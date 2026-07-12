# ERD
## Enterprise White-Label Multi-Tenant Education ERP + Website SaaS Platform

Document Type: Database Architecture and Entity Relationship Design
Version: 1.0
Date: 2026-07-06
Prepared For: Product, Engineering, QA, DevOps, and Data Architecture Teams

> This document defines the production-ready database architecture for a multi-tenant education ERP and website SaaS platform using PostgreSQL and Prisma ORM.

---

# 1. Database Overview

## 1.1 Purpose
The database design supports:
- Multi-tenant education institutions
- White-label SaaS delivery
- Role-based access control
- Academic, financial, communication, and website operations
- Soft-delete and full auditability

## 1.2 Architecture
The database is designed as a shared-schema multi-tenant architecture with tenant-scoped data isolation through:
- Tenant ID on all business tables
- Row-level security readiness
- Tenant-aware Prisma queries
- Separate storage for media and documents

## 1.3 Normalization Strategy
The schema follows normalized principles for core master data and transactional records:
- Master entities are separated from transactional entities
- Shared reference tables are reused across institutions
- Academic and financial operations are modeled as separate transactional domains
- Audit and activity tables are separate from primary business tables

## 1.4 UUID Strategy
- All primary keys use UUIDs for global uniqueness and safer distributed operations
- UUID v4 is used for most records
- Tenant IDs, user IDs, and document IDs are UUID-based
- External-facing identifiers may be generated as human-readable codes separately

## 1.5 Naming Convention
- Tables use snake_case
- Columns use snake_case
- Foreign keys use pattern `<reference_table>_id`
- Audit fields use `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`
- Enum-style values are stored as text or explicit enum types in Prisma

## 1.6 Tenant Isolation Strategy
- Every tenant-owned table includes `tenant_id`
- Every tenant-scoped query is filtered by tenant_id
- Super-admin operations can bypass tenant filters when necessary
- Tenant-specific branding, settings, and domains are stored separately

## 1.7 Scalability
The design supports scalability through:
- Indexed tenant-scoped queries
- Partitioning strategy for large tables such as activity logs and attendance
- Read replicas in future stages
- Caching for dashboard reporting and real-time notifications

---

# 2. Complete Entity Relationship Diagram

