export const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002';

export const DEMO_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDIiLCJ0ZW5hbnRJZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiamFzb25tQGNvYWliYWtlcnNmaWVsZC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODEzMzE1NTIsImV4cCI6MTc4MTQxNzk1Mn0.MBuhnSIFFSJqhiWDPoVre2lnkybS5gUczmoRfnky9qY';

export const demoUser = {
  id: DEMO_USER_ID, email: 'jasonm@coaibakersfield.com',
  first_name: 'Jason', last_name: 'Blunt', role: 'admin',
};

export const demoTenant = {
  id: DEMO_TENANT_ID, name: 'COAI Demo Agency', slug: 'coai-demo',
};

// ─── Contacts ──────────────────────────────────────────────────────────
export const demoContacts = [
  {
    id: 'contact-001', household_id: 'hh-001',
    first_name: 'John', last_name: 'Anderson',
    email: 'john.anderson@email.com', phone: '661-555-0101',
    status: 'Active Client', stage: 'client', lead_source: 'Referral',
    annual_income: 155000, date_of_birth: '1980-05-15',
    occupation: 'Small Business Owner', employer: 'Anderson Electric LLC',
    marital_status: 'Married', dependents_count: 2,
    business_owner: true, has_will: true, has_trust: false, has_power_of_attorney: true,
    city: 'Bakersfield', state: 'CA', zip: '93301',
    created_at: '2025-01-15T00:00:00Z',
    next_follow_up: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    policies: [
      { id: 'policy-001', line_of_business: 'Auto', carrier_name: 'Progressive', policy_number: 'POL-A-1001', status: 'Active', premium_amount: 145.00, annual_premium: 1740, effective_date: '2025-03-01', expiration_date: '2026-03-01', billing_frequency: 'Monthly', commission_pct: 10 },
      { id: 'policy-002', line_of_business: 'Life', carrier_name: 'Prudential', policy_number: 'POL-L-1001', status: 'Active', premium_amount: 85.00, annual_premium: 1020, effective_date: '2025-06-15', expiration_date: '2045-06-15', billing_frequency: 'Monthly', commission_pct: 50, face_amount: 500000 },
      { id: 'policy-003', line_of_business: 'Home', carrier_name: 'Travelers', policy_number: 'POL-H-1001', status: 'Active', premium_amount: 210.00, annual_premium: 2520, effective_date: '2025-01-01', expiration_date: '2026-01-01', billing_frequency: 'Monthly', commission_pct: 10 },
    ],
  },
  {
    id: 'contact-002', household_id: 'hh-001',
    first_name: 'Sarah', last_name: 'Anderson',
    email: 'sarah.anderson@email.com', phone: '661-555-0102',
    status: 'Active Client', stage: 'client', lead_source: 'Referral',
    annual_income: 72000, date_of_birth: '1982-08-22',
    occupation: 'Elementary Teacher', employer: 'Bakersfield City SD',
    marital_status: 'Married', dependents_count: 0,
    business_owner: false, has_will: false, has_trust: false, has_power_of_attorney: false,
    city: 'Bakersfield', state: 'CA', zip: '93301',
    created_at: '2025-01-15T00:00:00Z',
    next_follow_up: null,
    policies: [
      { id: 'policy-004', line_of_business: 'Auto', carrier_name: 'Progressive', policy_number: 'POL-A-1002', status: 'Active', premium_amount: 95.00, annual_premium: 1140, effective_date: '2025-03-01', expiration_date: '2026-03-01', billing_frequency: 'Monthly', commission_pct: 10 },
    ],
  },
  {
    id: 'contact-003',
    first_name: 'Michael', last_name: 'Carter',
    email: 'michael.carter@email.com', phone: '661-555-0201',
    status: 'Active Prospect', stage: 'assessment_done', lead_source: 'Google Ads',
    annual_income: 128000, date_of_birth: '1986-11-03',
    occupation: 'Project Manager', employer: 'Aera Energy',
    marital_status: 'Married', dependents_count: 2,
    business_owner: false, has_will: false, has_trust: false, has_power_of_attorney: false,
    city: 'Bakersfield', state: 'CA', zip: '93309',
    created_at: '2026-02-10T00:00:00Z',
    next_follow_up: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    policies: [],
  },
  {
    id: 'contact-004',
    first_name: 'Emily', last_name: 'Rodriguez',
    email: 'emily.r@email.com', phone: '661-555-0301',
    status: 'Lead', stage: 'new', lead_source: 'Facebook Ads',
    annual_income: 82000, date_of_birth: '1992-07-20',
    occupation: 'Registered Nurse', employer: 'Kern Medical Center',
    marital_status: 'Single', dependents_count: 1,
    business_owner: false, has_will: false, has_trust: false, has_power_of_attorney: false,
    city: 'Bakersfield', state: 'CA', zip: '93304',
    created_at: '2026-04-05T00:00:00Z',
    next_follow_up: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    policies: [],
  },
  {
    id: 'contact-005', household_id: 'hh-002',
    first_name: 'Robert', last_name: 'Martinez',
    email: 'robert.m@email.com', phone: '305-555-0201',
    status: 'Lead', stage: 'contacted', lead_source: 'Facebook Ads',
    annual_income: 55000, date_of_birth: '1993-04-12',
    occupation: 'Electrician', employer: 'Martinez Electric',
    marital_status: 'Single', dependents_count: 0,
    business_owner: true, has_will: false, has_trust: false, has_power_of_attorney: false,
    city: 'Miami', state: 'FL', zip: '33101',
    created_at: '2026-04-28T00:00:00Z',
    next_follow_up: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    policies: [],
  },
  {
    id: 'contact-006', household_id: 'hh-003',
    first_name: 'James', last_name: 'Thompson',
    email: 'james.thompson@email.com', phone: '303-555-0301',
    status: 'Active Prospect', stage: 'proposal_sent', lead_source: 'Organic Web',
    annual_income: 210000, date_of_birth: '1975-07-30',
    occupation: 'Physician', employer: 'Denver Health Medical Center',
    marital_status: 'Married', dependents_count: 3,
    business_owner: false, has_will: true, has_trust: false, has_power_of_attorney: true,
    city: 'Denver', state: 'CO', zip: '80201',
    created_at: '2025-11-20T00:00:00Z',
    next_follow_up: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    policies: [
      { id: 'policy-005', line_of_business: 'Life', carrier_name: 'MetLife', policy_number: 'POL-L-2001', status: 'Active', premium_amount: 320.00, annual_premium: 3840, effective_date: '2025-01-01', expiration_date: '2055-01-01', billing_frequency: 'Monthly', commission_pct: 50, face_amount: 1000000 },
      { id: 'policy-006', line_of_business: 'Auto', carrier_name: 'Travelers', policy_number: 'POL-A-2001', status: 'Active', premium_amount: 180.00, annual_premium: 2160, effective_date: '2025-03-15', expiration_date: '2026-03-15', billing_frequency: 'Monthly', commission_pct: 10 },
      { id: 'policy-007', line_of_business: 'Umbrella', carrier_name: 'Nationwide', policy_number: 'POL-U-2001', status: 'Active', premium_amount: 55.00, annual_premium: 660, effective_date: '2025-06-01', expiration_date: '2026-06-01', billing_frequency: 'Monthly', commission_pct: 12 },
    ],
  },
  {
    id: 'contact-007',
    first_name: 'Lisa', last_name: 'Watanabe',
    email: 'lisa.w@email.com', phone: '661-555-0401',
    status: 'Lead', stage: 'assessment_done', lead_source: 'Google Ads',
    annual_income: 95000, date_of_birth: '1988-12-01',
    occupation: 'Dentist', employer: 'Bakersfield Dental Group',
    marital_status: 'Married', dependents_count: 2,
    business_owner: true, has_will: false, has_trust: false, has_power_of_attorney: true,
    city: 'Bakersfield', state: 'CA', zip: '93308',
    created_at: '2026-03-20T00:00:00Z',
    next_follow_up: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    policies: [],
  },
];

