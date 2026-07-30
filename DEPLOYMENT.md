# Production Deployment Guide
## SchoolNex

---

## âœ… Pre-Deployment Verification (All Passed)

| Check | Status |
|-------|--------|
| Supabase PostgreSQL connected | âœ… `"database":"healthy"` |
| Upstash Redis connected | âœ… `PING â†’ PONG` |
| BullMQ Workers running | âœ… 4 workers (email, sms, notification, report) |
| Prisma generate | âœ… Client v5.22.0 |
| Prisma db push (68 tables) | âœ… "already in sync" |
| Database seeded | âœ… 16 roles, 128 permissions, super admin |
| API build | âœ… 383 KB |
| JWT secrets generated | âœ… 64-char hex |
| Health check | âœ… `/api/v1/health` returns healthy |
| No hardcoded localhost in prod code | âœ… All use env vars |

---

## BACKEND (Render)

| Setting | Value |
|---------|-------|
| **Root Directory** | _(leave empty â€” monorepo root)_ |
| **Build Command** | `npm install && npx prisma generate --schema=packages/database/prisma/schema.prisma && npm run build:api` |
| **Start Command** | `node apps/api/dist/server.js` |
| **Health Check Path** | `/api/v1/health` |

### Environment Variables (Render)

```env
NODE_ENV=production
API_PORT=4000
API_PREFIX=/api/v1
DATABASE_URL=<YOUR_DATABASE_URL>
REDIS_URL=<YOUR_REDIS_URL>
JWT_ACCESS_SECRET=<GENERATE_RANDOM_64_CHAR_SECRET>
JWT_REFRESH_SECRET=<GENERATE_RANDOM_64_CHAR_SECRET>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGINS=https://YOUR-APP.vercel.app
LOG_LEVEL=info
LOG_FORMAT=json
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=<GENERATE_RANDOM_32_CHAR_KEY>
```

---

## FRONTEND (Vercel)

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js (auto-detected) |
| **Build Command** | `next build` _(auto)_ |
| **Output Directory** | `.next` _(auto)_ |

### Environment Variables (Vercel)

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-APP.onrender.com/api/v1
```

---

## Post-Deployment Steps

1. Deploy backend to Render â†’ get the URL (e.g., `https://education-erp-api.onrender.com`)
2. Set `NEXT_PUBLIC_API_URL` in Vercel to `https://education-erp-api.onrender.com/api/v1`
3. Set `CORS_ORIGINS` in Render to your Vercel domain (e.g., `https://school-managment.vercel.app`)
4. Deploy frontend to Vercel
5. Test login: `admin@educationerp.com` / `Admin@123456`

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@educationerp.com | Admin@123456 |

---

## Architecture

```
[Vercel - Frontend]  â†’  [Render - API]  â†’  [Supabase - PostgreSQL]
     Next.js 15             Express             68 tables
                               â†“
                        [Upstash - Redis]
                         Sessions + Cache
                         BullMQ Workers
```
