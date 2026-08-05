# SchoolNex - API Map

**Base URL**: `/api/v1`  
**Auth**: Bearer JWT token in `Authorization` header  
**Tenant**: Resolved from JWT claims, `x-tenant-id` header, or subdomain  

---

## 1. Health

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| `GET` | `/health` | No | - | Health check (DB, Redis, workers) |

---

## 2. Authentication (`/auth`)

### Public Routes

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| `POST` | `/auth/login` | No | 10/15min | Login with identifier + password |
| `POST` | `/auth/register` | No | 10/15min | Register new user |
| `POST` | `/auth/signup-institute` | No | 10/15min | Signup new institute (creates tenant + admin) |
| `POST` | `/auth/refresh-token` | No | - | Refresh access token |
| `POST` | `/auth/forgot-password` | No | 5/hour | Request password reset |
| `POST` | `/auth/reset-password` | No | 5/hour | Reset password with token |
| `POST` | `/auth/verify-email` | No | - | Verify email with token |
| `POST` | `/auth/otp/send` | No | 10/15min | Send OTP to email |
| `POST` | `/auth/otp/verify` | No | 10/15min | Verify OTP |
| `POST` | `/auth/signup-with-otp` | No | 10/15min | Signup institute with OTP verification |

### Protected Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| `POST` | `/auth/logout` | JWT | - | Logout (revoke session) |
| `POST` | `/auth/change-password` | JWT | - | Change own password |
| `GET` | `/auth/me` | JWT | - | Get current user profile |
| `GET` | `/auth/sessions` | JWT | - | List active sessions |
| `DELETE` | `/auth/sessions/:sessionId` | JWT | - | Revoke a session |

---

## 3. Super Admin (`/saas`)

