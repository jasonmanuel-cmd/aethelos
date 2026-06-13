const jwt = require('jsonwebtoken');

const DEMO_EMAIL = 'jasonm@coaibakersfield.com';
const DEMO_PASSWORD = 'blunts954';
const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id, x-request-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

module.exports = async (req, res) => {
  try {
    handleCors(req, res);

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const url = req.url || '/';
    const method = req.method;

    if (url === '/' && method === 'GET') {
      return res.status(200).json({
        message: 'FSOS API',
        version: '1.0.0',
        status: 'ok',
        endpoints: {
          login: '/api/v1/tenant/login',
          health: '/api/v1/health',
        },
      });
    }

    if (url === '/api/v1/health' && method === 'GET') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (url === '/api/v1/tenant/login' && method === 'POST') {
      // Demo mode: accept any credentials for demo
      const token = jwt.sign(
        { userId: DEMO_USER_ID, tenantId: DEMO_TENANT_ID, email: DEMO_EMAIL, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        data: {
          token,
          user: {
            id: DEMO_USER_ID,
            email: DEMO_EMAIL,
            first_name: 'Jason',
            last_name: 'Blunt',
            role: 'admin',
          },
          tenant: { id: DEMO_TENANT_ID, name: 'COAI Demo Agency', slug: 'coai-demo' },
        },
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};