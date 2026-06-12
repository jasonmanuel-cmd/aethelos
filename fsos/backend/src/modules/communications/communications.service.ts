import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { logger } from '../../common/logger';

@Injectable()
export class CommunicationsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getLogs(contactId?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const where = contactId
      ? 'WHERE cl.contact_id = $1 AND cl.tenant_id = current_setting(\'app.current_tenant_id\')::uuid'
      : 'WHERE cl.tenant_id = current_setting(\'app.current_tenant_id\')::uuid';
    const values = contactId ? [contactId, limit, offset] : [limit, offset];

    const [rows, countResult] = await Promise.all([
      this.dataSource.query(
        `SELECT cl.*, c.first_name, c.last_name
         FROM communication_logs cl JOIN contacts c ON cl.contact_id = c.id
         ${where} ORDER BY cl.created_at DESC LIMIT $${contactId ? 2 : 1} OFFSET $${contactId ? 3 : 2}`,
        values
      ),
      this.dataSource.query(`SELECT COUNT(*) FROM communication_logs cl ${where}`, contactId ? [contactId] : []),
    ]);

    return {
      data: rows,
      total: parseInt(countResult[0]?.count || '0', 10),
      page, limit,
      total_pages: Math.ceil(parseInt(countResult[0]?.count || '0', 10) / limit),
    };
  }

  async sendCommunication(data: any) {
    if (data.contact_id) {
      await this.dataSource.query(
        `UPDATE contacts SET last_contacted_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [data.contact_id]
      );
    }

    const result = await this.dataSource.query(
      `INSERT INTO communication_logs (tenant_id, contact_id, channel, direction, subject, body, template_used, status)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.contact_id, data.channel, data.direction || 'outbound', data.subject, data.body,
       data.template_used, data.status || 'sent']
    );

    await this.dataSource.query(
      `INSERT INTO activity_log (tenant_id, contact_id, action, entity_type, entity_id, description, metadata)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, 'communication_sent', 'communication_log', $2, $3, $4)`,
      [data.contact_id, result[0].id, `${data.channel} sent to contact`,
       JSON.stringify({ channel: data.channel, subject: data.subject })]
    );

    logger.info(`Communication sent: ${data.channel}`, { contactId: data.contact_id });
    return { data: result[0] };
  }

  async getStats() {
    const rows = await this.dataSource.query(`
      SELECT channel, COUNT(*) as total,
             SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
             SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
             SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) as replied
      FROM communication_logs
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
      GROUP BY channel
    `);
    return { data: rows };
  }
}
