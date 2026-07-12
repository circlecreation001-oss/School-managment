# LOGIN FLOW
## HimanshiTech Education ERP — Authentication Flow Specification
**Date:** 2026-07-09

---

## Single Login Page

All users (Super Admin, Institute Admin, Principal, Teacher, Student, Parent, etc.) use ONE login page at `/login`.

The user does NOT select their role. The system detects it automatically.

## Supported Identifiers

| User Type | Login Methods |
|-----------|--------------|
| Super Admin | Email only |
| Institute Admin | Email or Username |
| Principal / VP / HOD | Email or Username or Employee ID |
| Teacher | Email or Username or Employee ID |
| Student | Email or Username or Admission Number |
| Parent | Phone Number or Email or Username |
| Accountant / Librarian / HR | Email or Username |
| Receptionist | Email or Username |

## Flow Diagram

```
┌─────────────────────────────────────┐
│         LOGIN PAGE (/login)         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Email / Username / ID / Phone│    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Password                     │    │
│  └─────────────────────────────┘    │
│  [ Sign In ]                        │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│     BACKEND: POST /auth/login       │
│                                     │
│  1. Resolve tenant (slug/default)   │
│  2. Check tenant status             │
│  3. Check lockout (Redis)           │
│  4. Find user by identifier:        │
│     - users.email                   │
│     - users.username                │
│     - users.phone                   │
│     - students.admissionNumber→user │
│     - teachers.employeeCode→user    │
│  5. Verify bcrypt password          │
│  6. Load roles + permissions        │
│  7. Generate JWT (15min)            │
│  8. Store session + refresh token   │
│  9. Audit log                       │
│  10. Return tokens + user data      │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│     FRONTEND: Role Detection        │
│                                     │
│  GET /auth/me → { roles, perms }    │
│  getLoginRedirect(roles) →          │
│                                     │
│  super_admin    → /super-admin      │
│  tenant_admin   → /dashboard        │
│  principal      → /principal        │
│  teacher        → /teacher          │
│  student        → /student          │
│  parent         → /parent           │
│  accountant     → /accountant       │
│  librarian      → /librarian        │
│  receptionist   → /reception        │
│  hr_manager     → /hr               │
│  transport      → /transport        │
│  hostel         → /hostel           │
│  inventory      → /inventory        │
└─────────────────────────────────────┘
```

## Error Handling

| Condition | Response |
|-----------|----------|
| Invalid identifier | 401 INVALID_CREDENTIALS |
| Wrong password | 401 INVALID_CREDENTIALS |
| Account locked (5 failures) | 423 ACCOUNT_LOCKED |
| Account suspended | 403 ACCOUNT_SUSPENDED |
| Account inactive | 403 ACCOUNT_INACTIVE |
| Tenant suspended | 403 TENANT_SUSPENDED |
| Tenant expired | 403 TENANT_EXPIRED |
| Missing tenant | 404 TENANT_NOT_FOUND |

## Token Refresh Flow

```
Client detects 401 → POST /auth/refresh-token { refreshToken }
  → Verify session in DB (active, not expired)
  → Load fresh roles/permissions
  → Rotate refresh token (old invalidated)
  → Return new accessToken + refreshToken
```

## Logout Flow

```
POST /auth/logout { refreshToken?, allDevices? }
  → allDevices=true: Revoke ALL user sessions
  → allDevices=false: Revoke specific session by refreshToken
  → Audit log
  → Frontend clears localStorage
  → Redirect to /login
```