// ─── Pipeline ──────────────────────────────────────────────────────────
export const demoPipelineStages = [
  { id: 'stage-1', name: 'New Lead', sort_order: 1, color: '#6B7280', probability: 5 },
  { id: 'stage-2', name: 'Contacted', sort_order: 2, color: '#3B82F6', probability: 15 },
  { id: 'stage-3', name: 'Assessment Done', sort_order: 3, color: '#4A7C6E', probability: 30 },
  { id: 'stage-4', name: 'Proposal Sent', sort_order: 4, color: '#C4956A', probability: 50 },
  { id: 'stage-5', name: 'Closing', sort_order: 5, color: '#2B4C7C', probability: 75 },
];

export const demoDeals = [
  { id: 'deal-001', contact_id: 'contact-004', pipeline_stage_id: 'stage-1', name: 'Emily Rodriguez — Life Insurance', amount: 250000, probability: 5, status: 'open', first_name: 'Emily', last_name: 'Rodriguez', stage_name: 'New Lead', stage_color: '#6B7280', deal_type: 'Life', created_at: '2026-04-05' },
  { id: 'deal-005', contact_id: 'contact-005', pipeline_stage_id: 'stage-2', name: 'Robert Martinez — Auto + Life Bundle', amount: 120000, probability: 15, status: 'open', first_name: 'Robert', last_name: 'Martinez', stage_name: 'Contacted', stage_color: '#3B82F6', deal_type: 'Bundled', created_at: '2026-04-28' },
  { id: 'deal-003', contact_id: 'contact-003', pipeline_stage_id: 'stage-3', name: 'Michael Carter — IUL Policy', amount: 350000, probability: 30, status: 'open', first_name: 'Michael', last_name: 'Carter', stage_name: 'Assessment Done', stage_color: '#4A7C6E', deal_type: 'Life', created_at: '2026-03-15' },
  { id: 'deal-007', contact_id: 'contact-007', pipeline_stage_id: 'stage-3', name: 'Lisa Watanabe — Full Protection Plan', amount: 500000, probability: 30, status: 'open', first_name: 'Lisa', last_name: 'Watanabe', stage_name: 'Assessment Done', stage_color: '#4A7C6E', deal_type: 'Life', created_at: '2026-03-20' },
  { id: 'deal-004', contact_id: 'contact-006', pipeline_stage_id: 'stage-4', name: 'James Thompson — Complete Portfolio', amount: 1500000, probability: 50, status: 'open', first_name: 'James', last_name: 'Thompson', stage_name: 'Proposal Sent', stage_color: '#C4956A', deal_type: 'Bundled', created_at: '2025-12-01' },
  { id: 'deal-006', contact_id: 'contact-006', pipeline_stage_id: 'stage-4', name: 'James Thompson — Business Succession', amount: 750000, probability: 50, status: 'open', first_name: 'James', last_name: 'Thompson', stage_name: 'Proposal Sent', stage_color: '#C4956A', deal_type: 'Business', created_at: '2026-01-10' },
];

