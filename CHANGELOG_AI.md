# CHANGELOG_AI.md

## 2026-08-05

### Module 1: Remove Dev Mode Bypass (LAUNCH_CHECKLIST.md #1)

**File Changed**: `apps/web/src/providers/auth-provider.tsx`

**Changes**:
- Removed `DEV_USER` constant (hardcoded admin with all 120 permissions)
- Removed dev mode bypass in `refreshUser()` - no longer loads user from localStorage
- Removed dev mode fallback in `login()` - no longer auto-grants access on network error
- Removed dev mode fallback in `login()` catch block - no longer auto-grants access on any exception
- Removed `devMode` localStorage handling in `logout()`
- Removed `localStorage.setItem('user', ...)` calls (user is always fetched from `/auth/me`)
- Added `if (refreshToken)` guard before calling `/auth/logout` to prevent null token requests

**Fix Applied**: Restored detailed error handling in `login()` catch block:
- Network errors → "Cannot connect to server. Please check your internet connection or try again later."
- Other errors → actual error message (from API, not raw server internals)

**Verification**: `npm run typecheck` passed, `npm run build` passed (API 472 KB, 86 pages)

---

### Student Portal: GET /students/me Endpoint

**Files Changed**:
- `apps/api/src/modules/students/student.service.ts` - Added `getMe(tenantId, userId)` method
- `apps/api/src/modules/students/student.controller.ts` - Added `getMe` controller method
- `apps/api/src/modules/students/student.routes.ts` - Added `GET /me` route (before `/:id`)

**New Endpoint**: `GET /api/v1/students/me`
- Auth: JWT required, Permission: `students:view`
- Uses `req.user.id` from JWT (never from query/body)
- Looks up `Student` by `userId` field
- Returns: id, tenantId, admissionNumber, rollNumber, firstName, lastName, classId, sectionId, batchId, branchId, academicSessionId, status, class (id/name/code), section (id/name)
- Tenant isolation: checks `student.tenantId !== tenantId`

**Verification**: `npm run typecheck` passed, `npm run build` passed (API 473.40 KB, 86 pages)

---

### Student Portal: GET /academics/timetable Endpoint

**Files Changed**:
- `apps/api/src/modules/academics/academic.service.ts` - Added `getTimetable(tenantId, classId)` method
- `apps/api/src/modules/academics/academic.controller.ts` - Added `getTimetable` controller method
- `apps/api/src/modules/academics/academic.routes.ts` - Added `GET /timetable` route

**New Endpoint**: `GET /api/v1/academics/timetable?classId=X`
- Auth: JWT required, Permission: `settings:view`
- Queries existing `Timetable` Prisma model
- Returns timetable entries with subject name, teacher name, room, dayOfWeek, startTime, endTime
- Ordered by dayOfWeek then startTime

**Verification**: `npm run build` passed (API 473.94 KB, 86 pages)

---

### Student Portal: All Pages Complete

**Pages Updated** (10 files):

| Page | API Used | Key Change |
|------|----------|------------|
| Dashboard | `GET /students/me` | Shows class, section, admission #, roll # |
| Attendance | `GET /students/me` + `GET /attendance/monthly?studentId=X` | Student-specific attendance with month picker |
| Timetable | `GET /students/me` + `GET /academics/timetable?classId=X` | Weekly grid with subject/teacher/room |
| Homework | `GET /students/me` + `GET /homework?classId=X&status=published` | Class-filtered homework cards |
| Materials | `GET /students/me` + `GET /study-materials?classId=X` | Class-filtered materials with download |
| Exams | `GET /students/me` + `GET /exams?classId=X` | Class-filtered exam schedule |
| Results | `GET /students/me` + `GET /exams/results/student/:studentId` | Student-specific marks with grades |
| Fees | `GET /students/me` + `GET /fees/ledger/:studentId` | Student-specific invoice ledger |
| Notifications | `GET /notifications/me` | User-specific notifications |
| Profile | `useAuth()` + `PATCH /users/:id` | Already functional, no changes needed |

**Verification**: `npm run build` passed (API 473.94 KB, 86 pages)

**Git Commits**:
- `b4c2fdd` - feat: student portal - attendance page
- `de200d9` - feat: complete student portal - timetable, homework, materials, exams, results, fees, notifications