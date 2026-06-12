import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { logger } from '../../common/logger';

interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params: { tool_name: string; arguments: any };
  id: number;
}

@Controller('mcp')
export class McpGatewayController {
  constructor(private readonly dataSource: DataSource) {}

  @Post('execute')
  async handleMcpCall(@Body() body: MCPRequest) {
    if (body.jsonrpc !== '2.0') {
      throw new HttpException('Invalid JSON-RPC version', HttpStatus.BAD_REQUEST);
    }

    const { tool_name, arguments: args } = body.params;
    logger.log(`MCP call: ${tool_name}`, { args });

    try {
      switch (tool_name) {
        case 'search_contacts':
          return this.searchContacts(args.query, args.limit);
        case 'get_contact':
          return this.getContact(args.contact_id);
        case 'get_household':
          return this.getHousehold(args.household_id);
        case 'get_household_vulnerabilities':
          return this.getVulnerabilities(args.household_id);
        case 'get_upcoming_xdates':
          return this.getUpcomingXdates(args.days);
        case 'update_pipeline_stage':
          return this.updatePipeline(args.lead_id, args.target_stage);
        case 'create_activity':
          return this.createActivity(args.contact_id, args.action, args.description, args.metadata);
        case 'get_cross_sell_opportunities':
          return this.getCrossSellOpportunities();
        case 'get_contact_assessment':
          return this.getContactAssessment(args.contact_id);
        case 'search_policies':
          return this.searchPolicies(args.query, args.lob);
        case 'schedule_appointment':
          return this.scheduleAppointment(args.contact_id, args.title, args.start_time, args.end_time);
        case 'get_dashboard_metrics':
          return this.getDashboardMetrics();
        default:
          return this.error(`Unknown tool: ${tool_name}`, -32601);
      }
    } catch (err: any) {
      logger.error('MCP tool error', { tool: tool_name, error: err.message });
      return this.error(err.message, -32603);
    }
  }

  private success(data: any, id: number = 1) {
    return { jsonrpc: '2.0', result: { status: 'success', data }, id };
  }

  private error(message: string, code: number, id: number = 1) {
    return { jsonrpc: '2.0', error: { code, message }, id };
  }

  private async searchContacts(query: string, limit = 20) {
    const rows = await this.dataSource.query(
      `SELECT id, first_name, last_name, email, phone, status, stage, created_at
       FROM contacts WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
       AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)
       LIMIT $2`, [`%${query}%`, limit]
    );
    return this.success(rows);
  }

  private async getContact(contactId: string) {
    const rows = await this.dataSource.query(
      `SELECT * FROM contacts WHERE id = $1 AND tenant_id = current_setting('app.current_tenant_id')::uuid`,
      [contactId]
    );
    if (!rows.length) return this.error('Contact not found', -32602);
    return this.success(rows[0]);
  }

  private async getHousehold(householdId: string) {
    const rows = await this.dataSource.query(
      `SELECT h.*,
              (SELECT json_agg(json_build_object('id', c.id, 'first_name', c.first_name, 'last_name', c.last_name, 'status', c.status))
               FROM contacts c WHERE c.household_id = h.id) as members
       FROM households h WHERE h.id = $1`,
      [householdId]
    );
    if (!rows.length) return this.error('Household not found', -32602);
    return this.success(rows[0]);
  }

  private async getVulnerabilities(householdId: string) {
    const rows = await this.dataSource.query(
      `SELECT c.id, c.first_name, c.last_name, x.target_x_date, x.current_campaign_stage,
              p.line_of_business, p.status as policy_status
       FROM contacts c
       LEFT JOIN x_date_tracker x ON x.contact_id = c.id
       LEFT JOIN policies p ON x.policy_id = p.id
       WHERE c.household_id = $1`,
      [householdId]
    );
    return this.success(rows);
  }

