import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

@Injectable()
export class AppointmentsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(page = 1, limit = 20, status?: string, assignedTo?: string) {
    const offset = (page - 1) * limit;
    const conditions = ['a.tenant_id = current_setting(\'app.current_tenant_id\')::uuid'];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) { conditions.push(`a.status = $${paramIndex++}`); values.push(status); }
    if (assignedTo) { conditions.push(`a.assigned_to = $${paramIndex++}`); values.push(assignedTo); }

    const where = conditions.join(' AND ');

    const [rows, countResult] = await Promise.all([
      this.dataSource.query(
        `SELECT a.*, c.first_name, c.last_name, c.email, c.phone,
                u.first_name as agent_first_name, u.last_name as agent_last_name
         FROM appointments a
         LEFT JOIN contacts c ON a.contact_id = c.id
         LEFT JOIN tenant_users u ON a.assigned_to = u.id
         WHERE ${where}
         ORDER BY a.start_time ASC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...values, limit, offset]
      ),
      this.dataSource.query(`SELECT COUNT(*) FROM appointments a WHERE ${where}`, values),
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
      `SELECT a.*, c.first_name, c.last_name, c.email, c.phone
       FROM appointments a LEFT JOIN contacts c ON a.contact_id = c.id WHERE a.id = $1`, [id]
    );
    if (!rows.length) throw new NotFoundError('Appointment', id);
    return { data: rows[0] };
  }

  async create(data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO appointments (tenant_id, contact_id, assigned_to, title, description, appointment_type,
        start_time, end_time, timezone, location, meeting_link, is_virtual)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [data.contact_id, data.assigned_to, data.title, data.description, data.appointment_type,
       data.start_time, data.end_time, data.timezone || 'America/New_York',
       data.location, data.meeting_link, data.is_virtual || false]
    );
    return { data: result[0] };
  }

  async update(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    const allowed = ['title', 'description', 'appointment_type', 'status', 'start_time', 'end_time', 'location', 'meeting_link', 'notes', 'outcome', 'assigned_to'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }
    if (!fields.length) throw new Error('No valid fields');
    values.push(id);
    const result = await this.dataSource.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    if (!result.length) throw new NotFoundError('Appointment', id);
    return { data: result[0] };
  }

  async getTodayAppointments() {
    const rows = await this.dataSource.query(
      `SELECT a.*, c.first_name, c.last_name, c.phone
       FROM appointments a JOIN contacts c ON a.contact_id = c.id
       WHERE a.tenant_id = current_setting('app.current_tenant_id')::uuid
       AND a.start_time::date = CURRENT_DATE AND a.status = 'scheduled'
       ORDER BY a.start_time`
    );
    return { data: rows };
  }
}