## 2.1 Mermaid ER Diagram
```mermaid
erDiagram
    TENANT ||--o{ INSTITUTE : owns
    TENANT ||--o{ USER : has
    TENANT ||--o{ ROLE : defines
    TENANT ||--o{ PERMISSION : defines
    TENANT ||--o{ ACADEMIC_SESSION : has
    TENANT ||--o{ DEPARTMENT : has
    TENANT ||--o{ COURSE : has
    TENANT ||--o{ CLASS : has
    TENANT ||--o{ SECTION : has
    TENANT ||--o{ BATCH : has
    TENANT ||--o{ SUBJECT : has
    TENANT ||--o{ STUDENT : has
    TENANT ||--o{ PARENT : has
    TENANT ||--o{ TEACHER : has
    TENANT ||--o{ STAFF : has
    TENANT ||--o{ ATTENDANCE : records
    TENANT ||--o{ LEAVE : manages
    TENANT ||--o{ HOLIDAY : maintains
    TENANT ||--o{ TIMETABLE : manages
    TENANT ||--o{ FEE_STRUCTURE : defines
    TENANT ||--o{ FEE_CATEGORY : defines
    TENANT ||--o{ INVOICE : issues
    TENANT ||--o{ PAYMENT : records
    TENANT ||--o{ SCHOLARSHIP : manages
    TENANT ||--o{ DISCOUNT : manages
    TENANT ||--o{ EXAM : schedules
    TENANT ||--o{ QUESTION_BANK : stores
    TENANT ||--o{ RESULT : records
    TENANT ||--o{ GRADE : defines
    TENANT ||--o{ HOMEWORK : assigns
    TENANT ||--o{ ASSIGNMENT : tracks
    TENANT ||--o{ STUDY_MATERIAL : stores
    TENANT ||--o{ BOOK : manages
    TENANT ||--o{ ISSUE : tracks
    TENANT ||--o{ RETURN : tracks
    TENANT ||--o{ FINE : tracks
    TENANT ||--o{ NOTIFICATION : sends
    TENANT ||--o{ SMS_LOG : logs
    TENANT ||--o{ WHATSAPP_LOG : logs
    TENANT ||--o{ EMAIL_LOG : logs
    TENANT ||--o{ ACTIVITY_LOG : logs
    TENANT ||--o{ AUDIT_LOG : stores
    TENANT ||--o{ GALLERY : manages
    TENANT ||--o{ BLOG : manages
    TENANT ||--o{ ADMISSION : processes
    TENANT ||--o{ CERTIFICATE : issues
    TENANT ||--o{ ID_CARD : issues
    TENANT ||--o{ WEBSITE_CMS : manages
    TENANT ||--o{ SETTINGS : configures

    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : assigned_to
    ROLE ||--o{ ROLE_PERMISSION : grants
    PERMISSION ||--o{ ROLE_PERMISSION : assigned_to

    INSTITUTE ||--o{ BRANCH : has
    BRANCH ||--o{ CLASS : has
    BRANCH ||--o{ SECTION : has
    BRANCH ||--o{ BATCH : has
    BRANCH ||--o{ SUBJECT : has
    BRANCH ||--o{ DEPARTMENT : has
    BRANCH ||--o{ TEACHER : employs
    BRANCH ||--o{ STAFF : employs
    BRANCH ||--o{ STUDENT : enrolls
    BRANCH ||--o{ ADMISSION : processes

    ACADEMIC_SESSION ||--o{ CLASS : belongs_to
    ACADEMIC_SESSION ||--o{ SUBJECT : belongs_to
    ACADEMIC_SESSION ||--o{ STUDENT : belongs_to
    ACADEMIC_SESSION ||--o{ EXAM : belongs_to
    ACADEMIC_SESSION ||--o{ RESULT : belongs_to

    STUDENT ||--o{ PARENT_STUDENT : linked_to
    PARENT ||--o{ PARENT_STUDENT : linked_to

    STUDENT ||--o{ ATTENDANCE : has
    TEACHER ||--o{ ATTENDANCE : has
    STAFF ||--o{ ATTENDANCE : has
    CLASS ||--o{ ATTENDANCE : records
    SUBJECT ||--o{ ATTENDANCE : includes

    STUDENT ||--o{ LEAVE : requests
    TEACHER ||--o{ LEAVE : requests
    STAFF ||--o{ LEAVE : requests

    STUDENT ||--o{ INVOICE : owns
    FEE_CATEGORY ||--o{ FEE_STRUCTURE : categorized_as
    FEE_STRUCTURE ||--o{ INVOICE : generated_from
    INVOICE ||--o{ PAYMENT : contains
    INVOICE ||--o{ SCHOLARSHIP : applies_to
    INVOICE ||--o{ DISCOUNT : applies_to

    CLASS ||--o{ EXAM : has
    SUBJECT ||--o{ EXAM : has
    TEACHER ||--o{ EXAM : supervises
    EXAM ||--o{ QUESTION_BANK : contains
    EXAM ||--o{ RESULT : contains
    STUDENT ||--o{ RESULT : receives
    GRADE ||--o{ RESULT : uses

    CLASS ||--o{ HOMEWORK : assigned_to
    SUBJECT ||--o{ HOMEWORK : assigned_to
    TEACHER ||--o{ HOMEWORK : creates
    HOMEWORK ||--o{ ASSIGNMENT : includes
    STUDENT ||--o{ ASSIGNMENT : submits

    CLASS ||--o{ STUDY_MATERIAL : visible_to
    SUBJECT ||--o{ STUDY_MATERIAL : belongs_to
    TEACHER ||--o{ STUDY_MATERIAL : uploads

    BOOK ||--o{ ISSUE : issued_as
    STUDENT ||--o{ ISSUE : borrows
    TEACHER ||--o{ ISSUE : borrows
    STAFF ||--o{ ISSUE : borrows
    ISSUE ||--o{ RETURN : resolves
    ISSUE ||--o{ FINE : generates

    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ ACTIVITY_LOG : creates
    USER ||--o{ AUDIT_LOG : creates
```