export const demoPipelineAnalytics = [
  { id: 'stage-1', name: 'New Lead', color: '#6B7280', deal_count: 1, total_value: 250000, weighted_value: 12500 },
  { id: 'stage-2', name: 'Contacted', color: '#3B82F6', deal_count: 1, total_value: 120000, weighted_value: 18000 },
  { id: 'stage-3', name: 'Assessment Done', color: '#4A7C6E', deal_count: 2, total_value: 850000, weighted_value: 255000 },
  { id: 'stage-4', name: 'Proposal Sent', color: '#C4956A', deal_count: 2, total_value: 2250000, weighted_value: 1125000 },
  { id: 'stage-5', name: 'Closing', color: '#2B4C7C', deal_count: 0, total_value: 0, weighted_value: 0 },
];

// ─── Appointments ──────────────────────────────────────────────────────
const today = new Date();
const daysFrom = (d: number) => new Date(today.getTime() + d * 86400000);
const hoursFrom = (h: number) => new Date(today.getTime() + h * 3600000);

export const demoAppointments = [
  {
    id: 'appt-001', contact_id: 'contact-002',
    assigned_to: DEMO_USER_ID,
    title: 'Annual Policy Review — Anderson Family',
    appointment_type: 'Review', status: 'scheduled',
    start_time: hoursFrom(2).toISOString(),
    end_time: hoursFrom(3).toISOString(),
    timezone: 'America/Los_Angeles', location: 'Office', is_virtual: false,
    notes: 'Review auto policies and discuss bundling options',
    first_name: 'John', last_name: 'Anderson', email: 'john.anderson@email.com', phone: '661-555-0101',
  },
  {
    id: 'appt-002', contact_id: 'contact-007',
    assigned_to: DEMO_USER_ID,
    title: 'Assessment Review — Lisa Watanabe',
    appointment_type: 'Consultation', status: 'scheduled',
    start_time: hoursFrom(5).toISOString(),
    end_time: hoursFrom(6).toISOString(),
    timezone: 'America/Los_Angeles',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    is_virtual: true,
    notes: 'Review financial assessment results and present recommendations',
    first_name: 'Lisa', last_name: 'Watanabe', email: 'lisa.w@email.com', phone: '661-555-0401',
  },
  {
    id: 'appt-003', contact_id: 'contact-003',
    assigned_to: DEMO_USER_ID,
    title: 'IUL Proposal Presentation — Michael Carter',
    appointment_type: 'Presentation', status: 'scheduled',
    start_time: daysFrom(1).setHours(10, 0, 0, 0),
    end_time: daysFrom(1).setHours(11, 0, 0, 0),
    timezone: 'America/Los_Angeles', location: 'Client Home', is_virtual: false,
    notes: 'Present indexed universal life proposal with living benefits',
    first_name: 'Michael', last_name: 'Carter', email: 'michael.carter@email.com', phone: '661-555-0201',
  },
  {
    id: 'appt-004', contact_id: 'contact-006',
    assigned_to: DEMO_USER_ID,
    title: 'Policy Signing — James Thompson',
    appointment_type: 'Closing', status: 'scheduled',
    start_time: daysFrom(2).setHours(14, 0, 0, 0),
    end_time: daysFrom(2).setHours(15, 0, 0, 0),
    timezone: 'America/Denver', location: 'Denver Office', is_virtual: false,
    notes: 'Final signing for complete portfolio — Life + Umbrella',
    first_name: 'James', last_name: 'Thompson', email: 'james.thompson@email.com', phone: '303-555-0301',
  },
  {
    id: 'appt-005', contact_id: 'contact-005',
    assigned_to: DEMO_USER_ID,
    title: 'Intro Call — Robert Martinez',
    appointment_type: 'Consultation', status: 'scheduled',
    start_time: daysFrom(3).setHours(9, 0, 0, 0),
    end_time: daysFrom(3).setHours(9, 30, 0, 0),
    timezone: 'America/Los_Angeles',
    meeting_link: 'https://zoom.us/j/1234567890',
    is_virtual: true,
    notes: 'First call — discuss auto insurance needs and business owner coverage',
    first_name: 'Robert', last_name: 'Martinez', email: 'robert.m@email.com', phone: '305-555-0201',
  },
  {
    id: 'appt-006', contact_id: null,
    assigned_to: DEMO_USER_ID,
    title: 'Lunch — COI Presentation Prep',
    appointment_type: 'Internal', status: 'scheduled',
    start_time: daysFrom(4).setHours(12, 0, 0, 0),
    end_time: daysFrom(4).setHours(13, 0, 0, 0),
    timezone: 'America/Los_Angeles', location: 'Office Conference Room', is_virtual: false,
    notes: 'Prep materials for Friday COI presentation at Bakersfield Chamber',
    first_name: '', last_name: '',
  },
];

