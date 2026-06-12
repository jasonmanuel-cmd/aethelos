# FSOS - Financial Services Operating System

**by Chaotically Organized AI**

An AI-native operating system for insurance brokers, financial advisors, estate planners, debt specialists, and wealth consultants. FSOS is not just a CRM — it's an orchestration engine that turns leads into lifetime relationships through AI-powered automation, scoring, and workflow orchestration.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FSOS PLATFORM                             │
├─────────────────────────────────────────────────────────────┤
│                     FRONTEND (Next.js)                       │
│  Dashboard │ Leads │ Pipeline │ Assessments │ Analytics     │
│  Workflows │ AI Agents │ Appointments │ Settings             │
├─────────────────────────────────────────────────────────────┤
│                    API GATEWAY (NestJS)                      │
│  REST API │ WebSocket │ MCP Gateway │ Rate Limiting          │
├─────────────────────────────────────────────────────────────┤
│                  SERVICE LAYER                               │
│  Contacts │ Policies │ X-Date │ Assessments │ Workflows     │
│  AI Agents │ Communications │ Analytics │ Tenants            │
├─────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE                              │
│  PostgreSQL (RLS) │ Redis (Queue/Cache) │ BullMQ (Jobs)     │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS (Node.js + TypeScript) |
| **Frontend** | Next.js 14 + React + Tailwind CSS |
| **Database** | PostgreSQL with Row-Level Security |
| **Queue/Cache** | Redis + BullMQ |
| **Auth** | JWT (access + refresh tokens) |
| **AI/LLM** | OpenAI GPT-4 (scoring engine) |
| **Comms** | Twilio (SMS), Postmark/Resend (Email) |
| **Integration** | MCP (Model Context Protocol) Gateway |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