**All routes require**: `authenticate` + `requireRole('super_admin')`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/saas/dashboard` | super_admin | Platform dashboard stats |
| `GET` | `/saas/tenants` | super_admin | List all tenants |
| `GET` | `/saas/tenants/:id` | super_admin | Get tenant details |
| `POST` | `/saas/tenants` | super_admin | Create new tenant |
| `PATCH` | `/saas/tenants/:id` | super_admin | Update tenant |
| `POST` | `/saas/tenants/:id/suspend` | super_admin | Suspend tenant |
| `POST` | `/saas/tenants/:id/activate` | super_admin | Activate tenant |
| `DELETE` | `/saas/tenants/:id` | super_admin | Soft-delete tenant |
| `PATCH` | `/saas/tenants/:id/branding` | super_admin | Update tenant branding |
| `PATCH` | `/saas/tenants/:id/features` | super_admin | Update feature flags |
| `GET` | `/saas/users` | super_admin | List all platform users |
| `PATCH` | `/saas/users/:id/status` | super_admin | Update user status |
| `POST` | `/saas/users/:id/force-logout` | super_admin | Force logout user |
| `POST` | `/saas/users/:id/reset-password` | super_admin | Reset user password |
| `GET` | `/saas/audit-logs` | super_admin | View audit logs |
| `POST` | `/saas/announcements` | super_admin | Create platform announcement |

---

## 4. Organizations (`/organizations`)

**All routes require**: `authenticate`

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| `GET` | `/organizations/plans` | JWT | - | List subscription plans |
| `POST` | `/organizations/plans` | JWT | super_admin | Create plan |
| `GET` | `/organizations` | JWT | super_admin | List all organizations |
| `GET` | `/organizations/:id` | JWT | super_admin, tenant_admin | Get organization |
| `POST` | `/organizations` | JWT | super_admin | Create organization |
| `PATCH` | `/organizations/:id` | JWT | super_admin | Update organization |
| `POST` | `/organizations/:id/suspend` | JWT | super_admin | Suspend organization |
| `POST` | `/organizations/:id/activate` | JWT | super_admin | Activate organization |
| `DELETE` | `/organizations/:id` | JWT | super_admin | Delete organization |
| `GET` | `/organizations/:id/branding` | JWT | super_admin, tenant_admin | Get branding |
| `PATCH` | `/organizations/:id/branding` | JWT | super_admin, tenant_admin | Update branding |
| `GET` | `/organizations/:id/subscription` | JWT | super_admin, tenant_admin | Get subscription |
| `POST` | `/organizations/:id/subscription` | JWT | super_admin | Assign subscription |
| `POST` | `/organizations/:id/subscription/renew` | JWT | super_admin | Renew subscription |
| `GET` | `/organizations/:id/config` | JWT | super_admin, tenant_admin | Get configs |
| `PUT` | `/organizations/:id/config` | JWT | super_admin, tenant_admin | Update configs |
| `GET` | `/organizations/:id/features` | JWT | super_admin, tenant_admin | Get feature flags |
| `PATCH` | `/organizations/:id/features` | JWT | super_admin | Update feature flags |
| `GET` | `/organizations/:id/admins` | JWT | super_admin | Get org admins |
| `POST` | `/organizations/:id/admins` | JWT | super_admin | Create org admin |
| `GET` | `/organizations/:id/usage` | JWT | super_admin, tenant_admin | Get usage stats |
| `GET` | `/organizations/:id/setup-status` | JWT | super_admin, tenant_admin, institution_admin | Get setup wizard status |
| `POST` | `/organizations/:id/setup-complete` | JWT | super_admin, tenant_admin, institution_admin | Complete setup wizard |

---

## 5. Users (`/users`)

**All routes require**: `authenticate`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `PATCH` | `/users/me/profile` | - | Update own profile |
| `GET` | `/users` | `users:view` | List users |
| `GET` | `/users/:id` | `users:view` | Get user |
| `POST` | `/users` | `users:create` | Create user |
| `PATCH` | `/users/:id` | `users:edit` | Update user |
| `POST` | `/users/:id/activate` | `users:edit` | Activate user |
| `POST` | `/users/:id/suspend` | `users:edit` | Suspend user |
| `POST` | `/users/:id/archive` | `users:delete` | Archive user |
| `POST` | `/users/:id/restore` | `users:edit` | Restore user |
| `POST` | `/users/:id/reset-password` | `users:edit` | Reset user password |
| `POST` | `/users/:id/force-logout` | `users:edit` | Force logout user |
| `GET` | `/users/:id/sessions` | `users:view` | Get user sessions |
| `DELETE` | `/users/:id/sessions/:sessionId` | `users:edit` | Revoke user session |
| `GET` | `/users/:id/roles` | `users:view` | Get user roles |
| `POST` | `/users/:id/roles` | `users:edit` | Assign role to user |
| `DELETE` | `/users/:id/roles/:roleId` | `users:edit` | Remove role from user |
| `GET` | `/users/:id/activity` | `users:view` | Get user activity |
| `GET` | `/users/:id/login-history` | `users:view` | Get login history |
| `POST` | `/users/bulk/import` | `users:create` | Bulk import users |
| `GET` | `/users/bulk/export` | `users:export` | Export users |

---

## 6. Academics (`/academics`)

**All routes require**: `authenticate`

### Sessions

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/sessions` | `settings:view` | List academic sessions |
| `POST` | `/academics/sessions` | `settings:configure` | Create session |
| `PATCH` | `/academics/sessions/:id` | `settings:configure` | Update session |
| `POST` | `/academics/sessions/:id/set-current` | `settings:configure` | Set as current session |

### Departments

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/departments` | `settings:view` | List departments |
| `POST` | `/academics/departments` | `settings:configure` | Create department |
| `PATCH` | `/academics/departments/:id` | `settings:configure` | Update department |
| `DELETE` | `/academics/departments/:id` | `settings:configure` | Delete department |

### Courses

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/courses` | `settings:view` | List courses |
| `POST` | `/academics/courses` | `settings:configure` | Create course |
| `PATCH` | `/academics/courses/:id` | `settings:configure` | Update course |
| `DELETE` | `/academics/courses/:id` | `settings:configure` | Delete course |

