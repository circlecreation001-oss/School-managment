# ROLE PERMISSION REPORT
## HimanshiTech Education ERP — Permission Matrix
**Date:** 2026-07-09

---

## Permission System

- **16 Modules:** users, students, teachers, parents, attendance, fees, exams, homework, study_materials, library, notifications, reports, settings, website, admissions, super_admin
- **8 Actions per module:** view, create, edit, delete, approve, export, configure, manage
- **Total Permissions:** 128

## Role-Permission Matrix

### Super Admin (128 permissions — ALL)
Full platform access across all tenants.

### Tenant Admin / Institution Admin
All permissions EXCEPT `super_admin:*` module.

### Principal (18 permissions)
| Module | view | create | edit | delete | approve | export |
|--------|:----:|:------:|:----:|:------:|:-------:|:------:|
| students | ✅ | | | | | ✅ |
| teachers | ✅ | | | | | ✅ |
| attendance | ✅ | | | | | ✅ |
| fees | ✅ | | | | | ✅ |
| exams | ✅ | | | | ✅ | ✅ |
| homework | ✅ | | | | | |
| study_materials | ✅ | | | | | |
| library | ✅ | | | | | |
| reports | ✅ | | | | | ✅ |
| notifications | ✅ | ✅ | | | | |
| admissions | ✅ | | | | ✅ | |

### Teacher (14 permissions)
| Module | view | create | edit | delete |
|--------|:----:|:------:|:----:|:------:|
| students | ✅ | | | |
| attendance | ✅ | ✅ | ✅ | |
| exams | ✅ | ✅ | ✅ | |
| homework | ✅ | ✅ | ✅ | ✅ |
| study_materials | ✅ | ✅ | ✅ | |
| library | ✅ | | | |
| notifications | ✅ | | | |
| reports | ✅ | | | |

### Student (8 permissions)
| Module | view |
|--------|:----:|
| attendance | ✅ |
| fees | ✅ |
| exams | ✅ |
| homework | ✅ |
| study_materials | ✅ |
| library | ✅ |
| notifications | ✅ |
| reports | ✅ |

### Parent (7 permissions)
| Module | view |
|--------|:----:|
| students | ✅ |
| attendance | ✅ |
| fees | ✅ |
| exams | ✅ |
| homework | ✅ |
| notifications | ✅ |
| reports | ✅ |

### Accountant (10 permissions)
Full access to `fees:*` (view, create, edit, delete, approve, export) + `students:view` + `reports:view/export` + `notifications:view/create`

### Librarian (7 permissions)
Full access to `library:*` + `students:view` + `teachers:view` + `reports:view`

### Receptionist (8 permissions)
`admissions:view/create/edit` + `students:view/create` + `parents:view/create` + `notifications:view/create`

### HR Manager (8 permissions)
`teachers:view/create/edit/delete` + `attendance:view/create/approve/export` + `reports:view/export`

### Vice Principal (14 permissions)
Similar to Principal with attendance approve access.

### HOD (16 permissions)
Similar to Teacher with additional reporting access.

### Transport Manager (4 permissions)
`students:view` + `attendance:view` + `reports:view` + `notifications:view/create`

### Hostel Warden (5 permissions)
`students:view` + `attendance:view/create` + `reports:view` + `notifications:view/create`

### Inventory Manager (2 permissions)
`reports:view` + `notifications:view`

---

## Middleware Enforcement Chain

```
Request → authenticate (JWT) → resolveTenant → requirePermission(['module:action']) → Controller
```

If user lacks permission: `403 Forbidden` with code `FORBIDDEN`

## Frontend Navigation Filtering

The sidebar renders only items the user has permission for:
```typescript
// navigation.ts
{ label: 'Fees', href: '/fees', icon: 'IndianRupee', permissions: ['fees:view'] }
```

If `fees:view` is not in the user's permissions array, the menu item is hidden.