// ─── X-Dates ───────────────────────────────────────────────────────────
export const demoXDates = [
  {
    id: 'xdate-001', policy_id: 'policy-001', contact_id: 'contact-001',
    first_name: 'John', last_name: 'Anderson',
    target_x_date: daysFrom(15).toISOString().split('T')[0],
    automation_trigger_date: daysFrom(-30).toISOString().split('T')[0],
    current_campaign_stage: 'Day_60_Sent_Email',
    line_of_business: 'Auto', carrier_name: 'Progressive',
    premium_amount: 145.00, ai_paused: false,
  },
  {
    id: 'xdate-002', policy_id: 'policy-002', contact_id: 'contact-001',
    first_name: 'John', last_name: 'Anderson',
    target_x_date: daysFrom(3).toISOString().split('T')[0],
    automation_trigger_date: daysFrom(-57).toISOString().split('T')[0],
    current_campaign_stage: 'Pending_Review',
    line_of_business: 'Life', carrier_name: 'Prudential',
    premium_amount: 85.00, ai_paused: false,
  },
  {
    id: 'xdate-003', policy_id: 'policy-005', contact_id: 'contact-006',
    first_name: 'James', last_name: 'Thompson',
    target_x_date: daysFrom(45).toISOString().split('T')[0],
    automation_trigger_date: daysFrom(-15).toISOString().split('T')[0],
    current_campaign_stage: 'Day_45_Email_Opened',
    line_of_business: 'Life', carrier_name: 'MetLife',
    premium_amount: 320.00, ai_paused: false,
  },
  {
    id: 'xdate-004', policy_id: 'policy-006', contact_id: 'contact-006',
    first_name: 'James', last_name: 'Thompson',
    target_x_date: daysFrom(90).toISOString().split('T')[0],
    automation_trigger_date: daysFrom(30).toISOString().split('T')[0],
    current_campaign_stage: 'Pending',
    line_of_business: 'Auto', carrier_name: 'Travelers',
    premium_amount: 180.00, ai_paused: false,
  },
  {
    id: 'xdate-005', policy_id: 'policy-003', contact_id: 'contact-001',
    first_name: 'John', last_name: 'Anderson',
    target_x_date: daysFrom(120).toISOString().split('T')[0],
    automation_trigger_date: daysFrom(60).toISOString().split('T')[0],
    current_campaign_stage: 'Pending',
    line_of_business: 'Home', carrier_name: 'Travelers',
    premium_amount: 210.00, ai_paused: false,
  },
];

