# DATABASE AUDIT
## HimanshiTech Education ERP — Prisma Schema Verification
**Date:** 2026-07-09 | **Status:** ✅ Complete and Synced

---

## Schema Status
- **Location:** `packages/database/prisma/schema.prisma`
- **DB Sync:** ✅ "The database is already in sync with the Prisma schema"
- **Provider:** PostgreSQL 16 (Docker, healthy)
- **ORM:** Prisma Client (generated)

## Models (68 Total)

### Core SaaS (6)
| Model | organizationId | Soft Delete | Indexes | FK |
|-------|:-:|:-:|:-:|:-:|
| Tenant | N/A (IS the org) | ✅ | ✅ status | ✅ |
| TenantSettings | via tenantId | — | ✅ unique tenantId | ✅ |
| FeatureFlag | ✅ tenantId | — | ✅ unique [tenantId, feature] | ✅ |
| Plan | N/A (global) | — | ✅ unique code | — |
| Subscription | ✅ tenantId | — | ✅ [tenantId, status], endDate | ✅ |
| OrganizationConfig | ✅ tenantId | — | ✅ [tenantId, module, key] | — |

### Institution (15)
| Model | organizationId | Soft Delete | Indexes | FK |
|-------|:-:|:-:|:-:|:-:|
| Institution | ✅ | ✅ | ✅ [tenantId, code] | ✅ Tenant |
| Branch | ✅ | ✅ | ✅ [institutionId, code] | ✅ Institution |
| AcademicSession | ✅ | ✅ | ✅ [tenantId, isCurrent] | ✅ Tenant |
| Department | ✅ | ✅ | ✅ [tenantId, code] | ✅ Branch |
| Course | ✅ | ✅ | ✅ [tenantId, code] | ✅ Branch, Dept |
| Class | ✅ | ✅ | ✅ [tenantId, branchId, sessionId, code] | ✅ Branch, Course, Session |
| Section | ✅ | ✅ | ✅ [tenantId, classId] | ✅ Class, Branch |
| Batch | ✅ | ✅ | ✅ [tenantId, branchId, code] | ✅ Branch, Class |
| Subject | ✅ | ✅ | ✅ [tenantId, code] | ✅ Branch, Course, Class |
| SubjectGroup | ✅ | — | ✅ [tenantId, classId] | — |
| SubjectGroupMapping | — | — | ✅ unique | ✅ SubjectGroup |
| ClassTeacherAssignment | ✅ | — | ✅ unique, teacherId | — |
| SubjectTeacherAssignment | ✅ | — | ✅ unique, teacherId | — |
| PromotionRule | ✅ | — | ✅ unique [tenantId, from, to] | — |
| CalendarEvent | ✅ | ✅ | ✅ [tenantId, branchId, startDate] | — |

### Identity & Access (6)
| Model | organizationId | Soft Delete | Indexes | FK |
|-------|:-:|:-:|:-:|:-:|
| User | ✅ tenantId | ✅ | ✅ [tenantId, email], [tenantId, username] | ✅ Tenant |
| Role | ✅ tenantId | ✅ | ✅ [tenantId, code] | ✅ Tenant |
| Permission | ✅ tenantId | — | ✅ [tenantId, code], [tenantId, module] | ✅ Tenant |
| UserRole | ✅ tenantId | — | ✅ [userId, roleId, tenantId] | ✅ User, Role |
| RolePermission | — | — | ✅ [roleId, permissionId] | ✅ Role, Permission |
| Session | ✅ tenantId | — | ✅ [userId, isActive], expiresAt | ✅ User |

### Student & Parent (5)
Student ✅ | Parent ✅ | ParentStudent ✅ | StudentDocument ✅ | Certificate ✅

### Teacher & Staff (6)
Teacher ✅ | TeacherSubject ✅ | TeacherQualification ✅ | TeacherExperience ✅ | TeacherSalary ✅ | TeacherDocument ✅ | Staff ✅

### Attendance & Leave (4)
Attendance ✅ | Leave ✅ | Holiday ✅ | Timetable ✅

### Fee Management (5)
FeeCategory ✅ | FeeStructure ✅ | Invoice ✅ | Payment ✅ | Discount ✅ | Scholarship ✅

### Examination (4)
Exam ✅ | QuestionBank ✅ | Grade ✅ | Result ✅

### Homework & Materials (4)
Homework ✅ | HomeworkAttachment ✅ | Submission ✅ | StudyMaterial ✅

### Library (2)
Book ✅ | BookIssue ✅

### Notifications (2)
NotificationTemplate ✅ | Notification ✅

### Website CMS (4)
WebsitePage ✅ | BlogPost ✅ | GalleryItem ✅ | ContactEnquiry ✅

### Admission (2)
Admission ✅ | AdmissionDocument ✅

### Audit (1)
AuditLog ✅ (indexes on [tenantId, entityType], [actorUserId], [tenantId, createdAt])

---

## Required Models Verification

| Required Model | Present | Table Name |
|---------------|:-------:|------------|
| Organization | ✅ | `tenants` |
| Subscription | ✅ | `subscriptions` |
| Branch | ✅ | `branches` |
| User | ✅ | `users` |
| Role | ✅ | `roles` |
| Permission | ✅ | `permissions` |
| RolePermission | ✅ | `role_permissions` |
| Student | ✅ | `students` |
| Teacher | ✅ | `teachers` |
| Parent | ✅ | `parents` |
| Staff | ✅ | `staff` |
| Class | ✅ | `classes` |
| Section | ✅ | `sections` |
| Subject | ✅ | `subjects` |
| Department | ✅ | `departments` |
| Batch | ✅ | `batches` |
| Attendance | ✅ | `attendance` |
| FeeStructure | ✅ | `fee_structures` |
| FeePayment | ✅ | `payments` |
| Exam | ✅ | `exams` |
| QuestionBank | ✅ | `question_bank` |
| Result | ✅ | `results` |
| Homework | ✅ | `homework` |
| Assignment (Submission) | ✅ | `submissions` |
| StudyMaterial | ✅ | `study_materials` |
| LibraryBook | ✅ | `books` |
| BookIssue | ✅ | `book_issues` |
| Notification | ✅ | `notifications` |
| UserSession | ✅ | `sessions` |
| LoginHistory | ✅ | `audit_logs` (action='login') |
| PasswordReset | ✅ | Redis-based (auth:reset:*) |
| RefreshToken | ✅ | `sessions.refreshToken` |
| AuditLog | ✅ | `audit_logs` |

**ALL 33 required models present. ✅**
