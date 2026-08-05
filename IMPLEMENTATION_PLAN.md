# SchoolNex - Implementation Plan

**Date**: August 2026  
**Based on**: FINAL_AUDIT.md (200+ features verified from codebase)  

---

## 🔴 BROKEN FEATURES (4 items)

### 1. Institute Signup (PgBouncer Timeout)

| Field | Detail |
|-------|--------|
| **Current Status** | 🔴 Broken - P2028 transaction timeout |
| **Root Cause** | `DATABASE_URL` points to PgBouncer pooler (port 6543) which drops interactive transactions after ~5s. Signup creates 120+ records in a single `prisma.$transaction()`. |
| **Backend Files** | `apps/api/src/modules/auth/auth.service.ts` (lines 525-643, signupInstitute method) |
| **Frontend Files** | `apps/web/src/app/(auth)/signup/page.tsx` |
| **DB Models** | Tenant, TenantSettings, Permission, Role, RolePermission, Institution, Branch, AcademicSession, Subscription, User, UserRole, OrganizationConfig |
| **Fix Complexity** | Low |
| **Before V1?** | Yes |
| **Dependencies** | Supabase direct connection URL |
| **Implementation Plan** | 1. Set `DATABASE_URL` to direct PostgreSQL connection (port 5432) in production env vars. 2. Set `DIRECT_URL` to same direct connection. 3. Do NOT use pooler URL for either. 4. Already applied `createMany` optimization (commit `21baa5d`). 5. Test signup in production. |

### 2. Email Not Sent (Verification, Password Reset, Welcome)

| Field | Detail |
|-------|--------|
| **Current Status** | 🔴 Broken - Tokens generated, emails never sent |
| **Root Cause** | `TODO` comments in auth.service.ts (lines 222, 336). SMTP env vars not configured. Email queue exists but not wired to auth flows. |
| **Backend Files** | `apps/api/src/modules/auth/auth.service.ts` (lines 222, 336), `apps/api/src/config/queue.ts` (emailQueue), `apps/api/src/workers/email.worker.ts` |
| **Frontend Files** | None (backend-only fix) |
| **DB Models** | NotificationTemplate (optional) |
| **Fix Complexity** | Low |
| **Before V1?** | Yes |
| **Dependencies** | SMTP provider (SendGrid, Resend, AWS SES) |
| **Implementation Plan** | 1. Configure SMTP_HOST/PORT/USER/PASS env vars. 2. In `auth.service.ts` register(): add `emailQueue.add('verify-email', { to: input.email, subject, body })` after token generation. 3. In `auth.service.ts` forgotPassword(): add `emailQueue.add('reset-password', { to: input.email, subject, body })` after token generation. 4. Verify welcome email in signupInstitute() already queues (line 676). 5. Test end-to-end. |

### 3. No PDF Generation

| Field | Detail |
|-------|--------|
| **Current Status** | 🔴 Broken - No PDF output for receipts or report cards |
| **Root Cause** | `utils/pdf.ts` exists but is not used. Receipt route exists (`/fees/invoices/:id/receipt`) but returns JSON. Report card route returns JSON. |
| **Backend Files** | `apps/api/src/utils/pdf.ts`, `apps/api/src/modules/fees/fee.routes.ts` (line 63), `apps/api/src/modules/exams/exam.service.ts` (getReportCard) |
| **Frontend Files** | None (backend generates PDF, frontend downloads) |
| **DB Models** | Invoice, Payment, Student, Exam, Result, Grade |
| **Fix Complexity** | Medium |
| **Before V1?** | Yes |
| **Dependencies** | pdfkit or jspdf library |
| **Implementation Plan** | 1. Install `pdfkit`. 2. Create `generateReceiptPDF(invoice, payment)` in `utils/pdf.ts`. 3. Wire to `GET /fees/invoices/:id/receipt` route - return PDF buffer with `Content-Type: application/pdf`. 4. Create `generateReportCardPDF(studentId, sessionId)` in `utils/pdf.ts`. 5. Add `GET /exams/report-card/:studentId/pdf` route. 6. Include school logo, student name, marks table, grade summary. |

