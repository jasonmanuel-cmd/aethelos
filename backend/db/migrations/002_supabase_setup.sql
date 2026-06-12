-- ============================================================
-- FSOS - Supabase Setup & Per-Tenant API Keys
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. Run 001_initial_schema.sql first (the full schema)
-- 2. Then run everything below

-- ============================================================
-- TENANT API KEYS (Per-tenant service credentials)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    api_key TEXT,
    api_secret TEXT,
    config_json JSONB DEFAULT '{}',
    is_configured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, service_name)
);

ALTER TABLE tenant_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_api_keys ON tenant_api_keys
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE TRIGGER update_tenant_api_keys_updated_at BEFORE UPDATE ON tenant_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_tenant_api_keys_tenant ON tenant_api_keys(tenant_id);
CREATE INDEX idx_tenant_api_keys_service ON tenant_api_keys(service_name);

-- ============================================================
-- MASTER DEMO TENANT + USER
-- ============================================================
-- Run this AFTER seeding the tenant. If using seed.ts, the JWT
-- secret below must match process.env.JWT_SECRET in .env.
-- For Supabase, we create the demo account directly in SQL.

-- Generate UUIDs for the master demo tenant
-- NOTE: Replace these with fresh UUIDs from uuid_generate_v4() or
--       use fixed ones for repeatable seeding.
--       These UUIDs are for reference — run without the DECLARE
--       block or use a DO block in Supabase.

DO $$
DECLARE
    master_tenant_id UUID := uuid_generate_v4();
    master_user_id UUID := uuid_generate_v4();
    master_household_id UUID := uuid_generate_v4();
    master_contact_id UUID := uuid_generate_v4();
BEGIN

-- Master Tenant
INSERT INTO tenants (id, name, slug, domain, primary_color, secondary_color)
VALUES (master_tenant_id, 'COAI Demo Agency', 'coai-demo', 'demo.coaibakersfield.com', '#2563EB', '#7C3AED');

-- Master User (jasonm@coaibakersfield.com)
-- Password: blunts954 (bcrypt hash)
INSERT INTO tenant_users (id, tenant_id, email, password_hash, first_name, last_name, role)
VALUES (
    master_user_id,
    master_tenant_id,
    'jasonm@coaibakersfield.com',
    '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0IRLG2y',
    'Jason',
    'Manalang',
    'admin'
);

-- Carriers for master tenant
INSERT INTO carriers (id, tenant_id, name, naic_code, am_best_rating, lines_offered, commission_pct)
VALUES
    (uuid_generate_v4(), master_tenant_id, 'Progressive', '24260', 'A+', '{Auto,Home,Umbrella}', 15),
    (uuid_generate_v4(), master_tenant_id, 'Travelers', '25676', 'A++', '{Auto,Home,Umbrella,Life}', 12),
    (uuid_generate_v4(), master_tenant_id, 'Nationwide', '23767', 'A+', '{Auto,Home,Life,Commercial}', 13),
    (uuid_generate_v4(), master_tenant_id, 'Prudential', '68245', 'A+', '{Life,IUL,VUL,LTC}', 55),
    (uuid_generate_v4(), master_tenant_id, 'MetLife', '65978', 'A+', '{Life,Disability,LTC,Annuities}', 50);

-- Pipeline stages for master tenant
INSERT INTO pipeline_stages (id, tenant_id, name, sort_order, color, probability)
VALUES
    (uuid_generate_v4(), master_tenant_id, 'New Lead', 1, '#6B7280', 5),
    (uuid_generate_v4(), master_tenant_id, 'Contacted', 2, '#3B82F6', 15),
    (uuid_generate_v4(), master_tenant_id, 'Assessment Done', 3, '#8B5CF6', 30),
    (uuid_generate_v4(), master_tenant_id, 'Proposal Sent', 4, '#F59E0B', 50),
    (uuid_generate_v4(), master_tenant_id, 'Closing', 5, '#10B981', 75);

-- Products for master tenant
INSERT INTO products (id, tenant_id, name, category, description, commission_pct)
VALUES
    (uuid_generate_v4(), master_tenant_id, 'Term Life Insurance', 'Life', 'Simple death benefit protection', 60),
    (uuid_generate_v4(), master_tenant_id, 'Whole Life Insurance', 'Life', 'Cash value + death benefit', 55),
    (uuid_generate_v4(), master_tenant_id, 'Indexed Universal Life (IUL)', 'Life', 'Growth potential + protection', 50),
    (uuid_generate_v4(), master_tenant_id, 'Variable Universal Life (VUL)', 'Life', 'Market-linked growth + protection', 45),
    (uuid_generate_v4(), master_tenant_id, 'Long-Term Care Insurance', 'LTC', 'Coverage for extended care needs', 35),
    (uuid_generate_v4(), master_tenant_id, 'Auto Insurance', 'Auto', 'Personal auto coverage', 15),
    (uuid_generate_v4(), master_tenant_id, 'Homeowners Insurance', 'Home', 'Property & liability protection', 15),
    (uuid_generate_v4(), master_tenant_id, 'Will & Trust', 'Estate', 'Estate planning documents', 20);

