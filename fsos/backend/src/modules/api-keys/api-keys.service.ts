import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

export interface TenantApiKey {
  id: string;
  tenant_id: string;
  service_name: string;
  api_key?: string;
  api_secret?: string;
  config_json: Record<string, any>;
  is_configured: boolean;
}

@Injectable()
export class ApiKeysService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getKeys(tenantId: string): Promise<{ data: TenantApiKey[] }> {
    const rows = await this.dataSource.query(
      `SELECT id, service_name, is_configured, 
              CASE WHEN is_configured THEN LEFT(api_key, 4) || '••••••••' || RIGHT(api_key, 4) ELSE NULL END as api_key,
              CASE WHEN is_configured THEN LEFT(api_secret, 4) || '••••••••' || RIGHT(api_secret, 4) ELSE NULL END as api_secret,
              config_json
       FROM tenant_api_keys 
       WHERE tenant_id = $1 
       ORDER BY service_name`,
      [tenantId]
    );
    return { data: rows };
  }

  async getKey(tenantId: string, serviceName: string): Promise<TenantApiKey | null> {
    const rows = await this.dataSource.query(
      `SELECT id, tenant_id, service_name, api_key, api_secret, config_json, is_configured
       FROM tenant_api_keys 
       WHERE tenant_id = $1 AND service_name = $2`,
      [tenantId, serviceName]
    );
    return rows.length ? rows[0] : null;
  }

  async upsertKey(tenantId: string, serviceName: string, data: { api_key?: string; api_secret?: string; config_json?: Record<string, any> }) {
    const existing = await this.getKey(tenantId, serviceName);
    const isConfigured = !!(data.api_key || data.api_secret);

    if (existing) {
      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.api_key !== undefined) { updates.push(`api_key = $${idx++}`); values.push(data.api_key); }
      if (data.api_secret !== undefined) { updates.push(`api_secret = $${idx++}`); values.push(data.api_secret); }
      if (data.config_json !== undefined) { updates.push(`config_json = $${idx++}`); values.push(JSON.stringify(data.config_json)); }
      updates.push(`is_configured = $${idx++}`); values.push(isConfigured);
      values.push(tenantId, serviceName);

      await this.dataSource.query(
        `UPDATE tenant_api_keys SET ${updates.join(', ')} WHERE tenant_id = $${idx} AND service_name = $${idx + 1}`,
        values
      );
    } else {
      await this.dataSource.query(
        `INSERT INTO tenant_api_keys (tenant_id, service_name, api_key, api_secret, config_json, is_configured)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tenantId, serviceName, data.api_key || null, data.api_secret || null, 
         data.config_json ? JSON.stringify(data.config_json) : '{}', isConfigured]
      );
    }

    logger.info(`API key ${isConfigured ? 'configured' : 'cleared'} for ${serviceName}`, { tenantId });
    return { data: { service_name: serviceName, is_configured: isConfigured } };
  }

  async deleteKey(tenantId: string, serviceName: string) {
    await this.dataSource.query(
      `DELETE FROM tenant_api_keys WHERE tenant_id = $1 AND service_name = $2`,
      [tenantId, serviceName]
    );
    return { message: `${serviceName} key deleted` };
  }

  async getRawKeyValue(tenantId: string, serviceName: string): Promise<{ api_key?: string; api_secret?: string; config_json?: Record<string, any> }> {
    const key = await this.getKey(tenantId, serviceName);
    if (key && key.is_configured) {
      return { api_key: key.api_key, api_secret: key.api_secret, config_json: key.config_json };
    }
    return {};
  }
}