### 4. Global Search

| Field | Detail |
|-------|--------|
| **Current Status** | 🔴 Broken - No global search endpoint |
| **Root Cause** | Each module has its own `?search=` parameter. No unified search across modules. |
| **Backend Files** | New: `apps/api/src/modules/search/` (to create) |
| **Frontend Files** | `apps/web/src/components/layout/` (header search bar) |
| **DB Models** | Student, Teacher, Parent, User, Invoice, Book |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 2) |
| **Dependencies** | None |
| **Implementation Plan** | 1. Create `GET /search?q=term` endpoint. 2. Query across students (name, admissionNumber), teachers (name, employeeCode), parents (name, phone), invoices (invoiceNumber), books (title, isbn). 3. Return grouped results: `{ students: [...], teachers: [...], ... }`. 4. Add search input to header with dropdown results. 5. Limit to 5 results per category. |

---

## 🟡 PARTIALLY WORKING FEATURES (25 items)

### 5. Forgot Password Email

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Token generated, email not sent |
| **Root Cause** | Same as #2 - SMTP not configured |
| **Fix Complexity** | Low |
| **Before V1?** | Yes |
| **Plan** | Same fix as #2 |

### 6. Student Profile Image Upload

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 photoUrl field exists, no upload UI |
| **Root Cause** | Document upload API exists (`POST /students/:id/documents`) but no dedicated photo upload with preview. |
| **Backend Files** | `apps/api/src/modules/students/student.controller.ts` (addDocument), `apps/api/src/middleware/upload.middleware.ts` |
| **Frontend Files** | `apps/web/src/app/(dashboard)/students/[id]/page.tsx`, `apps/web/src/components/forms/student-form.tsx` |
| **DB Models** | Student (photoUrl), StudentDocument |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Add file input to student form. 2. Upload to S3 via existing storage config. 3. Set `photoUrl` on student record. 4. Show avatar in student list and detail page. |

