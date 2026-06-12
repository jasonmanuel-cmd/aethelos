import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkflowsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getTemplates() {
    const rows = await this.dataSource.query(
      `SELECT * FROM workflow_templates WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND is_active = TRUE`
    );
    return { data: rows };
  }

  async createTemplate(data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO workflow_templates (tenant_id, name, description, category, trigger_config, nodes, edges)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.description, data.category, JSON.stringify(data.trigger_config || {}),
       JSON.stringify(data.nodes || []), JSON.stringify(data.edges || [])]
    );
    return { data: result[0] };
  }

  async updateTemplate(id: string, data: any) {
    const result = await this.dataSource.query(
      `UPDATE workflow_templates SET name = COALESCE($1, name), description = COALESCE($2, description),
        trigger_config = COALESCE($3, trigger_config), nodes = COALESCE($4, nodes), edges = COALESCE($5, edges)
       WHERE id = $6 RETURNING *`,
      [data.name, data.description, data.trigger_config ? JSON.stringify(data.trigger_config) : null,
       data.nodes ? JSON.stringify(data.nodes) : null, data.edges ? JSON.stringify(data.edges) : null, id]
    );
    if (!result.length) throw new NotFoundError('Workflow template', id);
    return { data: result[0] };
  }

  async executeWorkflow(templateId: string, contactId: string) {
    const template = await this.dataSource.query(
      `SELECT * FROM workflow_templates WHERE id = $1`,
      [templateId]
    );
    if (!template.length) throw new NotFoundError('Workflow template', templateId);

    const instanceId = uuidv4();
    const nodes = template[0].nodes || [];
    const startNode = nodes.find((n: any) => n.type === 'trigger');

    await this.dataSource.query(
      `INSERT INTO workflow_instances (id, tenant_id, template_id, contact_id, status, current_node_id, context)
       VALUES ($1, current_setting('app.current_tenant_id')::uuid, $2, $3, 'running', $4, $5)`,
      [instanceId, templateId, contactId, startNode?.id || null, JSON.stringify({ startedAt: new Date().toISOString() })]
    );

    logger.info('Workflow instance created', { templateId, contactId, instanceId });

    if (startNode) {
      await this.processNode(instanceId, startNode, nodes, contactId);
    }

    return { data: { id: instanceId, status: 'running' } };
  }

  private async processNode(instanceId: string, node: any, allNodes: any[], contactId: string) {
    const edges = await this.dataSource.query(
      `SELECT edges FROM workflow_templates t JOIN workflow_instances i ON t.id = i.template_id WHERE i.id = $1`,
      [instanceId]
    );

    const workflowEdges = edges[0]?.edges || [];
    const outgoingEdges = workflowEdges.filter((e: any) => e.source === node.id);

    await this.dataSource.query(
      `UPDATE workflow_instances SET current_node_id = $1, execution_history = execution_history || $2::jsonb WHERE id = $3`,
      [node.id, JSON.stringify([{ nodeId: node.id, processedAt: new Date().toISOString() }]), instanceId]
    );

    switch (node.type) {
      case 'condition': {
        const conditionMet = this.evaluateCondition(node.config, contactId);
        const targetEdge = conditionMet
          ? outgoingEdges.find((e: any) => e.condition === 'true')
          : outgoingEdges.find((e: any) => e.condition !== 'true');
        if (targetEdge) {
          const nextNode = allNodes.find((n: any) => n.id === targetEdge.target);
          if (nextNode) await this.processNode(instanceId, nextNode, allNodes, contactId);
        }
        break;
      }
      case 'delay': {
        const delayMs = (node.config?.delay_days || 1) * 24 * 60 * 60 * 1000;
        setTimeout(async () => {
          const defaultEdge = outgoingEdges[0];
          if (defaultEdge) {
            const nextNode = allNodes.find((n: any) => n.id === defaultEdge.target);
            if (nextNode) await this.processNode(instanceId, nextNode, allNodes, contactId);
          }
        }, delayMs);
        break;
      }
      case 'action': {
        await this.executeAction(node.config, contactId);
        const defaultEdge = outgoingEdges[0];
        if (defaultEdge) {
          const nextNode = allNodes.find((n: any) => n.id === defaultEdge.target);
          if (nextNode) await this.processNode(instanceId, nextNode, allNodes, contactId);
        }
        break;
      }
      default: {
        if (outgoingEdges.length > 0) {
          const nextNode = allNodes.find((n: any) => n.id === outgoingEdges[0].target);
          if (nextNode) await this.processNode(instanceId, nextNode, allNodes, contactId);
        } else {
          await this.dataSource.query(
            `UPDATE workflow_instances SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [instanceId]
          );
        }
      }
    }
  }

  private evaluateCondition(config: any, contactId: string): boolean {
    return true;
  }

  private async executeAction(config: any, contactId: string) {
    logger.log('Executing workflow action', { actionType: config?.type, contactId });
  }

  async getInstances(templateId?: string) {
    const where = templateId ? 'WHERE template_id = $1' : '';
    const values = templateId ? [templateId] : [];
    const rows = await this.dataSource.query(
      `SELECT i.*, w.name as template_name, c.first_name, c.last_name
       FROM workflow_instances i
       LEFT JOIN workflow_templates w ON i.template_id = w.id
       LEFT JOIN contacts c ON i.contact_id = c.id
       ${where} ORDER BY i.created_at DESC`,
      values
    );
    return { data: rows };
  }

  async getInstance(id: string) {
    const rows = await this.dataSource.query(
      `SELECT i.*, w.name as template_name, w.nodes, w.edges, c.first_name, c.last_name
       FROM workflow_instances i
       LEFT JOIN workflow_templates w ON i.template_id = w.id
       LEFT JOIN contacts c ON i.contact_id = c.id
       WHERE i.id = $1`,
      [id]
    );
    if (!rows.length) throw new NotFoundError('Workflow instance', id);
    return { data: rows[0] };
  }
}