### Classes

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/classes` | `settings:view` | List classes |
| `GET` | `/academics/classes/:id` | `settings:view` | Get class |
| `POST` | `/academics/classes` | `settings:configure` | Create class |
| `PATCH` | `/academics/classes/:id` | `settings:configure` | Update class |
| `DELETE` | `/academics/classes/:id` | `settings:configure` | Delete class |

### Sections

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/classes/:classId/sections` | `settings:view` | List sections for class |
| `POST` | `/academics/sections` | `settings:configure` | Create section |
| `PATCH` | `/academics/sections/:id` | `settings:configure` | Update section |
| `DELETE` | `/academics/sections/:id` | `settings:configure` | Delete section |

### Subjects

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/subjects` | `settings:view` | List subjects |
| `POST` | `/academics/subjects` | `settings:configure` | Create subject |
| `PATCH` | `/academics/subjects/:id` | `settings:configure` | Update subject |
| `DELETE` | `/academics/subjects/:id` | `settings:configure` | Delete subject |

### Subject Groups

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/subject-groups` | `settings:view` | List subject groups |
| `POST` | `/academics/subject-groups` | `settings:configure` | Create subject group |
| `DELETE` | `/academics/subject-groups/:id` | `settings:configure` | Delete subject group |

### Class Teacher Assignments

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/class-teachers` | `settings:view` | List class teacher assignments |
| `POST` | `/academics/class-teachers` | `settings:configure` | Assign class teacher |

### Subject Teacher Assignments

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/subject-teachers` | `settings:view` | List subject teacher assignments |
| `POST` | `/academics/subject-teachers` | `settings:configure` | Assign subject teacher |

### Promotion Rules

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/promotion-rules` | `settings:view` | List promotion rules |
| `POST` | `/academics/promotion-rules` | `settings:configure` | Create promotion rule |
| `DELETE` | `/academics/promotion-rules/:id` | `settings:configure` | Delete promotion rule |

### Calendar

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/academics/calendar` | `settings:view` | List calendar events |
| `POST` | `/academics/calendar` | `settings:configure` | Create calendar event |
| `PATCH` | `/academics/calendar/:id` | `settings:configure` | Update calendar event |
| `DELETE` | `/academics/calendar/:id` | `settings:configure` | Delete calendar event |

---

## 7. Students (`/students`)

**All routes require**: `authenticate`

### CRUD

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/students` | `students:view` | List students (paginated) |
| `GET` | `/students/stats` | `students:view` | Student statistics |
| `GET` | `/students/export` | `students:export` | Export students |
| `GET` | `/students/:id` | `students:view` | Get student by ID |
| `POST` | `/students` | `students:create` | Admit new student |
| `PATCH` | `/students/:id` | `students:edit` | Update student |
| `DELETE` | `/students/:id` | `students:delete` | Archive student |

### Parents

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/students/:id/parents` | `students:view` | Get student's parents |
| `POST` | `/students/:id/parents` | `students:edit` | Add parent to student |
| `DELETE` | `/students/:id/parents/:parentId` | `students:edit` | Remove parent link |

### Documents

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/students/:id/documents` | `students:view` | Get student documents |
| `POST` | `/students/:id/documents` | `students:edit` | Upload document |
| `DELETE` | `/students/:id/documents/:docId` | `students:edit` | Delete document |
| `POST` | `/students/:id/documents/:docId/verify` | `students:approve` | Verify document |

### Promotion & Transfer

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/students/promote` | `students:approve` | Promote students to next class |
| `POST` | `/students/:id/transfer` | `students:approve` | Transfer student |

### Other

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/students/:id/certificates` | `students:view` | Get student certificates |
| `GET` | `/students/:id/timeline` | `students:view` | Get student activity timeline |
| `POST` | `/students/bulk/import` | `students:create` | Bulk import students |

---

## 8. Teachers (`/teachers`)

**All routes require**: `authenticate`

### CRUD

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/teachers` | `teachers:view` | List teachers (paginated) |
| `GET` | `/teachers/:id` | `teachers:view` | Get teacher by ID |
| `POST` | `/teachers` | `teachers:create` | Create teacher |
| `PATCH` | `/teachers/:id` | `teachers:edit` | Update teacher |
| `DELETE` | `/teachers/:id` | `teachers:delete` | Archive teacher |

