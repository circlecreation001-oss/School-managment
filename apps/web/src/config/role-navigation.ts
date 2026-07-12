export interface RoleNavItem {
  label: string;
  href: string;
  icon: string;
}

export interface RolePortalConfig {
  role: string;
  basePath: string;
  dashboardPath: string;
  label: string;
  navigation: RoleNavItem[];
}

export const ROLE_PORTALS: Record<string, RolePortalConfig> = {
  super_admin: {
    role: 'super_admin',
    basePath: '/super-admin',
    dashboardPath: '/dashboard/super-admin',
    label: 'Super Admin',
    navigation: [
      { label: 'Platform Overview', href: '/super-admin', icon: 'LayoutDashboard' },
      { label: 'Organizations', href: '/super-admin/organizations', icon: 'Globe' },
      { label: 'All Users', href: '/super-admin/users', icon: 'Users' },
      { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: 'FileText' },
      { label: 'Platform Settings', href: '/super-admin/settings', icon: 'Settings' },
    ],
  },
  tenant_admin: {
    role: 'tenant_admin',
    basePath: '/dashboard',
    dashboardPath: '/dashboard/admin',
    label: 'Institute Admin',
    navigation: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Students', href: '/students', icon: 'GraduationCap' },
      { label: 'Teachers', href: '/teachers', icon: 'Users' },
      { label: 'Parents', href: '/parents', icon: 'UserCheck' },
      { label: 'Admissions', href: '/admissions', icon: 'UserPlus' },
      { label: 'Attendance', href: '/attendance', icon: 'CalendarCheck' },
      { label: 'Fees', href: '/fees', icon: 'IndianRupee' },
      { label: 'Exams', href: '/exams', icon: 'FileText' },
      { label: 'Homework', href: '/homework', icon: 'BookOpen' },
      { label: 'Library', href: '/library', icon: 'Library' },
      { label: 'Reports', href: '/reports', icon: 'BarChart3' },
      { label: 'Website', href: '/website', icon: 'Globe' },
      { label: 'Notifications', href: '/notifications', icon: 'Bell' },
      { label: 'Academics', href: '/academics', icon: 'BookOpen' },
      { label: 'Users', href: '/users', icon: 'Users' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
  institution_admin: {
    role: 'institution_admin',
    basePath: '/dashboard',
    dashboardPath: '/dashboard/admin',
    label: 'Institute Admin',
    navigation: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Students', href: '/students', icon: 'GraduationCap' },
      { label: 'Teachers', href: '/teachers', icon: 'Users' },
      { label: 'Attendance', href: '/attendance', icon: 'CalendarCheck' },
      { label: 'Fees', href: '/fees', icon: 'IndianRupee' },
      { label: 'Exams', href: '/exams', icon: 'FileText' },
      { label: 'Reports', href: '/reports', icon: 'BarChart3' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
  principal: {
    role: 'principal',
    basePath: '/principal',
    dashboardPath: '/dashboard/principal',
    label: 'Principal',
    navigation: [
      { label: 'Dashboard', href: '/principal', icon: 'LayoutDashboard' },
      { label: 'Students', href: '/students', icon: 'GraduationCap' },
      { label: 'Teachers', href: '/teachers', icon: 'Users' },
      { label: 'Attendance', href: '/attendance', icon: 'CalendarCheck' },
      { label: 'Exams', href: '/exams', icon: 'FileText' },
      { label: 'Reports', href: '/reports', icon: 'BarChart3' },
      { label: 'Notifications', href: '/notifications', icon: 'Bell' },
    ],
  },
  vice_principal: {
    role: 'vice_principal',
    basePath: '/principal',
    dashboardPath: '/dashboard/principal',
    label: 'Vice Principal',
    navigation: [
      { label: 'Dashboard', href: '/principal', icon: 'LayoutDashboard' },
      { label: 'Students', href: '/students', icon: 'GraduationCap' },
      { label: 'Attendance', href: '/attendance', icon: 'CalendarCheck' },
      { label: 'Exams', href: '/exams', icon: 'FileText' },
      { label: 'Reports', href: '/reports', icon: 'BarChart3' },
    ],
  },
  hod: {
    role: 'hod',
    basePath: '/teacher',
    dashboardPath: '/dashboard/teacher',
    label: 'Head of Department',
    navigation: [
      { label: 'Dashboard', href: '/teacher', icon: 'LayoutDashboard' },
      { label: 'My Classes', href: '/teacher/classes', icon: 'Users' },
      { label: 'Attendance', href: '/teacher/attendance', icon: 'CalendarCheck' },
      { label: 'Homework', href: '/teacher/homework', icon: 'BookOpen' },
      { label: 'Study Material', href: '/teacher/materials', icon: 'FolderOpen' },
      { label: 'Exams', href: '/teacher/exams', icon: 'FileText' },
      { label: 'Reports', href: '/reports', icon: 'BarChart3' },
    ],
  },
  teacher: {
    role: 'teacher',
    basePath: '/teacher',
    dashboardPath: '/dashboard/teacher',
    label: 'Teacher',
    navigation: [
      { label: 'Dashboard', href: '/teacher', icon: 'LayoutDashboard' },
      { label: 'My Classes', href: '/teacher/classes', icon: 'Users' },
      { label: 'Attendance', href: '/teacher/attendance', icon: 'CalendarCheck' },
      { label: 'Homework', href: '/teacher/homework', icon: 'BookOpen' },
      { label: 'Study Material', href: '/teacher/materials', icon: 'FolderOpen' },
      { label: 'Exams', href: '/teacher/exams', icon: 'FileText' },
      { label: 'Timetable', href: '/teacher/timetable', icon: 'CalendarCheck' },
      { label: 'Leave Requests', href: '/teacher/leaves', icon: 'UserCheck' },
      { label: 'Messages', href: '/teacher/messages', icon: 'Bell' },
    ],
  },
  student: {
    role: 'student',
    basePath: '/student',
    dashboardPath: '/dashboard/student',
    label: 'Student',
    navigation: [
      { label: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
      { label: 'My Profile', href: '/student/profile', icon: 'UserCheck' },
      { label: 'Attendance', href: '/student/attendance', icon: 'CalendarCheck' },
      { label: 'Homework', href: '/student/homework', icon: 'BookOpen' },
      { label: 'Study Material', href: '/student/materials', icon: 'FolderOpen' },
      { label: 'Fees', href: '/student/fees', icon: 'IndianRupee' },
      { label: 'Online Exams', href: '/student/exams', icon: 'FileText' },
      { label: 'Results', href: '/student/results', icon: 'BarChart3' },
      { label: 'Timetable', href: '/student/timetable', icon: 'CalendarCheck' },
      { label: 'Notifications', href: '/student/notifications', icon: 'Bell' },
    ],
  },
  parent: {
    role: 'parent',
    basePath: '/parent',
    dashboardPath: '/dashboard/parent',
    label: 'Parent',
    navigation: [
      { label: 'Dashboard', href: '/parent', icon: 'LayoutDashboard' },
      { label: 'Attendance', href: '/parent/attendance', icon: 'CalendarCheck' },
      { label: 'Fee Status', href: '/parent/fees', icon: 'IndianRupee' },
      { label: 'Homework', href: '/parent/homework', icon: 'BookOpen' },
      { label: 'Results', href: '/parent/results', icon: 'BarChart3' },
      { label: 'Communication', href: '/parent/messages', icon: 'Bell' },
      { label: 'Leave Requests', href: '/parent/leaves', icon: 'UserCheck' },
    ],
  },
  accountant: {
    role: 'accountant',
    basePath: '/accountant',
    dashboardPath: '/dashboard/accountant',
    label: 'Accountant',
    navigation: [
      { label: 'Dashboard', href: '/accountant', icon: 'LayoutDashboard' },
      { label: 'Fee Collection', href: '/fees', icon: 'IndianRupee' },
      { label: 'Receipts', href: '/accountant/receipts', icon: 'FileText' },
      { label: 'Expenses', href: '/accountant/expenses', icon: 'BarChart3' },
      { label: 'Reports', href: '/reports', icon: 'BarChart3' },
    ],
  },
  librarian: {
    role: 'librarian',
    basePath: '/librarian',
    dashboardPath: '/dashboard/library',
    label: 'Librarian',
    navigation: [
      { label: 'Dashboard', href: '/librarian', icon: 'LayoutDashboard' },
      { label: 'Books', href: '/library', icon: 'Library' },
      { label: 'Issue / Return', href: '/librarian/circulation', icon: 'BookOpen' },
      { label: 'Fine Management', href: '/librarian/fines', icon: 'IndianRupee' },
    ],
  },
  receptionist: {
    role: 'receptionist',
    basePath: '/reception',
    dashboardPath: '/dashboard/reception',
    label: 'Reception',
    navigation: [
      { label: 'Dashboard', href: '/reception', icon: 'LayoutDashboard' },
      { label: 'Admissions', href: '/admissions', icon: 'UserPlus' },
      { label: 'Enquiries', href: '/reception/enquiries', icon: 'Bell' },
      { label: 'Student Registration', href: '/reception/register', icon: 'GraduationCap' },
    ],
  },
  hr_manager: {
    role: 'hr_manager',
    basePath: '/hr',
    dashboardPath: '/dashboard/hr',
    label: 'HR Manager',
    navigation: [
      { label: 'Dashboard', href: '/hr', icon: 'LayoutDashboard' },
      { label: 'Staff', href: '/hr/staff', icon: 'Users' },
      { label: 'Leave Management', href: '/hr/leaves', icon: 'CalendarCheck' },
      { label: 'Payroll', href: '/hr/payroll', icon: 'IndianRupee' },
    ],
  },
  transport_manager: {
    role: 'transport_manager',
    basePath: '/transport',
    dashboardPath: '/dashboard/transport',
    label: 'Transport Manager',
    navigation: [
      { label: 'Dashboard', href: '/transport', icon: 'LayoutDashboard' },
    ],
  },
  hostel_warden: {
    role: 'hostel_warden',
    basePath: '/hostel',
    dashboardPath: '/dashboard/hostel',
    label: 'Hostel Warden',
    navigation: [
      { label: 'Dashboard', href: '/hostel', icon: 'LayoutDashboard' },
    ],
  },
  inventory_manager: {
    role: 'inventory_manager',
    basePath: '/inventory',
    dashboardPath: '/dashboard/inventory',
    label: 'Inventory Manager',
    navigation: [
      { label: 'Dashboard', href: '/inventory', icon: 'LayoutDashboard' },
    ],
  },
};

/**
 * Priority-ordered role list for multi-role users.
 * Higher priority roles take precedence for login redirect.
 */
const ROLE_PRIORITY = [
  'super_admin', 'tenant_admin', 'institution_admin', 'principal', 'vice_principal',
  'hod', 'teacher', 'accountant', 'librarian', 'receptionist', 'hr_manager',
  'transport_manager', 'hostel_warden', 'inventory_manager', 'student', 'parent',
];

export function getPortalForRole(roles: string[]): RolePortalConfig {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role) && ROLE_PORTALS[role]) return ROLE_PORTALS[role]!;
  }
  return ROLE_PORTALS['student']!;
}

/**
 * Returns the redirect path to use after successful login.
 * Maps to /dashboard/{role} paths as specified in the system requirements.
 */
export function getLoginRedirect(roles: string[]): string {
  return getPortalForRole(roles).basePath;
}