// ─── API Keys ──────────────────────────────────────────────────────────
export const demoApiKeys = [
  { service: 'openai', api_key: 'sk-••••••••••••••••••••', api_secret: '', is_configured: true, config_json: {} },
  { service: 'twilio', api_key: 'AC•••••••••••••••••••', api_secret: '••••••••••••••••', is_configured: false, config_json: { phone_number: '' } },
  { service: 'email', api_key: 're_••••••••••••••••', api_secret: '', is_configured: false, config_json: {} },
];

// ─── Dashboard Metrics ─────────────────────────────────────────────────
export const demoMetrics = {
  total_leads: 47, active_clients: 23, bound_policies: 18,
  monthly_premium: 45850, annual_premium_total: 550200,
  upcoming_appointments: 12, active_xdates: 31,
  active_prospects: 8, pending_quotes: 7,
  total_contacts: 47, conversion_rate: 38.5, avg_policy_size: 2547,
  lead_sources: [
    { source: 'Referral', count: 18, percentage: 38, conversion_rate: 42 },
    { source: 'Google Ads', count: 12, percentage: 26, conversion_rate: 28 },
    { source: 'Facebook Ads', count: 9, percentage: 19, conversion_rate: 22 },
    { source: 'Organic Web', count: 5, percentage: 11, conversion_rate: 35 },
    { source: 'Cold Call', count: 3, percentage: 6, conversion_rate: 8 },
  ],
  revenue_forecast: [
    { month: 'Jan', actual: 42000, projected: 45000 },
    { month: 'Feb', actual: 38000, projected: 41000 },
    { month: 'Mar', actual: 51000, projected: 48000 },
    { month: 'Apr', actual: 46000, projected: 50000 },
    { month: 'May', actual: 53000, projected: 52000 },
    { month: 'Jun', actual: null, projected: 55000 },
  ],
  agent_performance: [
    { id: 'agent-user-1', first_name: 'Jason', last_name: 'Blunt', total_assigned: 18, clients: 12, deals_won: 6, revenue_generated: 28500, appointments_completed: 24 },
    { id: 'agent-user-2', first_name: 'Sarah', last_name: 'Mitchell', total_assigned: 22, clients: 15, deals_won: 8, revenue_generated: 42100, appointments_completed: 31 },
    { id: 'agent-user-3', first_name: 'Mike', last_name: 'Rodriguez', total_assigned: 12, clients: 8, deals_won: 3, revenue_generated: 15200, appointments_completed: 17 },
  ],
};