### 7. Student/Teacher/Parent User Account Auto-Creation

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Student/Teacher/Parent records created, but no User account for login |
| **Root Cause** | `Student.userId` and `Teacher.userId` are nullable unique fields. No automatic user creation when student/teacher is created. |
| **Backend Files** | `apps/api/src/modules/students/student.service.ts` (admit), `apps/api/src/modules/teachers/teacher.service.ts` (create) |
| **Frontend Files** | None (backend-only) |
| **DB Models** | Student, Teacher, Parent, User, UserRole |
| **Fix Complexity** | Medium |
| **Before V1?** | Yes |
| **Dependencies** | Email delivery (#2) for sending credentials |
| **Implementation Plan** | 1. In `studentService.admit()`: after creating student, create User with auto-generated password, set `student.userId`. 2. In `teacherService.create()`: same for teacher. 3. In `studentService.addParent()`: same for parent. 4. Assign appropriate role (student/teacher/parent). 5. Queue welcome email with credentials. 6. Return credentials in response (or email only). |

### 8. Teacher Portal Verification

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 9 pages exist, need user account linkage |
| **Root Cause** | Same as #7 - no user account auto-creation |
| **Fix Complexity** | Low (depends on #7) |
| **Before V1?** | Yes |
| **Plan** | After #7 is fixed, teacher can login and access /teacher/* pages. Pages already use real APIs. |

### 9. Parent Portal Verification

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 7 pages exist, need user account linkage |
| **Root Cause** | Same as #7 |
| **Fix Complexity** | Low (depends on #7) |
| **Before V1?** | Yes |
| **Plan** | After #7 is fixed, parent can login and access /parent/* pages. |

### 10. Role-Specific Dashboards (Principal, Accountant, Reception, Librarian, HR)

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Pages exist, use shared APIs, no role-specific content |
| **Root Cause** | Dashboard pages are generic. No role-specific widgets or data views. |
| **Backend Files** | None needed (existing APIs sufficient) |
| **Frontend Files** | `apps/web/src/app/(dashboard)/principal/page.tsx`, `/accountant/page.tsx`, `/reception/page.tsx`, `/librarian/page.tsx`, `/hr/page.tsx` |
| **DB Models** | N/A (read-only views) |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Principal: add teacher performance, class-wise attendance, exam results summary. 2. Accountant: add fee collection stats, pending payments, daily collection. 3. Reception: add today's visitors, pending admissions, enquiry list. 4. Librarian: add overdue books, today's issues, popular books. 5. HR: add staff attendance, leave requests, upcoming birthdays. All use existing APIs. |

### 11. Super Admin Dashboard

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Pages exist, API exists, needs verification |
| **Root Cause** | `/saas/*` routes exist with full CRUD. Frontend pages at `/super-admin/*` exist. Not tested end-to-end. |
| **Backend Files** | `apps/api/src/modules/super-admin/super-admin.service.ts`, `.controller.ts`, `.routes.ts` |
| **Frontend Files** | `apps/web/src/app/(dashboard)/super-admin/*/page.tsx` |
| **DB Models** | Tenant, User, AuditLog |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Verify all super-admin pages load. 2. Test tenant CRUD. 3. Test user management. 4. Test audit log viewing. 5. Add tenant impersonation for support. |

### 12. Staff CRUD

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Staff model exists in Prisma, no API routes |
| **Root Cause** | `Staff` model defined in schema.prisma (lines 1050-1077) with full fields. No controller/service/routes created. |
| **Backend Files** | New: `apps/api/src/modules/staff/` (to create) |
| **Frontend Files** | `apps/web/src/app/(dashboard)/hr/staff/page.tsx` |
| **DB Models** | Staff (already exists) |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Create staff module following existing pattern (controller, service, repository, routes, schema). 2. Reuse `authenticate` + `requirePermission(['teachers:view'])` middleware. 3. CRUD endpoints: `GET/POST /staff`, `GET/PATCH/DELETE /staff/:id`. 4. Wire frontend staff page. |

### 13. Courses Frontend

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 API exists (`/academics/courses`), no frontend page |
| **Root Cause** | Courses tab not included in academics page. |
| **Backend Files** | `apps/api/src/modules/academics/academic.controller.ts` (listCourses, createCourse, etc.) |
| **Frontend Files** | `apps/web/src/app/(dashboard)/academics/page.tsx` |
| **DB Models** | Course |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | Add "Courses" tab to academics page alongside Sessions, Classes, Subjects, Departments. |

### 14. Receipt PDF

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Route exists, returns JSON not PDF |
| **Root Cause** | Same as #3 |
| **Fix Complexity** | Medium |
| **Before V1?** | Yes |
| **Plan** | Same fix as #3 |

### 15. Library Categories

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 String field on Book, not normalized |
| **Root Cause** | `Book.category` is a String field. No separate Category table. |
| **Backend Files** | `apps/api/src/modules/library/library.repository.ts` |
| **Frontend Files** | `apps/web/src/app/(dashboard)/library/page.tsx` |
| **DB Models** | Book (category field) |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 3) |
| **Plan** | 1. Add `BookCategory` model to Prisma schema. 2. Add CRUD endpoints. 3. Update book form to use category dropdown. 4. Migrate existing string categories. |

### 16. Announcements (Non-Super-Admin)

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Super admin only (`/saas/announcements`) |
| **Root Cause** | Announcement creation is only in super-admin routes. No tenant-level announcement system. |
| **Backend Files** | `apps/api/src/modules/super-admin/super-admin.routes.ts` |
| **Frontend Files** | `apps/web/src/components/ui/announcements.tsx` |
| **DB Models** | None (announcements are queued as notifications) |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Add `POST /notifications/announcement` endpoint for tenant admins. 2. Broadcast to all tenant users. 3. Show in Announcements component. |

### 17. SMS Worker

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Worker exists, stub implementation |
| **Root Cause** | `sms.worker.ts` is a stub. No SMS provider configured. |
| **Backend Files** | `apps/api/src/workers/sms.worker.ts`, `apps/api/src/config/queue.ts` |
| **Frontend Files** | None |
| **DB Models** | Notification |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 3) |
| **Dependencies** | SMS provider (Twilio, MSG91, etc.) |
| **Plan** | 1. Choose SMS provider. 2. Implement `processSmsJob()` in sms.worker.ts. 3. Configure SMS_API_KEY, SMS_SENDER_ID env vars. 4. Test end-to-end. |

### 18. WhatsApp Worker

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Routed through notification worker, no provider |
| **Root Cause** | `notification.worker.ts` routes to WhatsApp channel but no implementation. |
| **Backend Files** | `apps/api/src/workers/notification.worker.ts` |
| **Frontend Files** | None |
| **DB Models** | Notification |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 3) |
| **Dependencies** | WhatsApp Business API provider |
| **Plan** | 1. Choose WhatsApp provider. 2. Implement WhatsApp sending in notification worker. 3. Configure WHATSAPP_API_KEY env var. |

