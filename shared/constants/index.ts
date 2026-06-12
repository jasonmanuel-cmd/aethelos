export const PIPELINE_DEFAULTS = [
  { name: 'New Lead', probability: 5, color: '#6B7280' },
  { name: 'Contacted', probability: 15, color: '#3B82F6' },
  { name: 'Assessment Done', probability: 30, color: '#8B5CF6' },
  { name: 'Proposal Sent', probability: 50, color: '#F59E0B' },
  { name: 'Closing', probability: 75, color: '#10B981' },
  { name: 'Won', probability: 100, color: '#059669' },
  { name: 'Lost', probability: 0, color: '#DC2626' },
];

export const XDATE_AUTOMATION_STAGES = {
  DAY_60: { key: 'Day_60_Sent', name: 'Contextual Wake-Up (Email)', delay_days: 0 },
  DAY_57: { key: 'Day_57_Sent', name: 'Friction-Free Pivot (SMS)', delay_days: 3 },
  DAY_45: { key: 'Day_45_Sent', name: 'Rate Shock Intercept (Email)', delay_days: 15 },
  DAY_42: { key: 'Replied', name: 'Smart Agent Handoff', delay_days: 18 },
};

export const ASSESSMENT_CATEGORIES = [
  { id: 'basic_info', label: 'Basic Information', order: 1 },
  { id: 'financial_stability', label: 'Financial Stability', order: 2 },
  { id: 'family_protection', label: 'Family Protection', order: 3 },
  { id: 'retirement_readiness', label: 'Retirement Readiness', order: 4 },
  { id: 'long_term_care', label: 'Long-Term Care Risk', order: 5 },
];

export const RISK_LEVELS = [
  { min: 90, max: 100, label: 'Financially Fortified', color: '#059669' },
  { min: 70, max: 89, label: 'Generally Prepared', color: '#10B981' },
  { min: 50, max: 69, label: 'Moderate Risk', color: '#F59E0B' },
  { min: 30, max: 49, label: 'High Risk', color: '#F97316' },
  { min: 0, max: 29, label: 'Financial Danger Zone', color: '#DC2626' },
];

export const AI_AGENT_TYPES = {
  qualification: { name: 'Lead Qualifier', icon: 'Search', description: 'Qualifies leads via conversation' },
  appointment: { name: 'Appointment Setter', icon: 'Calendar', description: 'Books meetings automatically' },
  follow_up: { name: 'Follow-Up Nurture', icon: 'MessageSquare', description: 'Nurtures with educational content' },
  cross_sell: { name: 'Cross-Sell Detector', icon: 'Target', description: 'Identifies cross-sell opportunities' },
  retention: { name: 'Retention Guardian', icon: 'Shield', description: 'Monitors at-risk clients' },
  document_collection: { name: 'Doc Collector', icon: 'FileText', description: 'Gathers required documents' },
};

export const LINE_OF_BUSINESS_OPTIONS = [
  'Auto', 'Home', 'Umbrella', 'Commercial', 'Life', 'Health', 'Disability', 'LTC', 'Annuity', 'Estate'
];

export const FREQUENCY_OPTIONS = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semi-Annual', label: 'Semi-Annual' },
  { value: 'Annually', label: 'Annually' },
  { value: 'Single', label: 'Single Premium' },
];

export const LEAD_SOURCE_OPTIONS = [
  'Facebook Ads', 'Google Ads', 'LinkedIn', 'Organic Web', 'Referral',
  'Cold Call', 'Email Campaign', 'Event', 'Partner', 'Other'
];

export const CONTACT_RELATIONSHIPS = [
  'Primary', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other Relative', 'Dependent'
];
