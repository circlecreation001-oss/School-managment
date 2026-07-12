# AUTHENTICATION AUDIT
## HimanshiTech Education ERP — Live Verification
**Date:** 2026-07-09 | **Status:** ✅ All Flows Working

---

## Endpoints Verified (Live HTTP Calls)

| Endpoint | Method | Status | Verified |
|----------|--------|--------|----------|
| `/auth/login` | POST | ✅ 200 | Multi-identifier (email/username/phone/admNo/empCode) |
| `/auth/logout` | POST | ✅ 200 | Single + all devices |
| `/auth/refresh-token` | POST | ✅ 200 | Token rotation working |
| `/auth/forgot-password` | POST | ✅ 200 | Token stored in Redis |
| `/auth/reset-password` | POST | ✅ 200 | Hash validated, sessions revoked |
| `/auth/change-password` | POST | ✅ 200 | Current verified, history checked |
| `/auth/verify-email` | POST | ✅ | Redis token verification |
| `/auth/me` | GET | ✅ 200 | Full user + roles + 128 permissions |
| `/auth/sessions` | GET | ✅ 200 | Active sessions list |
| `/auth/sessions/:id` | DELETE | ✅ 200 | Session revocation |

## Login Flow (Verified)

```
User enters identifier (email/username/admNo/empCode/phone)
    ↓
Resolve tenant (JWT claims / header / subdomain / default 'platform')
    ↓
Check tenant status (active/trial OK; suspended/expired/archived BLOCKED)
    ↓
Check account lockout (5 attempts → 30min Redis lock)
    ↓
Find user by identifier (email OR username OR phone OR student.admissionNumber OR teacher.employeeCode)
    ↓
Verify bcrypt password (12 rounds)
    ↓
Get roles + permissions from UserRole → Role → RolePermission → Permission
    ↓
Generate JWT access token (15min expiry, contains sub/tenantId/roles/permissions/sessionId)
    ↓
Generate refresh token (random 64 bytes hex, stored in Session table)
    ↓
Create Session record (userId, tenantId, IP, user agent, expiry)
    ↓
Update lastLoginAt + lastLoginIp on User
    ↓
Create AuditLog (action: 'login')
    ↓
Return { accessToken, refreshToken, expiresIn, user: { id, email, firstName, lastName, roles, tenantId } }
```

## Security Controls

| Control | Implementation |
|---------|---------------|
| Password hashing | bcrypt, 12 rounds |
| JWT expiry | Access: 15 minutes |
| Refresh expiry | 7 days |
| Token rotation | New refresh token on each refresh |
| Account lockout | 5 failed attempts → 30min lock (Redis) |
| Password history | Last 5 passwords blocked (Redis) |
| Password strength | 8+ chars, upper, lower, number, special |
| Session limit | Max 5 active sessions per user |
| Tenant isolation | All queries scoped by tenantId |
| Rate limiting | Auth: 10/15min, Password: 5/1hr |
| Audit logging | Every auth event logged |

## Verified Credentials
- **Super Admin:** `admin@educationerp.com` / `Admin@123456` → Roles: `super_admin` → 128 permissions