---

# 3. Complete Database Modules

## 3.1 Core SaaS and Tenant Modules
- Tenant
- Institute
- Branch
- Academic Session
- Settings
- Website CMS

## 3.2 Identity and Access Modules
- Users
- Roles
- Permissions
- User Roles
- Activity Logs
- Audit Logs

## 3.3 Academic Modules
- Departments
- Courses
- Subjects
- Classes
- Sections
- Batches
- Timetable
- Admissions
- Students
- Parents
- Teachers
- Staff

## 3.4 Operations Modules
- Attendance
- Leave
- Holiday
- Homework
- Assignments
- Study Materials
- Library
- Books
- Issue
- Return
- Fine

## 3.5 Finance Modules
- Fee Structure
- Fee Categories
- Invoices
- Payments
- Scholarships
- Discounts

## 3.6 Examination Modules
- Exams
- Question Bank
- Results
- Grades

## 3.7 Communication and Engagement Modules
- Notifications
- SMS Logs
- WhatsApp Logs
- Email Logs
- Gallery
- Blog
- Certificates
- ID Cards

---

# 4. Table Details

## 4.1 Tenant
### Purpose
Represents a customer organization or institution account in the SaaS platform.

### Columns
- id (UUID, PK)
- name
- slug
- domain
- status
- subscription_status
- plan_code
- trial_ends_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- None

### Indexes
- idx_tenants_slug
- idx_tenants_status

### Constraints
- Unique slug
- Non-null name

### Relationships
- One tenant has many institutes, users, roles, and academic records.

## 4.2 Institute
### Purpose
Represents a top-level educational organization under a tenant.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- name
- code
- address
- contact_email
- contact_phone
- logo_url
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_institutes_tenant_id
- idx_institutes_code

### Constraints
- Unique code per tenant

### Relationships
- Many institutes belong to one tenant
- One institute has many branches and users

## 4.3 Branch
### Purpose
Represents a physical or logical campus/unit of an institute.

### Columns
- id (UUID, PK)
- institute_id (UUID, FK)
- tenant_id (UUID, FK)
- name
- code
- address
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- institute_id -> institutes.id
- tenant_id -> tenants.id

### Indexes
- idx_branches_institute_id
- idx_branches_tenant_id

### Constraints
- Unique code per institute

### Relationships
- One institute has many branches
- Branches own classes, sections, students, teachers, and attendance records

## 4.4 Academic Session
### Purpose
Represents an academic year or term.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- name
- start_date
- end_date
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_sessions_tenant_id
- idx_sessions_status

### Constraints
- Unique name per tenant and date range

### Relationships
- One session has many classes, students, exams, and results

## 4.5 Users
### Purpose
Represents all system users across roles.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- first_name
- last_name
- email
- username
- password_hash
- phone
- status
- avatar_url
- last_login_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_users_tenant_email
- idx_users_username
- idx_users_status

### Constraints
- Unique email and username per tenant

### Relationships
- One user has many roles, sessions, audit logs, and notifications

## 4.6 Roles
### Purpose
Defines roles in the system.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- name
- code
- description
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_roles_tenant_code

### Constraints
- Unique role code per tenant

### Relationships
- Roles are assigned to users through user roles and mapped to permissions.

## 4.7 Permissions
### Purpose
Defines available actions in the platform.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- name
- code
- module
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_permissions_tenant_code

### Constraints
- Unique permission code per tenant

### Relationships
- Many roles can have many permissions.

## 4.8 Students
### Purpose
Represents enrolled learners.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- academic_session_id (UUID, FK)
- admission_number
- roll_number
- first_name
- last_name
- dob
- gender
- email
- phone
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- academic_session_id -> academic_sessions.id

### Indexes
- idx_students_tenant_admission
- idx_students_roll_number
- idx_students_status

### Constraints
- Unique admission number per tenant
- Roll number unique per class/session if configured

### Relationships
- One student has many attendance records, invoices, results, assignments, and library issues.

