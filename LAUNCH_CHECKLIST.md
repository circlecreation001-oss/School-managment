# SchoolNex - Launch Checklist for First Paying School

**Target**: One paying school using the core ERP modules.  
**Scope**: Students, Teachers, Attendance, Fees, Exams, Homework, Reports.  
**Excluded**: Transport, Hostel, Inventory, Online Exam Player, Payroll, Timetable Builder, SMS/WhatsApp workers.

---

## 🔴 CRITICAL (Must Fix Before Any School Goes Live)

### 1. Remove Dev Mode Bypass from Production
- **File**: `apps/web/src/providers/auth-provider.tsx`
- **Issue**: `DEV_USER` with hardcoded email `shivam95ku@gmail.com` and all 120 permissions is used as fallback when API is unreachable. This means anyone can bypass authentication by blocking the API.
- **Fix**: Wrap dev mode behind `process.env.NODE_ENV === 'development'` check. Remove entirely from production builds.
- **Risk**: Complete authentication bypass. Any user gets full admin access.

### 2. Fix Email Delivery (Verification, Password Reset, Welcome)
- **Files**: `apps/api/src/modules/auth/auth.service.ts` (lines 222, 336)
- **Issue**: Email verification tokens and password reset tokens are generated and stored in Redis, but the actual emails are never sent. TODO comments exist in the code.
- **Fix**: 
  - Wire up the email queue to actually send verification emails after registration
  - Wire up password reset emails after forgot-password
  - Verify welcome email is sent after institute signup (line 676 - already queued, verify it works)
- **Risk**: Users cannot verify emails or reset passwords. Support burden.

### 3. Configure Production SMTP
- **File**: Environment variables on Render
- **Issue**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS must be set to a real email provider (SendGrid, AWS SES, Resend, etc.)
- **Fix**: Set up a transactional email service and configure env vars. Test end-to-end.
- **Risk**: No emails sent. Password reset, verification, notifications all broken.

### 4. Remove Hardcoded Credentials from Documentation
- **File**: `DEPLOYMENT.md` (line 85)
- **Issue**: `admin@educationerp.com` / `Admin@123456` documented publicly in the repo.
- **Fix**: Remove or replace with placeholder text. Credentials should only come from env vars.
- **Risk**: If this repo is public or shared, credentials are exposed.

### 5. Verify Razorpay Payment Flow End-to-End
- **Files**: `apps/api/src/modules/fees/razorpay.controller.ts`, `razorpay.service.ts`
- **Issue**: Razorpay integration exists but needs live testing with real API keys.
- **Fix**: 
  - Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars
  - Test: create order → complete payment → verify signature → webhook received
  - Test: payment failure handling
  - Test: refund flow
- **Risk**: Schools cannot collect fees online. Core revenue feature broken.

### 6. Verify File Upload/Storage in Production
- **Files**: `apps/api/src/config/storage.ts`, `apps/api/src/middleware/upload.middleware.ts`
- **Issue**: Storage is configured for MinIO in dev. Production uses Supabase S3. Needs verification.
- **Fix**: 
  - Set S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET, S3_REGION
  - Test: upload student photo, upload document, upload study material
  - Test: download/view uploaded files
- **Risk**: Student documents, photos, study materials cannot be stored.

### 7. Fix CORS for Production Domains
- **File**: Environment variable `CORS_ORIGINS` on Render
- **Issue**: CORS must be explicitly set to the production frontend domain. Currently allows `*.vercel.app` wildcard which is too permissive.
- **Fix**: Set to exact production domain (e.g., `https://schoolnex.in,https://app.schoolnex.in`). Remove wildcard in production.
- **Risk**: Either CORS blocks legitimate requests, or wildcard allows any Vercel deployment to access the API.

---

## 🟠 HIGH (Must Fix Before First School Onboards)

### 8. Complete Signup-to-First-Use Flow
- **Files**: `apps/web/src/app/(auth)/signup/`, `apps/api/src/modules/auth/auth.service.ts` (signupInstitute)
- **Issue**: After signup, user is auto-logged in but lands on an empty dashboard with no guidance.
- **Fix**: 
  - Add a post-signup onboarding wizard or checklist (create class → add students → add teachers)
  - Verify the `onboarding_complete` org config flag is used somewhere in the UI
  - Ensure the dashboard shows meaningful empty states with CTAs
- **Risk**: New schools abandon the product because they don't know what to do next.

### 9. Verify Attendance Marking Works End-to-End
- **Files**: `apps/api/src/modules/attendance/`, `apps/web/src/app/(dashboard)/attendance/`
- **Issue**: API routes exist and were tested, but the frontend UI needs verification.
- **Fix**: 
  - Test: select class → load student list → mark present/absent → submit
  - Test: holiday check prevents marking
  - Test: absent student notification is queued
  - Test: daily/monthly attendance reports render correctly
- **Risk**: Core daily-use feature broken.

