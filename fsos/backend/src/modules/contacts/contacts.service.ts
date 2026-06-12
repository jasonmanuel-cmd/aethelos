import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

@Injectable()
export class ContactsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(params: {
    page: number; limit: number; status?: string; stage?: string; search?: string; assignedTo?: string;
  }) {
    const { page, limit, status, stage, search, assignedTo } = params;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['1=1'];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`c.status = $${paramIndex++}`);
      values.push(status);
    }
    if (stage) {
      conditions.push(`c.stage = $${paramIndex++}`);
      values.push(stage);
    }
    if (search) {
      conditions.push(`(c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }
    if (assignedTo) {
      conditions.push(`c.assigned_to = $${paramIndex++}`);
      values.push(assignedTo);
    }

    const where = conditions.join(' AND ');

    const [rows, countResult] = await Promise.all([
      this.dataSource.query(
        `SELECT c.*, h.name as household_name, h.city, h.state,
                (SELECT COUNT(*) FROM policies p WHERE p.primary_contact_id = c.id) as policy_count,
                (SELECT json_agg(json_build_object('id', x.id, 'target_x_date', x.target_x_date, 'stage', x.current_campaign_stage))
                 FROM x_date_tracker x WHERE x.contact_id = c.id AND x.ai_paused = FALSE LIMIT 1) as active_xdate
         FROM contacts c
         LEFT JOIN households h ON c.household_id = h.id
         WHERE ${where}
         ORDER BY c.created_at DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...values, limit, offset]
      ),
      this.dataSource.query(
        `SELECT COUNT(*) FROM contacts c WHERE ${where}`,
        values
      ),
    ]);

    const total = parseInt(countResult[0]?.count || '0', 10);

    return {
      data: rows,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const rows = await this.dataSource.query(
      `SELECT c.*, h.name as household_name, h.street_address, h.city, h.state, h.zip_code, h.annual_income as household_income,
              (SELECT json_agg(json_build_object(
                'id', p.id, 'line_of_business', p.line_of_business, 'status', p.status,
                'policy_number', p.policy_number, 'premium_amount', p.premium_amount,
                'effective_date', p.effective_date, 'expiration_date', p.expiration_date,
                'carrier_name', cr.name
              )) FROM policies p LEFT JOIN carriers cr ON p.carrier_id = cr.id WHERE p.primary_contact_id = c.id) as policies,
              (SELECT json_agg(json_build_object(
                'id', a.id, 'overall_score', a.overall_score, 'risk_level', a.risk_level,
                'completed_at', a.completed_at, 'status', a.status
              ) ORDER BY a.created_at DESC) FROM assessments a WHERE a.contact_id = c.id) as assessments,
              (SELECT json_agg(json_build_object(
                'id', a.id, 'title', a.title, 'status', a.status,
                'start_time', a.start_time, 'appointment_type', a.appointment_type
              ) ORDER BY a.start_time DESC) FROM appointments a WHERE a.contact_id = c.id) as appointments
       FROM contacts c
       LEFT JOIN households h ON c.household_id = h.id
       WHERE c.id = $1`,
      [id]
    );

    if (!rows.length) throw new NotFoundError('Contact', id);
    return { data: rows[0] };
  }

  async create(data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO contacts (tenant_id, household_id, first_name, last_name, email, phone, date_of_birth,
        lead_source, status, stage, assigned_to, marital_status, dependents_count, annual_income,
        occupation, employer, relationship_to_head)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        data.household_id || null, data.first_name, data.last_name, data.email, data.phone,
        data.date_of_birth || null, data.lead_source || 'Direct', data.status || 'Lead',
        data.stage || 'new', data.assigned_to || null, data.marital_status || null,
        data.dependents_count || 0, data.annual_income || null, data.occupation || null,
        data.employer || null, data.relationship_to_head || 'Primary',
      ]
    );

    logger.info('Contact created', { contactId: result[0]?.id });
    return { data: result[0] };
  }

  async update(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['first_name', 'last_name', 'email', 'phone', 'status', 'stage', 'assigned_to',
           'household_id', 'marital_status', 'dependents_count', 'annual_income', 'lead_source',
           'occupation', 'employer', 'date_of_birth'].includes(key)) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (!fields.length) throw new Error('No valid fields to update');

    values.push(id);
    const result = await this.dataSource.query(
      `UPDATE contacts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (!result.length) throw new NotFoundError('Contact', id);
    logger.info('Contact updated', { contactId: id });
    return { data: result[0] };
  }

  async remove(id: string) {
    const result = await this.dataSource.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING id',
      [id]
    );
    if (!result.length) throw new NotFoundError('Contact', id);
    return { data: { id }, message: 'Contact deleted' };
  }

  async getHouseholdMembers(id: string) {
    const contact = await this.dataSource.query(
      'SELECT household_id FROM contacts WHERE id = $1', [id]
    );
    if (!contact.length) throw new NotFoundError('Contact', id);
    if (!contact[0].household_id) return { data: [] };

    const members = await this.dataSource.query(
      `SELECT c.*, (SELECT json_agg(json_build_object('id', p.id, 'line_of_business', p.line_of_business, 'status', p.status))
        FROM policies p WHERE p.primary_contact_id = c.id) as policies
       FROM contacts c WHERE c.household_id = $1 ORDER BY c.relationship_to_head`,
      [contact[0].household_id]
    );
    return { data: members };
  }

  async getPolicies(id: string) {
    const policies = await this.dataSource.query(
      `SELECT p.*, cr.name as carrier_name, cr.logo_url
       FROM policies p LEFT JOIN carriers cr ON p.carrier_id = cr.id
       WHERE p.primary_contact_id = $1 ORDER BY p.created_at DESC`,
      [id]
    );
    return { data: policies };
  }

  async getActivity(id: string) {
    const activity = await this.dataSource.query(
      `SELECT * FROM activity_log WHERE contact_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [id]
    );
    return { data: activity };
  }
}