```bash
# Clone and install
cd fsos
cd backend && npm install
cd ../frontend && npm install
cd ..

# Set up environment
cp .env.example backend/.env
# Edit backend/.env with your local database credentials

# Create the database
createdb fsos

# Run migrations
psql -d fsos -f backend/db/migrations/001_initial_schema.sql

# Seed demo data
cd backend && npx ts-node db/seed.ts

# Start development
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Demo Login

- **URL**: http://localhost:3000
- **Email**: admin@demo.com
- **Password**: admin123

## Core Modules

### 1. CRM Core (`/api/v1/contacts`, `/api/v1/households`)

Household-anchored contact management. Contacts live inside households, enabling intelligent cross-sell detection by analyzing coverage gaps at the family level.

### 2. Policy Management (`/api/v1/policies`, `/api/v1/carriers`)

Track policies across multiple lines of business (Auto, Home, Life, IUL, VUL, LTC, Disability, Annuities, Estate). Every bound policy automatically generates an X-Date tracker entry.

### 3. X-Date Automation (`/api/v1/xdates`)

The 60-day automated outreach engine:

| Day | Channel | Message |
|-----|---------|---------|
| T-60 | Email | Contextual wake-up with market rate data |
| T-57 | SMS | Friction-free pivot with simple reply |
| T-45 | Email | Rate shock intercept (carrier has sent renewal) |
| T-42 | CRM Alert | Smart agent handoff with full dossier |

### 4. Financial Health Assessment (`/api/v1/assessments`)

AI-powered 5-dimension scoring engine:
- **Financial Stability** (20% weight)
- **Family Protection** (30% weight)
- **Retirement Readiness** (25% weight)
- **Estate Planning** (15% weight)
- **Long-Term Care Preparedness** (10% weight)

Auto-detects lead segments: Debt, Family Protection, Wealth Building, Retirement, Estate Planning.

### 5. Workflow Orchestration (`/api/v1/workflows`)

DAG-based visual workflow engine. Triggers, conditions, AI evaluations, delays, and actions compose into automated sequences. Non-technical admins can build workflows via the drag-and-drop interface.

### 6. AI Agent Ecosystem (`/api/v1/agents`)

Six autonomous digital employees:

| Agent | Function |
|-------|----------|
| Lead Qualifier | Qualifies inbound leads via SMS/email conversation |
| Appointment Setter | Books meetings, handles reschedules, reduces no-shows |
| Follow-Up Nurture | Educational content drip sequences |
| Cross-Sell Detector | Scans household for coverage gaps |
| Retention Guardian | Monitors at-risk clients |
| Document Collector | Gathers required documents automatically |

### 7. MCP Gateway (`/api/v1/mcp`)

Model Context Protocol gateway enables ANY external AI agent (Claude, GPT, Gemini, LangChain, CrewAI, AutoGen) to query and mutate CRM data via standard JSON-RPC. Available tools:
- `search_contacts`, `get_contact`, `get_household`
- `get_household_vulnerabilities`
- `get_upcoming_xdates`, `get_cross_sell_opportunities`
- `update_pipeline_stage`, `schedule_appointment`
- `get_dashboard_metrics`, `get_contact_assessment`

### 8. Pipeline & Deals (`/api/v1/pipeline`)

Multi-stage pipeline with deal tracking, probability-weighted forecasting, and drag-and-drop stage management.

### 9. Analytics (`/api/v1/analytics`)

Dashboard metrics, lead source performance, agent performance rankings, revenue forecasting, and conversion tracking.

## Database Schema

18 tables with Row-Level Security (RLS) for multi-tenant isolation:

- `tenants` / `tenant_users` — Multi-tenant foundation
- `households` — Master anchor for bundling
- `contacts` — Individual clients with 360° profile
- `carriers` — Insurance company registry
- `policies` — All lines of business
- `x_date_tracker` — Automation engine ledger
- `assessments` / `assessment_templates` — Scoring engine
- `workflow_templates` / `workflow_instances` — DAG engine
- `ai_agents` / `agent_conversations` — Agent ecosystem
- `appointments` — Scheduling
- `communication_logs` — Full audit trail
- `pipeline_stages` / `deals` — Sales pipeline
- `products` — Product catalog
- `activity_log` — Immutable event feed

### RLS Tenant Isolation

Every tenant-scoped query is automatically filtered by `current_setting('app.current_tenant_id')`. No risk of cross-tenant data leakage.

## API Endpoints

### Authentication
- `POST /api/v1/tenant/login` — Login

### Contacts
- `GET /api/v1/contacts` — List with pagination, search, filters
- `GET /api/v1/contacts/:id` — Full detail
- `POST /api/v1/contacts` — Create
- `PUT /api/v1/contacts/:id` — Update
- `GET /api/v1/contacts/:id/household` — Household members
- `GET /api/v1/contacts/:id/policies` — Contact policies
- `GET /api/v1/contacts/:id/activity` — Activity timeline

### Households
- `GET /api/v1/households` — List
- `GET /api/v1/households/:id` — Detail with members
- `POST /api/v1/households` — Create
- `PUT /api/v1/households/:id` — Update

### Policies
- `GET /api/v1/policies` — List (filter by LOB, status)
- `GET /api/v1/policies/:id` — Detail
- `POST /api/v1/policies` — Create (auto-generates X-Date tracker)
- `PUT /api/v1/policies/:id` — Update

### X-Dates
- `GET /api/v1/xdates` — List
- `GET /api/v1/xdates/upcoming` — Upcoming 60 days
- `GET /api/v1/xdates/cross-sell` — Auto cross-sell opportunities
- `POST /api/v1/xdates/:id/pause` — Pause automation
- `POST /api/v1/xdates/:id/resume` — Resume automation

### Assessments
- `GET /api/v1/assessments/templates` — Available templates
- `POST /api/v1/assessments/start/:contactId` — Start assessment
- `POST /api/v1/assessments/:id/submit` — Submit + AI scoring
- `GET /api/v1/assessments/contact/:contactId` — Contact history
- `GET /api/v1/assessments/:id` — Detail

### Workflows
- `GET /api/v1/workflows/templates` — List templates
- `POST /api/v1/workflows/templates` — Create template
- `PUT /api/v1/workflows/templates/:id` — Update
- `POST /api/v1/workflows/:templateId/execute/:contactId` — Execute
- `GET /api/v1/workflows/instances` — List instances

### AI Agents
- `GET /api/v1/agents` — List agents
- `GET /api/v1/agents/:id` — Detail
- `PUT /api/v1/agents/:id` — Update config
- `POST /api/v1/agents/:id/trigger/:contactId` — Trigger on contact

### MCP Gateway
- `POST /api/v1/mcp/execute` — JSON-RPC tool execution

### Appointments
- `GET /api/v1/appointments` — List
- `GET /api/v1/appointments/today` — Today's appointments
- `POST /api/v1/appointments` — Create
- `PUT /api/v1/appointments/:id` — Update

### Analytics
- `GET /api/v1/analytics/dashboard` — Main dashboard
- `GET /api/v1/analytics/lead-sources` — Source performance
- `GET /api/v1/analytics/agent-performance` — Agent rankings
- `GET /api/v1/analytics/forecast` — Revenue forecast

### Pipeline
- `GET /api/v1/pipeline/stages` — Pipeline stages
- `GET /api/v1/pipeline/deals` — Deals
- `POST /api/v1/pipeline/deals` — Create deal
- `PUT /api/v1/pipeline/deals/:id` — Update deal
- `GET /api/v1/pipeline/analytics` — Stage analytics

## Multi-Tenant White-Label

FSOS supports unlimited tenants with:
- Isolated data via PostgreSQL Row-Level Security
- Custom branding (colors, logo, domain)
- Per-tenant user roles and permissions
- White-label SaaS ready from Day 1

## External AI Agent Integration (MCP)

Any external LLM or agent framework can interact with FSOS:

```javascript
// Example: Claude/CrewAI/AutoGen querying FSOS
const response = await fetch('http://localhost:3001/api/v1/mcp/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token',
    'x-tenant-id': 'your-tenant-id'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'call_tool',
    params: {
      tool_name: 'get_household_vulnerabilities',
      arguments: { household_id: 'hh_001a782e-99ac-40d2' }
    },
    id: 1
  })
});
```

## Project Structure

```
fsos/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── households/        # Household CRUD
│   │   │   ├── contacts/          # Contact management
│   │   │   ├── policies/          # Policy & X-Date
│   │   │   ├── carriers/          # Carrier registry
│   │   │   ├── xdate/            # Automation engine
│   │   │   ├── assessments/       # AI scoring
│   │   │   ├── workflows/        # DAG orchestration
│   │   │   ├── agents/           # AI agent mgmt
│   │   │   ├── mcp-gateway/      # JSON-RPC bridge
│   │   │   ├── appointments/     # Scheduling
│   │   │   ├── pipelines/        # Sales pipeline
│   │   │   ├── communications/   # Message logs
│   │   │   ├── analytics/        # Dashboards
│   │   │   └── tenant/           # Auth & settings
│   │   ├── common/               # Shared middleware
│   │   ├── config/               # App config
│   │   └── main.ts               # Entry point
│   └── db/
│       └── migrations/           # SQL migrations
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js pages
│   │   ├── components/           # UI components
│   │   ├── lib/                  # API client & utils
│   │   └── types/                # TypeScript types
│   └── public/                   # Static assets
└── shared/
    ├── types/                    # Shared type defs
    └── constants/                # Shared constants
```

## Revenue Model

FSOS is designed for white-label SaaS distribution:
- **Per-seat licensing** ($120/user/month)
- **Revenue lift**: Agencies see 2-3x conversion on existing leads through automated X-Date sequences
- **ROI**: The ROI Calculator (included in dev) shows typical ROI of 500-2000%+

## License

Proprietary — Chaotically Organized AI