## 4.9 Parents
### Purpose
Represents guardians linked to one or more students.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- first_name
- last_name
- email
- phone
- relation
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_parents_tenant_phone

### Constraints
- At least one of email or phone is required

### Relationships
- Many parents can link to many students through a mapping table.

## 4.10 Teachers
### Purpose
Represents teaching staff.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- user_id (UUID, FK)
- teacher_id
- first_name
- last_name
- department_id (UUID, FK)
- status
- joining_date
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- user_id -> users.id
- department_id -> departments.id

### Indexes
- idx_teachers_tenant_teacher_id
- idx_teachers_status

### Constraints
- Unique teacher_id per tenant

### Relationships
- Teacher can teach subjects, create homework, supervise exams, and mark attendance.

## 4.11 Staff
### Purpose
Represents non-teaching staff such as admin, receptionist, accountant, and librarian.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- user_id (UUID, FK)
- staff_id
- department_id (UUID, FK)
- designation
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- user_id -> users.id
- department_id -> departments.id

### Indexes
- idx_staff_tenant_staff_id

### Constraints
- Unique staff_id per tenant

### Relationships
- Staff manage admissions, finance, attendance, library, and settings.

## 4.12 Departments
### Purpose
Represents organizational departments such as Science, Commerce, or Admin.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- name
- code
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id

### Indexes
- idx_departments_tenant_code

### Constraints
- Unique code per tenant

### Relationships
- Departments group teachers and staff.

## 4.13 Courses
### Purpose
Represents academic programs or courses.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- name
- code
- duration
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id

### Indexes
- idx_courses_tenant_code

### Constraints
- Unique code per tenant

### Relationships
- Courses have classes and subjects.

## 4.14 Subjects
### Purpose
Represents academic subjects.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- course_id (UUID, FK)
- academic_session_id (UUID, FK)
- name
- code
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- course_id -> courses.id
- academic_session_id -> academic_sessions.id

### Indexes
- idx_subjects_tenant_code

### Constraints
- Unique code per tenant

### Relationships
- Subjects are linked to classes, teachers, exams, homework, and study materials.

## 4.15 Classes
### Purpose
Represents academic class levels.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- academic_session_id (UUID, FK)
- course_id (UUID, FK)
- name
- code
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- academic_session_id -> academic_sessions.id
- course_id -> courses.id

### Indexes
- idx_classes_tenant_code

### Constraints
- Unique class code per tenant/session

### Relationships
- Classes have sections, batches, students, exams, and homework.

## 4.16 Sections
### Purpose
Represents divisions of a class.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- class_id (UUID, FK)
- name
- code
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- class_id -> classes.id

### Indexes
- idx_sections_class_id

### Constraints
- Unique code per class

### Relationships
- Sections group students and attendance.

## 4.17 Batches
### Purpose
Represents coaching or training batches.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- class_id (UUID, FK)
- name
- code
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- class_id -> classes.id

### Indexes
- idx_batches_class_id

### Constraints
- Unique code per class

### Relationships
- Batches organize classes for coaching institutes.

## 4.18 Attendance
### Purpose
Stores daily attendance for students, teachers, and staff.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- student_id (UUID, FK, nullable)
- teacher_id (UUID, FK, nullable)
- staff_id (UUID, FK, nullable)
- class_id (UUID, FK, nullable)
- attendance_date
- status
- remarks
- marked_by
- approved_by
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- student_id -> students.id
- teacher_id -> teachers.id
- staff_id -> staff.id
- class_id -> classes.id

### Indexes
- idx_attendance_tenant_date
- idx_attendance_student_date
- idx_attendance_teacher_date

### Constraints
- One attendance record per person/date/class combination

### Relationships
- Belongs to students, teachers, or staff and classes.

## 4.19 Leave
### Purpose
Stores leave requests and approvals.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- user_id (UUID, FK)
- leave_type
- start_date
- end_date
- reason
- status
- approved_by
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- user_id -> users.id

### Indexes
- idx_leave_tenant_user
- idx_leave_status

### Constraints
- End date cannot be before start date

