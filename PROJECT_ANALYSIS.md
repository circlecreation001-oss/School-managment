# SchoolNex - Project Analysis

**Last Updated**: August 2026  
**Product**: SchoolNex - Complete School Management ERP  
**Company**: Circle Creation (Founded by Shivam Kumar)  
**Website**: https://schoolnex.in

---

## 1. Executive Summary

SchoolNex is a **multi-tenant, white-label SaaS Education ERP** built as a monorepo with a Node.js/Express backend, Next.js 15 frontend, PostgreSQL database, and Redis caching/queue system. It supports the complete lifecycle of educational institution management: student admissions, attendance, fee collection, examinations, homework, library, notifications, website CMS, and more.

**Production Status**: LIVE on Render (API) + Vercel (Frontend) + Supabase (PostgreSQL) + Upstash (Redis).

---

## 2. Repository Structure

```
SMS/
├── apps/
│   ├── api/                          # Express.js Backend (TypeScript)
│   │   ├── src/
│   │   │   ├── app.ts                # Express app setup (CORS, Helmet, rate limiting)
│   │   │   ├── server.ts             # Bootstrap (DB, Redis, Workers, Super Admin)
│   │   │   ├── config/               # env, logger, redis, queue, socket, storage
│   │   │   ├── middleware/           # auth, rbac, tenant, validate, error, upload, request-id
│   │   │   ├── modules/             # 17 feature modules (each: controller, service, repository, routes, schema, tests)
│   │   │   ├── routes/              # Health check + API router aggregation
│   │   │   ├── utils/               # errors, response, token, password, encryption, pdf, excel, branch
│   │   │   └── workers/             # BullMQ workers (email, sms, notification, report)
│   │   └── package.json
│   └── web/                          # Next.js 15 Frontend (TypeScript)
│       ├── src/
│       │   ├── app/                  # App Router (auth, dashboard, public route groups)
│       │   ├── components/           # auth, calendar, charts, common, forms, layout, portal, ui
│       │   ├── config/               # navigation.ts, role-navigation.ts
│       │   ├── hooks/                # use-debounce, use-permissions, use-sidebar, use-theme
│       │   ├── lib/                  # api-client.ts (fetch wrapper with caching, token refresh)
│       │   └── providers/            # auth-provider.tsx (React Context)
│       └── package.json
├── packages/
│   ├── database/                     # Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # 1792 lines, 68+ models, 15 enums
│   │   │   └── migrations/
│   │   ├── seed/                     # roles-permissions.ts, super-admin.ts
│   │   └── src/index.ts
│   ├── types/                        # Shared TypeScript types
│   │   └── src/                      # api.types, auth.types, common.types, tenant.types, rbac.types
│   ├── utils/                        # Shared utilities (pagination, etc.)
│   └── validation/                   # Shared validation schemas
├── docs/                             # Feature docs, production status, audits
├── plan/                             # Architecture plans, ERD, business rules, audits
├── infra/                            # Docker, Nginx configs
├── docker-compose.yml                # PostgreSQL, Redis, MinIO, Mailpit
├── render.yaml                       # Render deployment config
├── DEPLOYMENT.md                     # Production deployment guide
├── package.json                      # Monorepo root (npm workspaces)
└── tsconfig.base.json                # Shared TypeScript config
```

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | 15 |
| **Frontend Styling** | Tailwind CSS | 3.x |
| **Backend** | Express.js + TypeScript | 5.x |
| **Build Tool (API)** | tsup | latest |
| **Database** | PostgreSQL (Supabase) | 16 |
| **ORM** | Prisma | 5.22.0 |
| **Cache / Sessions** | Redis (Upstash) | 7 |
| **Job Queue** | BullMQ | latest |
| **Email** | Nodemailer | latest |
| **Storage** | MinIO (dev) / Supabase S3 (prod) | latest |
| **Auth** | JWT (access + refresh) + bcryptjs | - |
| **Validation** | Zod | latest |
| **Testing** | Vitest | latest |
| **Monorepo** | npm Workspaces | - |
| **Linting** | ESLint + Prettier | - |
| **Git Hooks** | Husky + lint-staged + commitlint | - |

