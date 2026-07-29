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
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    ],
  },
  {
    label: 'Student Management',
    items: [
      { label: 'Students', href: '/students', icon: 'GraduationCap', permissions: ['students:view'] },
      { label: 'Admissions', href: '/admissions', icon: 'UserPlus', permissions: ['admissions:view'] },
      { label: 'Parents', href: '/parents', icon: 'UserCheck', permissions: ['parents:view'] },
      { label: 'Import Data', href: '/import', icon: 'Upload', permissions: ['students:create'] },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Classes & Sections', href: '/academics', icon: 'BookOpen', permissions: ['settings:view'] },
      { label: 'Homework', href: '/homework', icon: 'FileEdit', permissions: ['homework:view'] },
      { label: 'Study Materials', href: '/study-materials', icon: 'FolderOpen', permissions: ['study_materials:view'] },
    ],
  },
  {
    label: 'Attendance',
    items: [
      { label: 'Attendance', href: '/attendance', icon: 'CalendarCheck', permissions: ['attendance:view'] },
    ],
  },
  {
    label: 'Examinations',
    items: [
      { label: 'Exams & Results', href: '/exams', icon: 'FileText', permissions: ['exams:view'] },
    ],
  },
  {
    label: 'Fees & Finance',
    items: [
      { label: 'Fee Collection', href: '/fees', icon: 'IndianRupee', permissions: ['fees:view'] },
    ],
  },
  {
    label: 'Teachers & HR',
    items: [
      { label: 'Teachers', href: '/teachers', icon: 'Users', permissions: ['teachers:view'] },
      { label: 'HR & Payroll', href: '/hr', icon: 'Briefcase', permissions: ['teachers:view'] },
      { label: 'Users & Roles', href: '/users', icon: 'Shield', permissions: ['users:view'] },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Library', href: '/library', icon: 'Library', permissions: ['library:view'] },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Notifications', href: '/notifications', icon: 'Bell', permissions: ['notifications:view'] },
    ],
  },
  {
    label: 'Reports & Analytics',
    items: [
      { label: 'Reports', href: '/reports', icon: 'BarChart3', permissions: ['reports:view'] },
    ],
  },
  {
    label: 'Website & CMS',
    items: [
      { label: 'Website Manager', href: '/website', icon: 'Globe', permissions: ['website:view'] },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Settings', href: '/settings', icon: 'Settings', permissions: ['settings:view'] },
    ],
  },
  {
    label: 'Platform (Super Admin)',
    items: [
      { label: 'Platform Overview', href: '/super-admin', icon: 'LayoutDashboard', roles: ['super_admin'] },
      { label: 'Organizations', href: '/super-admin/organizations', icon: 'Globe', roles: ['super_admin'] },
      { label: 'All Users', href: '/super-admin/users', icon: 'Users', roles: ['super_admin'] },
      { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: 'FileText', roles: ['super_admin'] },
      { label: 'Platform Settings', href: '/super-admin/settings', icon: 'Settings', roles: ['super_admin'] },
    ],
  },
];
