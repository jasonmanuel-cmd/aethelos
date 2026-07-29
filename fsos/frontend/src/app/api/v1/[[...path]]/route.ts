import { NextRequest, NextResponse } from 'next/server';
import {
  DEMO_JWT, demoUser, demoTenant, demoMetrics,
  demoAppointments, demoXDates, demoApiKeys,
  demoContacts, demoPipelineStages, demoDeals,
  demoAgents, demoAssessments, demoTemplates,
  demoWorkflows, demoLeadSources, demoForecast,
  demoPipelineAnalytics, demoCarriers,
  isValidDemoToken,
} from '@/lib/demo-data';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function error(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

async function handleRoute(pathParts: string[], req: NextRequest) {
  const [module, ...rest] = pathParts || [];
  const method = req.method;
  const token = getToken(req);

  if (module !== 'tenant' && (!token || !isValidDemoToken(token))) {
    return error('Unauthorized', 401);
  }

  // ─── Auth ──────────────────────────────────────────────────────
  if (module === 'tenant') {
    if (rest[0] === 'login' && method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (body.email === 'jasonm@coaibakersfield.com' && body.password === 'blunts954') {
        return json({ data: { token: DEMO_JWT, user: demoUser, tenant: demoTenant } });
      }
      return error('Invalid credentials', 401);
    }
    if (rest[0] === 'profile') return json({ data: demoUser });
    if (rest[0] === 'users') return json({ data: [demoUser] });
    if (rest[0] === 'settings' && method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      return json({ data: { id: demoTenant.id, settings: body.settings || {} } });
    }
    if (rest[0] === 'branding' && method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      return json({ data: { ...demoTenant, ...body } });
    }
  }

  // ─── Analytics ──────────────────────────────────────────────────
  if (module === 'analytics') {
    if (rest[0] === 'dashboard') return json({ metrics: demoMetrics });
    if (rest[0] === 'lead-sources') return json({ data: demoLeadSources });
    if (rest[0] === 'agent-performance') return json({ data: demoMetrics.agent_performance });
    if (rest[0] === 'forecast') return json({ data: demoForecast });
    return json(demoMetrics);
  }

  // ─── Contacts ───────────────────────────────────────────────────
  if (module === 'contacts') {
    if (rest[0] && method === 'GET') {
      const contact = demoContacts.find(c => c.id === rest[0]);
      if (!contact) return error('Not found', 404);
      return json({ data: contact });
    }
    if (method === 'GET') {
      const search = req.nextUrl.searchParams.get('search')?.toLowerCase();
      const status = req.nextUrl.searchParams.get('status');
      const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
      const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
      let filtered = demoContacts;
      if (search) filtered = filtered.filter(c => `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search));
      if (status) filtered = filtered.filter(c => c.status === status);
      return json({ data: filtered, total: filtered.length, page, limit, total_pages: Math.ceil(filtered.length / limit) });
    }
    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));
      return json({ data: { id: `contact-${Date.now()}`, ...body, created_at: new Date().toISOString(), policies: [] } });
    }
    if ((method === 'PUT' || method === 'PATCH') && rest[0]) {
      const body = await req.json().catch(() => ({}));
      return json({ data: { id: rest[0], ...body, updated_at: new Date().toISOString() } });
    }
  }

  // ─── Appointments ───────────────────────────────────────────────
  if (module === 'appointments') {
    if (method === 'GET') {
      const status = req.nextUrl.searchParams.get('status') || 'scheduled';
      const isToday = req.nextUrl.searchParams.get('today') || rest[0] === 'today';
      let filtered = demoAppointments;
      if (isToday) filtered = filtered.filter(a => new Date(a.start_time).toDateString() === new Date().toDateString());
      else if (status) filtered = filtered.filter(a => a.status === status);
      return json({ data: filtered, total: filtered.length, page: 1, limit: 20, total_pages: 1 });
    }
    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));
      return json({ data: { id: `appt-${Date.now()}`, ...body, status: 'scheduled' } });
    }
  }

  // ─── Pipeline ───────────────────────────────────────────────────
  if (module === 'pipeline') {
    if (rest[0] === 'stages') return json({ data: demoPipelineStages });
    if (rest[0] === 'deals') {
      if (method === 'GET') return json({ data: demoDeals, total: demoDeals.length });
      if (method === 'POST') {
        const body = await req.json().catch(() => ({}));
        return json({ data: { id: `deal-${Date.now()}`, ...body } });
      }
    }
    if (rest[0] === 'analytics') return json({ data: demoPipelineAnalytics });
    return json({ data: { stages: demoPipelineStages, deals: demoDeals } });
  }

  // ─── X-Dates ────────────────────────────────────────────────────
  if (module === 'xdates') {
    if (rest[0] === 'upcoming') return json({ data: demoXDates });
    return json({ data: demoXDates });
  }

  // ─── API Keys ───────────────────────────────────────────────────
  if (module === 'api-keys') {
    if (rest[0] && method === 'GET') {
      const key = demoApiKeys.find(k => k.service === rest[0]);
      return json(key || { service: rest[0], is_configured: false });
    }
    if (method === 'GET') return json(demoApiKeys);
    if (method === 'POST' && rest[0]) return json({ service: rest[0], is_configured: true });
    if (method === 'DELETE' && rest[0]) return json({ success: true });
  }

  // ─── Agents ─────────────────────────────────────────────────────
  if (module === 'agents') {
    if (rest[0] && method === 'GET') {
      const agent = demoAgents.find(a => a.id === rest[0]);
      if (!agent) return error('Not found', 404);
      return json({ data: agent });
    }
    if (rest[0] && method === 'POST') {
      const body = await req.json().catch(() => ({}));
      return json({ data: { id: rest[0], last_run_at: new Date().toISOString(), ...body } });
    }
    return json({ data: demoAgents });
  }

  // ─── Assessments ────────────────────────────────────────────────
  if (module === 'assessments') {
    if (rest[0] === 'templates') return json({ data: demoTemplates });
    if (rest[0] === 'start' && rest[1]) {
      return json({ data: { id: `assessment-${Date.now()}`, status: 'in_progress' } });
    }
    if (rest[0] && rest[1] === 'submit' && method === 'POST') {
      return json({
        data: {
          overall_score: 45, risk_level: 'Moderate Risk',
          scores: { stability: 70, protection: 30, retirement: 55, estate_planning: 25, ltc_preparedness: 40 },
          recommendations: [
            { priority: 1, category: 'Protection', recommendation: 'Increase life insurance coverage to 10x annual income' },
            { priority: 2, category: 'Estate', recommendation: 'Create will and designate beneficiaries' },
            { priority: 3, category: 'Retirement', recommendation: 'Maximize tax-advantaged retirement contributions' },
          ],
        },
      });
    }
    return json({ data: demoAssessments });
  }

  // ─── Workflows ──────────────────────────────────────────────────
  if (module === 'workflows') {
    if (rest[0] === 'templates') return json({ data: demoWorkflows });
    if (method === 'GET') return json({ data: demoWorkflows });
    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));
      return json({ data: { id: `wf-${Date.now()}`, ...body, is_active: true } });
    }
  }

  // ─── Carriers ───────────────────────────────────────────────────
  if (module === 'carriers' && method === 'GET') {
    return json({ data: demoCarriers });
  }

  // ─── Health ─────────────────────────────────────────────────────
  if (module === 'health') return json({ status: 'ok', timestamp: new Date().toISOString() });

  if (!module) return json({ message: 'AethelOS FSOS API', version: '1.0.0', status: 'ok' });

  return error('Not found', 404);
}

export async function GET(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRoute(params.path || [], req);
}
export async function POST(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRoute(params.path || [], req);
}
export async function PUT(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRoute(params.path || [], req);
}
export async function PATCH(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRoute(params.path || [], req);
}
export async function DELETE(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRoute(params.path || [], req);
}
