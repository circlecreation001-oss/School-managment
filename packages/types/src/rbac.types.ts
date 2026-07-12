export type SystemRole =
  | 'super_admin'
  | 'tenant_admin'
  | 'institution_admin'
  | 'academic_admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'librarian'
  | 'receptionist'
  | 'hr_manager'
  | 'staff';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'configure' | 'manage';

export type PermissionModule =
  | 'users'
  | 'students'
  | 'teachers'
  | 'parents'
  | 'attendance'
  | 'fees'
  | 'exams'
  | 'homework'
  | 'study_materials'
  | 'library'
  | 'notifications'
  | 'reports'
  | 'settings'
  | 'website'
  | 'super_admin';

export type Permission = `${PermissionModule}:${PermissionAction}`;

export interface RoleDefinition {
  code: SystemRole;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: Permission[];
}

export interface UserPermissionCheck {
  userId: string;
  tenantId: string;
  requiredPermissions: Permission[];
  requireAll?: boolean;
}
