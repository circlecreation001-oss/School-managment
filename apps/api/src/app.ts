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

// ─── Security headers ───
app.use(helmet());

// ─── Request ID ───
app.use(requestId);

// ─── CORS ───
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-request-id'],
  }),
);

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