### 10. Verify Fee Collection + Receipt Generation
- **Files**: `apps/api/src/modules/fees/`, `apps/web/src/app/(dashboard)/fees/`
- **Issue**: Full flow needs end-to-end verification.
- **Fix**: 
  - Test: create fee category → create fee structure → generate invoice → record payment → generate receipt PDF
  - Test: bulk invoice generation for a class
  - Test: discount and scholarship application
  - Test: due report and collection summary
- **Risk**: Schools cannot manage fees. Primary revenue feature.

### 11. Verify Exam + Result Publishing
- **Files**: `apps/api/src/modules/exams/`, `apps/web/src/app/(dashboard)/exams/`
- **Issue**: Full flow needs verification.
- **Fix**: 
  - Test: create exam → enter marks → publish results → view report card
  - Test: grade auto-assignment
  - Test: result notification to parents
  - Test: class performance analytics
- **Risk**: Schools cannot manage examinations.

### 12. Fix Frontend Loading & Error States
- **Files**: All dashboard pages under `apps/web/src/app/(dashboard)/`
- **Issue**: Many pages may lack proper loading skeletons, empty states, and error boundaries.
- **Fix**: 
  - Add `<LoadingState />` or skeleton components to all data-fetching pages
  - Add `<EmptyState />` with CTAs when no data exists
  - Add `<ErrorState />` with retry buttons for API failures
  - Verify error.tsx boundary catches unhandled errors
- **Risk**: Poor UX leads to support tickets and churn.

### 13. Verify All Dashboard Pages Render Without Errors
- **Files**: All 30+ pages under `apps/web/src/app/(dashboard)/`
- **Issue**: Some pages may have broken imports, missing components, or API mismatches.
- **Fix**: 
  - Run `npm run typecheck` and fix all TypeScript errors
  - Manually visit every dashboard page as tenant_admin
  - Verify API responses match frontend expectations
  - Check browser console for errors
- **Risk**: Broken pages = broken product.

### 14. Fix Role-Based Dashboard Redirects
- **Files**: `apps/web/src/config/role-navigation.ts`, `apps/web/src/app/(dashboard)/layout.tsx`
- **Issue**: After login, users should be redirected to their role-specific dashboard (teacher → /teacher, student → /student, etc.)
- **Fix**: 
  - Verify redirect logic in auth provider or dashboard layout
  - Test login as each role type
  - Ensure role-specific portals have content (teacher, student, parent, accountant, librarian, reception, hr, principal)
- **Risk**: Users land on wrong dashboard, cannot find their features.

### 15. Add Proper Form Validation Feedback
- **Files**: All form components under `apps/web/src/components/forms/`
- **Issue**: Zod validation exists on the backend but frontend forms may not show inline validation errors.
- **Fix**: 
  - Display field-level error messages from API responses
  - Add client-side validation for required fields before submit
  - Show success toasts after mutations
  - Show error toasts with actionable messages
- **Risk**: Users submit invalid data, get confused by generic errors.

---

## 🟡 MEDIUM (Should Fix Before First School, But Not Blocking)

### 16. Add PDF Generation for Report Cards
- **Files**: `apps/api/src/utils/pdf.ts`, `apps/api/src/modules/exams/exam.service.ts` (getReportCard)
- **Issue**: Report card data is returned as JSON. No PDF download endpoint.
- **Fix**: Add a `/exams/report-card/:studentId/pdf` endpoint that generates a downloadable PDF.
- **Risk**: Schools expect printable report cards.

### 17. Add PDF Generation for Fee Receipts
- **Files**: `apps/api/src/modules/fees/fee.routes.ts` (line 63 - route exists)
- **Issue**: Route `/fees/invoices/:id/receipt` exists but needs verification.
- **Fix**: Test receipt PDF generation. Ensure it includes school logo, student name, amount, receipt number.
- **Risk**: Schools need printable receipts for accounting.

### 18. Improve Bulk Import Error Handling
- **Files**: `apps/api/src/modules/students/student.service.ts` (bulkImport), `apps/api/src/modules/imports/`
- **Issue**: Bulk import exists but error reporting may be incomplete.
- **Fix**: 
  - Return detailed row-level errors with suggestions
  - Add a preview step before final import
  - Support CSV and Excel formats
- **Risk**: Schools with existing data cannot migrate easily.

### 19. Add Data Export (CSV/Excel)
- **Files**: `apps/api/src/modules/students/student.routes.ts` (export route exists)
- **Issue**: Export routes exist but need verification.
- **Fix**: Test export for students, teachers, attendance, fees, exams. Ensure proper CSV/Excel formatting.
- **Risk**: Schools need to export data for reporting/backup.

### 20. Verify Trial Expiry Handling
- **Files**: `apps/api/src/middleware/tenant.middleware.ts` (requireTenant)
- **Issue**: After 7-day trial, tenant status changes to 'expired'. Middleware blocks access. But is there a grace period? A renewal prompt?
- **Fix**: 
  - Add a grace period (e.g., 3 days) with a banner
  - Show clear renewal CTA on login
  - Ensure data is not deleted on expiry
- **Risk**: School loses access abruptly, data appears lost, churn.

