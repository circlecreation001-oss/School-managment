# DATABASE RELATION REPORT
## HimanshiTech Education ERP — Entity Relationships
**Date:** 2026-07-09

---

## Core Relationships

### Tenant (Organization) — Root Entity
```
Tenant
 ├── TenantSettings (1:1)
 ├── FeatureFlag (1:N)
 ├── Institution (1:N)
 │    └── Branch (1:N)
 │         ├── Department (1:N)
 │         ├── Course (1:N)
 │         ├── Class (1:N)
 │         │    ├── Section (1:N)
 │         │    └── Batch (1:N)
 │         ├── Subject (1:N)
 │         ├── Student (1:N)
 │         ├── Teacher (1:N)
 │         ├── Staff (1:N)
 │         ├── Timetable (1:N)
 │         └── Holiday (1:N)
 ├── User (1:N)
 │    ├── UserRole (1:N) → Role
 │    ├── Session (1:N)
 │    └── Notification (1:N)
 ├── Role (1:N)
 │    └── RolePermission (1:N) → Permission
 ├── Permission (1:N)
 ├── AcademicSession (1:N)
 └── AuditLog (1:N)
```

### Student Relationships
```
Student
 ├── Branch (N:1)
 ├── Class (N:1)
 ├── Section (N:1)
 ├── Batch (N:1)
 ├── AcademicSession (N:1)
 ├── User (1:1, optional — linked login account)
 ├── ParentStudent (1:N) → Parent (M:N through join table)
 ├── StudentDocument (1:N)
 ├── Certificate (1:N)
 ├── Attendance (1:N)
 ├── Invoice (1:N)
 ├── Result (1:N)
 ├── Submission (1:N) — homework submissions
 └── BookIssue (1:N)
```

### Teacher Relationships
```
Teacher
 ├── Branch (N:1)
 ├── Department (N:1, optional)
 ├── User (1:1, optional — linked login account)
 ├── TeacherSubject (1:N) → Subject (M:N)
 ├── TeacherQualification (1:N)
 ├── TeacherExperience (1:N)
 ├── TeacherSalary (1:1)
 ├── TeacherDocument (1:N)
 ├── Attendance (1:N)
 ├── Leave (1:N)
 ├── Timetable (1:N)
 ├── Homework (1:N) — created by
 ├── StudyMaterial (1:N) — uploaded by
 ├── Exam (1:N) — created by
 └── BookIssue (1:N)
```

### Fee Relationships
```
FeeCategory (1:N) → FeeStructure
FeeStructure → AcademicSession, Class, FeeCategory
Invoice → Student, FeeStructure
Invoice (1:N) → Payment
Invoice (1:N) → Discount
Invoice (1:N) → Scholarship
```

### Exam Relationships
```
Exam → AcademicSession, Class, Subject, Teacher
Exam (1:N) → Result → Student, Grade
Exam (1:N) → QuestionBank → Subject
```

---

## Cascade Rules

| Parent | Child | On Delete |
|--------|-------|-----------|
| Tenant | Institution | Cascade |
| Institution | Branch | Cascade |
| Branch | Department, Course, Class, Section, Batch | Cascade |
| Class | Section | Cascade |
| User | UserRole, Session | Cascade |
| Role | RolePermission | Cascade |
| Permission | RolePermission | Cascade |
| Student | ParentStudent, StudentDocument, Attendance | Cascade |
| Parent | ParentStudent | Cascade |
| Homework | HomeworkAttachment, Submission | Cascade |
| Admission | AdmissionDocument | Cascade |
| Exam | Result, QuestionBank | (via FK) |
| Invoice | Payment, Discount, Scholarship | (via FK) |
| Book | BookIssue | (via FK) |

---

## Indexes (50+)

Key composite indexes for performance:
- `[tenantId, branchId, status]` on Students, Teachers, Staff
- `[tenantId, branchId, classId]` on Students
- `[tenantId, email]` UNIQUE on Users
- `[tenantId, admissionNumber]` UNIQUE on Students
- `[tenantId, employeeCode]` UNIQUE on Teachers
- `[tenantId, code]` UNIQUE on Roles, Permissions, Departments, Courses, Subjects
- `[studentId, attendanceDate]` UNIQUE on Attendance
- `[tenantId, invoiceNumber]` UNIQUE on Invoices
- `[tenantId, branchId, academicSessionId]` on Exams, FeeStructures
- `[tenantId, createdAt]` on AuditLogs

---

## Tenant Isolation Points

1. **Database Level:** tenantId on every business table
2. **Middleware Level:** `resolveTenant` + `requireTenant`
3. **Service Level:** All repository queries include `WHERE tenantId = ?`
4. **Redis Level:** Cache keys prefixed with `tenant:ctx:{tenantId}`
5. **JWT Level:** tenantId embedded in token payload
