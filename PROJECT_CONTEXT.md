# SchoolNex - Project Context

**Purpose**: This document provides a comprehensive understanding of the SchoolNex codebase for developers, AI assistants, and new team members. It explains the architecture, conventions, patterns, and design decisions.

---

## 1. Project Identity

| Attribute | Value |
|-----------|-------|
| **Product Name** | SchoolNex |
| **Tagline** | Complete School Management ERP Software |
| **Company** | Circle Creation |
| **Founder** | Shivam Kumar |
| **Website** | https://schoolnex.in |
| **Repository** | SMS/ (monorepo) |
| **License** | Private / Proprietary |
| **Node.js** | >= 20.0.0 |
| **npm** | >= 10.0.0 |

---

## 2. Monorepo Structure & npm Workspaces

The project uses **npm Workspaces** with 4 packages:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Workspace Packages

| Package | Name | Path | Purpose |
|---------|------|------|---------|
| API Backend | `apps/api` | `apps/api/` | Express.js REST API server |
| Web Frontend | `apps/web` | `apps/web/` | Next.js 15 frontend application |
| Database | `@erp/database` | `packages/database/` | Prisma client + schema + migrations + seed |
| Types | `@erp/types` | `packages/types/` | Shared TypeScript type definitions |
| Utils | `@erp/utils` | `packages/utils/` | Shared utility functions (pagination, etc.) |
| Validation | `@erp/validation` | `packages/validation/` | Shared Zod validation schemas |

### Import Convention
- Backend imports from `@erp/database` for Prisma client
- Backend imports from `@erp/types` for shared types
- Backend imports from `@erp/utils` for shared utilities
- Frontend does NOT import from `@erp/database` (browser compatibility)

---

## 3. Backend Architecture (`apps/api`)

### 3.1 Module Pattern

Every feature module follows a strict **5-file pattern**:

```
modules/{module-name}/
├── index.ts              # Barrel export (router)
├── {module}.controller.ts # HTTP request/response handling
├── {module}.service.ts    # Business logic
├── {module}.repository.ts # Database queries (Prisma)
├── {module}.routes.ts     # Express Router with auth + validation
├── {module}.schema.ts     # Zod validation schemas
└── __tests__/
    └── {module}.service.test.ts
```

### 3.2 Layer Responsibilities

| Layer | Responsibility | Must NOT |
|-------|---------------|----------|
| **Controller** | Parse request, call service, send response | Business logic, DB queries |
| **Service** | Business logic, validation, orchestration | HTTP concerns (req/res) |
| **Repository** | Prisma queries only | Business logic, HTTP concerns |
| **Routes** | Wire HTTP method + path + middleware + controller | Any logic |
| **Schema** | Zod schemas for request validation | Any logic |

### 3.3 Middleware Execution Order

```
1. CORS (pre-flight OPTIONS)
2. Helmet (security headers)
3. Permissions-Policy header
4. Request ID (UUID)
5. Body parsing (JSON 2MB, URL-encoded 2MB)
6. Cookie parser (signed)
7. Compression (gzip)
8. Global rate limiter (100/15min)
9. Request logger (sanitized)
10. Tenant context resolution
11. API Router
    ├── Auth middleware (JWT)
    ├── RBAC middleware (role/permission)
    ├── Validation middleware (Zod)
    └── Controller
12. 404 handler
13. Global error handler
```

### 3.4 Config Module

The `config/` directory provides singleton services:

| File | Export | Purpose |
|------|--------|---------|
| `env.ts` | `env` | Typed environment variables with defaults |
| `logger.ts` | `logger` | Pino logger (pretty in dev, JSON in prod) |
| `redis.ts` | `redis`, `connectRedis`, `disconnectRedis` | ioredis client (supports Upstash TLS) |
| `queue.ts` | `emailQueue`, `smsQueue`, `notificationQueue`, `reportQueue` | BullMQ queues |
| `socket.ts` | `initializeSocket`, `emitToUser` | Socket.IO for real-time notifications |
| `storage.ts` | Storage client | S3-compatible file storage |

### 3.5 Error Handling

- **AppError class** (`utils/errors.ts`): Custom error with `statusCode`, `code`, `message`
- **Global error handler** (`middleware/error.middleware.ts`): Catches all errors, returns standardized JSON
- **Production**: No stack traces, generic messages for 500 errors
- **Development**: Full error details included

### 3.6 Response Helpers (`utils/response.ts`)

```typescript
sendSuccess(res, data, message)     // 200
sendCreated(res, data, message)     // 201
sendPaginated(res, data, meta, message) // 200 with pagination
```

---

## 4. Frontend Architecture (`apps/web`)

### 4.1 Next.js App Router Structure

