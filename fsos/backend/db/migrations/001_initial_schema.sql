-- ============================================================
-- FSOS - Financial Services Operating System
-- Chaotically Organized AI
-- Initial Database Schema v1.0
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TENANT (Multi-Tenant Foundation)
-- ============================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#2563EB',
    secondary_color VARCHAR(7) DEFAULT '#7C3AED',
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSONB DEFAULT '[]',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- ============================================================
-- HOUSEHOLDS (Master Anchor for Bundling)
-- ============================================================
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'US',
    home_phone VARCHAR(20),
    annual_income DECIMAL(12,2),
    household_size INTEGER DEFAULT 1,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CONTACTS (Individuals within Households)
-- ============================================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    occupation VARCHAR(150),
    employer VARCHAR(150),
    relationship_to_head VARCHAR(50) DEFAULT 'Primary',
    lead_source VARCHAR(100),
    source_details JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'Lead',
    stage VARCHAR(50) DEFAULT 'new',
    pipeline_status VARCHAR(50) DEFAULT 'active',
    credit_score_range VARCHAR(20),
    monthly_debt_payments DECIMAL(10,2),
    emergency_savings_months INTEGER DEFAULT 0,
    has_will BOOLEAN DEFAULT FALSE,
    has_trust BOOLEAN DEFAULT FALSE,
    has_power_of_attorney BOOLEAN DEFAULT FALSE,
    has_healthcare_directive BOOLEAN DEFAULT FALSE,
    marital_status VARCHAR(20),
    dependents_count INTEGER DEFAULT 0,
    business_owner BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMPTZ,
    consent_ip_address VARCHAR(45),
    consent_text TEXT,
    opted_out BOOLEAN DEFAULT FALSE,
    opted_out_at TIMESTAMPTZ,
    last_contacted_at TIMESTAMPTZ,
    next_follow_up TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_household ON contacts(household_id);
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to);
CREATE INDEX idx_contacts_status ON contacts(tenant_id, status);
CREATE INDEX idx_contacts_stage ON contacts(tenant_id, stage);
CREATE INDEX idx_contacts_next_follow_up ON contacts(tenant_id, next_follow_up) WHERE next_follow_up IS NOT NULL;
CREATE INDEX idx_contacts_opted_out ON contacts(tenant_id, opted_out) WHERE opted_out = FALSE;

-- ============================================================
-- CARRIERS (Insurance Companies)
-- ============================================================
CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    naic_code VARCHAR(20),
    am_best_rating VARCHAR(5),
    is_internal_write BOOLEAN DEFAULT TRUE,
    avg_annual_rate_change_pct DECIMAL(5,2) DEFAULT 0.00,
    lines_offered TEXT[] DEFAULT '{}',
    commission_pct DECIMAL(5,2),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- ============================================================
-- POLICIES
-- ============================================================
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    primary_contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    carrier_id UUID REFERENCES carriers(id) ON DELETE SET NULL,
    policy_number VARCHAR(100),
    line_of_business VARCHAR(50) NOT NULL,
    sub_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Quoted',
    premium_amount DECIMAL(10,2),
    annual_premium DECIMAL(10,2),
    commission_amount DECIMAL(10,2),
    commission_pct DECIMAL(5,2),
    billing_frequency VARCHAR(50) DEFAULT 'Monthly',
    face_amount DECIMAL(12,2),
    cash_value DECIMAL(12,2),
    death_benefit DECIMAL(12,2),
    deductible DECIMAL(10,2),
    coverage_limits JSONB DEFAULT '{}',
    riders JSONB DEFAULT '{}',
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    renewal_date DATE,
    underwritten_by VARCHAR(150),
    underwriting_status VARCHAR(50),
    application_id VARCHAR(100),
    documents JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_policies_contact ON policies(primary_contact_id);
CREATE INDEX idx_policies_carrier ON policies(carrier_id);
CREATE INDEX idx_policies_tenant ON policies(tenant_id);
CREATE INDEX idx_policies_lob ON policies(tenant_id, line_of_business);
CREATE INDEX idx_policies_status ON policies(tenant_id, status);
CREATE INDEX idx_policies_expiration ON policies(expiration_date);
CREATE INDEX idx_policies_effective ON policies(effective_date);

ALTER TABLE policies ADD CONSTRAINT chk_policy_dates CHECK (expiration_date > effective_date);

-- ============================================================
-- X-DATE TRACKER (Automation Engine Ledger)
-- ============================================================
CREATE TABLE x_date_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    target_x_date DATE NOT NULL,
    automation_trigger_date DATE NOT NULL,
    current_campaign_stage VARCHAR(50) DEFAULT 'Pending',
    campaign_stages JSONB DEFAULT '[]',
    ai_paused BOOLEAN DEFAULT FALSE,
    paused_by UUID REFERENCES tenant_users(id),
    pause_reason VARCHAR(255),
    human_intervention_needed BOOLEAN DEFAULT FALSE,
    last_action_timestamp TIMESTAMPTZ,
    sequence_started_at TIMESTAMPTZ,
    sequence_completed_at TIMESTAMPTZ,
    outcome VARCHAR(50),
    outcome_details TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_xdate_tenant ON x_date_tracker(tenant_id);
CREATE INDEX idx_xdate_contact ON x_date_tracker(contact_id);
CREATE INDEX idx_xdate_trigger ON x_date_tracker(automation_trigger_date) WHERE ai_paused = FALSE;
CREATE INDEX idx_xdate_stage ON x_date_tracker(tenant_id, current_campaign_stage);
CREATE INDEX idx_xdate_pending ON x_date_tracker(tenant_id, automation_trigger_date) WHERE current_campaign_stage = 'Pending' AND ai_paused = FALSE;