### Relationships
- Linked to users and attendance rules.

## 4.20 Holiday
### Purpose
Stores institutional holidays.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- name
- date
- holiday_type
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_holidays_tenant_date

### Constraints
- Date must be valid

### Relationships
- Used by attendance logic.

## 4.21 Timetable
### Purpose
Stores class schedules and subject allocations.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- class_id (UUID, FK)
- subject_id (UUID, FK)
- teacher_id (UUID, FK)
- day_of_week
- start_time
- end_time
- room_number
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- class_id -> classes.id
- subject_id -> subjects.id
- teacher_id -> teachers.id

### Indexes
- idx_timetable_class_day

### Constraints
- Non-overlapping per teacher/class when configured

### Relationships
- Connects classes, subjects, teachers, and branches.

## 4.22 Fee Structure
### Purpose
Defines fee plans for classes and sessions.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- academic_session_id (UUID, FK)
- class_id (UUID, FK)
- fee_category_id (UUID, FK)
- amount
- due_date
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- academic_session_id -> academic_sessions.id
- class_id -> classes.id
- fee_category_id -> fee_categories.id

### Indexes
- idx_fee_structure_tenant_class

### Constraints
- Amount must be non-negative

### Relationships
- Used to generate invoices.

## 4.23 Fee Categories
### Purpose
Groups fee types such as tuition, transport, hostels, or admission.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- name
- code
- description
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_fee_categories_tenant_code

### Constraints
- Unique code per tenant

### Relationships
- One fee category has many fee structures.

## 4.24 Invoices
### Purpose
Stores generated fee invoices.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- student_id (UUID, FK)
- fee_structure_id (UUID, FK)
- invoice_number
- total_amount
- outstanding_amount
- status
- due_date
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- student_id -> students.id
- fee_structure_id -> fee_structures.id

### Indexes
- idx_invoices_tenant_number
- idx_invoices_student_status

### Constraints
- Unique invoice_number per tenant

### Relationships
- One invoice has many payments and discounts.

## 4.25 Payments
### Purpose
Records fee transactions.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- invoice_id (UUID, FK)
- payment_method
- transaction_reference
- amount
- currency
- status
- paid_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- invoice_id -> invoices.id

### Indexes
- idx_payments_transaction_reference
- idx_payments_invoice_id

### Constraints
- Unique transaction_reference per tenant

### Relationships
- Linked to invoices and financial reports.

## 4.26 Scholarships
### Purpose
Stores scholarship allocations and approvals.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- student_id (UUID, FK)
- invoice_id (UUID, FK)
- amount
- status
- approved_by
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- student_id -> students.id
- invoice_id -> invoices.id

### Indexes
- idx_scholarships_student_id

### Constraints
- Amount cannot be negative

### Relationships
- Applied to invoices.

## 4.27 Discounts
### Purpose
Stores fee discounts applied to invoices.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- invoice_id (UUID, FK)
- name
- percentage
- amount
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- invoice_id -> invoices.id

### Indexes
- idx_discounts_invoice_id

### Constraints
- Percentage between 0 and 100

### Relationships
- Applied to invoices.

## 4.28 Exams
### Purpose
Schedules exams and assessments.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- academic_session_id (UUID, FK)
- class_id (UUID, FK)
- subject_id (UUID, FK)
- teacher_id (UUID, FK)
- name
- exam_date
- start_time
- end_time
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- academic_session_id -> academic_sessions.id
- class_id -> classes.id
- subject_id -> subjects.id
- teacher_id -> teachers.id

### Indexes
- idx_exams_tenant_date

### Constraints
- Exam date must be valid

### Relationships
- One exam has many results and questions.

## 4.29 Question Bank
### Purpose
Stores exam questions.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- exam_id (UUID, FK)
- subject_id (UUID, FK)
- question_text
- options_json
- correct_option
- difficulty_level
- marks
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- exam_id -> exams.id
- subject_id -> subjects.id

### Indexes
- idx_question_bank_exam_id

### Constraints
- Marks must be positive

### Relationships
- Related to exams and subjects.