  private async getUpcomingXdates(days = 60) {
    const rows = await this.dataSource.query(
      `SELECT x.*, c.first_name, c.last_name, c.email, c.phone,
              p.line_of_business, p.annual_premium, cr.name as carrier_name
       FROM x_date_tracker x
       JOIN contacts c ON x.contact_id = c.id
       LEFT JOIN policies p ON x.policy_id = p.id
       LEFT JOIN carriers cr ON p.carrier_id = cr.id
       WHERE x.tenant_id = current_setting('app.current_tenant_id')::uuid
       AND x.target_x_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1::integer
       AND x.ai_paused = FALSE
       ORDER BY x.target_x_date`, [days]
    );
    return this.success(rows);
  }

  private async updatePipeline(leadId: string, stage: string) {
    const result = await this.dataSource.query(
      `UPDATE contacts SET stage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
       AND tenant_id = current_setting('app.current_tenant_id')::uuid RETURNING id, first_name, last_name, stage`,
      [stage, leadId]
    );
    if (!result.length) return this.error('Contact not found', -32602);
    return this.success(result[0]);
  }

  private async createActivity(contactId: string, action: string, description: string, metadata: any) {
    const result = await this.dataSource.query(
      `INSERT INTO activity_log (tenant_id, contact_id, action, description, metadata)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4)
       RETURNING *`,
      [contactId, action, description, JSON.stringify(metadata || {})]
    );
    return this.success(result[0]);
  }

  private async getCrossSellOpportunities() {
    const rows = await this.dataSource.query(
      `SELECT h.name as household, c.first_name, c.last_name, c.email, c.phone,
              pol.policy_number, pol.line_of_business, pol.expiration_date
       FROM households h JOIN contacts c ON h.id = c.household_id
       JOIN policies pol ON c.id = pol.primary_contact_id AND pol.status = 'Bound'
       WHERE c.relationship_to_head = 'Primary'
       AND NOT EXISTS (
         SELECT 1 FROM policies p2 WHERE p2.primary_contact_id IN
           (SELECT id FROM contacts WHERE household_id = h.id)
         AND p2.line_of_business != pol.line_of_business AND p2.status = 'Bound'
       )`
    );
    return this.success(rows);
  }

  private async getContactAssessment(contactId: string) {
    const rows = await this.dataSource.query(
      `SELECT * FROM assessments WHERE contact_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [contactId]
    );
    return this.success(rows[0] || null);
  }

  private async searchPolicies(query: string, lob?: string) {
    const values: any[] = [`%${query}%`];
    let lobFilter = '';
    if (lob) {
      lobFilter = ' AND p.line_of_business = $2';
      values.push(lob);
    }
    const rows = await this.dataSource.query(
      `SELECT p.*, c.first_name, c.last_name, cr.name as carrier_name
       FROM policies p JOIN contacts c ON p.primary_contact_id = c.id
       LEFT JOIN carriers cr ON p.carrier_id = cr.id
       WHERE p.tenant_id = current_setting('app.current_tenant_id')::uuid
       AND (p.policy_number ILIKE $1 OR c.first_name ILIKE $1 OR c.last_name ILIKE $1)
       ${lobFilter} LIMIT 20`, values
    );
    return this.success(rows);
  }

  private async scheduleAppointment(contactId: string, title: string, startTime: string, endTime: string) {
    const result = await this.dataSource.query(
      `INSERT INTO appointments (tenant_id, contact_id, title, start_time, end_time, status)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, 'scheduled')
       RETURNING *`,
      [contactId, title, startTime, endTime]
    );
    return this.success(result[0]);
  }

  private async getDashboardMetrics() {
    const metrics = await this.dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM contacts WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND status = 'Lead') as total_leads,
        (SELECT COUNT(*) FROM contacts WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND status = 'Active Client') as active_clients,
        (SELECT COUNT(*) FROM contacts WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND next_follow_up <= CURRENT_DATE) as pending_followups,
        (SELECT COUNT(*) FROM appointments WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND status = 'scheduled' AND start_time >= CURRENT_DATE) as upcoming_appointments,
        (SELECT COALESCE(SUM(annual_premium * commission_pct / 100), 0) FROM policies WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND status = 'Bound') as annual_revenue,
        (SELECT COUNT(*) FROM x_date_tracker WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND ai_paused = FALSE AND target_x_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 60) as xdates_next_60_days
    `);
    return this.success(metrics[0] || {});
  }
}
