import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { logger } from '../../common/logger';

@Processor('outreach-messages')
export class OutreachProcessor extends WorkerHost {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly apiKeysService: ApiKeysService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { data } = job;
    await this.ensureTenantHasApiKeys(data.tenantId);

    switch (job.name) {
      case 'send-day60-email':
        return this.sendDay60Email(data);
      case 'send-day57-sms':
        return this.sendDay57Sms(data);
      case 'send-day45-email':
        return this.sendDay45Email(data);
      default:
        logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async ensureTenantHasApiKeys(tenantId: string) {
    const emailKey = await this.apiKeysService.getRawKeyValue(tenantId, 'email');
    const twilioKey = await this.apiKeysService.getRawKeyValue(tenantId, 'twilio');

    if (!emailKey.api_key) {
      logger.warn(`Tenant ${tenantId} has no email API key configured — using env defaults or skipping`);
    }
    if (!twilioKey.api_key) {
      logger.warn(`Tenant ${tenantId} has no Twilio API key configured — using env defaults or skipping`);
    }

    return { emailKey, twilioKey };
  }

  private async sendDay60Email(data: any) {
    const keys = await this.ensureTenantHasApiKeys(data.tenantId);

    logger.log(`[Day 60] Sending contextual wake-up email to ${data.email}${keys.emailKey.api_key ? ' [tenant key]' : ' [env default]'}`, { contactId: data.contactId });

    const subject = data.lineOfBusiness === 'Auto'
      ? `Quick question about your ${data.currentCarrier} policy renewal`
      : `Your ${data.currentCarrier} policy renewal is coming up`;

    const body = `Hi ${data.firstName},\n\n` +
      `I was reviewing our local market data and noticed your ${data.lineOfBusiness.toLowerCase()} policy with ${data.currentCarrier} ` +
      `is up for renewal soon.\n\n` +
      `Over the last year, ${data.currentCarrier} has increased rates by approximately ${data.rateIncrease || 8}% in your area. ` +
      `Your renewal bill is likely going to be higher than last year.\n\n` +
      `We've just mapped out the new quarterly rates across our carrier network. If you have 30 seconds, ` +
      `I can run a quick comparison to see if we can lock in a better rate before your renewal processes.\n\n` +
      `Would you like me to take a look?\n\nBest,\nYour FSOS Agent`;

    await this.logCommunication(data.tenantId, data.contactId, 'email', 'outbound', subject, body, 'day60_xdate_wakeup');

    if (data.trackerId) {
      await this.dataSource.query(
        `UPDATE x_date_tracker SET current_campaign_stage = 'Day_60_Sent', last_action_timestamp = CURRENT_TIMESTAMP WHERE id = $1`,
        [data.trackerId]
      );
    }

    return { status: 'sent', channel: 'email', contactId: data.contactId, key_source: keys.emailKey.api_key ? 'tenant' : 'env' };
  }

  private async sendDay57Sms(data: any) {
    const keys = await this.ensureTenantHasApiKeys(data.tenantId);

    logger.log(`[Day 57] Sending SMS pivot to ${data.phone}${keys.twilioKey.api_key ? ' [tenant key]' : ' [env default]'}`, { contactId: data.contactId });

    const body = `Hi ${data.firstName}, it's your agent. Sent you an email about your ${data.lineOfBusiness.toLowerCase()} policy with ${data.currentCarrier} renewal coming up. ` +
      `Rates have changed in your area this quarter. If I can save you money with the same coverage, would it be worth a 2-minute chat? ` +
      `Reply YES and I'll text you options. (Reply STOP to opt out)`;

    await this.logCommunication(data.tenantId, data.contactId, 'sms', 'outbound', null, body, 'day57_xdate_sms');

    return { status: 'sent', channel: 'sms', contactId: data.contactId, key_source: keys.twilioKey.api_key ? 'tenant' : 'env' };
  }

  private async sendDay45Email(data: any) {
    const keys = await this.ensureTenantHasApiKeys(data.tenantId);

    logger.log(`[Day 45] Sending rate shock intercept email to ${data.email}${keys.emailKey.api_key ? ' [tenant key]' : ' [env default]'}`, { contactId: data.contactId });

    const subject = `Did ${data.currentCarrier} raise your rates? Don't pay it without checking`;

    const body = `Hi ${data.firstName},\n\n` +
      `By now, ${data.currentCarrier} has likely sent your renewal premium. If it went up, you're not alone — but you don't have to accept it.\n\n` +
      `I've pre-formatted a quote sheet for your household using our top 4 competing carriers. It takes me less than 5 minutes ` +
      `to verify your discounts and finalize these numbers.\n\n` +
      `Reply to this email with a photo of your renewal declaration page and I'll pinpoint where they're overcharging you.\n\n` +
      `Worth a look?\n\nBest,\nYour FSOS Agent`;

    await this.logCommunication(data.tenantId, data.contactId, 'email', 'outbound', subject, body, 'day45_xdate_intercept');

    return { status: 'sent', channel: 'email', contactId: data.contactId, key_source: keys.emailKey.api_key ? 'tenant' : 'env' };
  }

  private async logCommunication(tenantId: string, contactId: string, channel: string, direction: string, subject: string | null, body: string, template: string) {
    await this.dataSource.query(
      `INSERT INTO communication_logs (tenant_id, contact_id, channel, direction, subject, body, template_used, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent')`,
      [tenantId, contactId, channel, direction, subject, body, template]
    );
  }
}
