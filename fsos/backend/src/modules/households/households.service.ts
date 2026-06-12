import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

@Injectable()
export class HouseholdsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;
    let where = '1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      where = `(h.name ILIKE $${paramIndex} OR c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    const [rows, countResult] = await Promise.all([
      this.dataSource.query(
        `SELECT h.*,
                (SELECT COUNT(*) FROM contacts c WHERE c.household_id = h.id) as member_count,
                (SELECT COUNT(*) FROM contacts c JOIN policies p ON c.id = p.primary_contact_id WHERE c.household_id = h.id) as policy_count,
                (SELECT json_agg(json_build_object('id', c.id, 'first_name', c.first_name, 'last_name', c.last_name, 'status', c.status, 'email', c.email))
                 FROM contacts c WHERE c.household_id = h.id LIMIT 5) as members
         FROM households h
         LEFT JOIN contacts c ON c.household_id = h.id
         WHERE ${where}
         GROUP BY h.id
         ORDER BY h.created_at DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...values, limit, offset]
      ),
      this.dataSource.query(`SELECT COUNT(*) FROM households h WHERE ${where}`, values),
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
      `SELECT h.*,
              (SELECT json_agg(json_build_object(
                'id', c.id, 'first_name', c.first_name, 'last_name', c.last_name,
                'email', c.email, 'phone', c.phone, 'status', c.status, 'stage', c.stage,
                'relationship_to_head', c.relationship_to_head, 'date_of_birth', c.date_of_birth
              )) FROM contacts c WHERE c.household_id = h.id) as members
       FROM households h WHERE h.id = $1`,
      [id]
    );
    if (!rows.length) throw new NotFoundError('Household', id);
    return { data: rows[0] };
  }

  async create(data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO households (tenant_id, name, street_address, city, state, zip_code, annual_income, household_size, home_phone)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.name, data.street_address, data.city, data.state, data.zip_code, data.annual_income, data.household_size || 1, data.home_phone]
    );
    return { data: result[0] };
  }

  async update(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    const allowed = ['name', 'street_address', 'city', 'state', 'zip_code', 'annual_income', 'household_size', 'home_phone', 'notes'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }
    if (!fields.length) throw new Error('No valid fields');
    values.push(id);
    const result = await this.dataSource.query(
      `UPDATE households SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    if (!result.length) throw new NotFoundError('Household', id);
    return { data: result[0] };
  }
}
