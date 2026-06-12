import * as path from 'path';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function intEnv(name: string, defaultVal: number): number {
  const value = process.env[name];
  return value ? parseInt(value, 10) : defaultVal;
}

export const config = {
  port: intEnv('PORT', 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  database: {
    url: requiredEnv('DATABASE_URL'),
    poolSize: intEnv('DB_POOL_SIZE', 20),
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: intEnv('REDIS_PORT', 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  auth: {
    jwtSecret: requiredEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_FROM_NUMBER || '',
  },

  email: {
    apiKey: process.env.EMAIL_API_KEY || '',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@fsos.io',
    fromName: process.env.EMAIL_FROM_NAME || 'FSOS',
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
  },

  paths: {
    uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    logDir: process.env.LOG_DIR || path.join(process.cwd(), 'logs'),
  },

  rateLimit: {
    ttl: intEnv('RATE_LIMIT_TTL', 60),
    limit: intEnv('RATE_LIMIT_MAX', 100),
  },
} as const;
