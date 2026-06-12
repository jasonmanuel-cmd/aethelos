# Supabase Setup Guide

## Prerequisites

1. A Supabase account (free tier works)
2. Your Supabase project URL + `anon key` + `service_role key` (found in Project Settings > API)
3. The `POSTGRES_PASSWORD` from the Supabase project dashboard

## Step 1: Run Migration 001 — Core Schema

1. Go to your Supabase project dashboard → **SQL Editor**
2. Open `backend/db/migrations/001_initial_schema.sql`
3. Paste the entire contents into the SQL Editor
4. Click **Run**
5. Verify no errors (all statements use `IF NOT EXISTS` so re-running is safe)

This creates:
- `tenants` table + RLS policy
- `users` table + RLS policy
- `carriers` table
- `pipeline_stages` table
- `products` table
- `agents` table
- `households` table
- `contacts` table
- `policies` table
- `assessments` table + `assessment_responses` table
- `workflow_templates` table + `workflow_instances` table + `workflow_nodes` table
- `x_date_tracker` table
- `communication_logs` table
- `appointments` table
- `tenant_audit_log` table
- `tenant_api_keys` table (encrypted key storage)
- `updated_at` trigger function
- Indexes on all foreign keys and commonly queried columns

## Step 2: Run Migration 002 — Demo Seed Data

1. In the same Supabase SQL Editor, open `backend/db/migrations/002_supabase_setup.sql`
2. Paste and click **Run**
3. Verify no errors

This seeds:
- **COAI Demo Agency** tenant (slug: `coai-demo`, domain: `demo.coaibakersfield.com`)
- **Admin user**: `jasonm@coaibakersfield.com` / `blunts954` (bcrypt hashed)
- **5 carriers**: Progressive, Travelers, Nationwide, Prudential, MetLife
- **5 pipeline stages**: New Lead → Contacted → Assessment Done → Proposal Sent → Closing
- **8 products** across Life, LTC, Auto, Home, Estate categories
- **5 AI agents**: Lead Qualifier, Appointment Setter, Follow-Up Nurture, Cross-Sell Detector, Retention Guardian
- **Demo household**: "The Demo Family" (Bakersfield, CA)
- **4 demo contacts**: John/Jane Demo (Active Client), Sarah Prospect (Lead), Mike WarmLead (Active Prospect)
- **2 demo policies**: Auto $145/mo, Life $85/mo
- **1 assessment template**: Financial Health Assessment (5-section config)
- **1 workflow template**: New Lead Nurture DAG (trigger → delay → email)
- **3 placeholder API key records**: openai=FALSE, twilio=FALSE, email=FALSE

## Step 3: Configure Backend `.env`

Create or update `backend/.env`:

```env
# Database — use the Supabase connection string from Project Settings > Database > Connection string
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# JWT (use any secure random string)
JWT_SECRET=your-256-bit-jwt-secret-change-in-production
JWT_EXPIRATION=24h

# Redis connection (optional, for queue support)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Environment
NODE_ENV=development
PORT=3001

# Fallback API keys (used when tenant hasn't configured their own)
OPENAI_API_KEY=sk-...       # optional
TWILIO_ACCOUNT_SID=AC...    # optional
TWILIO_AUTH_TOKEN=...       # optional
TWILIO_PHONE_NUMBER=...     # optional
EMAIL_API_KEY=re_...        # optional
```

**Note on database URL format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```
- Password must be URL-encoded if it contains special characters
- The `[PROJECT_REF]` is your project's unique identifier (found in Project Settings > General > Reference ID)

## Step 4: Start the Backend

```bash
cd backend
npm install --legacy-peer-deps
npm run start:dev
```

The backend will start on http://localhost:3001.

## Step 5: Verify the Demo Account

```bash
# Test login
curl -X POST http://localhost:3001/api/v1/tenant/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jasonm@coaibakersfield.com", "password": "blunts954"}'

# Expected response (truncated):
# {
#   "token": "eyJ...",
#   "tenant": { "id": "...", "name": "COAI Demo Agency", "slug": "coai-demo" }
# }
```

## Step 6: Configure API Keys (via Settings UI)

After logging in with the demo account:

1. Go to **Settings** → **API Keys**
2. **OpenAI**: Paste your OpenAI API key (`sk-...`) → Save
3. **Twilio** (optional for SMS): Paste Account SID, Auth Token, and phone number → Save
4. **Email** (optional for email campaigns): Paste your Resend/Postmark/SendGrid API key → Save

API keys are encrypted at rest in the `tenant_api_keys` table using PostgreSQL `pgcrypto`.

## Troubleshooting

### "relation does not exist"
→ Run both migration files in order. If you see this error on first run, the migration likely didn't complete. Re-run the SQL.

### "permission denied for table tenants"
→ Make sure RLS is enabled on the tables. The migration sets this up automatically, but if you skipped it, run `ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;` for each table.

### "password authentication failed"
→ Double-check your Supabase database password. Use the "Reset Database Password" option in Supabase Project Settings if needed.

### Backend can't connect
→ In Supabase Dashboard → **Database** → check if your IP is allowed under "Connection Pooling". For local dev, you may need to enable IPv4 CIDR `0.0.0.0/0` temporarily (or use a VPN).

## Architecture Notes

- **Multi-tenant RLS**: Every table has `tenant_id` column with a row-level security policy. The middleware runs `SELECT set_config('app.current_tenant_id', $1, false)` on every authenticated request, which the RLS policies use to filter rows.
- **API key encryption**: Uses `pgp_sym_encrypt()` / `pgp_sym_decrypt()` from `pgcrypto`. The encryption key is derived from the JWT secret (configured at the database level via `app.encryption_key` custom parameter).
- **No Supabase Auth**: This app uses its own JWT-based auth flow. Supabase is used purely as a managed PostgreSQL provider.
- **Fallback chain**: When services need an API key (e.g., OpenAI for assessments, Twilio for SMS), they check:
  1. Tenant-specific key in `tenant_api_keys` table
  2. Environment variable (`OPENAI_API_KEY`, `TWILIO_*`, `EMAIL_API_KEY`)
  3. Graceful degradation (skip AI enhancement, log warning for SMS/email)
