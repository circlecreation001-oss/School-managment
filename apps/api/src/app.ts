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

// ─── CORS (MUST be before all other middleware) ───
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);

    const allowedOrigins = env.corsOrigins;

    // In development, allow all
    if (env.nodeEnv === 'development') return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Also allow any *.vercel.app preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    logger.warn({ origin, allowedOrigins }, 'CORS blocked request from origin');
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-request-id'],
  exposedHeaders: ['x-request-id'],
  maxAge: 86400, // Cache preflight for 24 hours
};

// Handle OPTIONS preflight for ALL routes (returns 204)
app.options('*', cors(corsOptions));

// Apply CORS to all requests
app.use(cors(corsOptions));

// ─── Security headers ───
app.use(helmet());

// ─── Request ID ───
app.use(requestId);

// ─── Body parsing ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Compression ───
app.use(compression());

// ─── Rate limiting ───
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

// ─── Request logging ───
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.originalUrl, requestId: req.id }, 'Incoming request');
  next();
});

// ─── Tenant context resolution (after auth sets user) ───
app.use(env.apiPrefix, resolveTenant);

// ─── API Routes ───
app.use(env.apiPrefix, apiRouter);

// ─── 404 handler ───
app.use(notFoundHandler);

// ─── Global error handler ───
app.use(errorHandler);

export { app };