### 19. In-App Notifications (Real-time)

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Socket.IO initialized, emitToUser exists, frontend incomplete |
| **Root Cause** | `socket.ts` initializes Socket.IO. `emitToUser()` function exists. Frontend notification bell doesn't connect to socket. |
| **Backend Files** | `apps/api/src/config/socket.ts` |
| **Frontend Files** | `apps/web/src/app/(dashboard)/notifications/page.tsx`, header component |
| **DB Models** | Notification |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Add Socket.IO client to frontend layout. 2. Listen for `notification:new` events. 3. Update notification bell badge count. 4. Show toast for new notifications. |

### 20. Export Excel/CSV

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 `utils/excel.ts` exists, export routes use it, needs verification |
| **Root Cause** | Excel utility exists with column definitions. Export routes return data. Frontend export buttons exist but may not trigger download. |
| **Backend Files** | `apps/api/src/utils/excel.ts`, `apps/api/src/modules/students/student.controller.ts` (exportStudents) |
| **Frontend Files** | `apps/web/src/app/(dashboard)/students/page.tsx` (Export button) |
| **DB Models** | Student, Teacher |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Verify export endpoints return proper Content-Type. 2. Wire frontend export buttons to trigger file download. 3. Test with real data. |

### 21. File Upload UI

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Document upload APIs exist, no UI for photo/logo upload |
| **Root Cause** | Upload middleware exists. Document endpoints exist. No file input components in forms. |
| **Backend Files** | `apps/api/src/middleware/upload.middleware.ts`, `apps/api/src/config/storage.ts` |
| **Frontend Files** | `apps/web/src/components/forms/student-form.tsx`, `teacher-form.tsx` |
| **DB Models** | Student (photoUrl), Teacher (photoUrl), TenantSettings (logoUrl) |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Add file input to student/teacher forms. 2. Upload to S3 via presigned URL or direct upload. 3. Set photoUrl/logoUrl on record. 4. Show preview. |

### 22. School Logo Upload

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 TenantSettings has logoUrl, branding API exists, no upload UI |
| **Root Cause** | Same as #21 |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | Add logo upload to settings page. Use existing branding API. |

### 23. Payroll Generation

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 TeacherSalary model exists, no payroll generation |
| **Root Cause** | `TeacherSalary` model has salary components. No payroll slip generation or salary processing. |
| **Backend Files** | New: payroll service |
| **Frontend Files** | `apps/web/src/app/(dashboard)/hr/payroll/page.tsx` |
| **DB Models** | TeacherSalary |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 3) |
| **Plan** | 1. Create payroll generation service. 2. Calculate monthly salary from TeacherSalary components. 3. Generate payslip PDF. 4. Add payroll list page. |

### 24. Leave Management

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Leave model exists, teacher leave records viewable, no create endpoint |
| **Root Cause** | `GET /teachers/:id/leaves` exists. No `POST /leaves` endpoint for creating leave applications. |
| **Backend Files** | `apps/api/src/modules/teachers/teacher.controller.ts` (getLeaves) |
| **Frontend Files** | `apps/web/src/app/(dashboard)/teacher/leaves/page.tsx`, `/hr/leaves/page.tsx` |
| **DB Models** | Leave |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | 1. Add `POST /leaves` endpoint. 2. Add approval workflow (pending → approved/rejected). 3. Wire frontend leave application form. |

