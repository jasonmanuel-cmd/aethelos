export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: string;
  stage: string;
  lead_source?: string;
  assigned_to?: string;
  household_id?: string;
  marital_status?: string;
  dependents_count: number;
  annual_income?: number;
  date_of_birth?: string;
  relationship_to_head?: string;
  next_follow_up?: string;
  last_contacted_at?: string;
  created_at: string;
  household_name?: string;
  city?: string;
  state?: string;
  policy_count?: number;
  active_xdate?: any;
}

export interface Household {
  id: string;
  name: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  annual_income?: number;
  household_size: number;
  member_count?: number;
  policy_count?: number;
  members: any[];
}

export interface Policy {
  id: string;
  primary_contact_id: string;
  carrier_id?: string;
  policy_number?: string;
  line_of_business: string;
  sub_type?: string;
  status: string;
  premium_amount?: number;
  annual_premium?: number;
  commission_pct?: number;
  billing_frequency: string;
  effective_date: string;
  expiration_date: string;
  face_amount?: number;
  carrier_name?: string;
  carrier_logo?: string;
}

export interface Assessment {
  id: string;
  contact_id: string;
  status: string;
  overall_score?: number;
  risk_level?: string;
  scores: Record<string, number>;
  recommendations: any[];
  completed_at?: string;
  created_at: string;
}

export interface XDateTracker {
  id: string;
  contact_id: string;
  policy_id?: string;
  target_x_date: string;
  automation_trigger_date: string;
  current_campaign_stage: string;
  ai_paused: boolean;
  first_name?: string;
  last_name?: string;
  line_of_business?: string;
  carrier_name?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  category?: string;
  nodes: any[];
  edges: any[];
  trigger_config: any;
}

export interface AiAgent {
  id: string;
  name: string;
  agent_type: string;
  description?: string;
  is_active: boolean;
  configuration: any;
  metrics: any;
}

export interface Appointment {
  id: string;
  contact_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  appointment_type?: string;
  status: string;
  start_time: string;
  end_time: string;
  meeting_link?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface Deal {
  id: string;
  contact_id: string;
  pipeline_stage_id: string;
  name: string;
  amount?: number;
  probability: number;
  expected_close_date?: string;
  status: string;
  first_name?: string;
  last_name?: string;
  stage_name?: string;
  stage_color?: string;
}

export interface DashboardMetrics {
  total_contacts: number;
  total_leads: number;
  active_clients: number;
  active_prospects: number;
  bound_policies: number;
  pending_quotes: number;
  active_xdates: number;
  monthly_premium: number;
  annual_premium_total: number;
  upcoming_appointments: number;
}

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