---

## 4. Database Schema (68+ Models, 15 Enums)

### 4.1 Core SaaS & Tenant
- **Tenant** - Multi-tenant organization (slug, domain, status, plan, trial)
- **TenantSettings** - Branding (logo, colors, timezone, currency, SMS/email providers)
- **FeatureFlag** - Per-tenant feature toggles
- **Plan** - Subscription plans (code, price, limits)
- **Subscription** - Tenant-plan association with billing
- **OrganizationConfig** - Key-value config per module per tenant

### 4.2 Institution Structure
- **Institution** → **Branch** → **Department** → **Course** → **Class** → **Section** → **Batch**
- **AcademicSession** - Year-based sessions (e.g., 2025-2026)
- **Subject**, **SubjectGroup**, **SubjectGroupMapping**
- **ClassTeacherAssignment**, **SubjectTeacherAssignment**
- **PromotionRule** - Auto-promotion rules between classes
- **CalendarEvent** - Academic calendar

### 4.3 Identity & Access (IAM)
- **User** - (tenantId, email, passwordHash, status, emailVerified)
- **Role** - (tenantId, code, isSystemRole)
- **Permission** - (tenantId, code: "module:action")
- **UserRole** - Many-to-many (userId, roleId, tenantId, institutionId, branchId)
- **RolePermission** - Many-to-many
- **Session** - Refresh token storage with device tracking

### 4.4 Student & Parent
- **Student** - (admissionNumber, rollNumber, class, section, batch, status)
- **Parent** - (relation, contact)
- **ParentStudent** - Junction with primary flag
- **StudentDocument** - Uploaded documents with verification
- **Certificate** - Merit, transfer, conduct certificates

### 4.5 Teacher & Staff
- **Teacher** - (employeeCode, qualification, experience, designation, status)
- **TeacherSubject** - Teacher-subject mapping
- **TeacherQualification**, **TeacherExperience**, **TeacherSalary**, **TeacherDocument**
- **Staff** - Non-teaching staff

### 4.6 Attendance & Leave
- **Attendance** - Student/Teacher/Staff daily attendance
- **Leave** - Leave applications with approval workflow
- **Holiday** - Institution holidays
- **Timetable** - Weekly class schedule

### 4.7 Fee Management
- **FeeCategory** → **FeeStructure** → **Invoice** → **Payment**
- **Discount**, **Scholarship**

### 4.8 Examination
- **Exam** → **Result** (with grade auto-assignment)
- **QuestionBank** - MCQ/subjective question repository
- **Grade** - Grading scale (A+, B, etc.)

### 4.9 Homework & Study Materials
- **Homework** → **HomeworkAttachment** → **Submission**
- **StudyMaterial** - Notes, PDFs, videos, links

### 4.10 Library
- **Book** → **BookIssue** (with fine tracking)

### 4.11 Notifications
- **NotificationTemplate** - Per-tenant templates
- **Notification** - Sent notifications with delivery tracking

### 4.12 Website & CMS
- **WebsitePage** - Public pages (home, about, contact)
- **BlogPost** - Blog with SEO metadata
- **GalleryItem** - Image gallery
- **ContactEnquiry** - Contact form submissions

### 4.13 Admissions
- **Admission** → **AdmissionDocument** - Admission pipeline

### 4.14 Audit
- **AuditLog** - All CRUD operations tracked

---

## 5. Authentication System