## 4.30 Results
### Purpose
Stores student exam results.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- exam_id (UUID, FK)
- student_id (UUID, FK)
- academic_session_id (UUID, FK)
- marks_obtained
- grade_id (UUID, FK)
- status
- published_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- exam_id -> exams.id
- student_id -> students.id
- academic_session_id -> academic_sessions.id
- grade_id -> grades.id

### Indexes
- idx_results_student_exam
- idx_results_status

### Constraints
- Marks must be within configured range

### Relationships
- Results belong to exams and students.

## 4.31 Grades
### Purpose
Defines grade mappings for results.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- name
- min_marks
- max_marks
- description
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_grades_tenant_name

### Constraints
- min_marks <= max_marks

### Relationships
- One grade can be used by many results.

## 4.32 Homework
### Purpose
Stores homework assignments.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- class_id (UUID, FK)
- subject_id (UUID, FK)
- teacher_id (UUID, FK)
- title
- description
- due_date
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- class_id -> classes.id
- subject_id -> subjects.id
- teacher_id -> teachers.id

### Indexes
- idx_homework_class_due

### Constraints
- Due date must be valid

### Relationships
- One homework has many assignments.

## 4.33 Assignments
### Purpose
Stores student submissions for homework.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- homework_id (UUID, FK)
- student_id (UUID, FK)
- submission_date
- status
- marks_obtained
- remarks
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- homework_id -> homework.id
- student_id -> students.id

### Indexes
- idx_assignments_homework_student

### Constraints
- Marks cannot exceed homework max marks if configured

### Relationships
- Belongs to one homework and one student.

## 4.34 Study Materials
### Purpose
Stores learning content such as PDFs and videos.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- class_id (UUID, FK)
- subject_id (UUID, FK)
- teacher_id (UUID, FK)
- title
- file_url
- file_type
- file_size
- visibility
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- class_id -> classes.id
- subject_id -> subjects.id
- teacher_id -> teachers.id

### Indexes
- idx_study_materials_class_subject

### Constraints
- File size and type must be allowed

### Relationships
- Visible to classes and subjects.

## 4.35 Library
### Purpose
Represents a library or reading resource inventory system.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- name
- code
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_library_tenant_code

### Constraints
- Unique code per tenant

### Relationships
- One library has many books and issues.

## 4.36 Books
### Purpose
Stores library inventory records.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- library_id (UUID, FK)
- title
- author
- isbn
- barcode
- qr_code
- availability_status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- library_id -> libraries.id

### Indexes
- idx_books_isbn
- idx_books_barcode

### Constraints
- ISBN and barcode should be unique if used

### Relationships
- Books can be issued and returned many times.

## 4.37 Issue
### Purpose
Stores issued books and borrowing details.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- book_id (UUID, FK)
- borrower_id (UUID, FK)
- issued_at
- due_date
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- book_id -> books.id
- borrower_id -> users.id

### Indexes
- idx_issues_book_id
- idx_issues_status

### Constraints
- Borrower must be valid user

### Relationships
- One issue has one return and may create one fine.

## 4.38 Return
### Purpose
Stores return transactions for issued books.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- issue_id (UUID, FK)
- returned_at
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- issue_id -> issues.id

### Indexes
- idx_returns_issue_id

### Constraints
- One return per issue

### Relationships
- Resolves an issue record.

## 4.39 Fine
### Purpose
Stores library penalties for overdue or damaged books.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- issue_id (UUID, FK)
- amount
- reason
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- issue_id -> issues.id

### Indexes
- idx_fines_issue_id

### Constraints
- Amount must be non-negative

### Relationships
- Linked to a specific loan issue.

## 4.40 Notifications
### Purpose
Stores notification records for users.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- user_id (UUID, FK)
- channel
- template_code
- message
- status
- sent_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- user_id -> users.id

### Indexes
- idx_notifications_user_status

### Constraints
- Channel must be allowed value

### Relationships
- Sent to users.

## 4.41 SMS Logs
### Purpose
Stores SMS delivery logs.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- notification_id (UUID, FK)
- recipient
- status
- provider_response
- sent_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- notification_id -> notifications.id

