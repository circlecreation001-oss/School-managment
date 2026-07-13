# Production Deployment Guide
## HimanshiTech Education ERP

---

## ✅ Pre-Deployment Verification (All Passed)

| Check | Status |
|-------|--------|
| Supabase PostgreSQL connected | ✅ `"database":"healthy"` |
| Upstash Redis connected | ✅ `PING → PONG` |
| BullMQ Workers running | ✅ 4 workers (email, sms, notification, report) |
| Prisma generate | ✅ Client v5.22.0 |
| Prisma db push (68 tables) | ✅ "already in sync" |
| Database seeded | ✅ 16 roles, 128 permissions, super admin |
| API build | ✅ 383 KB |
| JWT secrets generated | ✅ 64-char hex |
| Health check | ✅ `/api/v1/health` returns healthy |
| No hardcoded localhost in prod code | ✅ All use env vars |

---

## BACKEND (Render)

| Setting | Value |
|---------|-------|
| **Root Directory** | _(leave empty — monorepo root)_ |
| **Build Command** | `npm install && npx prisma generate --schema=packages/database/prisma/schema.prisma && npm run build:api` |
| **Start Command** | `node apps/api/dist/server.mjs` |
| **Health Check Path** | `/api/v1/health` |

### Environment Variables (Render)

```env
NODE_ENV=production
API_PORT=4000
API_PREFIX=/api/v1
DATABASE_URL=postgresql://postgres:shiva95kU%40123@db.auqqwdbibsxmxkegmovv.supabase.co:5432/postgres
REDIS_URL=rediss://default:gQAAAAAAAmHxAAIgcDEwZTU5MDk5MjMxNGU0YjFmOThjYmZiMGMxMTlhNjVhYg@moved-tuna-156145.upstash.io:6379
JWT_ACCESS_SECRET=dc5db4969c2c38f2f0efed154d614bfd7f12d8a558dd96b379b9060a0f41e496
JWT_REFRESH_SECRET=476a1faf766d448ffef62e52bd42df5c73a6027b7a7a3fdf597677f9629b7e71
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGINS=https://YOUR-APP.vercel.app
LOG_LEVEL=info
LOG_FORMAT=json
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=aafa87dcc24a3d98fa8622729fab0c29
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

1. Deploy backend to Render → get the URL (e.g., `https://education-erp-api.onrender.com`)
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
[Vercel - Frontend]  →  [Render - API]  →  [Supabase - PostgreSQL]
     Next.js 15             Express             68 tables
                               ↓
                        [Upstash - Redis]
                         Sessions + Cache
                         BullMQ Workers
```