### 5.1 Flow
1. **Login**: Email/username/phone + password → JWT access (15min) + refresh (7d) tokens
2. **Multi-tenant resolution**: tenantSlug, x-tenant-id header, or subdomain
3. **Token refresh**: Silent refresh via `/auth/refresh-token`
4. **Session management**: Max 5 active sessions per user, oldest revoked on overflow
5. **Account lockout**: 5 failed attempts → 30-minute lockout (Redis)
6. **Password history**: Last 5 passwords stored, cannot reuse
7. **Password policy**: 12 chars, upper+lower+number+special

### 5.2 Institute Signup Flow
1. User fills signup form (institute name, owner name, email, mobile, password)
2. System creates: Tenant + TenantSettings + Institution + Branch + AcademicSession + Subscription + Admin User + 15 roles + 120 permissions + 14 org configs
3. All in a single Prisma transaction
4. Auto-login with JWT tokens
5. Welcome email queued

### 5.3 Platform Super Admin
- Created on server bootstrap from env vars (`SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`)
- Lives in "platform" tenant
- Has `super_admin` role with all 128 permissions
- Password auto-updates if env var changes

---

## 6. RBAC (Role-Based Access Control)

### 6.1 Architecture
- **17 System Roles**: super_admin, tenant_admin, institution_admin, principal, vice_principal, hod, teacher, student, parent, accountant, librarian, receptionist, hr_manager, transport_manager, hostel_warden, inventory_manager, staff
- **15 Permission Modules**: users, students, teachers, parents, attendance, fees, exams, homework, study_materials, library, notifications, reports, settings, website, admissions
- **8 Permission Actions**: view, create, edit, delete, approve, export, configure, manage
- **Total**: 120 possible permissions per tenant (15 × 8)

### 6.2 Middleware
- `authenticate` - JWT verification, attaches user to request
- `requireRole(...roles)` - Checks user has at least one of the specified roles
- `requirePermission([...perms], requireAll?)` - Checks permissions; super_admin bypasses all
- `resolveTenant` - Resolves tenant from JWT → header → subdomain
- `requireTenant` - Ensures tenant context exists and is not suspended/expired

### 6.3 Permission Seeding
- On tenant creation: 120 permissions created, all assigned to tenant_admin
- On server bootstrap: `repairTenantPermissions()` fixes any tenants missing permissions

---

## 7. Multi-Tenancy Architecture

### 7.1 Isolation Strategy
- **Database-level**: Single PostgreSQL database, every table has `tenantId` column
- **Query-level**: All Prisma queries scoped by `tenantId` (enforced in service layer)
- **Tenant resolution**: JWT claims → `x-tenant-id` header → subdomain
- **Redis caching**: Tenant context cached for 5 minutes (`tenant:ctx:{id}`)

### 7.2 Tenant Lifecycle
- **trial** → **active** → **suspended** / **expired** / **cancelled** → **archived**
- Trial: 7 days, auto-created on signup
- Suspended/expired tenants blocked at middleware level

### 7.3 White-Label / Branding
- Per-tenant: logo, favicon, primary/secondary/accent colors
- Per-tenant: timezone, currency, language, date format
- Per-tenant: SMS/email/WhatsApp provider configuration
- Per-tenant: feature flags

---

## 8. API Architecture

### 8.1 Route Structure
```
/api/v1/
├── /health                    # Health check
├── /auth/*                    # Authentication (login, register, signup, OTP, sessions)
├── /saas/*                    # Super Admin (dashboard, tenants, users, audit logs)
├── /organizations/*           # Organization management (plans, branding, subscription, config)
├── /users/*                   # User CRUD, roles, sessions, activity
├── /academics/*               # Sessions, departments, courses, classes, sections, subjects, calendar
├── /students/*                # Student CRUD, parents, documents, promotion, transfer, certificates
├── /teachers/*                # Teacher CRUD, qualifications, experience, salary, subjects, documents
├── /attendance/*              # Student/teacher/staff attendance, QR check-in, analytics, holidays
├── /fees/*                    # Categories, structures, invoices, payments, Razorpay, discounts, refunds
├── /exams/*                   # Exams, marks, results, grades, analytics, report cards
├── /homework/*                # Homework CRUD, submissions, review
├── /study-materials/*         # Study material CRUD, download tracking
├── /library/*                 # Books, issues, returns, fines, reports
├── /reports/*                 # Dashboard, attendance, fees, revenue, students, teachers, exam reports
├── /notifications/*           # Send, broadcast, templates, user notifications
├── /website/*                 # Public pages, blog, gallery, enquiries, enterprise leads
└── /imports/*                 # Excel/CSV import detection and processing
```

