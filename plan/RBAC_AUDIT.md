# RBAC AUDIT
## HimanshiTech Education ERP — Role-Based Access Control
**Date:** 2026-07-09 | **Status:** ✅ Fully Implemented

---

## System Roles (16)

| # | Role Code | Name | Dashboard Path | Permissions |
|---|-----------|------|---------------|-------------|
| 1 | super_admin | Super Admin | /super-admin | ALL (128) |
| 2 | tenant_admin | Tenant Admin | /dashboard | ALL except super_admin module |
| 3 | institution_admin | Institution Admin | /dashboard | 48 permissions |
| 4 | principal | Principal | /principal | 18 permissions |
| 5 | vice_principal | Vice Principal | /principal | 14 permissions |
| 6 | hod | Head of Department | /teacher | 16 permissions |
| 7 | teacher | Teacher | /teacher | 14 permissions |
| 8 | student | Student | /student | 8 permissions |
| 9 | parent | Parent | /parent | 7 permissions |
| 10 | accountant | Accountant | /accountant | 10 permissions |
| 11 | librarian | Librarian | /librarian | 7 permissions |
| 12 | receptionist | Receptionist | /reception | 8 permissions |
| 13 | hr_manager | HR Manager | /hr | 8 permissions |
| 14 | transport_manager | Transport Manager | /transport | 4 permissions |
| 15 | hostel_warden | Hostel Warden | /hostel | 5 permissions |
| 16 | inventory_manager | Inventory Manager | /inventory | 2 permissions |
| 17 | staff | General Staff | /dashboard | 2 permissions |

## Permission Matrix (128 total)

16 modules × 8 actions = 128 permissions

**Modules:** users, students, teachers, parents, attendance, fees, exams, homework, study_materials, library, notifications, reports, settings, website, admissions, super_admin

**Actions:** view, create, edit, delete, approve, export, configure, manage

## Middleware Enforcement

| Middleware | File | Function |
|-----------|------|----------|
| `authenticate` | `auth.middleware.ts` | Verifies JWT, extracts user from token |
| `requireRole(...)` | `rbac.middleware.ts` | Checks user has one of specified roles |
| `requirePermission([...])` | `rbac.middleware.ts` | Checks user has required permission(s) |
| `resolveTenant` | `tenant.middleware.ts` | Resolves tenant from JWT/header/subdomain |
| `requireTenant` | `tenant.middleware.ts` | Blocks if no tenant or suspended |

## Super Admin Bypass
```typescript
if (req.user.roles.includes('super_admin')) {
  next(); return; // Bypasses all permission checks
}
```

## Frontend Route Protection

| Component | File | Purpose |
|-----------|------|---------|
| `RouteGuard` | `route-guard.tsx` | Redirects unauthenticated → /login |
| `RouteGuard requiredRoles` | `route-guard.tsx` | Redirects unauthorized → /unauthorized |
| `getLoginRedirect(roles)` | `role-navigation.ts` | Maps role → correct dashboard path |
| Permission-based nav | `navigation.ts` | Filters sidebar items by permission |

## Verified RBAC Behavior

| Scenario | Expected | Actual |
|----------|----------|--------|
| No token → /dashboard | Redirect to /login | ✅ |
| Student → /super-admin | 403 Unauthorized | ✅ |
| Teacher → /fees API | 403 Forbidden | ✅ |
| Super Admin → anything | 200 OK | ✅ |
| Expired token → any API | 401 Token Expired | ✅ |
| Invalid token → any API | 401 Token Invalid | ✅ |
