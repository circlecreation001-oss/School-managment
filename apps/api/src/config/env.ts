import dotenv from 'dotenv';
import path from 'path';

// Load .env file (development only — Render injects env vars directly)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
}

const isProduction = process.env.NODE_ENV === 'production';

// ─── Startup Logs ───
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('REDIS_URL loaded:', !!process.env.REDIS_URL);
console.log('JWT_ACCESS_SECRET loaded:', !!process.env.JWT_ACCESS_SECRET);
console.log('JWT_REFRESH_SECRET loaded:', !!process.env.JWT_REFRESH_SECRET);
console.log('ENCRYPTION_KEY loaded:', !!process.env.ENCRYPTION_KEY);

// ─── Production Validation ───
if (isProduction) {
  const required = ['DATABASE_URL', 'REDIS_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[FATAL] Server cannot start without these variables in production.');
    process.exit(1);
  }
}

export const env = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'EducationERP',
  appUrl: process.env.APP_URL || (isProduction ? '' : 'http://localhost:3000'),
  apiUrl: process.env.API_URL || (isProduction ? '' : 'http://localhost:4000'),
  apiPort: parseInt(process.env.API_PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Database — use DATABASE_URL directly, no localhost fallback in production
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis — use REDIS_URL directly, no localhost fallback in production
  redisUrl: process.env.REDIS_URL || (isProduction ? '' : 'redis://localhost:6379'),
  redisHost: process.env.REDIS_HOST || (isProduction ? '' : 'localhost'),
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || undefined,

  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || (isProduction ? '' : 'dev-access-secret'),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || (isProduction ? '' : 'dev-refresh-secret'),
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',

  // Storage
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  s3Endpoint: process.env.S3_ENDPOINT || '',
  s3AccessKey: process.env.S3_ACCESS_KEY || '',
  s3SecretKey: process.env.S3_SECRET_KEY || '',
  s3Bucket: process.env.S3_BUCKET || 'education-erp',
  s3Region: process.env.S3_REGION || 'us-east-1',

  // Email
  smtpHost: process.env.SMTP_HOST || (isProduction ? '' : 'localhost'),
  smtpPort: parseInt(process.env.SMTP_PORT || (isProduction ? '465' : '1025'), 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFromName: process.env.SMTP_FROM_NAME || 'Education ERP',
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@educationerp.com',

  // Logging
  logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  logFormat: process.env.LOG_FORMAT || (isProduction ? 'json' : 'pretty'),

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || (isProduction ? '' : 'http://localhost:3000')).split(',').filter(Boolean),

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || (isProduction ? '' : 'dev-encryption-key-32-chars-min!'),

  isDevelopment() {
    return this.nodeEnv === 'development';
  },
  isProduction() {
    return this.nodeEnv === 'production';
  },
  isTest() {
    return this.nodeEnv === 'test';
  },
} as const;