### Qualifications

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/teachers/:id/qualifications` | `teachers:view` | Get qualifications |
| `POST` | `/teachers/:id/qualifications` | `teachers:edit` | Add qualification |
| `DELETE` | `/teachers/:id/qualifications/:qId` | `teachers:edit` | Delete qualification |

### Experience

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/teachers/:id/experiences` | `teachers:view` | Get experience records |
| `POST` | `/teachers/:id/experiences` | `teachers:edit` | Add experience |
| `DELETE` | `/teachers/:id/experiences/:expId` | `teachers:edit` | Delete experience |

### Salary

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/teachers/:id/salary` | `teachers:view` | Get salary details |
| `PUT` | `/teachers/:id/salary` | `teachers:edit` | Update salary |

### Subjects

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/teachers/:id/subjects` | `teachers:view` | Get assigned subjects |
| `PUT` | `/teachers/:id/subjects` | `teachers:edit` | Assign subjects |

### Documents

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/teachers/:id/documents` | `teachers:view` | Get documents |
| `POST` | `/teachers/:id/documents` | `teachers:edit` | Upload document |
| `DELETE` | `/teachers/:id/documents/:docId` | `teachers:edit` | Delete document |

### Other

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/teachers/:id/timetable` | `teachers:view` | Get teacher timetable |
| `GET` | `/teachers/:id/attendance` | `teachers:view` | Get attendance records |
| `GET` | `/teachers/:id/leaves` | `teachers:view` | Get leave records |
| `GET` | `/teachers/:id/leave-stats` | `teachers:view` | Get leave statistics |
| `GET` | `/teachers/:id/timeline` | `teachers:view` | Get activity timeline |

---

## 9. Attendance (`/attendance`)

**All routes require**: `authenticate`

### Mark Attendance

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/attendance/students/bulk` | `attendance:create` | Mark bulk student attendance |
| `POST` | `/attendance/students/:studentId` | `attendance:create` | Mark single student attendance |
| `POST` | `/attendance/teachers` | `attendance:create` | Mark teacher attendance |
| `POST` | `/attendance/staff` | `attendance:create` | Mark staff attendance |
| `POST` | `/attendance/check-in` | `attendance:create` | QR/Biometric check-in |

### Query

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/attendance/students/daily` | `attendance:view` | Daily student attendance |
| `GET` | `/attendance/teachers/daily` | `attendance:view` | Daily teacher attendance |
| `GET` | `/attendance/staff/daily` | `attendance:view` | Daily staff attendance |
| `GET` | `/attendance/monthly` | `attendance:view` | Monthly attendance report |
| `GET` | `/attendance/analytics` | `attendance:view` | Attendance analytics |
| `GET` | `/attendance/absentees` | `attendance:view` | Get absentees for date |
| `GET` | `/attendance/holidays` | `attendance:view` | Get holidays for month |

---

## 10. Fees (`/fees`)

**All routes require**: `authenticate` (except webhook)

### Categories

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/fees/categories` | `fees:view` | List fee categories |
| `POST` | `/fees/categories` | `fees:create` | Create fee category |
| `PATCH` | `/fees/categories/:id` | `fees:edit` | Update fee category |
| `DELETE` | `/fees/categories/:id` | `fees:edit` | Delete fee category |

### Structures

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/fees/structures` | `fees:view` | List fee structures |
| `GET` | `/fees/structures/:id` | `fees:view` | Get fee structure |
| `POST` | `/fees/structures` | `fees:create` | Create fee structure |

