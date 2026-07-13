import dotenv from 'dotenv';
import path from 'path';

// Load .env file - try multiple paths for monorepo compatibility
// In production (Render/Railway), env vars are injected by the platform — dotenv is a no-op
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Resolve Redis URL — NO localhost fallback in production
function resolveRedisUrl(): string {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  if (url) return url;
  if (isProduction) {
    console.error('[FATAL] REDIS_URL is not set in production environment');
    process.exit(1);
  }
  return 'redis://localhost:6379';
}

export const env = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'EducationERP',
  appUrl: process.env.APP_URL || (isProduction ? '' : 'http://localhost:3000'),
  apiUrl: process.env.API_URL || (isProduction ? '' : 'http://localhost:4000'),
  apiPort: parseInt(process.env.API_PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redisUrl: resolveRedisUrl(),
  redisHost: process.env.REDIS_HOST || (isProduction ? '' : 'localhost'),
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || process.env.UPSTASH_REDIS_REST_TOKEN || undefined,

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

// Startup environment validation log
console.log(`[env] NODE_ENV=${env.nodeEnv}`);
console.log(`[env] REDIS_URL loaded: ${process.env.REDIS_URL ? 'yes' : 'NO'}`);
console.log(`[env] DATABASE_URL loaded: ${process.env.DATABASE_URL ? 'yes' : 'NO'}`);
console.log(`[env] JWT_ACCESS_SECRET loaded: ${process.env.JWT_ACCESS_SECRET ? 'yes' : 'NO'}`);
if (isProduction && !process.env.DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL is not set in production environment');
  process.exit(1);
}
if (isProduction && !process.env.JWT_ACCESS_SECRET) {
  console.error('[FATAL] JWT_ACCESS_SECRET is not set in production environment');
  process.exit(1);
}
