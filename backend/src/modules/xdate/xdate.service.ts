import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

@Injectable()
export class XDateService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectQueue('outreach-messages') private readonly outreachQueue: Queue,
  ) {}

  async findAll(tenantId: string, page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? 'x.current_campaign_stage = $3' : '1=1';
    const values: any[] = [tenantId, limit, offset];
    if (status) values.splice(1, 0, status);

    const [rows, countResult] = await Promise.all([
      this.dataSource.query(
        `SELECT x.*, c.first_name, c.last_name, c.email, c.phone,
                p.line_of_business, p.policy_number, p.premium_amount, p.annual_premium,
                cr.name as carrier_name
         FROM x_date_tracker x
         JOIN contacts c ON x.contact_id = c.id
         LEFT JOIN policies p ON x.policy_id = p.id
         LEFT JOIN carriers cr ON p.carrier_id = cr.id
         WHERE x.tenant_id = $1 AND ${where}
         ORDER BY x.target_x_date ASC
         LIMIT $2 OFFSET $3`,
        values
      ),
      this.dataSource.query(
        `SELECT COUNT(*) FROM x_date_tracker x WHERE x.tenant_id = $1 AND ${where}`,
        values.slice(0, status ? 2 : 1)
      ),
    ]);

    return {
      data: rows,
      total: parseInt(countResult[0]?.count || '0', 10),
      page, limit,
      total_pages: Math.ceil(parseInt(countResult[0]?.count || '0', 10) / limit),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dispatchDailyAutomations() {
    logger.log('Running daily X-Date automation dispatch...');

    const targetLeads = await this.dataSource.query(`
      SELECT x.id AS tracker_id, c.id AS contact_id, c.first_name, c.phone, c.email,
             p.line_of_business, cr.name AS current_carrier, cr.avg_annual_rate_change_pct,
             x.tenant_id
      FROM x_date_tracker x
      JOIN contacts c ON x.contact_id = c.id
      JOIN policies p ON x.policy_id = p.id
      JOIN carriers cr ON p.carrier_id = cr.id
      WHERE x.automation_trigger_date = CURRENT_DATE
        AND x.current_campaign_stage = 'Pending'
        AND x.ai_paused = FALSE
        AND c.status IN ('Lead', 'Active Prospect')
        AND c.opted_out = FALSE
    `);

    if (!targetLeads.length) {
      logger.log('No X-Date automations to dispatch today');
      return;
    }

    for (const lead of targetLeads) {
      try {
        await this.outreachQueue.add('send-day60-email', {
          trackerId: lead.tracker_id,
          contactId: lead.contact_id,
          email: lead.email,
          firstName: lead.first_name,
          lineOfBusiness: lead.line_of_business,
          currentCarrier: lead.current_carrier,
          rateIncrease: lead.avg_annual_rate_change_pct,
          tenantId: lead.tenant_id,
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
        });

        await this.dataSource.query(`
          UPDATE x_date_tracker
          SET current_campaign_stage = 'Day_60_Sent', last_action_timestamp = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [lead.tracker_id]);

        await this.dataSource.query(`
          INSERT INTO activity_log (tenant_id, contact_id, action, entity_type, entity_id, description, metadata)
          VALUES ($1, $2, 'xdate_automation_dispatched', 'x_date_tracker', $3, '60-day X-Date automation email dispatched', $4)
        `, [lead.tenant_id, lead.contact_id, lead.tracker_id, JSON.stringify({ stage: 'Day_60_Sent', line_of_business: lead.line_of_business })]);
      } catch (err) {
        logger.error(`Failed to dispatch X-Date automation for lead ${lead.contact_id}`, { error: err.message });
      }
    }

    logger.log(`Dispatched ${targetLeads.length} X-Date automation sequences`);
  }

  async pauseSequence(id: string, reason?: string) {
    const result = await this.dataSource.query(
      `UPDATE x_date_tracker SET ai_paused = TRUE, pause_reason = $2, last_action_timestamp = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id, reason || null]
    );
    if (!result.length) throw new NotFoundError('X-Date tracker', id);
    return { data: result[0] };
  }

  async resumeSequence(id: string) {
    const result = await this.dataSource.query(
      `UPDATE x_date_tracker SET ai_paused = FALSE, pause_reason = NULL, last_action_timestamp = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!result.length) throw new NotFoundError('X-Date tracker', id);
    return { data: result[0] };
  }

  async getUpcoming(tenantId: string, days = 60) {
    const rows = await this.dataSource.query(
      `SELECT x.*, c.first_name, c.last_name, c.email, p.line_of_business, p.annual_premium, cr.name as carrier_name
       FROM x_date_tracker x
       JOIN contacts c ON x.contact_id = c.id
       LEFT JOIN policies p ON x.policy_id = p.id
       LEFT JOIN carriers cr ON p.carrier_id = cr.id
       WHERE x.tenant_id = $1 AND x.target_x_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $2::integer
         AND x.ai_paused = FALSE
       ORDER BY x.target_x_date ASC`,
      [tenantId, days]
    );
    return { data: rows };
  }

  async getCrossSellOpportunities(tenantId: string) {
    const rows = await this.dataSource.query(
      `SELECT h.id as household_id, h.name as household_name,
              c.id as contact_id, c.first_name, c.last_name, c.email, c.phone,
              pol_auto.policy_number as auto_policy, pol_auto.expiration_date as auto_expiration,
              cr_auto.name as auto_carrier
       FROM households h
       JOIN contacts c ON h.id = c.household_id
       JOIN policies pol_auto ON c.id = pol_auto.primary_contact_id AND pol_auto.line_of_business = 'Auto' AND pol_auto.status = 'Bound'
       LEFT JOIN carriers cr_auto ON pol_auto.carrier_id = cr_auto.id
       WHERE NOT EXISTS (
         SELECT 1 FROM contacts c2
         JOIN policies p2 ON c2.id = p2.primary_contact_id
         WHERE c2.household_id = h.id AND p2.line_of_business = 'Home' AND p2.status = 'Bound'
       )
       AND c.relationship_to_head = 'Primary'
       GROUP BY h.id, h.name, c.id, c.first_name, c.last_name, c.email, c.phone,
                pol_auto.policy_number, pol_auto.expiration_date, cr_auto.name`
    );
    return { data: rows };
  }
}
