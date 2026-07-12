# CRUD REPORT
## HimanshiTech Education ERP — Complete CRUD Operations
**Date:** 2026-07-09

---

## CRUD Status Per Module

| Module | Create | Read | Update | Delete | Search | Filter | Pagination | Validation | Permissions | Audit Log |
|--------|:------:|:----:|:------:|:------:|:------:|:------:|:----------:|:----------:|:-----------:|:---------:|
| Students | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Zod | ✅ | ✅ |
| Teachers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Zod | ✅ | ✅ |
| Parents | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Zod | ✅ | ✅ |
| Academics (Sessions) | ✅ | ✅ | ✅ | — | — | — | — | ✅ | ✅ | ✅ |
| Academics (Classes) | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ |
| Academics (Sections) | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ |
| Academics (Subjects) | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ |
| Academics (Departments) | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ |
| Attendance | ✅ | ✅ | ✅ | — | — | ✅ | — | ✅ | ✅ | ✅ |
| Homework | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ Zod | ✅ | ✅ |
| Study Materials | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Exams | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fee Categories | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ |
| Fee Structures | ✅ | ✅ | — | — | — | — | — | ✅ | ✅ | ✅ |
| Invoices | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Payments | ✅ | ✅ | — | — | — | — | — | ✅ | ✅ | ✅ |
| Library Books | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book Issues | ✅ | ✅ | ✅ | — | — | ✅ | — | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Website Pages | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ |
| Blog Posts | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | ✅ |
| Gallery | ✅ | ✅ | — | ✅ | — | ✅ | — | ✅ | ✅ | ✅ |
| Enquiries | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Organizations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports | — | ✅ | — | — | — | ✅ | — | — | ✅ | — |

---

## Validation Layer

Every POST/PATCH endpoint uses **Zod schemas** for request body validation:
- Type checking (string, number, date, email, etc.)
- Required field enforcement
- String length limits
- Enum validation
- Custom regex (phone, password strength)
- Nested object validation
- Array validation

Validation errors return 400 with field-level messages:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

## Permission Checks

Every endpoint is protected by:
1. `authenticate` — JWT verification
2. `requirePermission([...])` — Permission check
3. `resolveTenant` — Tenant context injection
4. Service layer — tenantId in all WHERE clauses

## Activity/Audit Logs

The `AuditLog` model captures:
- `tenantId` — which organization
- `actorUserId` — who performed the action
- `entityType` — what entity (user, student, exam, etc.)
- `entityId` — which record
- `action` — what happened (create, update, delete, login, etc.)
- `oldValue` / `newValue` — JSON diff (on updates)
- `ipAddress` / `userAgent` — client info
- `createdAt` — when
