import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getDashboard() {
    const tenantId = `current_setting('app.current_tenant_id')::uuid`;

    const [metrics, pipelineData, conversionData, revenueData, activityData] = await Promise.all([
      this.dataSource.query(`
        SELECT
          (SELECT COUNT(*) FROM contacts WHERE tenant_id = ${tenantId}) as total_contacts,
          (SELECT COUNT(*) FROM contacts WHERE tenant_id = ${tenantId} AND status = 'Lead') as total_leads,
          (SELECT COUNT(*) FROM contacts WHERE tenant_id = ${tenantId} AND status = 'Active Client') as active_clients,
          (SELECT COUNT(*) FROM contacts WHERE tenant_id = ${tenantId} AND status = 'Active Prospect') as active_prospects,
          (SELECT COUNT(*) FROM policies WHERE tenant_id = ${tenantId} AND status = 'Bound') as bound_policies,
          (SELECT COUNT(*) FROM policies WHERE tenant_id = ${tenantId} AND status = 'Quoted') as pending_quotes,
          (SELECT COUNT(*) FROM x_date_tracker WHERE tenant_id = ${tenantId} AND ai_paused = FALSE AND current_campaign_stage != 'Closed') as active_xdates,
          (SELECT COALESCE(SUM(premium_amount), 0) FROM policies WHERE tenant_id = ${tenantId} AND status = 'Bound') as monthly_premium,
          (SELECT COALESCE(SUM(annual_premium), 0) FROM policies WHERE tenant_id = ${tenantId} AND status = 'Bound') as annual_premium_total,
          (SELECT COUNT(*) FROM appointments WHERE tenant_id = ${tenantId} AND start_time >= CURRENT_DATE AND status = 'scheduled') as upcoming_appointments
      `),
      this.dataSource.query(`
        SELECT ps.name, ps.color, ps.sort_order, COUNT(d.id) as deal_count,
               COALESCE(SUM(d.amount), 0) as total_value
        FROM pipeline_stages ps
        LEFT JOIN deals d ON d.pipeline_stage_id = ps.id AND d.status = 'open'
        WHERE ps.tenant_id = ${tenantId}
        GROUP BY ps.id, ps.name, ps.color, ps.sort_order ORDER BY ps.sort_order
      `),
      this.dataSource.query(`
        SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as leads,
               SUM(CASE WHEN status IN ('Active Client', 'Active Prospect') THEN 1 ELSE 0 END) as converted
        FROM contacts WHERE tenant_id = ${tenantId}
        GROUP BY month ORDER BY month DESC LIMIT 12
      `),
      this.dataSource.query(`
        SELECT DATE_TRUNC('month', created_at) as month, COALESCE(SUM(premium_amount), 0) as premiums,
               COALESCE(SUM(commission_amount), 0) as commissions
        FROM policies WHERE tenant_id = ${tenantId} AND status = 'Bound'
        GROUP BY month ORDER BY month DESC LIMIT 12
      `),
      this.dataSource.query(`
        SELECT DATE_TRUNC('day', created_at) as day, action, COUNT(*) as count
        FROM activity_log WHERE tenant_id = ${tenantId} AND created_at >= CURRENT_DATE - 7
        GROUP BY day, action ORDER BY day DESC
      `),
    ]);

    return {
      metrics: metrics[0] || {},
      pipeline: pipelineData,
      conversion: conversionData,
      revenue: revenueData,
      recent_activity: activityData,
    };
  }

  async getLeadSourceAnalytics() {
    const rows = await this.dataSource.query(`
      SELECT lead_source, COUNT(*) as count,
             SUM(CASE WHEN status IN ('Active Client', 'Active Prospect') THEN 1 ELSE 0 END) as converted,
             ROUND(SUM(CASE WHEN status IN ('Active Client', 'Active Prospect') THEN 1 ELSE 0 END)::decimal / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate
      FROM contacts WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
      GROUP BY lead_source ORDER BY count DESC
    `);
    return { data: rows };
  }

  async getAgentPerformance() {
    const rows = await this.dataSource.query(`
      SELECT u.id, u.first_name, u.last_name,
             (SELECT COUNT(*) FROM contacts c WHERE c.assigned_to = u.id) as total_assigned,
             (SELECT COUNT(*) FROM contacts c WHERE c.assigned_to = u.id AND c.status = 'Active Client') as clients,
             (SELECT COUNT(*) FROM deals d WHERE d.assigned_to = u.id AND d.status = 'won') as deals_won,
             (SELECT COALESCE(SUM(d.amount), 0) FROM deals d WHERE d.assigned_to = u.id AND d.status = 'won') as revenue_generated,
             (SELECT COUNT(*) FROM appointments a WHERE a.assigned_to = u.id AND a.status = 'completed') as appointments_completed
      FROM tenant_users u
      WHERE u.tenant_id = current_setting('app.current_tenant_id')::uuid
      ORDER BY revenue_generated DESC
    `);
    return { data: rows };
  }

  async getRevenueForecast() {
    const rows = await this.dataSource.query(`
      SELECT
        (SELECT COALESCE(SUM(annual_premium * commission_pct / 100), 0)
         FROM policies WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND status = 'Bound'
         AND expiration_date > CURRENT_DATE) as locked_revenue,
        (SELECT COALESCE(SUM(d.amount * d.probability / 100), 0)
         FROM deals d WHERE d.tenant_id = current_setting('app.current_tenant_id')::uuid AND d.status = 'open') as pipeline_weighted,
        (SELECT COUNT(*) FROM x_date_tracker WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
         AND target_x_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 90) as renewals_next_90
    `);
    return { data: rows[0] };
  }
}
