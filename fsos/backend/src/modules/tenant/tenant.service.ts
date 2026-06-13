import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const DEMO_EMAIL = 'jasonm@coaibakersfield.com';
const DEMO_PASSWORD = 'blunts954';
const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002';

@Injectable()
export class TenantService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getCurrentTenant(tenantId: string) {
    const rows = await this.dataSource.query(
      `SELECT id, name, slug, domain, logo_url, primary_color, secondary_color, settings FROM tenants WHERE id = $1`,
      [tenantId]
    );
    if (!rows.length) throw new NotFoundError('Tenant', tenantId);
    return { data: rows[0] };
  }

  async getUsers(tenantId: string) {
    const rows = await this.dataSource.query(
      `SELECT id, email, first_name, last_name, role, is_active, last_login_at, created_at
       FROM tenant_users WHERE tenant_id = $1 ORDER BY created_at`,
      [tenantId]
    );
    return { data: rows };
  }

  async login(email: string, password: string) {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = jwt.sign(
        { userId: DEMO_USER_ID, tenantId: DEMO_TENANT_ID, email: DEMO_EMAIL, role: 'admin' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '24h' }
      );

      logger.info(`Demo user ${email} logged in`, { tenantId: DEMO_TENANT_ID });

      return {
        data: {
          token,
          user: {
            id: DEMO_USER_ID,
            email: DEMO_EMAIL,
            first_name: 'Jason',
            last_name: 'Blunt',
            role: 'admin',
          },
          tenant: { id: DEMO_TENANT_ID, name: 'COAI Demo Agency', slug: 'coai-demo' },
        },
      };
    }

    const rows = await this.dataSource.query(
      `SELECT tu.*, t.slug as tenant_slug, t.name as tenant_name
       FROM tenant_users tu JOIN tenants t ON tu.tenant_id = t.id
       WHERE tu.email = $1 AND tu.is_active = TRUE`,
      [email]
    );

    if (!rows.length) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) throw new Error('Invalid credentials');

    await this.dataSource.query(
      `UPDATE tenant_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [rows[0].id]
    );

    const token = jwt.sign(
      { userId: rows[0].id, tenantId: rows[0].tenant_id, email: rows[0].email, role: rows[0].role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    logger.info(`User ${email} logged in`, { tenantId: rows[0].tenant_id });

    return {
      data: {
        token,
        user: {
          id: rows[0].id, email: rows[0].email, first_name: rows[0].first_name,
          last_name: rows[0].last_name, role: rows[0].role,
        },
        tenant: { id: rows[0].tenant_id, name: rows[0].tenant_name, slug: rows[0].tenant_slug },
      },
    };
  }

  async updateSettings(tenantId: string, settings: any) {
    const result = await this.dataSource.query(
      `UPDATE tenants SET settings = $1 WHERE id = $2 RETURNING id, settings`,
      [JSON.stringify(settings), tenantId]
    );
    if (!result.length) throw new NotFoundError('Tenant', tenantId);
    return { data: result[0] };
  }

  async updateBranding(tenantId: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    for (const key of ['logo_url', 'primary_color', 'secondary_color', 'name']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }
    if (!fields.length) throw new Error('No valid fields');
    values.push(tenantId);
    const result = await this.dataSource.query(
      `UPDATE tenants SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    if (!result.length) throw new NotFoundError('Tenant', tenantId);
    return { data: result[0] };
  }
}
