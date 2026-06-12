const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  for await (const chunk of req) body += chunk;

  try {
    const { email, password } = JSON.parse(body);
    if (!email || !password) throw new Error('Missing fields');

    const result = await pool.query(`
      SELECT u.*, t.name as tenant_name, t.slug as tenant_slug, t.domain as tenant_domain
      FROM "user" u
      JOIN tenant t ON t.id = u.tenant_id
      WHERE u.email = $1 AND u.is_active = true
    `, [email]);

    if (result.rows.length === 0) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ detail: 'Invalid email or password' }));
      return;
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ detail: 'Invalid email or password' }));
      return;
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: {
        token,
        user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role },
        tenant: { id: user.tenant_id, name: user.tenant_name, slug: user.tenant_slug, domain: user.tenant_domain }
      }
    }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
};