```
app/
├── layout.tsx              # Root layout (providers, fonts, metadata)
├── page.tsx                # Landing page (redirects to /home)
├── error.tsx               # Global error boundary
├── not-found.tsx           # 404 page
├── robots.ts               # robots.txt generation
├── sitemap.ts              # sitemap.xml generation
├── globals.css             # Tailwind imports + global styles
├── (auth)/                 # Auth route group (no layout chrome)
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
├── (dashboard)/            # Dashboard route group (with sidebar layout)
│   ├── layout.tsx          # Sidebar + Header + content area
│   ├── dashboard/page.tsx
│   ├── students/page.tsx
│   ├── teachers/page.tsx
│   ├── attendance/page.tsx
│   ├── fees/page.tsx
│   ├── exams/page.tsx
│   ├── homework/page.tsx
│   ├── library/page.tsx
│   ├── reports/page.tsx
│   ├── settings/page.tsx
│   ├── users/page.tsx
│   ├── notifications/page.tsx
│   ├── website/page.tsx
│   ├── study-materials/page.tsx
│   ├── admissions/page.tsx
│   ├── parents/page.tsx
│   ├── academics/page.tsx
│   ├── import/page.tsx
│   ├── super-admin/        # Super admin sub-pages
│   ├── teacher/            # Teacher portal
│   ├── student/            # Student portal
│   ├── parent/             # Parent portal
│   ├── accountant/         # Accountant portal
│   ├── librarian/          # Librarian portal
│   ├── reception/          # Reception portal
│   ├── hr/                 # HR portal
│   ├── principal/          # Principal portal
│   └── unauthorized/       # Access denied page
└── (public)/               # Public website route group
    ├── layout.tsx          # Public layout (header, footer)
    ├── home/page.tsx
    ├── about/page.tsx
    ├── contact/page.tsx
    ├── blog/page.tsx
    ├── gallery/page.tsx
    ├── enterprise/page.tsx
    ├── apply/page.tsx
    ├── downloads/page.tsx
    ├── faculty/page.tsx
    └── results/page.tsx
```

### 4.2 Component Organization

```
components/
├── auth/          # LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm
├── calendar/      # CalendarEvent, CalendarView
├── charts/        # AttendanceChart, RevenueChart, etc.
├── common/        # Breadcrumb, EmptyState, ErrorState, LoadingState, PageHeader, SearchInput
├── forms/         # FormField, FormSelect, FormTextarea, FileUpload, etc.
├── layout/        # Sidebar, Header, DashboardLayout, MobileNav
├── portal/        # Role-specific dashboard widgets
└── ui/            # Button, Card, Modal, Table, Badge, Input, Select, Tabs, Toast, etc.
```

### 4.3 API Client (`lib/api-client.ts`)

The `ApiClient` class provides:
- **Automatic token refresh**: On 401, attempts refresh, retries request
- **In-memory cache**: 30-second TTL for GET requests
- **Request deduplication**: Same in-flight GET requests share one promise
- **Cache invalidation**: Auto-clears on POST/PUT/PATCH/DELETE
- **Dev mode fallback**: Falls back to hardcoded DEV_USER when API unreachable

### 4.4 Auth Provider (`providers/auth-provider.tsx`)

- React Context providing `user`, `isLoading`, `isAuthenticated`, `login`, `logout`, `refreshUser`
- On mount: checks localStorage for token, calls `/auth/me` to validate
- Dev mode: if API unreachable, uses hardcoded DEV_USER with all permissions
- Login: calls `/auth/login`, stores tokens, fetches user profile
- Logout: calls `/auth/logout`, clears all tokens and dev mode

### 4.5 Navigation System

- **`config/navigation.ts`**: Defines all sidebar menu items with labels, hrefs, icons, and required permissions/roles
- **`config/role-navigation.ts`**: Maps roles to default redirect paths
- Sidebar filters items based on user's permissions and roles
- 14 navigation groups, each with permission-gated items

---

## 5. Database Patterns

### 5.1 Naming Conventions

| Convention | Example |
|------------|---------|
| Table names | `snake_case` in DB, `camelCase` in Prisma |
| Column names | `snake_case` in DB (`@map`), `camelCase` in Prisma |
| Primary keys | `id` (CUID, String) |
| Foreign keys | `{entity}_id` (e.g., `tenant_id`, `student_id`) |
| Timestamps | `created_at`, `updated_at`, `deleted_at` |
| Unique constraints | `@@unique([tenantId, field])` |
| Indexes | `@@index([tenantId, status])` |

### 5.2 Multi-Tenant Pattern