### 25. Fee Receipt PDF

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Same as #3 and #14 |
| **Fix Complexity** | Medium |
| **Before V1?** | Yes |
| **Plan** | Same as #3 |

### 26. Report Card PDF

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 Same as #3 |
| **Fix Complexity** | Medium |
| **Before V1?** | Yes |
| **Plan** | Same as #3 |

### 27. Dashboard Quick Actions

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 No quick action buttons on dashboard |
| **Root Cause** | Dashboard has cards and charts but no "Quick Actions" section for common tasks. |
| **Backend Files** | None needed |
| **Frontend Files** | `apps/web/src/app/(dashboard)/dashboard/page.tsx` |
| **DB Models** | N/A |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | Add Quick Actions card with buttons: "Add Student", "Mark Attendance", "Create Invoice", "Schedule Exam". Each links to the respective page. |

### 28. Sidebar Counts

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 No counts in sidebar navigation |
| **Root Cause** | Sidebar shows static labels. No badge counts for pending items. |
| **Backend Files** | New: `GET /dashboard/sidebar-counts` or use existing APIs |
| **Frontend Files** | `apps/web/src/components/layout/sidebar.tsx`, `apps/web/src/config/navigation.ts` |
| **DB Models** | Student, Teacher, Invoice (pending), Admission (pending) |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 3) |
| **Plan** | 1. Create endpoint returning counts: pending admissions, overdue invoices, today's absentees. 2. Show badge numbers in sidebar. 3. Update on navigation. |

### 29. Dark Mode Consistency

| Field | Detail |
|-------|--------|
| **Current Status** | 🟡 dark: classes present, not consistently applied |
| **Root Cause** | Some components have dark mode classes, others don't. No systematic dark mode audit. |
| **Backend Files** | None |
| **Frontend Files** | All components under `apps/web/src/components/` and `apps/web/src/app/` |
| **DB Models** | N/A |
| **Fix Complexity** | Low (tedious) |
| **Before V1?** | No (Phase 3) |
| **Plan** | Audit all components for missing `dark:` variants. Add where missing. Test in dark mode. |

---

## ⚪ NOT IMPLEMENTED FEATURES (20 items)

### 30. Transport Module

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ No Prisma model, no API, no frontend |
| **Fix Complexity** | High |
| **Before V1?** | No (Phase 3) |
| **Plan** | 1. Add Prisma models: Vehicle, Route, Stop, Driver, StudentTransport. 2. Create transport module (CRUD for all entities). 3. Add frontend pages. 4. Estimated: 2 weeks. |

### 31. Hostel Module

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ No Prisma model, no API, no frontend |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 3) |
| **Plan** | 1. Add Prisma models: Hostel, Room, RoomAllocation. 2. Create hostel module. 3. Add frontend pages. 4. Estimated: 1 week. |

### 32. Inventory Module

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ No Prisma model, no API, no frontend |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 3) |
| **Plan** | 1. Add Prisma models: Item, Category, Stock, Supplier. 2. Create inventory module. 3. Estimated: 1 week. |

### 33. AI Features (Chat, Analytics, Reports, Assistant)

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ Not implemented |
| **Fix Complexity** | High |
| **Before V1?** | No (Phase 3) |
| **Plan** | Requires external AI service integration. Not a priority for V1. |

### 34. Backup/Restore

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ Not implemented |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 3) |
| **Plan** | Supabase provides automated backups. Manual backup/restore UI can be added later. |

### 35. Remember Me

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ Not implemented |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 3) |
| **Plan** | Extend refresh token expiry when "Remember Me" is checked. Add checkbox to login form. |

### 36. Push Notifications

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ Not implemented |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 3) |
| **Plan** | Requires service worker + Firebase Cloud Messaging. Not a priority for V1. |

