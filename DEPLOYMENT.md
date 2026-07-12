# Deployment Guide — HimanshiTech Education ERP

## Architecture
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  Supabase    │
│   (Vercel)   │     │(Render/Rail) │     │ (PostgreSQL) │
│  Next.js 15  │     │ Express API  │     │  68 tables   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │    Redis     │
                     │  (Upstash)   │
                     └──────────────┘
```

---

## ✅ Completed Steps

- [x] Supabase PostgreSQL connected
- [x] `prisma db push` — all 68 tables created
- [x] Database seeded (roles, permissions, super admin)
- [x] Prisma client generated
- [x] `.env.example` updated for production
- [x] API builds successfully (374 KB)
- [x] Web builds successfully (all pages)

---

## 📋 Deployment Checklist

### 1. Database (Supabase) ✅ DONE
- [x] Create Supabase project
- [x] Get connection string
- [x] Set `DATABASE_URL` in .env
- [x] Run `npx prisma db push`
- [x] Run seed script (`npx tsx packages/database/seed/index.ts`)
- [x] Verify 68 tables created in Supabase dashboard

### 2. Redis (Upstash — Free tier available)
- [ ] Create account at https://upstash.com
- [ ] Create a Redis database (select closest region)
- [ ] Copy the connection URL (format: `rediss://default:xxx@xxx.upstash.io:6379`)
- [ ] Set `REDIS_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in environment

### 3. Backend (Render or Railway)
- [ ] Create a new **Web Service** on Render (or Railway)
- [ ] Connect GitHub repo: `circlecreation001-oss/School-managment`
- [ ] Set build command: `npm install && npm run db:generate && npm run build:api`
- [ ] Set start command: `node apps/api/dist/server.mjs`
- [ ] Set root directory: (leave empty — monorepo root)
- [ ] Add environment variables:
  ```
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
  REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
  REDIS_HOST=xxx.upstash.io
  REDIS_PORT=6379
  REDIS_PASSWORD=xxx
  JWT_ACCESS_SECRET=(generate: openssl rand -hex 32)
  JWT_REFRESH_SECRET=(generate: openssl rand -hex 32)
  JWT_ACCESS_EXPIRY=15m
  JWT_REFRESH_EXPIRY=7d
  API_PORT=4000
  API_PREFIX=/api/v1
  CORS_ORIGINS=https://your-app.vercel.app
  LOG_LEVEL=info
  LOG_FORMAT=json
  ENCRYPTION_KEY=(generate: openssl rand -hex 16)
  ```
- [ ] Deploy and verify health check: `GET /api/v1/health`

### 4. Frontend (Vercel)
- [ ] Import GitHub repo to Vercel
- [ ] Set **Root Directory**: `apps/web`
- [ ] Framework Preset: **Next.js**
- [ ] Build Command: `next build` (auto-detected)
- [ ] Add environment variable:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
  ```
- [ ] Deploy
- [ ] Verify: Login page loads, API calls work

### 5. Post-Deployment Verification
- [ ] `GET /api/v1/health` returns `{"status":"healthy"}`
- [ ] Login works: `admin@educationerp.com` / `Admin@123456`
- [ ] `/auth/me` returns user with 128 permissions
- [ ] Frontend pages load correctly
- [ ] Role-based redirect works

---

## 🔑 Credentials

| Item | Value |
|------|-------|
| Super Admin Email | admin@educationerp.com |
| Super Admin Password | Admin@123456 |
| Supabase Project | db.auqqwdbibsxmxkegmovv.supabase.co |

---

## ⚠️ Remaining Manual Steps

1. **Get a Redis provider** (Upstash free tier: 10K commands/day)
2. **Generate JWT secrets** (run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. **Update CORS_ORIGINS** with your actual Vercel domain after deployment
4. **Update `NEXT_PUBLIC_API_URL`** in Vercel with your actual Render/Railway URL

---

## 🚀 Quick Deploy Commands

```bash
# Generate secrets
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(16).toString('hex'))"

# Verify database
npx prisma db push --schema=packages/database/prisma/schema.prisma

# Seed (only run once!)
npx tsx packages/database/seed/index.ts

# Build
npm run build:api
npm run build:web
```
