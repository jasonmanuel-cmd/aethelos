import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

@Injectable()
export class PipelinesService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getStages() {
    const rows = await this.dataSource.query(
      `SELECT * FROM pipeline_stages WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
       ORDER BY sort_order ASC`
    );
    return { data: rows };
  }

  async getDeals(stageId?: string) {
    const where = stageId
      ? 'WHERE d.pipeline_stage_id = $1 AND d.tenant_id = current_setting(\'app.current_tenant_id\')::uuid'
      : 'WHERE d.tenant_id = current_setting(\'app.current_tenant_id\')::uuid';
    const values = stageId ? [stageId] : [];

    const rows = await this.dataSource.query(
      `SELECT d.*, c.first_name, c.last_name, c.email, c.phone, ps.name as stage_name, ps.color as stage_color,
              u.first_name as agent_first_name, u.last_name as agent_last_name
       FROM deals d
       LEFT JOIN contacts c ON d.contact_id = c.id
       LEFT JOIN pipeline_stages ps ON d.pipeline_stage_id = ps.id
       LEFT JOIN tenant_users u ON d.assigned_to = u.id
       ${where}
       ORDER BY d.expected_close_date ASC NULLS LAST`,
      values
    );
    return { data: rows };
  }

  async createDeal(data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO deals (tenant_id, contact_id, pipeline_stage_id, assigned_to, name, amount, probability,
        expected_close_date, deal_type, products)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.contact_id, data.pipeline_stage_id, data.assigned_to, data.name, data.amount,
       data.probability, data.expected_close_date, data.deal_type, data.products || []]
    );
    return { data: result[0] };
  }

  async updateDeal(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    const allowed = ['pipeline_stage_id', 'amount', 'probability', 'expected_close_date', 'name', 'status', 'notes', 'lost_reason'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }
    if (!fields.length) throw new Error('No valid fields');
    values.push(id);
    const result = await this.dataSource.query(
      `UPDATE deals SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    if (!result.length) throw new NotFoundError('Deal', id);
    return { data: result[0] };
  }

  async getPipelineAnalytics() {
    const stages = await this.dataSource.query(
      `SELECT ps.id, ps.name, ps.color, ps.sort_order,
              COUNT(d.id) as deal_count,
              COALESCE(SUM(d.amount), 0) as pipeline_value,
              COALESCE(SUM(d.amount * d.probability / 100), 0) as weighted_value
       FROM pipeline_stages ps
       LEFT JOIN deals d ON d.pipeline_stage_id = ps.id AND d.status = 'open'
       WHERE ps.tenant_id = current_setting('app.current_tenant_id')::uuid
       GROUP BY ps.id, ps.name, ps.color, ps.sort_order
       ORDER BY ps.sort_order`
    );
    return { data: stages };
  }
}
