import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';

@Injectable()
export class CarriersService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(activeOnly = true) {
    const where = activeOnly ? 'WHERE is_active = TRUE' : '';
    const rows = await this.dataSource.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM policies p WHERE p.carrier_id = c.id) as policy_count
       FROM carriers c ${where}
       ORDER BY c.name`
    );
    return { data: rows };
  }

  async findOne(id: string) {
    const rows = await this.dataSource.query(
      `SELECT c.*,
              (SELECT json_agg(json_build_object('id', p.id, 'policy_number', p.policy_number,
                'line_of_business', p.line_of_business, 'status', p.status,
                'premium_amount', p.premium_amount, 'expiration_date', p.expiration_date,
                'contact_name', con.first_name || ' ' || con.last_name))
               FROM policies p JOIN contacts con ON p.primary_contact_id = con.id
               WHERE p.carrier_id = c.id) as policies
       FROM carriers c WHERE c.id = $1`,
      [id]
    );
    if (!rows.length) throw new NotFoundError('Carrier', id);
    return { data: rows[0] };
  }

  async create(data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO carriers (tenant_id, name, naic_code, am_best_rating, is_internal_write,
        lines_offered, commission_pct)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.naic_code, data.am_best_rating, data.is_internal_write !== false,
       data.lines_offered || [], data.commission_pct]
    );
    return { data: result[0] };
  }
}