### 37. Online Exam Player

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ QuestionBank model exists, no player |
| **Fix Complexity** | High |
| **Before V1?** | No (Phase 3) |
| **Plan** | 1. Create MCQ exam player UI. 2. Timer, auto-submit, result calculation. 3. Estimated: 2 weeks. |

### 38. Timetable Builder UI

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ Timetable model exists, API exists, no visual editor |
| **Fix Complexity** | Medium |
| **Before V1?** | No (Phase 3) |
| **Plan** | Create drag-and-drop timetable builder. Estimated: 1 week. |

### 39. Bulk Delete

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ No bulk delete for any module |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 2) |
| **Plan** | Add checkbox selection to tables. Add `POST /students/bulk/delete` endpoint. Same pattern for teachers. |

### 40. Parent Photo Upload

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ Not implemented |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 3) |
| **Plan** | Add photoUrl to Parent model. Add upload UI to parent form. |

### 41. Staff Photo Upload

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ Not implemented |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 3) |
| **Plan** | Same as #40 for Staff model. |

### 42. Hover Cards

| Field | Detail |
|-------|--------|
| **Current Status** | ⚪ Not implemented |
| **Fix Complexity** | Low |
| **Before V1?** | No (Phase 3) |
| **Plan** | Add hover preview cards for students/teachers in lists. |

### 43-49. Remaining ⚪ Items

| # | Feature | Phase |
|---|---------|-------|
| 43 | Lessons | Phase 3 |
| 44 | Payroll Reports | Phase 3 |
| 45 | Parent Update API | Phase 2 |
| 46 | Attendance Edit/Delete UI | Phase 2 |
| 47 | Fee Edit/Delete UI | Phase 2 |
| 48 | Admission Delete | Phase 2 |
| 49 | Session/Section/Subject Filter/Pagination | Phase 2 |

---

## 📊 PRIORITY SUMMARY

### Phase 1: Mandatory Before Launch (8 items, ~3 days)

| # | Feature | Complexity | Effort |
|---|---------|-----------|--------|
| 1 | Fix DATABASE_URL (signup) | Low | 30 min |
| 2 | Configure SMTP + wire email sending | Low | 2 hours |
| 3 | PDF generation (receipts + report cards) | Medium | 4 hours |
| 5 | Forgot password email | Low | 30 min |
| 7 | Auto-create user accounts for students/teachers/parents | Medium | 3 hours |
| 8 | Teacher portal verification | Low | 30 min |
| 9 | Parent portal verification | Low | 30 min |
| 14/25/26 | Receipt PDF + Report card PDF | Medium | (included in #3) |

### Phase 2: Recommended (15 items, ~5 days)

| # | Feature | Complexity |
|---|---------|-----------|
| 4 | Global search | Medium |
| 6 | Student photo upload | Low |
| 10 | Role-specific dashboards | Low |
| 11 | Super admin verification | Low |
| 12 | Staff CRUD | Low |
| 13 | Courses frontend | Low |
| 16 | Tenant announcements | Low |
| 19 | In-app notifications (real-time) | Low |
| 20 | Export Excel/CSV verification | Low |
| 21 | File upload UI | Low |
| 22 | School logo upload | Low |
| 24 | Leave management | Low |
| 27 | Dashboard quick actions | Low |
| 39 | Bulk delete | Low |
| 45-49 | Various CRUD completions | Low |

### Phase 3: Future Version (26 items, ~6 weeks)

| # | Feature | Complexity |
|---|---------|-----------|
| 15 | Library categories | Low |
| 17 | SMS worker | Medium |
| 18 | WhatsApp worker | Medium |
| 23 | Payroll generation | Medium |
| 28 | Sidebar counts | Low |
| 29 | Dark mode consistency | Low |
| 30 | Transport module | High |
| 31 | Hostel module | Medium |
| 32 | Inventory module | Medium |
| 33 | AI features | High |
| 34 | Backup/Restore | Medium |
| 35 | Remember Me | Low |
| 36 | Push notifications | Medium |
| 37 | Online exam player | High |
| 38 | Timetable builder UI | Medium |
| 40-42 | Photo uploads, hover cards | Low |
| 43-44 | Lessons, payroll reports | Medium |