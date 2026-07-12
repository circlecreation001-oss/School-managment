export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permissions?: string[];
  roles?: string[];
  children?: NavItem[];
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Users', href: '/users', icon: 'Users', permissions: ['users:view'] },
      { label: 'Academics', href: '/academics', icon: 'BookOpen', permissions: ['settings:view'] },
    ],
  },
  {
    label: 'Academic',
    items: [
      { label: 'Students', href: '/students', icon: 'GraduationCap', permissions: ['students:view'] },
      { label: 'Teachers', href: '/teachers', icon: 'Users', permissions: ['teachers:view'] },
      { label: 'Parents', href: '/parents', icon: 'UserCheck', permissions: ['parents:view'] },
      { label: 'Attendance', href: '/attendance', icon: 'CalendarCheck', permissions: ['attendance:view'] },
      { label: 'Exams', href: '/exams', icon: 'FileText', permissions: ['exams:view'] },
      { label: 'Homework', href: '/homework', icon: 'BookOpen', permissions: ['homework:view'] },
      { label: 'Study Material', href: '/study-materials', icon: 'FolderOpen', permissions: ['study_materials:view'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Fees', href: '/fees', icon: 'IndianRupee', permissions: ['fees:view'] },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Library', href: '/library', icon: 'Library', permissions: ['library:view'] },
      { label: 'Notifications', href: '/notifications', icon: 'Bell', permissions: ['notifications:view'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Reports', href: '/reports', icon: 'BarChart3', permissions: ['reports:view'] },
      { label: 'Website', href: '/website', icon: 'Globe', permissions: ['website:view'] },
      { label: 'Admissions', href: '/admissions', icon: 'UserPlus', permissions: ['admissions:view'] },
      { label: 'Settings', href: '/settings', icon: 'Settings', permissions: ['settings:view'] },
    ],
  },
  {
    label: 'Super Admin',
    items: [
      { label: 'Platform Overview', href: '/super-admin', icon: 'LayoutDashboard', roles: ['super_admin'] },
      { label: 'Organizations', href: '/super-admin/organizations', icon: 'Globe', roles: ['super_admin'] },
      { label: 'All Users', href: '/super-admin/users', icon: 'Users', roles: ['super_admin'] },
      { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: 'FileText', roles: ['super_admin'] },
      { label: 'Platform Settings', href: '/super-admin/settings', icon: 'Settings', roles: ['super_admin'] },
    ],
  },
];