Every table includes `tenantId`:
```prisma
model Example {
  id        String    @id @default(cuid())
  tenantId  String    @map("tenant_id")
  // ... fields
  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

### 5.3 Soft Delete Pattern

Most entities use soft deletes:
```prisma
model Example {
  deletedAt DateTime? @map("deleted_at")
}
```
Queries must filter `deletedAt: null`.

### 5.4 Audit Trail

Every mutation logs to `AuditLog`:
```typescript
await prisma.auditLog.create({
  data: {
    tenantId, actorUserId, entityType, entityId,
    action, oldValue, newValue, ipAddress, userAgent
  }
});
```

---

## 6. Authentication & Authorization Flow

### 6.1 Login Flow (Detailed)

```
1. Client POST /api/v1/auth/login { identifier, password, tenantSlug? }
2. Server resolves tenant (by slug, or auto-detect from email/username/phone)
3. Server checks tenant status (active/trial only)
4. Server checks account lockout (Redis: auth:lock:{tenantId}:{identifier})
5. Server finds user by identifier (email, username, or phone)
6. Server checks user status (active only)
7. Server verifies password (bcrypt.compare)
8. Server clears failed attempts on success
9. Server gets user roles + permissions from DB
10. Server enforces session limit (max 5, oldest revoked)
11. Server generates JWT access token (15min) + refresh token (7d)
12. Server stores session in DB
13. Server updates lastLoginAt, lastLoginIp
14. Server creates audit log entry
15. Server returns { accessToken, refreshToken, expiresIn, user }
```

### 6.2 Token Refresh Flow

```
1. Client detects 401 or token expiring
2. Client POST /api/v1/auth/refresh-token { refreshToken }
3. Server finds session by refresh token
4. Server validates session (active, not expired)
5. Server validates user (active)
6. Server gets fresh roles + permissions
7. Server rotates refresh token (old invalidated, new issued)
8. Server generates new access token
9. Server returns { accessToken, refreshToken, expiresIn, user }
```

### 6.3 Permission Check Flow

```
1. Route defines: requirePermission(['students:view'])
2. Middleware checks req.user exists (authenticate must run first)
3. If user has 'super_admin' role → bypass all checks
4. Otherwise, check user.permissions array includes required permission
5. If requireAll=true, ALL permissions must match
6. If requireAll=false (default), ANY permission suffices
7. On failure → 403 FORBIDDEN
```

---

## 7. Key Design Decisions

### 7.1 Why Single Database (Not Database-per-Tenant)?
- Simpler operations (single connection pool, single migration)
- Easier cross-tenant reporting for super admins
- Lower infrastructure cost
- Tenant isolation enforced at application layer (every query scoped)

### 7.2 Why CUID (Not UUID or Auto-Increment)?
- Sortable (time-based prefix)
- URL-safe
- Collision-resistant
- Works in distributed systems

### 7.3 Why BullMQ (Not RabbitMQ or SQS)?
- Native Redis backing (already using Redis)
- Simple API
- Built-in retry, backoff, delayed jobs
- Good observability

### 7.4 Why tsup (Not tsc or webpack for API)?
- Fast (esbuild-based)
- Single-file output
- Tree-shaking
- TypeScript declaration generation

### 7.5 Why Dev Mode in Frontend?
- Allows frontend development without running backend
- Hardcoded DEV_USER with all permissions
- Toggle via localStorage
- Automatically activates when API unreachable

---

## 8. Environment Variables

### 8.1 Required (Production)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string (supports rediss:// for Upstash) |
| `JWT_ACCESS_SECRET` | JWT signing secret (64-char hex) |
| `JWT_REFRESH_SECRET` | JWT refresh secret (64-char hex) |
| `ENCRYPTION_KEY` | AES-256-GCM encryption key (32+ chars) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `SUPER_ADMIN_EMAIL` | Platform super admin email |
| `SUPER_ADMIN_PASSWORD` | Platform super admin password |

### 8.2 Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Environment mode |
| `API_PORT` | `4000` | Server port |
| `API_PREFIX` | `/api/v1` | API route prefix |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token TTL |
| `SMTP_HOST/PORT/USER/PASS` | - | Email delivery |
| `S3_ENDPOINT/ACCESS_KEY/SECRET_KEY/BUCKET/REGION` | - | File storage |
| `LOG_LEVEL` | `info` (prod) / `debug` (dev) | Logging verbosity |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15min) | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

---

## 9. Common Patterns & Conventions

### 9.1 Service Method Pattern
```typescript
async methodName(tenantId: string, input: SomeInput, actorId: string) {
  // 1. Validate existence
  const entity = await repository.findById(id);
  if (!entity || entity.tenantId !== tenantId) {
    throw new AppError(404, 'NOT_FOUND', 'Entity not found');
  }
  
  // 2. Business logic
  // ...
  
  // 3. Persist
  const result = await repository.update(id, data);
  
  // 4. Audit
  await this.audit(tenantId, actorId, 'entity_type', id, 'action');
  
  // 5. Notify (non-blocking)
  try {
    await NotificationTriggers.someTrigger(tenantId, { ... });
  } catch (err) {
    logger.warn({ err }, 'Notification failed (non-fatal)');
  }
  
  return result;
}
```

### 9.2 Route Pattern
```typescript
const router = Router();
router.use(authenticate);  // All routes require auth