### Invoices

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/fees/invoices` | `fees:view` | List invoices (paginated) |
| `GET` | `/fees/invoices/:id` | `fees:view` | Get invoice |
| `POST` | `/fees/invoices` | `fees:create` | Generate single invoice |
| `POST` | `/fees/invoices/bulk` | `fees:create` | Generate bulk invoices |
| `GET` | `/fees/invoices/:id/receipt` | `fees:view` | Generate receipt PDF |

### Payments

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/fees/payments` | `fees:create` | Record manual payment |
| `POST` | `/fees/payments/razorpay/create-order` | `fees:create` | Create Razorpay order |
| `POST` | `/fees/payments/razorpay/verify` | `fees:create` | Verify Razorpay payment |
| `POST` | `/fees/webhooks/razorpay` | No auth | Razorpay webhook handler |

### Discounts & Scholarships

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/fees/discounts` | `fees:approve` | Apply discount |
| `POST` | `/fees/scholarships` | `fees:approve` | Apply scholarship |

### Refunds

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/fees/refunds` | `fees:approve` | Process refund |

### Reports

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/fees/reports/due` | `fees:view` | Due fees report |
| `GET` | `/fees/reports/collection` | `fees:view` | Collection summary |
| `GET` | `/fees/reports/revenue` | `fees:view` | Revenue by month |
| `GET` | `/fees/ledger/:studentId` | `fees:view` | Student fee ledger |

---

## 11. Exams (`/exams`)

**All routes require**: `authenticate`

### Exams

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/exams` | `exams:view` | List exams (paginated) |
| `GET` | `/exams/:id` | `exams:view` | Get exam |
| `POST` | `/exams` | `exams:create` | Create exam |
| `POST` | `/exams/schedule` | `exams:create` | Create exam schedule (multiple) |
| `PATCH` | `/exams/:id` | `exams:edit` | Update exam |
| `DELETE` | `/exams/:id` | `exams:edit` | Cancel exam |

### Marks

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/exams/marks` | `exams:edit` | Enter marks |
| `POST` | `/exams/:id/publish` | `exams:approve` | Publish results |

### Results

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/exams/results` | `exams:view` | Get results (filterable) |
| `GET` | `/exams/results/student/:studentId` | `exams:view` | Get student results |
| `GET` | `/exams/report-card/:studentId` | `exams:view` | Get report card |

### Grades

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/exams/grades` | `exams:view` | List grades |
| `POST` | `/exams/grades` | `exams:create` | Create grade |
| `DELETE` | `/exams/grades/:id` | `exams:edit` | Delete grade |

### Analytics

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/exams/:id/analytics` | `exams:view` | Exam analytics |
| `GET` | `/exams/performance/class` | `exams:view` | Class performance |

---

## 12. Homework (`/homework`)

**All routes require**: `authenticate`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/homework` | `homework:view` | List homework (paginated) |
| `GET` | `/homework/:id` | `homework:view` | Get homework |
| `POST` | `/homework` | `homework:create` | Create homework |
| `PATCH` | `/homework/:id` | `homework:edit` | Update homework |
| `DELETE` | `/homework/:id` | `homework:edit` | Delete homework |
| `POST` | `/homework/:id/publish` | `homework:edit` | Publish homework |
| `POST` | `/homework/:id/close` | `homework:edit` | Close homework |
| `POST` | `/homework/:id/submit` | `homework:view` | Submit homework |
| `GET` | `/homework/:id/submissions` | `homework:view` | Get submissions |
| `PATCH` | `/homework/submissions/:submissionId/review` | `homework:edit` | Review submission |
| `GET` | `/homework/student/:studentId/submissions` | `homework:view` | Get student submissions |

---

## 13. Study Materials (`/study-materials`)

**All routes require**: `authenticate`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/study-materials` | `study_materials:view` | List materials (paginated) |
| `GET` | `/study-materials/:id` | `study_materials:view` | Get material |
| `GET` | `/study-materials/:id/download` | `study_materials:view` | Download material |
| `POST` | `/study-materials` | `study_materials:create` | Create material |
| `PATCH` | `/study-materials/:id` | `study_materials:edit` | Update material |
| `DELETE` | `/study-materials/:id` | `study_materials:delete` | Delete material |

---

## 14. Library (`/library`)

**All routes require**: `authenticate`