### 8.2 Middleware Stack
1. CORS (whitelist-based, Vercel domains auto-allowed)
2. Helmet (HSTS 1yr, CSP, X-Frame-Options: DENY, Permissions-Policy)
3. Request ID (UUID per request)
4. Body parsing (2MB limit, signed cookies)
5. Compression (gzip)
6. Global rate limiting (100 req/15min)
7. Request logging (sanitized)
8. Tenant context resolution
9. Auth (JWT) + RBAC (role/permission checks)
10. Validation (Zod schemas)
11. Error handling (centralized)

### 8.3 Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

---

## 9. Frontend Architecture

### 9.1 Route Groups
- **(auth)**: login, signup, forgot-password, reset-password
- **(dashboard)**: 30+ pages (dashboard, students, teachers, attendance, fees, exams, homework, library, reports, settings, super-admin, role-specific portals)
- **(public)**: home, about, contact, blog, gallery, enterprise, apply, downloads, faculty, results

### 9.2 State Management
- **AuthProvider** (React Context): User state, login/logout, token management
- **Dev Mode**: Falls back to hardcoded DEV_USER when API is unreachable
- **API Client**: Custom fetch wrapper with:
  - Automatic token refresh on 401
  - In-memory cache (30s TTL)
  - In-flight request deduplication
  - Cache invalidation on mutations

### 9.3 Navigation
- Role-based sidebar navigation (NAVIGATION config)
- Permission-gated menu items
- 14 navigation groups: Main, Student Management, Academics, Attendance, Examinations, Fees, Teachers & HR, Library, Communication, Import/Export, Reports, Website, Administration, Platform (Super Admin)