export const demoLeadSources = [
  { lead_source: 'Referral', count: 18, conversion_rate: 42 },
  { lead_source: 'Google Ads', count: 12, conversion_rate: 28 },
  { lead_source: 'Facebook Ads', count: 9, conversion_rate: 22 },
  { lead_source: 'Organic Web', count: 5, conversion_rate: 35 },
  { lead_source: 'Cold Call', count: 3, conversion_rate: 8 },
];

export const demoForecast = {
  locked_revenue: 185000,
  pipeline_weighted: 1424000,
  renewals_next_90: 62400,
};

// ─── Assessments ───────────────────────────────────────────────────────
export const demoAssessments = [
  {
    id: 'assessment-001', template_id: 'template-001',
    contact_id: 'contact-006', status: 'completed',
    overall_score: 42, risk_level: 'High Risk',
    completed_at: daysFrom(-14).toISOString(),
    first_name: 'James', last_name: 'Thompson',
    scores: { stability: 72, protection: 15, retirement: 58, estate_planning: 20, ltc_preparedness: 35 },
    recommendations: [
      { priority: 1, category: 'Protection', recommendation: 'Establish life insurance coverage for income replacement — current coverage covers only 40% of needs' },
      { priority: 2, category: 'Estate', recommendation: 'Create will and trust documents to ensure asset distribution' },
      { priority: 3, category: 'LTC', recommendation: 'Evaluate long-term care insurance options due to family history of chronic conditions' },
    ],
  },
  {
    id: 'assessment-002', template_id: 'template-001',
    contact_id: 'contact-007', status: 'in_progress',
    overall_score: null, risk_level: null,
    completed_at: null,
    first_name: 'Lisa', last_name: 'Watanabe',
    scores: { stability: 80, protection: null, retirement: null, estate_planning: null, ltc_preparedness: null },
    recommendations: [],
  },
];

export const demoTemplates = [
  { id: 'template-001', name: 'Financial Health Assessment', category: 'financial_health', description: 'Comprehensive 5-section assessment covering stability, protection, retirement, estate, and LTC', sections: ['basic_info', 'financial_stability', 'family_protection', 'retirement_readiness', 'long_term_care'] },
];