### Books

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/library/books` | `library:view` | List books (paginated) |
| `GET` | `/library/books/:id` | `library:view` | Get book |
| `GET` | `/library/books/barcode/:barcode` | `library:view` | Find book by barcode |
| `POST` | `/library/books` | `library:create` | Add book |
| `PATCH` | `/library/books/:id` | `library:edit` | Update book |
| `DELETE` | `/library/books/:id` | `library:edit` | Delete book |

### Issues & Returns

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/library/issues` | `library:view` | List book issues |
| `POST` | `/library/issues` | `library:create` | Issue book |
| `POST` | `/library/returns` | `library:create` | Return book |
| `POST` | `/library/fines` | `library:create` | Collect fine |

### Reports

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/library/reports/inventory` | `library:view` | Inventory report |
| `GET` | `/library/reports/overdue` | `library:view` | Overdue books report |
| `GET` | `/library/reports/most-issued` | `library:view` | Most issued books |

---

## 15. Reports (`/reports`)

**All routes require**: `authenticate`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/reports/dashboard` | `reports:view` | Report dashboard |
| `GET` | `/reports/attendance` | `reports:view` | Attendance report |
| `GET` | `/reports/fees` | `reports:view` | Fee report |
| `GET` | `/reports/revenue` | `reports:view` | Revenue report |
| `GET` | `/reports/students` | `reports:view` | Student report |
| `GET` | `/reports/teachers` | `reports:view` | Teacher report |
| `GET` | `/reports/exam-results` | `reports:view` | Exam results report |
| `POST` | `/reports/export` | `reports:export` | Export report |

---

## 16. Notifications (`/notifications`)

**All routes require**: `authenticate`

### Send

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/notifications/send` | `notifications:create` | Send notification |
| `POST` | `/notifications/send-from-template` | `notifications:create` | Send from template |
| `POST` | `/notifications/broadcast` | `notifications:create` | Broadcast to group |
| `POST` | `/notifications/schedule` | `notifications:create` | Schedule notification |

### User Notifications

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/notifications/me` | - | Get my notifications |
| `GET` | `/notifications/unread-count` | - | Get unread count |
| `PATCH` | `/notifications/:id/read` | - | Mark as read |
| `PATCH` | `/notifications/read-all` | - | Mark all as read |

### Admin

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/notifications` | `notifications:view` | List all notifications |
| `GET` | `/notifications/stats` | `notifications:view` | Delivery statistics |

### Templates

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/notifications/templates` | `notifications:view` | List templates |
| `POST` | `/notifications/templates` | `notifications:manage` | Create template |
| `PATCH` | `/notifications/templates/:id` | `notifications:manage` | Update template |
| `DELETE` | `/notifications/templates/:id` | `notifications:manage` | Delete template |

---

## 17. Website (`/website`)

### Public Routes (No Auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/website/public/pages/:slug` | No | Get public page |
| `GET` | `/website/public/blog/:slug` | No | Get public blog post |
| `POST` | `/website/public/enquiry` | No | Submit contact enquiry |
| `POST` | `/website/enterprise-leads` | No | Submit enterprise lead |

### Admin Routes (Auth Required)

#### Pages

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/website/pages` | `website:view` | List pages |
| `GET` | `/website/pages/:slug` | `website:view` | Get page |
| `POST` | `/website/pages` | `website:create` | Create page |
| `PATCH` | `/website/pages/:id` | `website:edit` | Update page |
| `DELETE` | `/website/pages/:id` | `website:delete` | Delete page |

#### Blog

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/website/blog` | `website:view` | List blog posts |
| `GET` | `/website/blog/categories` | `website:view` | Get blog categories |
| `GET` | `/website/blog/:slug` | `website:view` | Get blog post |
| `POST` | `/website/blog` | `website:create` | Create blog post |
| `PATCH` | `/website/blog/:id` | `website:edit` | Update blog post |
| `DELETE` | `/website/blog/:id` | `website:delete` | Delete blog post |