const view = requirePermission(['module:view']);
const create = requirePermission(['module:create']);
const edit = requirePermission(['module:edit']);

router.get('/', view, validateRequest({ query: listQuerySchema }), controller.list);
router.get('/:id', view, controller.getById);
router.post('/', create, validate(createSchema), controller.create);
router.patch('/:id', edit, validate(updateSchema), controller.update);
router.delete('/:id', requirePermission(['module:delete']), controller.delete);
```

### 9.3 Error Response Pattern
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Student not found",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 9.4 Pagination Pattern
```typescript
// Service
const { data, total } = await repository.list(tenantId, { page, limit, ...filters });
const meta = buildPaginationMeta(total, page, limit);
return { data, meta };

// Response
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 10. File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Backend modules | `{name}.{layer}.ts` | `student.service.ts` |
| Backend routes | `{name}.routes.ts` | `student.routes.ts` |
| Backend schemas | `{name}.schema.ts` | `student.schema.ts` |
| Backend tests | `{name}.test.ts` | `student.service.test.ts` |
| Frontend pages | `page.tsx` | `app/students/page.tsx` |
| Frontend components | `kebab-case.tsx` | `attendance-chart.tsx` |
| Frontend hooks | `use-{name}.ts` | `use-debounce.ts` |
| Config files | `{name}.{ext}` | `navigation.ts` |
| Prisma schema | `schema.prisma` | - |
| Prisma migrations | `{timestamp}_{name}/` | `20240101000000_init/` |

---

## 11. Testing Strategy

- **Framework**: Vitest
- **Test location**: `__tests__/` directory within each module
- **Test pattern**: Unit tests for services, integration tests for routes
- **Current coverage**: ~40% (needs improvement)
- **Test files exist for**: auth, super-admin, students, attendance, fees, exams, notifications, academics, study-materials, users

---

## 12. Git Workflow

- **Husky**: Pre-commit hooks
- **lint-staged**: ESLint + Prettier on staged files
- **commitlint**: Conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- **Branch strategy**: Not explicitly documented in codebase

---

## 13. Known Technical Debt & TODOs

1. **Email verification**: Token generated but email not actually sent (TODO comment in auth.service.ts)
2. **Password reset email**: Token generated but email not sent (TODO comment)
3. **SMS worker**: Stub implementation
4. **WhatsApp worker**: Stub implementation
5. **Test coverage**: Only ~40%, needs significant expansion
6. **Dev mode in production**: DEV_USER fallback should be disabled in production builds
7. **TypeScript strictness**: `exactOptionalPropertyTypes: false` (relaxed)
8. **Missing modules**: Transport, Hostel, Inventory, Online Exam Player, Payroll Slips, Timetable Builder UI
9. **Hardcoded credentials in DEPLOYMENT.md**: `admin@educationerp.com` / `Admin@123456` documented
10. **Frontend dev mode**: Hardcoded DEV_USER with email `shivam95ku@gmail.com` in auth-provider.tsx

---

## 14. Quick Reference: Key Files

| Purpose | File |
|---------|------|
| Database schema | `packages/database/prisma/schema.prisma` |
| API entry point | `apps/api/src/server.ts` |
| Express app setup | `apps/api/src/app.ts` |
| Environment config | `apps/api/src/config/env.ts` |
| Auth middleware | `apps/api/src/middleware/auth.middleware.ts` |
| RBAC middleware | `apps/api/src/middleware/rbac.middleware.ts` |
| Tenant middleware | `apps/api/src/middleware/tenant.middleware.ts` |
| Auth service | `apps/api/src/modules/auth/auth.service.ts` |
| Auth routes | `apps/api/src/modules/auth/auth.routes.ts` |
| API router | `apps/api/src/routes/index.ts` |
| Frontend auth | `apps/web/src/providers/auth-provider.tsx` |
| API client | `apps/web/src/lib/api-client.ts` |
| Navigation config | `apps/web/src/config/navigation.ts` |
| Shared types | `packages/types/src/` |
| Deployment guide | `DEPLOYMENT.md` |
| Docker compose | `docker-compose.yml` |
| Render config | `render.yaml` |