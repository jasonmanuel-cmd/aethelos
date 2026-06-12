// ============================================================
// FSOS - Shared Type Definitions
// ============================================================

// --- Enums ---
export type ContactStatus = 'Lead' | 'Active Prospect' | 'Active Client' | 'Lost' | 'Archived';
export type ContactStage = 'new' | 'contacted' | 'assessment' | 'assessment_done' | 'proposal' | 'closing' | 'won' | 'lost' | 'client';
export type PolicyStatus = 'Quoted' | 'Bound' | 'Expired' | 'Cancelled' | 'Competitor_Active' | 'Pending';
export type LineOfBusiness = 'Auto' | 'Home' | 'Umbrella' | 'Commercial' | 'Life' | 'Health' | 'Disability' | 'LTC' | 'Annuity' | 'Estate';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type CommunicationChannel = 'email' | 'sms' | 'voice' | 'web_chat' | 'mail';
export type CampaignStage = 'Pending' | 'Day_60_Sent' | 'Day_57_Sent' | 'Day_45_Sent' | 'Replied' | 'Closed' | 'Cancelled';
export type AgentType = 'qualification' | 'appointment' | 'follow_up' | 'cross_sell' | 'retention' | 'document_collection';
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

// --- Core Entities ---
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  permissions: string[];
  last_login_at?: string;
  created_at: string;
}

export interface Household {
  id: string;
  tenant_id: string;
  name: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  annual_income?: number;
  household_size: number;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  household_id?: string;
  assigned_to?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  date_of_birth?: string;
  occupation?: string;
  employer?: string;
  relationship_to_head: string;
  lead_source?: string;
  source_details: Record<string, any>;
  status: ContactStatus;
  stage: ContactStage;
  credit_score_range?: string;
  monthly_debt_payments?: number;
  emergency_savings_months: number;
  marital_status?: string;
  dependents_count: number;
  business_owner: boolean;
  opted_out: boolean;
  next_follow_up?: string;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Carrier {
  id: string;
  tenant_id: string;
  name: string;
  naic_code?: string;
  am_best_rating?: string;
  is_internal_write: boolean;
  avg_annual_rate_change_pct: number;
  lines_offered: string[];
  commission_pct?: number;
  logo_url?: string;
  is_active: boolean;
}

export interface Policy {
  id: string;
  tenant_id: string;
  primary_contact_id: string;
  carrier_id?: string;
  policy_number?: string;
  line_of_business: LineOfBusiness;
  sub_type?: string;
  status: PolicyStatus;
  premium_amount?: number;
  annual_premium?: number;
  commission_amount?: number;
  commission_pct?: number;
  billing_frequency: string;
  face_amount?: number;
  cash_value?: number;
  death_benefit?: number;
  deductible?: number;
  coverage_limits: Record<string, any>;
  riders: Record<string, any>;
  effective_date: string;
  expiration_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface XDateTracker {
  id: string;
  tenant_id: string;
  policy_id?: string;
  contact_id: string;
  target_x_date: string;
  automation_trigger_date: string;
  current_campaign_stage: CampaignStage;
  ai_paused: boolean;
  human_intervention_needed: boolean;
  last_action_timestamp?: string;
  outcome?: string;
}

export interface Assessment {
  id: string;
  tenant_id: string;
  template_id?: string;
  contact_id: string;
  status: 'in_progress' | 'completed';
  responses: Record<string, any>;
  scores: Record<string, number>;
  overall_score?: number;
  risk_level?: string;
  ai_insights: Record<string, any>;
  recommendations: AssessmentRecommendation[];
  completed_at?: string;
  created_at: string;
}

export interface AssessmentRecommendation {
  priority: number;
  category: string;
  recommendation: string;
}

export interface WorkflowTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  trigger_config: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'ai_evaluation' | 'delay' | 'route';
  config: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface AiAgent {
  id: string;
  tenant_id: string;
  name: string;
  agent_type: AgentType;
  description?: string;
  is_active: boolean;
  configuration: Record<string, any>;
  metrics: Record<string, any>;
  last_run_at?: string;
}

export interface Deal {
  id: string;
  tenant_id: string;
  contact_id: string;
  pipeline_stage_id: string;
  assigned_to?: string;
  name: string;
  amount?: number;
  probability: number;
  expected_close_date?: string;
  products: string[];
  status: 'open' | 'won' | 'lost';
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  contact_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  appointment_type?: string;
  status: AppointmentStatus;
  start_time: string;
  end_time: string;
  meeting_link?: string;
  is_virtual: boolean;
  reminder_sent: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  category: string;
  description?: string;
  features: string[];
  commission_pct?: number;
  is_active: boolean;
}

// --- API Types ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  title: string;
  status: number;
  detail: string;
  request_id: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

// --- Dashboard Types ---
export interface DashboardMetrics {
  total_leads: number;
  active_clients: number;
  pending_follow_ups: number;
  upcoming_appointments: number;
  monthly_revenue: number;
  conversion_rate: number;
  pipeline_value: number;
  xdates_this_month: number;
}

export interface PipelineAnalytics {
  stages: {
    id: string;
    name: string;
    count: number;
    value: number;
    color: string;
  }[];
  total_value: number;
  weighted_value: number;
}

// --- Assessment Scoring ---
export interface AssessmentScores {
  stability: number;
  protection: number;
  retirement: number;
  estate_planning: number;
  ltc_preparedness: number;
  overall: number;
}

export interface LeadSegment {
  type: 'debt' | 'family_protection' | 'wealth_building' | 'retirement' | 'estate_planning';
  description: string;
  recommended_products: string[];
  agent_type: string;
}

// --- Communication Template ---
export interface CommunicationTemplate {
  id: string;
  tenant_id: string;
  name: string;
  channel: CommunicationChannel;
  subject?: string;
  body: string;
  variables: string[];
  category: string;
}