-- ============================================================
-- ASSESSMENTS (Financial Health Scoring)
-- ============================================================
CREATE TABLE assessment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB NOT NULL DEFAULT '{}',
    scoring_rules JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES assessment_templates(id),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    completed_by UUID REFERENCES tenant_users(id),
    status VARCHAR(50) DEFAULT 'in_progress',
    responses JSONB NOT NULL DEFAULT '{}',
    scores JSONB NOT NULL DEFAULT '{}',
    overall_score INTEGER,
    risk_level VARCHAR(50),
    ai_insights JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    report_pdf_url TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_contact ON assessments(contact_id);
CREATE INDEX idx_assessments_tenant ON assessments(tenant_id);
CREATE INDEX idx_assessments_score ON assessments(overall_score);

-- ============================================================
-- WORKFLOW ENGINE (DAG Automation)
-- ============================================================
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    trigger_config JSONB NOT NULL DEFAULT '{}',
    nodes JSONB NOT NULL DEFAULT '[]',
    edges JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES workflow_templates(id),
    contact_id UUID REFERENCES contacts(id),
    status VARCHAR(50) DEFAULT 'pending',
    current_node_id VARCHAR(100),
    context JSONB DEFAULT '{}',
    execution_history JSONB DEFAULT '[]',
    error_details JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_templates_tenant ON workflow_templates(tenant_id);
CREATE INDEX idx_workflow_instances_tenant ON workflow_instances(tenant_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_contact ON workflow_instances(contact_id);

-- ============================================================
-- AI AGENTS
-- ============================================================
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSONB NOT NULL DEFAULT '{}',
    channel_config JSONB DEFAULT '{}',
    schedule_config JSONB DEFAULT '{}',
    llm_config JSONB DEFAULT '{}',
    last_run_at TIMESTAMPTZ,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

CREATE TABLE agent_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES ai_agents(id),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL,
    session_data JSONB DEFAULT '{}',
    messages JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    outcome VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_conversations_contact ON agent_conversations(contact_id);
CREATE INDEX idx_agent_conversations_agent ON agent_conversations(agent_id);
CREATE INDEX idx_agent_conversations_status ON agent_conversations(status);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES tenant_users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    appointment_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    location VARCHAR(255),
    meeting_link TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_method VARCHAR(50),
    confirmation_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    outcome VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_assigned ON appointments(assigned_to);
CREATE INDEX idx_appointments_contact ON appointments(contact_id);
CREATE INDEX idx_appointments_start ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(tenant_id, status);

-- ============================================================
-- COMMUNICATIONS
-- ============================================================
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES ai_agents(id),
    sent_by UUID REFERENCES tenant_users(id),
    channel VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL DEFAULT 'outbound',
    subject VARCHAR(255),
    body TEXT,
    template_used VARCHAR(150),
    status VARCHAR(50) DEFAULT 'sent',
    external_id VARCHAR(255),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comms_contact ON communication_logs(contact_id);
CREATE INDEX idx_comms_tenant ON communication_logs(tenant_id);
CREATE INDEX idx_comms_channel ON communication_logs(channel);
CREATE INDEX idx_comms_created ON communication_logs(created_at);
CREATE INDEX idx_comms_status ON communication_logs(status);

-- ============================================================
-- PIPELINE & DEALS
-- ============================================================
CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7) DEFAULT '#6B7280',
    probability INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, sort_order)
);

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    pipeline_stage_id UUID REFERENCES pipeline_stages(id),
    assigned_to UUID REFERENCES tenant_users(id),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2),
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    deal_type VARCHAR(100),
    products TEXT[] DEFAULT '{}',
    notes TEXT,
    status VARCHAR(50) DEFAULT 'open',
    lost_reason TEXT,
    won_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deals_tenant ON deals(tenant_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_assigned ON deals(assigned_to);
CREATE INDEX idx_deals_stage ON deals(pipeline_stage_id);
CREATE INDEX idx_deals_status ON deals(tenant_id, status);

-- ============================================================
-- PRODUCT CATALOG
-- ============================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]',
    typical_premium_range JSONB DEFAULT '{}',
    commission_pct DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ACTIVITY FEED
-- ============================================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES tenant_users(id),
    contact_id UUID REFERENCES contacts(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_tenant ON activity_log(tenant_id);
CREATE INDEX idx_activity_actor ON activity_log(actor_id);
CREATE INDEX idx_activity_contact ON activity_log(contact_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY (Tenant Isolation)
-- ============================================================
-- Enable RLS on all tenant-scoped tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE x_date_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_households ON households
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_contacts ON contacts
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_carriers ON carriers
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_policies ON policies
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_xdate ON x_date_tracker
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_assessment_templates ON assessment_templates
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_assessments ON assessments
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_workflow_templates ON workflow_templates
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_workflow_instances ON workflow_instances
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_ai_agents ON ai_agents
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_agent_conversations ON agent_conversations
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_appointments ON appointments
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_communications ON communication_logs
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_pipeline_stages ON pipeline_stages
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_deals ON deals
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_products ON products
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
CREATE POLICY tenant_isolation_activity ON activity_log
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carriers_updated_at BEFORE UPDATE ON carriers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_xdate_updated_at BEFORE UPDATE ON x_date_tracker
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_templates_updated_at BEFORE UPDATE ON assessment_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