### 9.4 Component Library
- **auth/**: LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm
- **calendar/**: Calendar components
- **charts/**: AttendanceChart, etc.
- **common/**: Shared UI components
- **forms/**: Form inputs, selects, file uploads
- **layout/**: Sidebar, Header, DashboardLayout
- **portal/**: Role-specific portal components
- **ui/**: Button, Card, Modal, Table, Badge, etc.

---

## 10. Background Workers (BullMQ)

| Queue | Worker | Concurrency | Purpose |
|-------|--------|-------------|---------|
| `email` | email.worker.ts | 10 | Send emails via Nodemailer/SMTP |
| `sms` | sms.worker.ts | 5 | Send SMS (stub) |
| `notification` | notification.worker.ts | 10 | Unified notification router (email/sms/whatsapp/push/in-app) |
| `report` | report.worker.ts | 3 | Heavy report generation |

### Notification Triggers (Automated)
- **Admission Confirmation**: Email + WhatsApp on new admission
- **Fee Receipt**: Email + WhatsApp on payment
- **Attendance Alert**: Email + WhatsApp when student marked absent
- **Homework Alert**: In-app broadcast when homework published
- **Result Alert**: Email + WhatsApp when results published
- **Birthday Wishes**: Email + WhatsApp
- **Demo Booking Confirmation**: Email + WhatsApp

---

## 11. Security Posture

| Control | Implementation |
|---------|---------------|
| **Transport Security** | HSTS (1 year, includeSubDomains, preload) |
| **Content Security** | CSP via Helmet (strict directives) |
| **Clickjacking** | X-Frame-Options: DENY |
| **MIME Sniffing** | X-Content-Type-Options: nosniff |
| **XSS** | X-XSS-Protection enabled |
| **CORS** | Whitelist-based, credentials enabled |
| **Rate Limiting** | Global: 100/15min, Auth: 10/15min, Password: 5/hour |
| **Password Hashing** | bcrypt (12 rounds) |
| **Password Policy** | 12 chars, upper+lower+number+special, history check (last 5) |
| **Account Lockout** | 5 failed attempts → 30-min lockout (Redis) |
| **JWT** | Access: 15min, Refresh: 7d, rotation on use |
| **Field Encryption** | AES-256-GCM for sensitive fields |
| **File Upload** | MIME type + extension whitelist, 2MB body limit |
| **Error Handling** | No stack traces in production |
| **Multi-Tenant Isolation** | Every query scoped by tenantId |
| **Audit Logging** | All CRUD operations tracked with actor, IP, user agent |

---

## 12. Deployment Architecture

```
[Vercel - Frontend]  →  [Render - API]  →  [Supabase - PostgreSQL]
     Next.js 15             Express             68 tables
                                ↓
                         [Upstash - Redis]
                          Sessions + Cache
                          BullMQ Workers
```

### Infrastructure
- **Frontend**: Vercel (auto-deploy from Git)
- **Backend**: Render (Node.js web service)
- **Database**: Supabase (managed PostgreSQL)
- **Redis**: Upstash (managed Redis)
- **Storage**: Supabase S3 (file uploads)
- **Email (Dev)**: Mailpit (Docker)
- **Email (Prod)**: SMTP (configurable)

---

## 13. Testing

- **Framework**: Vitest
- **Test Files**: 10 test files across modules (auth, super-admin, students, attendance, fees, exams, notifications, academics, study-materials, users)
- **Coverage**: ~40% (per production status report)
- **Setup**: vitest.config.ts + vitest.setup.ts per app

---

## 14. Development Workflow

```bash
# Install dependencies
npm install

# Start development
npm run dev:api     # Express API on :4000
npm run dev:web     # Next.js on :3000

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema (no migration)
npm run db:seed      # Seed roles, permissions, super admin
npm run db:studio    # Prisma Studio GUI

# Quality
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier

# Docker (dev infrastructure)
docker-compose up -d  # PostgreSQL, Redis, MinIO, Mailpit
```

---

## 15. Key Business Rules

1. **Trial**: 7-day free trial on signup, auto-expires
2. **Duplicate Prevention**: Students checked by email and phone before creation
3. **Attendance**: Cannot mark on holidays; absent students trigger parent notifications
4. **Fee Payments**: Cannot exceed outstanding amount; auto-updates invoice status
5. **Exam Marks**: Cannot exceed total marks; auto-grade assignment
6. **Session Limit**: Max 5 active sessions per user
7. **Password History**: Last 5 passwords cannot be reused
8. **Tenant Isolation**: All data access scoped to tenantId
9. **Soft Deletes**: Most entities use deletedAt for soft deletion
10. **Audit Trail**: Every mutation logged with actor, IP, user agent

---

## 16. Modules NOT Yet Implemented

| Module | Effort | Status |
|--------|--------|--------|
| Transport (vehicles, routes, GPS) | 2 weeks | No Prisma model |
| Hostel (rooms, allocation) | 1 week | No Prisma model |
| Inventory/Assets | 1 week | No Prisma model |
| Online Exam Player (MCQ engine) | 2 weeks | QuestionBank exists, no player |
| Payroll Slips | 3 days | TeacherSalary exists, no generation |
| Timetable Builder UI | 1 week | Model exists, no visual editor |

---

## 17. Production Readiness Score

| Category | Score |
|----------|-------|
| Authentication | 98% |
| Authorization (RBAC) | 95% |
| Backend API | 95% |
| Frontend UI | 85% |
| Database | 95% |
| Security | 92% |
| Multi-Tenancy | 98% |
| Deployment | 100% |
| Documentation | 80% |
| Testing | 40% |
| **Overall** | **85%** |