### Indexes
- idx_sms_logs_notification_id

### Constraints
- Recipient must be valid

### Relationships
- One notification has many SMS logs.

## 4.42 WhatsApp Logs
### Purpose
Stores WhatsApp delivery logs.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- notification_id (UUID, FK)
- recipient
- status
- provider_response
- sent_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- notification_id -> notifications.id

### Indexes
- idx_whatsapp_logs_notification_id

### Constraints
- Recipient must be valid

### Relationships
- One notification has many WhatsApp logs.

## 4.43 Email Logs
### Purpose
Stores email delivery logs.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- notification_id (UUID, FK)
- recipient
- status
- provider_response
- sent_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- notification_id -> notifications.id

### Indexes
- idx_email_logs_notification_id

### Constraints
- Recipient must be valid

### Relationships
- One notification has many email logs.

## 4.44 Activity Logs
### Purpose
Captures user and system activity events.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- user_id (UUID, FK, nullable)
- entity_type
- entity_id
- action
- metadata_json
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- user_id -> users.id

### Indexes
- idx_activity_logs_tenant_created_at
- idx_activity_logs_entity

### Constraints
- action must be non-empty

### Relationships
- Associated with users and business entities.

## 4.45 Audit Logs
### Purpose
Stores immutable or append-only audit events.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- user_id (UUID, FK, nullable)
- entity_type
- entity_id
- action
- old_value_json
- new_value_json
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- user_id -> users.id

### Indexes
- idx_audit_logs_tenant_entity
- idx_audit_logs_created_at

### Constraints
- Immutable once written

### Relationships
- Tracks lifecycle events for main entities.

## 4.46 Gallery
### Purpose
Stores website or institution gallery content.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- title
- description
- image_url
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_gallery_tenant_status

### Constraints
- Status must be published or draft

### Relationships
- Used by website CMS and public pages.

## 4.47 Blog
### Purpose
Stores website blog posts.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- title
- slug
- content
- author_id (UUID, FK)
- status
- published_at
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- author_id -> users.id

### Indexes
- idx_blog_tenant_slug
- idx_blog_status

### Constraints
- Unique slug per tenant

### Relationships
- Published through website CMS.

## 4.48 Admissions
### Purpose
Tracks incoming applications and admissions.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- branch_id (UUID, FK)
- student_id (UUID, FK, nullable)
- applicant_name
- contact_email
- contact_phone
- status
- source
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- branch_id -> branches.id
- student_id -> students.id

### Indexes
- idx_admissions_tenant_status

### Constraints
- Contact details required

### Relationships
- Can convert into a student record.

## 4.49 Certificates
### Purpose
Stores issued certificates.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- student_id (UUID, FK)
- certificate_type
- issue_date
- file_url
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- student_id -> students.id

### Indexes
- idx_certificates_student_id

### Constraints
- Issue date must be valid

### Relationships
- Linked to student records.

## 4.50 ID Cards
### Purpose
Stores issued student or staff ID cards.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- student_id (UUID, FK, nullable)
- teacher_id (UUID, FK, nullable)
- staff_id (UUID, FK, nullable)
- file_url
- issued_at
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id
- student_id -> students.id
- teacher_id -> teachers.id
- staff_id -> staff.id

### Indexes
- idx_id_cards_tenant_status

### Constraints
- At least one of student/teacher/staff reference must be present

### Relationships
- Linked to academic users.

## 4.51 Website CMS
### Purpose
Stores website pages and content blocks.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- page_slug
- title
- content_json
- status
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_website_cms_tenant_slug

### Constraints
- Unique slug per tenant

### Relationships
- Powers public-facing website content.

## 4.52 Settings
### Purpose
Stores tenant-level configuration.

### Columns
- id (UUID, PK)
- tenant_id (UUID, FK)
- key
- value_json
- category
- created_at
- updated_at
- deleted_at

### Primary Key
- id

### Foreign Keys
- tenant_id -> tenants.id

### Indexes
- idx_settings_tenant_key

### Constraints
- Unique key per tenant/category

### Relationships
- Configures branding, modules, policies, and permissions.

---

