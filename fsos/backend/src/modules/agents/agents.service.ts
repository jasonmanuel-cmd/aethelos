import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

@Injectable()
export class AgentsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll() {
    const rows = await this.dataSource.query(
      `SELECT * FROM ai_agents WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND is_active = TRUE`
    );
    return { data: rows };
  }

  async findOne(id: string) {
    const rows = await this.dataSource.query(
      `SELECT *, (SELECT COUNT(*) FROM agent_conversations WHERE agent_id = $1) as total_conversations
       FROM ai_agents WHERE id = $1`,
      [id]
    );
    if (!rows.length) throw new NotFoundError('AI Agent', id);
    return { data: rows[0] };
  }

  async update(id: string, data: any) {
    const result = await this.dataSource.query(
      `UPDATE ai_agents SET configuration = COALESCE($1, configuration),
        channel_config = COALESCE($2, channel_config), is_active = COALESCE($3, is_active)
       WHERE id = $4 RETURNING *`,
      [data.configuration ? JSON.stringify(data.configuration) : null,
       data.channel_config ? JSON.stringify(data.channel_config) : null,
       data.is_active !== undefined ? data.is_active : null, id]
    );
    if (!result.length) throw new NotFoundError('AI Agent', id);
    return { data: result[0] };
  }

  async getConversations(agentId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows, countResult] = await Promise.all([
      this.dataSource.query(
        `SELECT ac.*, c.first_name, c.last_name, c.email
         FROM agent_conversations ac JOIN contacts c ON ac.contact_id = c.id
         WHERE ac.agent_id = $1 ORDER BY ac.updated_at DESC LIMIT $2 OFFSET $3`,
        [agentId, limit, offset]
      ),
      this.dataSource.query(`SELECT COUNT(*) FROM agent_conversations WHERE agent_id = $1`, [agentId]),
    ]);

    return {
      data: rows,
      total: parseInt(countResult[0]?.count || '0', 10),
      page, limit,
      total_pages: Math.ceil(parseInt(countResult[0]?.count || '0', 10) / limit),
    };
  }

  async triggerAgent(agentId: string, contactId: string) {
    const agent = await this.dataSource.query(
      `SELECT * FROM ai_agents WHERE id = $1`, [agentId]
    );
    if (!agent.length) throw new NotFoundError('AI Agent', agentId);

    const conversation = await this.dataSource.query(
      `INSERT INTO agent_conversations (tenant_id, agent_id, contact_id, channel, status)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, 'sms', 'active')
       RETURNING *`,
      [agentId, contactId]
    );

    logger.info(`AI Agent ${agent[0].name} triggered`, { agentId, contactId });

    return { data: conversation[0], message: `${agent[0].name} activated for contact` };
  }
}
