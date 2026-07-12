# PRISMA SCHEMA REPORT
## HimanshiTech Education ERP
**Date:** 2026-07-09 | **Schema File:** `packages/database/prisma/schema.prisma`

---

## Summary
| Metric | Value |
|--------|-------|
| Total Models | 68 |
| Total Enums | 18 |
| Provider | PostgreSQL |
| Generator | prisma-client-js |
| Schema Lines | ~1800 |
| DB Status | ✅ In Sync |

## Enums (18)
TenantStatus, EntityStatus, Gender, AttendanceStatus, LeaveStatus, PaymentStatus, PaymentMethod, InvoiceStatus, ExamStatus, ResultStatus, HomeworkStatus, SubmissionStatus, NotificationChannel, NotificationStatus, BookIssueStatus, AdmissionStatus, StudentStatus, TeacherStatus

## All Models (68)

1. Tenant
2. TenantSettings
3. FeatureFlag
4. Plan
5. Subscription
6. OrganizationConfig
7. Institution
8. Branch
9. AcademicSession
10. Department
11. Course
12. Class
13. Section
14. Batch
15. Subject
16. SubjectGroup
17. SubjectGroupMapping
18. ClassTeacherAssignment
19. SubjectTeacherAssignment
20. PromotionRule
21. CalendarEvent
22. User
23. Role
24. Permission
25. UserRole
26. RolePermission
27. Session
28. Student
29. Parent
30. ParentStudent
31. StudentDocument
32. Certificate
33. Teacher
34. TeacherSubject
35. TeacherQualification
36. TeacherExperience
37. TeacherSalary
38. TeacherDocument
39. Staff
40. Attendance
41. Leave
42. Holiday
43. Timetable
44. FeeCategory
45. FeeStructure
46. Invoice
47. Payment
48. Discount
49. Scholarship
50. Exam
51. QuestionBank
52. Grade
53. Result
54. Homework
55. HomeworkAttachment
56. Submission
57. StudyMaterial
58. Book
59. BookIssue
60. NotificationTemplate
61. Notification
62. WebsitePage
63. BlogPost
64. GalleryItem
65. ContactEnquiry
66. Admission
67. AdmissionDocument
68. AuditLog

## Standard Fields on All Business Models
- `id` (String, CUID, @id)
- `tenantId` / `organizationId` (String, FK to Tenant)
- `createdAt` (DateTime, @default(now()))
- `updatedAt` (DateTime, @updatedAt)
- `deletedAt` (DateTime?, soft delete)

## Index Strategy
- All tables: `tenantId` indexed (tenant isolation)
- Unique constraints: `@@unique([tenantId, code])` pattern
- Composite indexes on common query patterns
- Foreign key indexes on all relation fields
