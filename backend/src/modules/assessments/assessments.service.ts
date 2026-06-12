import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

@Injectable()
export class AssessmentsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getTemplates() {
    const rows = await this.dataSource.query(
      `SELECT * FROM assessment_templates WHERE tenant_id = current_setting('app.current_tenant_id')::uuid AND is_active = TRUE`
    );
    return { data: rows };
  }

  async createAssessment(contactId: string, templateId?: string) {
    const result = await this.dataSource.query(
      `INSERT INTO assessments (tenant_id, contact_id, template_id, status)
       VALUES (current_setting('app.current_tenant_id')::uuid, $1, $2, 'in_progress')
       RETURNING *`,
      [contactId, templateId || null]
    );
    return { data: result[0] };
  }

  async submitAssessment(id: string, responses: Record<string, any>) {
    const scores = this.calculateScores(responses);
    const overall = Math.round(
      scores.stability * 0.20 + scores.protection * 0.30 + scores.retirement * 0.25 +
      scores.estate_planning * 0.15 + scores.ltc_preparedness * 0.10
    );

    const riskLevel = overall >= 90 ? 'Financially Fortified' : overall >= 70 ? 'Generally Prepared' :
      overall >= 50 ? 'Moderate Risk' : overall >= 30 ? 'High Risk' : 'Financial Danger Zone';

    const recommendations = this.generateRecommendations(scores, responses);

    const result = await this.dataSource.query(
      `UPDATE assessments SET status = 'completed', responses = $1, scores = $2,
        overall_score = $3, risk_level = $4, recommendations = $5, completed_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [JSON.stringify(responses), JSON.stringify(scores), overall, riskLevel, JSON.stringify(recommendations), id]
    );

    if (!result.length) throw new NotFoundError('Assessment', id);

    await this.updateContactFromAssessment(result[0].contact_id, scores, riskLevel);

    logger.info('Assessment completed', { assessmentId: id, contactId: result[0].contact_id, score: overall });
    return { data: result[0] };
  }

  private calculateScores(responses: Record<string, any>): Record<string, number> {
    const fin = responses.financial_stability || {};
    const fam = responses.family_protection || {};
    const ret = responses.retirement_readiness || {};
    const ltc = responses.long_term_care || {};

    const emergencyScore = Math.min((fin.emergency_savings_months || 0) / 6 * 100, 100);
    const debtScore = Math.max(0, 100 - ((fin.monthly_debt_payments || 0) / 5000) * 100);
    const creditScore = fin.credit_score_range === '800+' ? 100 : fin.credit_score_range === '740-799' ? 85 :
      fin.credit_score_range === '670-739' ? 60 : fin.credit_score_range === '580-669' ? 35 : 15;

    const stability = Math.round((emergencyScore + debtScore + creditScore) / 3);

    const hasLife = fam.has_term || fam.has_whole_life || fam.has_iul || fam.has_vul;
    const protection = Math.round(
      (hasLife ? 40 : 0) + (fam.coverage_amount > 100000 ? 30 : fam.coverage_amount > 0 ? 15 : 0) +
      (fam.has_disability ? 15 : 0) + (fam.has_ltc ? 15 : 0)
    );

    const retireAge = ret.retirement_age || 65;
    const retireAssets = ret.retirement_assets || 0;
    const retireIncome = ret.expected_retirement_income || 0;
    const retirement = Math.round(
      Math.min(retireAge <= 55 ? 20 : retireAge <= 65 ? 40 : 20, 40) +
      Math.min(retireAssets / 1000000 * 20, 20) +
      (ret.has_401k ? 15 : 0) + (ret.has_ira ? 15 : 0) + (ret.has_annuity ? 10 : 0)
    );

    const estate = Math.round(
      (fam.beneficiaries_updated ? 25 : 0) + (fam.has_will ? 25 : 0) +
      (fam.has_trust ? 25 : 0) + (fam.has_power_of_attorney ? 12.5 : 0) +
      (fam.has_healthcare_directive ? 12.5 : 0)
    );

    const familyHistory = ltc.family_history || [];
    const historyScore = familyHistory.length > 0 ? 20 : 0;
    const carePlan = ltc.care_plan || '';
    const planScore = carePlan === 'Professional Caregiver' || carePlan === 'Assisted Living' ? 30 :
      carePlan === 'Spouse' || carePlan === 'Family' ? 70 : 40;
    const ltcScore = Math.round(100 - historyScore - (100 - planScore) * 0.5);

    return { stability, protection, retirement, estate_planning: estate, ltc_preparedness: ltcScore };
  }

  private generateRecommendations(scores: Record<string, number>, responses: Record<string, any>) {
    const recs: { priority: number; category: string; recommendation: string }[] = [];
    let priority = 1;

    if (scores.protection < 50) {
      recs.push({ priority: priority++, category: 'Protection', recommendation: 'Establish life insurance coverage for income replacement and family security' });
    }
    if (scores.stability < 50) {
      recs.push({ priority: priority++, category: 'Stability', recommendation: 'Build emergency fund to 3-6 months of expenses and address debt reduction' });
    }
    if (scores.estate_planning < 50) {
      recs.push({ priority: priority++, category: 'Estate', recommendation: 'Create will and trust documents to ensure proper asset distribution' });
    }
    if (scores.retirement < 50) {
      recs.push({ priority: priority++, category: 'Retirement', recommendation: 'Increase retirement contributions and explore IUL/annuity strategies' });
    }
    if (scores.ltc_preparedness < 50) {
      recs.push({ priority: priority++, category: 'LTC', recommendation: 'Evaluate long-term care insurance options given potential exposure' });
    }
    return recs;
  }

  private async updateContactFromAssessment(contactId: string, scores: Record<string, number>, riskLevel: string) {
    const emergencyMonths = scores.stability > 70 ? 6 : scores.stability > 40 ? 3 : 1;
    await this.dataSource.query(
      `UPDATE contacts SET stage = 'assessment_done', emergency_savings_months = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [emergencyMonths, contactId]
    );
  }

  async getContactAssessments(contactId: string) {
    const rows = await this.dataSource.query(
      `SELECT * FROM assessments WHERE contact_id = $1 ORDER BY created_at DESC`,
      [contactId]
    );
    return { data: rows };
  }

  async getAssessment(id: string) {
    const rows = await this.dataSource.query(
      `SELECT a.*, c.first_name, c.last_name, c.email
       FROM assessments a JOIN contacts c ON a.contact_id = c.id WHERE a.id = $1`,
      [id]
    );
    if (!rows.length) throw new NotFoundError('Assessment', id);
    return { data: rows[0] };
  }
}
