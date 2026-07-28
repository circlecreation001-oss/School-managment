import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env, logger } from './config/index.js';
import { errorHandler, notFoundHandler, requestId, resolveTenant } from './middleware/index.js';
import { apiRouter } from './routes/index.js';

const app = express();

// ─── Trust proxy (for rate limiting behind reverse proxy) ───
app.set('trust proxy', 1);

// ─── Disable x-powered-by ───
app.disable('x-powered-by');

// ─── CORS (MUST be before all other middleware) ───
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = env.corsOrigins;
    if (env.nodeEnv === 'development') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    logger.warn({ origin }, 'CORS blocked');
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-request-id'],
  exposedHeaders: ['x-request-id'],
  maxAge: 86400,
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ─── Security headers (Helmet + hardened) ───
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow cross-origin resources (storage)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true, // X-Content-Type-Options: nosniff
    xFrameOptions: { action: 'deny' }, // Clickjacking protection
    xXssProtection: true, // X-XSS-Protection
  }),
);

// ─── Permissions-Policy header ───
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  next();
});

// ─── Request ID ───
app.use(requestId);

// ─── Body parsing (strict size limits) ───
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(env.encryptionKey)); // Signed cookies

// ─── Compression ───
app.use(compression());

// ─── Global rate limiting ───
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
  },
});
app.use(limiter);

// ─── Request logging (sanitized - never log auth headers or bodies with passwords) ───
app.use((req, _res, next) => {
  if (env.nodeEnv !== 'test') {
    logger.info({ method: req.method, url: req.originalUrl, requestId: req.id }, 'req');
  }
  next();
});

// ─── Tenant context resolution ───
app.use(env.apiPrefix, resolveTenant);

// ─── API Routes ───
app.use(env.apiPrefix, apiRouter);

// ─── 404 handler ───
app.use(notFoundHandler);

// ─── Global error handler ───
app.use(errorHandler);

export { app };
