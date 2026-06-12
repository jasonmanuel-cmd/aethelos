import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

@Injectable()
export class PoliciesService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(page = 1, limit = 20, lob?: string, status?: string) {
    const offset = (page - 1) * limit;
    const conditions: string[] = ['p.tenant_id = current_setting(\'app.current_tenant_id\')::uuid'];
    const values: any[] = [];
    let paramIndex = 1;

    if (lob) { conditions.push(`p.line_of_business = $${paramIndex++}`); values.push(lob); }
    if (status) { conditions.push(`p.status = $${paramIndex++}`); values.push(status); }

    const where = conditions.join(' AND ');

    const [rows, countResult] = await Promise.all([
      this.dataSource.query(
        `SELECT p.*, c.first_name, c.last_name, cr.name as carrier_name, cr.logo_url as carrier_logo
         FROM policies p
         JOIN contacts c ON p.primary_contact_id = c.id
         LEFT JOIN carriers cr ON p.carrier_id = cr.id
         WHERE ${where}
         ORDER BY p.expiration_date ASC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...values, limit, offset]
      ),
      this.dataSource.query(`SELECT COUNT(*) FROM policies p WHERE ${where}`, values),
    ]);

    return {
      data: rows,
      total: parseInt(countResult[0]?.count || '0', 10),
      page, limit,
      total_pages: Math.ceil(parseInt(countResult[0]?.count || '0', 10) / limit),
    };
  }

  async findOne(id: string) {
    const rows = await this.dataSource.query(
      `SELECT p.*, c.first_name, c.last_name, c.email, c.phone, cr.name as carrier_name,
              cr.logo_url, cr.am_best_rating
       FROM policies p
       JOIN contacts c ON p.primary_contact_id = c.id
       LEFT JOIN carriers cr ON p.carrier_id = cr.id
       WHERE p.id = $1`,
      [id]
    );
    if (!rows.length) throw new NotFoundError('Policy', id);
    return { data: rows[0] };
  }

  async create(data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO policies (tenant_id, primary_contact_id, carrier_id, policy_number, line_of_business,
        sub_type, status, premium_amount, annual_premium, commission_pct, billing_frequency,
        effective_date, expiration_date, face_amount, deductible, coverage_limits)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [data.primary_contact_id, data.carrier_id, data.policy_number, data.line_of_business,
       data.sub_type, data.status || 'Quoted', data.premium_amount,
       data.annual_premium || (data.premium_amount ? data.premium_amount * 12 : null),
       data.commission_pct, data.billing_frequency || 'Monthly',
       data.effective_date, data.expiration_date, data.face_amount, data.deductible,
       data.coverage_limits ? JSON.stringify(data.coverage_limits) : '{}']
    );

    if (result[0]?.expiration_date) {
      const triggerDate = new Date(result[0].expiration_date);
      triggerDate.setDate(triggerDate.getDate() - 60);

      await this.dataSource.query(
        `INSERT INTO x_date_tracker (tenant_id, policy_id, contact_id, target_x_date, automation_trigger_date)
         VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4)`,
        [result[0].id, data.primary_contact_id, result[0].expiration_date, triggerDate.toISOString().split('T')[0]]
      );
    }

    logger.info('Policy created', { policyId: result[0]?.id, lob: data.line_of_business });
    return { data: result[0] };
  }

  async update(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    const allowed = ['carrier_id', 'policy_number', 'status', 'premium_amount', 'annual_premium',
      'commission_pct', 'billing_frequency', 'effective_date', 'expiration_date', 'notes'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }
    if (!fields.length) throw new Error('No valid fields');
    values.push(id);
    const result = await this.dataSource.query(
      `UPDATE policies SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    if (!result.length) throw new NotFoundError('Policy', id);
    return { data: result[0] };
  }
}