// ─── Workflows ─────────────────────────────────────────────────────────
export const demoWorkflows = [
  {
    id: 'wf-001', name: 'New Lead Nurture', description: 'Automated nurture sequence for new leads — welcome email + 3 follow-ups over 14 days', category: 'lead_nurture', is_active: true, trigger: 'lead_created',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Lead Created', data: {} },
      { id: 'n2', type: 'delay', label: 'Wait 1 Hour', data: { duration: 3600 } },
      { id: 'n3', type: 'email', label: 'Send Welcome Email', data: { template: 'welcome_lead' } },
      { id: 'n4', type: 'condition', label: 'Opened?', data: {} },
      { id: 'n5', type: 'email', label: 'Send Follow-Up Day 3', data: { template: 'follow_up_3' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n4', target: 'n5', label: 'Yes' },
    ],
    trigger_config: { event: 'lead_created', filters: { source: ['web', 'referral'] } },
  },
  {
    id: 'wf-002', name: 'Policy Renewal Campaign', description: '60-day renewal campaign with SMS and email touchpoints', category: 'renewal', is_active: true, trigger: 'xdate_60',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'X-Date 60 Days Out', data: {} },
      { id: 'n2', type: 'delay', label: 'Wait 7 Days', data: { duration: 604800 } },
      { id: 'n3', type: 'email', label: 'Renewal Reminder Email', data: { template: 'renewal_60' } },
      { id: 'n4', type: 'sms', label: 'SMS Check-in', data: { template: 'sms_renewal_check' } },
      { id: 'n5', type: 'delay', label: 'Wait 14 Days', data: { duration: 1209600 } },
      { id: 'n6', type: 'email', label: 'Urgent Reminder', data: { template: 'renewal_30' } },
      { id: 'n7', type: 'call', label: 'Agent Call Task', data: {} },
      { id: 'n8', type: 'condition', label: 'Renewed?', data: {} },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n4', target: 'n5' },
      { id: 'e5', source: 'n5', target: 'n6' },
      { id: 'e6', source: 'n6', target: 'n7' },
      { id: 'e7', source: 'n7', target: 'n8' },
    ],
    trigger_config: { event: 'xdate', days_before: 60 },
  },
  {
    id: 'wf-003', name: 'Cross-Sell Opportunity', description: 'Trigger cross-sell outreach based on life events (marriage, birth, home purchase)', category: 'cross_sell', is_active: true, trigger: 'life_event',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Life Event Detected', data: {} },
      { id: 'n2', type: 'email', label: 'Personalized Congratulatory Email', data: { template: 'life_event_congrats' } },
      { id: 'n3', type: 'delay', label: 'Wait 3 Days', data: { duration: 259200 } },
      { id: 'n4', type: 'email', label: 'Relevant Coverage Suggestion', data: { template: 'life_event_coverage' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
    ],
    trigger_config: { event: 'life_event', sources: ['policy_change', 'assessment', 'manual'] },
  },
  {
    id: 'wf-004', name: 'Client Onboarding', description: 'New client welcome and onboarding sequence after policy binding', category: 'onboarding', is_active: true, trigger: 'policy_bound',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Policy Bound', data: {} },
      { id: 'n2', type: 'email', label: 'Welcome + Documents', data: { template: 'welcome_client' } },
      { id: 'n3', type: 'delay', label: 'Wait 7 Days', data: { duration: 604800 } },
      { id: 'n4', type: 'sms', label: 'Check-in SMS', data: { template: 'client_check_in' } },
      { id: 'n5', type: 'delay', label: 'Wait 30 Days', data: { duration: 2592000 } },
      { id: 'n6', type: 'email', label: 'Annual Review Scheduling', data: { template: 'annual_review' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n4', target: 'n5' },
      { id: 'e5', source: 'n5', target: 'n6' },
    ],
    trigger_config: { event: 'policy_bound', filters: {} },
  },
];

// ─── AI Agents ─────────────────────────────────────────────────────────
export const demoAgents = [
  {
    id: 'agent-001', name: 'Lead Qualifier', agent_type: 'qualification',
    description: 'Qualifies inbound leads via SMS and email conversations — asks screening questions, scores interest, and routes hot leads to appointment booking',
    is_active: true,
    last_run_at: new Date().toISOString(),
    configuration: { screening_questions: 5, min_score_to_route: 70, channels: ['sms', 'email'] },
    metrics: { leads_qualified: 142, conversion_rate: 34, avg_response_time: '2m' },
  },
  {
    id: 'agent-002', name: 'Appointment Setter', agent_type: 'appointment',
    description: 'Books meetings automatically with qualified leads — checks calendar availability, sends time slots, confirms bookings with reminders',
    is_active: true,
    last_run_at: new Date().toISOString(),
    configuration: { advance_notice_days: 1, max_slots_to_offer: 3, reminder_hours: [24, 2] },
    metrics: { appointments_booked: 89, show_rate: 78, avg_booking_time: '15m' },
  },
  {
    id: 'agent-003', name: 'Follow-Up Nurture', agent_type: 'follow_up',
    description: 'Nurtures leads with educational content and check-ins — adapts pacing based on engagement signals (opens, clicks, replies)',
    is_active: true,
    last_run_at: daysFrom(-1).toISOString(),
    configuration: { max_touches_per_week: 2, adapt_pacing: true, content_categories: ['educational', 'social_proof', 'offer'] },
    metrics: { emails_sent: 1240, open_rate: 42, click_rate: 18 },
  },
  {
    id: 'agent-004', name: 'Cross-Sell Detector', agent_type: 'cross_sell',
    description: 'Identifies cross-sell opportunities from existing client data — analyzes life events, policy gaps, and demographic patterns',
    is_active: true,
    last_run_at: daysFrom(-2).toISOString(),
    configuration: { scan_frequency_hours: 24, signals: ['life_event', 'policy_expiry', 'coverage_gap'], min_confidence: 65 },
    metrics: { opportunities_found: 67, conversions: 23, avg_increase: 3400 },
  },
  {
    id: 'agent-005', name: 'Retention Guardian', agent_type: 'retention',
    description: 'Monitors at-risk clients and triggers save campaigns — watches for late payments, low engagement, and competitor shopping signals',
    is_active: true,
    last_run_at: daysFrom(-7).toISOString(),
    configuration: { risk_threshold: 60, save_campaign_delay_days: 3, max_discount: 15 },
    metrics: { at_risk_detected: 12, saved: 8, retention_rate: 67 },
  },
];

// ─── Carriers ──────────────────────────────────────────────────────────
export const demoCarriers = [
  { id: 'carrier-1', name: 'Progressive', naic_code: '24260', am_best_rating: 'A+', is_active: true, lines_offered: ['Auto', 'Home', 'Umbrella'] },
  { id: 'carrier-2', name: 'Travelers', naic_code: '25676', am_best_rating: 'A++', is_active: true, lines_offered: ['Auto', 'Home', 'Life'] },
  { id: 'carrier-3', name: 'Nationwide', naic_code: '23767', am_best_rating: 'A+', is_active: true, lines_offered: ['Auto', 'Home', 'Life', 'Commercial'] },
  { id: 'carrier-4', name: 'Prudential', naic_code: '68245', am_best_rating: 'A+', is_active: true, lines_offered: ['Life', 'IUL', 'LTC'] },
  { id: 'carrier-5', name: 'MetLife', naic_code: '65978', am_best_rating: 'A+', is_active: true, lines_offered: ['Life', 'Disability', 'LTC', 'Annuities'] },
  { id: 'carrier-6', name: 'State Farm', naic_code: '25176', am_best_rating: 'A++', is_active: true, lines_offered: ['Auto', 'Home', 'Life', 'Health'] },
];

// ─── Helpers ───────────────────────────────────────────────────────────
export function isValidDemoToken(token: string): boolean {
  return token === DEMO_JWT || token.length > 50;
}
export function getTenantIdFromToken(token: string): string {
  return DEMO_TENANT_ID;
}
export function getUserFromToken(token: string): typeof demoUser {
  return demoUser;
}