### 21. Add Super Admin Dashboard for Support
- **Files**: `apps/web/src/app/(dashboard)/super-admin/`
- **Issue**: Super admin pages exist but need verification.
- **Fix**: 
  - Verify tenant list, tenant detail, user management
  - Add ability to extend trials, change plans
  - Add ability to impersonate tenant admin for support
- **Risk**: Cannot support schools without admin tools.

---

## 🟢 LOW (Nice to Have Before First School)

### 22. Add School Branding (Logo, Colors)
- **Files**: `apps/api/src/modules/organization/`, `TenantSettings` model
- **Issue**: White-label settings exist in DB but may not be applied to frontend.
- **Fix**: Dynamically load tenant branding (logo, colors) and apply to the dashboard UI.
- **Risk**: Schools want their own branding.

### 23. Add Parent Portal Verification
- **Files**: `apps/web/src/app/(dashboard)/parent/`
- **Issue**: Parent portal pages exist. Need to verify parent login, view children's attendance, fees, results.
- **Risk**: Parents are key stakeholders.

### 24. Add Student Portal Verification
- **Files**: `apps/web/src/app/(dashboard)/student/`
- **Issue**: Student portal pages exist. Need to verify student login, view homework, study materials, results.
- **Risk**: Students are primary users.

### 25. Add Notification Center UI
- **Files**: `apps/web/src/app/(dashboard)/notifications/`
- **Issue**: Notification bell/badge in header, notification list page.
- **Fix**: Verify real-time notifications via Socket.IO, in-app notification list, mark as read.
- **Risk**: Notifications are a key value proposition.

---

## 📋 Pre-Launch Verification Checklist

### Infrastructure
- [ ] Render API service is running and healthy (`/api/v1/health` returns 200)
- [ ] Vercel frontend is deployed and loading
- [ ] Supabase PostgreSQL is connected and responsive
- [ ] Upstash Redis is connected (sessions + cache + BullMQ)
- [ ] BullMQ workers are processing jobs (email, notification, report)
- [ ] SMTP is configured and sending emails
- [ ] S3 storage is configured and accepting uploads
- [ ] Razorpay is configured with live keys
- [ ] CORS is restricted to production domains only
- [ ] SSL/TLS is enforced (HSTS, HTTPS redirect)

### Security
- [ ] Dev mode bypass is removed from production build
- [ ] Hardcoded credentials removed from all files
- [ ] JWT secrets are strong, randomly generated, and rotated from defaults
- [ ] Rate limiting is active and tested
- [ ] Helmet security headers are present in responses
- [ ] No stack traces in error responses
- [ ] No debug endpoints exposed
- [ ] SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are set

### Core Flow
- [ ] Visit schoolnex.in → public website loads
- [ ] Click "Start Free Trial" → signup form works
- [ ] Complete signup → auto-login → dashboard loads
- [ ] Create academic session
- [ ] Create classes and sections
- [ ] Add students (single + bulk import)
- [ ] Add teachers
- [ ] Mark student attendance
- [ ] Create fee structure → generate invoices → record payment
- [ ] Create exam → enter marks → publish results
- [ ] Create homework → student submission → review
- [ ] Upload study material → download
- [ ] Generate reports (attendance, fees, students)
- [ ] Send notification
- [ ] Logout → login works

### Role-Specific
- [ ] Teacher login → teacher dashboard → mark attendance, create homework
- [ ] Student login → student dashboard → view homework, submit, view results
- [ ] Parent login → parent dashboard → view child's attendance, fees, results
- [ ] Accountant login → fee collection, reports
- [ ] Librarian login → book management, issue/return

### Edge Cases
- [ ] Login with wrong password → error message (not locked out on first attempt)
- [ ] Login with wrong password 5 times → account locked for 30 minutes
- [ ] Expired token → auto-refresh or redirect to login
- [ ] Access forbidden page → clear "Access Denied" message
- [ ] 404 page → friendly not-found page
- [ ] Submit form with invalid data → field-level errors
- [ ] Submit form with missing required fields → validation errors
- [ ] Upload file larger than 2MB → error message
- [ ] Upload invalid file type → error message
- [ ] Mark attendance on holiday → blocked with message
- [ ] Pay more than outstanding amount → blocked with message
- [ ] Enter marks exceeding total → blocked with message

---

## 📊 Effort Estimate

| Priority | Items | Estimated Effort |
|----------|-------|-----------------|
| 🔴 Critical | 7 items | 2-3 days |
| 🟠 High | 8 items | 3-5 days |
| 🟡 Medium | 6 items | 2-3 days |
| 🟢 Low | 4 items | 1-2 days |
| **Total** | **25 items** | **8-13 days** |

---

## 🚀 Recommended Launch Sequence

1. **Week 1**: Fix all 🔴 Critical items (security, email, payments, storage)
2. **Week 2**: Fix all 🟠 High items (onboarding, core flows, UI polish)
3. **Week 3**: Fix 🟡 Medium items (PDFs, import/export, trial handling)
4. **Week 4**: Fix 🟢 Low items (branding, portals, notifications) + full QA pass
5. **Launch**: Run pre-launch verification checklist. Go live with first school.