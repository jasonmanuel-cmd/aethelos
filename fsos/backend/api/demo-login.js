const jwt = require('jsonwebtoken');

const DEMO_EMAIL = 'jasonm@coaibakersfield.com';
const DEMO_PASSWORD = 'blunts954';
const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
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

  return res.status(401).json({ error: 'Invalid credentials' });
};