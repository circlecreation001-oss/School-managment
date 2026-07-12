# ERP LIFECYCLE REPORT
## HimanshiTech Education ERP — Complete Entity Lifecycles
**Date:** 2026-07-10

---

## Organization Lifecycle

```
Created (trial) → Active → Suspended → Activated → Expired → Archived
     │                │         │
     └── Setup ───────┘         └── Can be re-activated by Super Admin
```

| State | Can Login | API Access | Billing |
|-------|:---------:|:----------:|:-------:|
| trial | ✅ | ✅ | Free (trialEndsAt) |
| active | ✅ | ✅ | Subscription active |
| suspended | ❌ | ❌ | Paused |
| expired | ❌ | ❌ | Renewal required |
| cancelled | ❌ | ❌ | Terminated |
| archived | ❌ | ❌ | Data retained |

---

## Student Lifecycle

```
Admission Inquiry
    ↓ (status: inquiry → applied → under_review → document_verification → approved)
Student Created
    ↓ (admissionNumber auto-generated, status: active)
    ├── Parent linked (ParentStudent)
    ├── Class/Section assigned
    ├── Fee invoices generated
    ├── Login credentials created
    ↓
Active Student (daily operations)
    ├── Attendance marked daily
    ├── Homework assigned & submitted
    ├── Study materials accessed
    ├── Exams taken → Results generated
    ├── Fees paid → Receipts issued
    └── Library books issued
    ↓
Year End
    ├── Promotion (bulk, rule-based)
    │   ├── minAttendancePercent check
    │   ├── minPassPercent check
    │   └── requireFeesClear check
    ├── Transfer (TC generated)
    └── Graduation (status: graduated)
    ↓
Alumni (status: archived, data retained)
```

**Statuses:** active, inactive, pending, promoted, transferred, graduated, archived

---

## Teacher Lifecycle

```
Teacher Created
    ↓ (employeeCode auto-generated, status: active)
    ├── Department assigned
    ├── Subjects assigned (TeacherSubject M:N)
    ├── Classes assigned (SubjectTeacherAssignment)
    ├── Timetable configured
    ├── Login credentials created
    ↓
Active Teacher (daily operations)
    ├── Mark student attendance
    ├── Create & manage homework
    ├── Upload study materials
    ├── Create exams & enter marks
    ├── View reports
    ├── Apply for leave
    └── Own attendance tracked
    ↓
Status Changes
    ├── on_leave → return to active
    ├── probation → active (after review)
    ├── resigned → terminated
    └── retired → archived
```

**Statuses:** active, inactive, probation, on_leave, resigned, terminated, retired

---

## Parent Lifecycle

```
Parent Created (during student admission)
    ↓
    ├── Linked to 1+ students (ParentStudent, many-to-many)
    ├── Login account created (phone/email)
    ├── Assigned 'parent' role
    ↓
Active Parent
    ├── View child's attendance
    ├── View child's homework
    ├── View fee status & invoices
    ├── View exam results & report card
    ├── Receive notifications (SMS/WhatsApp/email/push)
    └── Communicate with teachers
```

---

## Fee Lifecycle

```
Fee Category created (Tuition, Transport, Lab, etc.)
    ↓
Fee Structure configured (category + class + amount + frequency)
    ↓
Invoices generated (single or bulk per class)
    ↓ (status: draft → issued)
Student/Parent views invoice
    ↓
Payment recorded (cash/online/UPI/cheque/card/DD)
    ↓ (status: issued → partially_paid → paid)
Receipt generated (auto receipt number)
    ↓
Discount/Scholarship applied (if applicable)
    ↓
Reports: due report, collection summary, revenue by month
```

**Invoice Statuses:** draft, issued, paid, partially_paid, overdue, cancelled, refunded

---

## Exam Lifecycle

```
Exam created (type, class, subject, totalMarks, date)
    ↓ (status: draft)
Exam scheduled (date, time, room assigned)
    ↓ (status: scheduled)
Students take exam
    ↓ (status: in_progress)
Marks entered (bulk per class/subject)
    ↓ (status: completed)
Auto-grading applied (Grade table: marks range → letter grade + GPA)
    ↓
Results reviewed by principal
    ↓ (status: under_review → approved)
Results published
    ↓ (status: published)
Report cards generated (per student: all subjects, total, percentage, rank)
```

**Exam Types:** unit_test, mid_term, final, practical, assignment, quiz, project, semester
**Result Statuses:** draft, under_review, approved, published, revised

---

## Homework Lifecycle

```
Teacher creates homework (class, subject, title, description, dueDate, maxMarks)
    ↓ (status: draft)
Teacher publishes
    ↓ (status: published)
Students see in dashboard
    ↓
Student submits (content, file upload)
    ↓ (submission status: submitted/late)
Teacher reviews submissions
    ↓
Teacher grades (marks, remarks)
    ↓ (submission status: graded)
Teacher closes homework
    ↓ (status: closed)
Archive
    ↓ (status: archived)
```

---

## Attendance Lifecycle

```
Teacher opens attendance for class + date
    ↓
Marks each student: present / absent / late / half_day / leave
    ↓
Saved (unique constraint: studentId + date)
    ↓
Parent notification triggered (if absent)
    ↓
Monthly summary computed (working days, present days, %)
    ↓
Analytics: class-wise, absentee list, trends
```

---

## Library Book Lifecycle

```
Book added to catalog (title, author, ISBN, copies)
    ↓
Student/Teacher requests issue
    ↓
Book issued (issueDate, dueDate)
    ↓ (status: issued)
    ├── Returned on time → (status: returned)
    └── Not returned by dueDate → (status: overdue)
         ↓
         Fine calculated (per-day rate × overdue days)
         ↓
         Fine paid → Book returned
```

---

## Notification Lifecycle

```
Event triggers notification (attendance, fee, result, etc.)
    ↓
Notification created (channel: email/sms/whatsapp/push/in_app)
    ↓ (status: pending)
Added to BullMQ queue
    ↓ (status: queued)
Worker processes delivery
    ↓ (status: sent → delivered)
User reads (readAt timestamp set)
```

---

## Session & Security Lifecycle

```
User logs in → Session created (refreshToken, IP, userAgent, expiresAt)
    ↓
Access token used for API calls (15-min expiry)
    ↓
Token expires → Client refreshes (POST /auth/refresh-token)
    ↓ (refresh token rotated, old invalidated)
    ├── Session revoked by user → Cannot refresh
    ├── Session expired → Must login again
    └── Logout all devices → All sessions revoked
```

---

## Verified (Live)

| Workflow | Tested | Result |
|----------|--------|--------|
| Org creation + full scaffold | ✅ | Tenant + institution + branch + session + subscription + configs created |
| Setup wizard complete | ✅ | Classes + subjects + departments created, onboarding_complete=true |
| Login → role detect → redirect | ✅ | super_admin → /super-admin |
| Fee category CRUD | ✅ | POST 201, GET 200 |
| All 272 API endpoints | ✅ | Responding correctly |
| Setup status check | ✅ | Returns step completion + counts |