#### Gallery

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/website/gallery` | `website:view` | List gallery items |
| `GET` | `/website/gallery/categories` | `website:view` | Get gallery categories |
| `POST` | `/website/gallery` | `website:create` | Add gallery item |
| `DELETE` | `/website/gallery/:id` | `website:delete` | Delete gallery item |

#### Enquiries

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/website/enquiries` | `website:view` | List enquiries |
| `PATCH` | `/website/enquiries/:id/status` | `website:edit` | Update enquiry status |

---

## 18. Imports (`/imports`)

**All routes require**: `authenticate`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/imports/detect` | `students:create` | Detect file format |
| `POST` | `/imports/process` | `students:create` | Process import file |

---

## 19. Permission Reference

### Permission Modules

| Module | Code | Description |
|--------|------|-------------|
| Users | `users` | User management |
| Students | `students` | Student management |
| Teachers | `teachers` | Teacher management |
| Parents | `parents` | Parent management |
| Attendance | `attendance` | Attendance tracking |
| Fees | `fees` | Fee collection |
| Exams | `exams` | Examination management |
| Homework | `homework` | Homework assignments |
| Study Materials | `study_materials` | Study material management |
| Library | `library` | Library management |
| Notifications | `notifications` | Notification system |
| Reports | `reports` | Reports & analytics |
| Settings | `settings` | System settings |
| Website | `website` | Website CMS |
| Admissions | `admissions` | Admission management |

### Permission Actions

| Action | Code | Description |
|--------|------|-------------|
| View | `view` | Read/list access |
| Create | `create` | Create new records |
| Edit | `edit` | Update existing records |
| Delete | `delete` | Delete/archive records |
| Approve | `approve` | Approval workflows |
| Export | `export` | Export data |
| Configure | `configure` | System configuration |
| Manage | `manage` | Full management access |

### Permission Format

```
{module}:{action}
```

**Examples**: `students:view`, `fees:create`, `exams:approve`, `settings:configure`

---

## 20. System Roles

| Role | Code | Scope |
|------|------|-------|
| Super Admin | `super_admin` | Platform-wide (all tenants) |
| Tenant Admin | `tenant_admin` | Full tenant access (120 permissions) |
| Institution Admin | `institution_admin` | Institution-level (58 permissions) |
| Principal | `principal` | Academic oversight (20 permissions) |
| Vice Principal | `vice_principal` | Academic support (16 permissions) |
| Head of Department | `hod` | Department management (18 permissions) |
| Teacher | `teacher` | Teaching functions (16 permissions) |
| Student | `student` | Student portal (8 permissions) |
| Parent | `parent` | Parent portal (7 permissions) |
| Accountant | `accountant` | Financial management (12 permissions) |
| Librarian | `librarian` | Library management (7 permissions) |
| Receptionist | `receptionist` | Front desk (7 permissions) |
| HR Manager | `hr_manager` | HR functions (8 permissions) |
| Transport Manager | `transport_manager` | Transport (4 permissions) |
| Hostel Warden | `hostel_warden` | Hostel (5 permissions) |
| Inventory Manager | `inventory_manager` | Inventory (2 permissions) |
| Staff | `staff` | General staff (2 permissions) |

---

## 21. Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
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

### Error
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

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid input |
| 400 | `VALIDATION_ERROR` | Zod validation failed |
| 401 | `AUTHENTICATION_REQUIRED` | No token provided |
| 401 | `TOKEN_EXPIRED` | JWT expired |
| 401 | `TOKEN_INVALID` | JWT invalid |
| 401 | `SESSION_REVOKED` | Session revoked |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 403 | `TENANT_SUSPENDED` | Tenant suspended |
| 403 | `TENANT_EXPIRED` | Subscription expired |
| 403 | `ACCOUNT_INACTIVE` | User inactive |
| 403 | `ACCOUNT_SUSPENDED` | User suspended |
| 404 | `NOT_FOUND` | Resource not found |
| 404 | `TENANT_NOT_FOUND` | Tenant not found |
| 409 | `CONFLICT` | Duplicate resource |
| 423 | `ACCOUNT_LOCKED` | Too many failed attempts |
| 429 | `RATE_LIMITED` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error |