-- AI Agents for master tenant
INSERT INTO ai_agents (id, tenant_id, name, agent_type, description, configuration)
VALUES
    (uuid_generate_v4(), master_tenant_id, 'Lead Qualifier', 'qualification', 'Qualifies inbound leads via conversation', '{"enabled": true, "channels": ["sms", "email"]}'),
    (uuid_generate_v4(), master_tenant_id, 'Appointment Setter', 'appointment', 'Books meetings automatically', '{"enabled": true, "channels": ["sms", "email"]}'),
    (uuid_generate_v4(), master_tenant_id, 'Follow-Up Nurture', 'follow_up', 'Nurtures leads with educational content', '{"enabled": true, "channels": ["email"]}'),
    (uuid_generate_v4(), master_tenant_id, 'Cross-Sell Detector', 'cross_sell', 'Identifies cross-sell opportunities', '{"enabled": true, "channels": ["system"]}'),
    (uuid_generate_v4(), master_tenant_id, 'Retention Guardian', 'retention', 'Monitors at-risk clients', '{"enabled": true, "channels": ["system"]}');

-- Demo Household
INSERT INTO households (id, tenant_id, name, street_address, city, state, zip_code, annual_income, household_size)
VALUES (master_household_id, master_tenant_id, 'The Demo Family', '1234 Main Street', 'Bakersfield', 'CA', '93301', 150000, 4);

-- Demo Contacts
INSERT INTO contacts (id, tenant_id, household_id, first_name, last_name, email, phone, status, stage, lead_source, annual_income, dependents_count, relationship_to_head, marital_status)
VALUES
    (master_contact_id, master_tenant_id, master_household_id, 'John', 'Demo', 'john.demo@email.com', '661-555-0100', 'Active Client', 'client', 'Referral', 150000, 2, 'Primary', 'Married'),
    (uuid_generate_v4(), master_tenant_id, master_household_id, 'Jane', 'Demo', 'jane.demo@email.com', '661-555-0101', 'Active Client', 'client', 'Referral', 75000, 0, 'Spouse', 'Married'),
    (uuid_generate_v4(), master_tenant_id, NULL, 'Sarah', 'Prospect', 'sarah@email.com', '661-555-0200', 'Lead', 'new', 'Facebook Ads', 85000, 2, 'Primary', 'Married'),
    (uuid_generate_v4(), master_tenant_id, NULL, 'Mike', 'WarmLead', 'mike@email.com', '661-555-0300', 'Active Prospect', 'assessment_done', 'Google Ads', 120000, 1, 'Primary', 'Single');

-- Demo Policies
INSERT INTO policies (id, tenant_id, primary_contact_id, line_of_business, status, premium_amount, annual_premium, effective_date, expiration_date, billing_frequency)
VALUES
    (uuid_generate_v4(), master_tenant_id, master_contact_id, 'Auto', 'Bound', 145.00, 1740.00, '2026-01-01', '2026-12-31', 'Monthly'),
    (uuid_generate_v4(), master_tenant_id, master_contact_id, 'Life', 'Bound', 85.00, 1020.00, '2025-06-15', '2026-06-15', 'Monthly');

-- Assessment template
INSERT INTO assessment_templates (id, tenant_id, name, description, category, config, scoring_rules)
VALUES (uuid_generate_v4(), master_tenant_id, 'Financial Health Assessment', 'Comprehensive financial wellness check', 'financial_health',
    '{"sections": [{"id": "basic_info", "title": "Basic Information", "order": 1}, {"id": "financial_stability", "title": "Financial Stability", "order": 2}, {"id": "family_protection", "title": "Family Protection", "order": 3}, {"id": "retirement_readiness", "title": "Retirement Readiness", "order": 4}, {"id": "long_term_care", "title": "Long-Term Care Risk", "order": 5}]}',
    '{"stability_weight": 0.20, "protection_weight": 0.30, "retirement_weight": 0.25, "estate_weight": 0.15, "ltc_weight": 0.10}'
);

-- Workflow templates
INSERT INTO workflow_templates (id, tenant_id, name, description, category, trigger_config, nodes, edges)
VALUES (uuid_generate_v4(), master_tenant_id, 'New Lead Nurture', 'Automated nurture sequence for new leads', 'lead_nurture',
    '{"trigger": "lead_created"}',
    '[{"id": "n1", "type": "trigger", "config": {"event": "lead_created"}, "position": {"x": 100, "y": 100}}, {"id": "n2", "type": "delay", "config": {"delay_days": 1}, "position": {"x": 300, "y": 100}}, {"id": "n3", "type": "action", "config": {"type": "send_email", "template": "welcome"}, "position": {"x": 500, "y": 100}}]',
    '[{"id": "e1", "source": "n1", "target": "n2"}, {"id": "e2", "source": "n2", "target": "n3"}]'
);

-- Seed default API key records for the master tenant (set to FALSE so user must configure)
INSERT INTO tenant_api_keys (id, tenant_id, service_name, is_configured)
VALUES
    (uuid_generate_v4(), master_tenant_id, 'openai', FALSE),
    (uuid_generate_v4(), master_tenant_id, 'twilio', FALSE),
    (uuid_generate_v4(), master_tenant_id, 'email', FALSE);

RAISE NOTICE 'Master demo tenant seeded successfully';
RAISE NOTICE '  Tenant: COAI Demo Agency (demo.coaibakersfield.com)';
RAISE NOTICE '  Admin: jasonm@coaibakersfield.com / blunts954';

END $$;
