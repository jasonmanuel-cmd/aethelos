import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Seed Tenant
    const tenantId = uuidv4();
    const userId = uuidv4();
    const carrierIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const stageIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const productIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const agentIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const householdIds = [uuidv4(), uuidv4(), uuidv4()];
    const contactIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];

    // Tenant
    await client.query(
      `INSERT INTO tenants (id, name, slug, domain, primary_color, secondary_color) VALUES ($1,$2,$3,$4,$5,$6)`,
      [tenantId, 'Demo Agency', 'demo-agency', 'demo.fsos.io', '#2563EB', '#7C3AED']
    );

    // Admin User
    const hash = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO tenant_users (id, tenant_id, email, password_hash, first_name, last_name, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, tenantId, 'admin@demo.com', hash, 'Admin', 'User', 'admin']
    );

    // Carrier seeds
    const carriers = [
      { id: carrierIds[0], name: 'Progressive', naic: '24260', rating: 'A+', lines: '{Auto,Home,Umbrella}', comm: 15 },
      { id: carrierIds[1], name: 'Travelers', naic: '25676', rating: 'A++', lines: '{Auto,Home,Umbrella,Life}', comm: 12 },
      { id: carrierIds[2], name: 'Nationwide', naic: '23767', rating: 'A+', lines: '{Auto,Home,Life,Commercial}', comm: 13 },
      { id: carrierIds[3], name: 'Prudential', naic: '68245', rating: 'A+', lines: '{Life,IUL,VUL,LTC}', comm: 55 },
      { id: carrierIds[4], name: 'MetLife', naic: '65978', rating: 'A+', lines: '{Life,Disability,LTC,Annuities}', comm: 50 },
    ];
    for (const c of carriers) {
      await client.query(
        `INSERT INTO carriers (id, tenant_id, name, naic_code, am_best_rating, lines_offered, commission_pct)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [c.id, tenantId, c.name, c.naic, c.rating, c.lines, c.comm]
      );
    }

    // Pipeline Stages
    const stages = [
      { id: stageIds[0], name: 'New Lead', order: 1, color: '#6B7280', prob: 5 },
      { id: stageIds[1], name: 'Contacted', order: 2, color: '#3B82F6', prob: 15 },
      { id: stageIds[2], name: 'Assessment Done', order: 3, color: '#8B5CF6', prob: 30 },
      { id: stageIds[3], name: 'Proposal Sent', order: 4, color: '#F59E0B', prob: 50 },
      { id: stageIds[4], name: 'Closing', order: 5, color: '#10B981', prob: 75 },
    ];
    for (const s of stages) {
      await client.query(
        `INSERT INTO pipeline_stages (id, tenant_id, name, sort_order, color, probability)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [s.id, tenantId, s.name, s.order, s.color, s.prob]
      );
    }

    // Products
    const products = [
      { id: productIds[0], name: 'Term Life Insurance', cat: 'Life', desc: 'Simple death benefit protection', comm: 60 },
      { id: productIds[1], name: 'Whole Life Insurance', cat: 'Life', desc: 'Cash value + death benefit', comm: 55 },
      { id: productIds[2], name: 'Indexed Universal Life (IUL)', cat: 'Life', desc: 'Growth potential + protection', comm: 50 },
      { id: productIds[3], name: 'Variable Universal Life (VUL)', cat: 'Life', desc: 'Market-linked growth + protection', comm: 45 },
      { id: productIds[4], name: 'Long-Term Care Insurance', cat: 'LTC', desc: 'Coverage for extended care needs', comm: 35 },
      { id: productIds[5], name: 'Auto Insurance', cat: 'Auto', desc: 'Personal auto coverage', comm: 15 },
      { id: productIds[6], name: 'Homeowners Insurance', cat: 'Home', desc: 'Property & liability protection', comm: 15 },
      { id: productIds[7], name: 'Will & Trust', cat: 'Estate', desc: 'Estate planning documents', comm: 20 },
    ];
    for (const p of products) {
      await client.query(
        `INSERT INTO products (id, tenant_id, name, category, description, commission_pct)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [p.id, tenantId, p.name, p.cat, p.desc, p.comm]
      );
    }

    // AI Agents
    const agents = [
      { id: agentIds[0], name: 'Lead Qualifier', type: 'qualification', desc: 'Qualifies inbound leads via conversation' },
      { id: agentIds[1], name: 'Appointment Setter', type: 'appointment', desc: 'Books meetings automatically' },
      { id: agentIds[2], name: 'Follow-Up Nurture', type: 'follow_up', desc: 'Nurtures leads with educational content' },
      { id: agentIds[3], name: 'Cross-Sell Detector', type: 'cross_sell', desc: 'Identifies cross-sell opportunities' },
      { id: agentIds[4], name: 'Retention Guardian', type: 'retention', desc: 'Monitors at-risk clients' },
    ];
    for (const a of agents) {
      await client.query(
        `INSERT INTO ai_agents (id, tenant_id, name, agent_type, description, configuration)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [a.id, tenantId, a.name, a.type, a.desc, JSON.stringify({ enabled: true, channels: ['sms', 'email'] })]
      );
    }

    // Households
    const households = [
      { id: householdIds[0], name: 'The Johnson Family', addr: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', income: 120000, size: 4 },
      { id: householdIds[1], name: 'The Smith Household', addr: '456 Pine Ave', city: 'Miami', state: 'FL', zip: '33101', income: 85000, size: 2 },
      { id: householdIds[2], name: 'The Davis Family', addr: '789 Elm Rd', city: 'Denver', state: 'CO', zip: '80201', income: 210000, size: 5 },
    ];
    for (const h of households) {
      await client.query(
        `INSERT INTO households (id, tenant_id, name, street_address, city, state, zip_code, annual_income, household_size)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [h.id, tenantId, h.name, h.addr, h.city, h.state, h.zip, h.income, h.size]
      );
    }

    // Contacts
    const contacts = [
      { id: contactIds[0], hid: householdIds[0], fn: 'Michael', ln: 'Johnson', email: 'michael@example.com', phone: '512-555-0101', status: 'Active Client', stage: 'client', ls: 'Referral', inc: 120000, dep: 2, dob: '1980-05-15' },
      { id: contactIds[1], hid: householdIds[0], fn: 'Sarah', ln: 'Johnson', email: 'sarah@example.com', phone: '512-555-0102', status: 'Active Client', stage: 'client', ls: 'Referral', rel: 'Spouse', inc: 85000, dob: '1982-08-22' },
      { id: contactIds[2], hid: householdIds[1], fn: 'Robert', ln: 'Smith', email: 'robert@example.com', phone: '305-555-0201', status: 'Lead', stage: 'new', ls: 'Facebook Ads', inc: 85000, dep: 0, dob: '1990-11-03' },
      { id: contactIds[3], hid: householdIds[1], fn: 'Emily', ln: 'Smith', email: 'emily@example.com', phone: '305-555-0202', status: 'Lead', stage: 'new', ls: 'Facebook Ads', rel: 'Spouse', inc: 65000, dob: '1992-02-14' },
      { id: contactIds[4], hid: householdIds[2], fn: 'James', ln: 'Davis', email: 'james@example.com', phone: '303-555-0301', status: 'Active Prospect', stage: 'assessment_done', ls: 'Organic Web', inc: 210000, dep: 3, dob: '1975-07-30' },
      { id: contactIds[5], hid: householdIds[2], fn: 'Lisa', ln: 'Davis', email: 'lisa@example.com', phone: '303-555-0302', status: 'Active Prospect', stage: 'assessment_done', ls: 'Organic Web', rel: 'Spouse', inc: 95000, dob: '1978-12-18' },
      { id: contactIds[6], hid: null, fn: 'Thomas', ln: 'Wilson', email: 'thomas@example.com', phone: '214-555-0401', status: 'Lead', stage: 'new', ls: 'Google Ads', inc: 55000, dep: 1, dob: '1995-09-08' },
      { id: contactIds[7], hid: null, fn: 'Jennifer', ln: 'Brown', email: 'jennifer@example.com', phone: '713-555-0501', status: 'Lead', stage: 'contacted', ls: 'Referral', inc: 175000, dep: 0, dob: '1988-04-25' },
    ];
    for (const c of contacts) {
      await client.query(
        `INSERT INTO contacts (id, tenant_id, household_id, first_name, last_name, email, phone, status, stage, lead_source, annual_income, dependents_count, date_of_birth, relationship_to_head, marital_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [c.id, tenantId, c.hid, c.fn, c.ln, c.email, c.phone, c.status, c.stage || 'new', c.ls, c.inc, c.dep, c.dob || null, c.rel || 'Primary', c.dep > 0 ? 'Married' : 'Single']
      );
    }

    // Policies
    const policyIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const policies = [
      { id: policyIds[0], cid: contactIds[0], carrId: carrierIds[0], num: 'POL-AUTO-001', lob: 'Auto', status: 'Bound', prem: 1200, annual: 1440, eff: '2026-01-01', exp: '2026-07-01', bill: 'Monthly' },
      { id: policyIds[1], cid: contactIds[0], carrId: carrierIds[3], num: 'POL-LIFE-001', lob: 'Life', sub: 'IUL', status: 'Bound', prem: 350, annual: 4200, eff: '2025-06-15', exp: '2026-06-15', bill: 'Monthly', fa: 500000 },
      { id: policyIds[2], cid: contactIds[4], carrId: carrierIds[1], num: 'POL-AUTO-002', lob: 'Auto', status: 'Bound', prem: 1800, annual: 2160, eff: '2026-03-01', exp: '2026-09-01', bill: 'Monthly' },
      { id: policyIds[3], cid: contactIds[4], carrId: carrierIds[2], num: 'POL-HOME-001', lob: 'Home', status: 'Bound', prem: 2400, annual: 2880, eff: '2025-12-01', exp: '2026-12-01', bill: 'Annually' },
    ];
    for (const p of policies) {
      await client.query(
        `INSERT INTO policies (id, tenant_id, primary_contact_id, carrier_id, policy_number, line_of_business, sub_type, status, premium_amount, annual_premium, effective_date, expiration_date, billing_frequency, face_amount)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [p.id, tenantId, p.cid, p.carrId, p.num, p.lob, p.sub || null, p.status, p.prem, p.annual, p.eff, p.exp, p.bill, p.fa || null]
      );
    }

    // X-Date Tracker entries
    const xdateIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const xdates = [
      { id: xdateIds[0], pid: policyIds[0], cid: contactIds[0], target: '2026-07-01', trigger: '2026-05-02', stage: 'Day_60_Sent' },
      { id: xdateIds[1], pid: policyIds[1], cid: contactIds[0], target: '2026-06-15', trigger: '2026-04-16', stage: 'Pending' },
      { id: xdateIds[2], pid: policyIds[2], cid: contactIds[4], target: '2026-09-01', trigger: '2026-07-03', stage: 'Pending' },
      { id: xdateIds[3], pid: policyIds[3], cid: contactIds[4], target: '2026-12-01', trigger: '2026-10-02', stage: 'Pending' },
    ];
    for (const x of xdates) {
      await client.query(
        `INSERT INTO x_date_tracker (id, tenant_id, policy_id, contact_id, target_x_date, automation_trigger_date, current_campaign_stage)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [x.id, tenantId, x.pid, x.cid, x.target, x.trigger, x.stage]
      );
    }

    // Assessment template
    const templateId = uuidv4();
    await client.query(
      `INSERT INTO assessment_templates (id, tenant_id, name, description, category, config, scoring_rules)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [templateId, tenantId, 'Financial Health Assessment', 'Comprehensive financial wellness check', 'financial_health',
        JSON.stringify({
          sections: [
            { id: 'basic_info', title: 'Basic Information', order: 1 },
            { id: 'financial_stability', title: 'Financial Stability', order: 2 },
            { id: 'family_protection', title: 'Family Protection', order: 3 },
            { id: 'retirement_readiness', title: 'Retirement Readiness', order: 4 },
            { id: 'long_term_care', title: 'Long-Term Care Risk', order: 5 }
          ]
        }),
        JSON.stringify({
          stability_weight: 0.20,
          protection_weight: 0.30,
          retirement_weight: 0.25,
          estate_weight: 0.15,
          ltc_weight: 0.10
        })
      ]
    );

    // Sample assessment for James Davis
    await client.query(
      `INSERT INTO assessments (id, tenant_id, template_id, contact_id, status, responses, scores, overall_score, risk_level, recommendations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [uuidv4(), tenantId, templateId, contactIds[4], 'completed',
        JSON.stringify({
          basic_info: { age: 50, income: 210000, marital_status: 'Married', dependents: 3 },
          financial_stability: { emergency_savings: 6, debt_payments: 2500, credit_score: '740-799', homeowner: true },
          family_protection: { has_term: false, has_whole_life: false, has_iul: false, coverage_amount: 0 },
          retirement_readiness: { retirement_age: 62, retirement_assets: 450000, has_401k: true, has_ira: true },
          long_term_care: { family_history: ['Cancer', 'Stroke'], care_plan: 'Spouse' }
        }),
        JSON.stringify({
          stability: 72, protection: 15, retirement: 58, estate_planning: 20, ltc_preparedness: 35
        }),
        42,
        'High Risk',
        JSON.stringify([
          { priority: 1, category: 'Protection', recommendation: 'Establish life insurance coverage for income replacement' },
          { priority: 2, category: 'Estate', recommendation: 'Create will and trust documents' },
          { priority: 3, category: 'LTC', recommendation: 'Evaluate long-term care insurance options due to family history' }
        ])
      ]
    );

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
    console.log('  Tenant: Demo Agency (demo.fsos.io)');
    console.log('  Admin: admin@demo.com / admin123');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', e);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