# 5. Relationship Matrix

## 5.1 One-to-One
- User to Teacher profile (optional)
- User to Staff profile (optional)
- Tenant to Settings (one-to-many, but tenant-config is effectively one per tenant)
- Admission to Student (optional conversion relationship)

## 5.2 One-to-Many
- Tenant to Institutes
- Tenant to Users
- Tenant to Academic Sessions
- Institute to Branches
- Branch to Students
- Class to Sections
- Class to Batches
- Class to Exams
- Student to Attendance
- Student to Results
- Invoice to Payments
- Homework to Assignments
- Library to Books
- Notification to SMS/WhatsApp/Email Logs

## 5.3 Many-to-Many
- Users to Roles
- Roles to Permissions
- Parents to Students
- Teachers to Subjects
- Teachers to Classes
- Students to Subjects (via enrollments if modeled separately)
- Students to Homework (via assignments)

---

# 6. Database Index Strategy

- Index all tenant_id columns used in filtering
- Index frequently queried fields such as status, date, code, and number
- Add composite indexes for common report queries, e.g. `(tenant_id, academic_session_id, class_id, status)`
- Add partial indexes for active records only
- Add full-text indexes for blog and CMS content in future versions
- Use covering indexes for dashboard and reporting queries

---

# 7. Soft Delete Strategy

- All business tables include `deleted_at`
- Logical delete is preferred over hard delete
- Soft-deleted records remain visible to admins and audit logs
- Queries should exclude deleted records by default
- Restore workflows should set `deleted_at = NULL` and record audit trail

---

# 8. Audit Strategy

- Every create, update, delete, restore, and approval action is logged
- Separate `activity_logs` and `audit_logs` tables support usage and compliance needs
- Audit logs should be append-only and immutable
- Sensitive changes such as payment, fee, and role updates should be logged in detail

---

# 9. Tenant Isolation Strategy

- Every tenant-owned table contains `tenant_id`
- Prisma queries must enforce tenant filtering in service layer
- Multi-tenant contexts should be injected into each request
- Super-admin access should be explicitly authorized and logged
- Custom domains, branding, and settings are tenant-specific

---

# 10. Backup & Disaster Recovery

- Daily full backups of PostgreSQL databases
- Point-in-time recovery enabled where supported
- Weekly backup verification and restore drills
- Offsite or cloud storage for backup retention
- Backup retention policy for 30 to 90 days depending on compliance needs
- Disaster recovery runbook maintained for major incidents

---

# 11. Prisma Mapping Strategy

- Use Prisma schema with clear model names matching database tables
- Use `@@map` for naming consistency where necessary
- Add `@@index` for tenant and lookup fields
- Use `@@unique` for tenant-scoped uniqueness constraints
- Use `@@ignore` only for views or non-persistent derived logic if required
- Model soft-delete via `deletedAt` field and Prisma filter defaults

Example Prisma approach:
- `model Tenant { ... }`
- `model User { ... }`
- `model Student { ... }`
- `model Attendance { ... }`
- `model Payment { ... }`

---

# 12. Future Expansion

## 12.1 Hostel
- Add hostel tables, room allocation, and resident records

## 12.2 Transport
- Add transport routes, vehicle tracking, bus stops, and fee linkage

## 12.3 Inventory
- Add item categories, stock movement, suppliers, and purchase orders

## 12.4 Payroll
- Add salary components, payroll runs, deductions, and payslips

## 12.5 Franchise
- Add franchise hierarchy, commission rules, and regional governance

## 12.6 Mobile Apps
- Add device tokens, mobile session tracking, and offline sync metadata

## 12.7 AI Modules
- Add recommendation tables, AI prompts, model logs, and generated insights

---

# Notes

## Design Principles
- Keep the schema simple, auditable, and tenant-safe
- Prefer explicit relationships over hidden logic
- Use soft delete and audit logs for all business records
- Keep reports and analytics separated from transactional tables where possible

## Warnings
- Avoid cross-tenant joins or shared data without explicit tenant checks
- Avoid hard deletes for core business records
- Avoid bypassing audit logging for financial, role, and security changes
