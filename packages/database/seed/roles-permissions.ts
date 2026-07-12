import { PrismaClient } from '@prisma/client';

// All modules in the system
const MODULES = [
  'users',
  'students',
  'teachers',
  'parents',
  'attendance',
  'fees',
  'exams',
  'homework',
  'study_materials',
  'library',
  'notifications',
  'reports',
  'settings',
  'website',
  'admissions',
  'super_admin',
] as const;

// All possible actions
const ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
  'export',
  'configure',
  'manage',
] as const;

// Role definitions with their permissions
const ROLE_DEFINITIONS = [
  {
    code: 'super_admin',
    name: 'Super Admin',
    description: 'Platform-level administration and governance',
    isSystemRole: true,
    permissions: '*', // All permissions
  },
  {
    code: 'tenant_admin',
    name: 'Tenant Admin',
    description: 'Institution-level full administration',
    isSystemRole: true,
    permissions: MODULES.filter((m) => m !== 'super_admin')
      .flatMap((m) => ACTIONS.map((a) => `${m}:${a}`)),
  },
  {
    code: 'institution_admin',
    name: 'Institution Admin',
    description: 'Manages institution-level operations',
    isSystemRole: true,
    permissions: [
      'users:view', 'users:create', 'users:edit', 'users:delete',
      'students:view', 'students:create', 'students:edit', 'students:delete', 'students:export',
      'teachers:view', 'teachers:create', 'teachers:edit', 'teachers:delete',
      'parents:view', 'parents:create', 'parents:edit',
      'attendance:view', 'attendance:create', 'attendance:edit', 'attendance:approve', 'attendance:export',
      'fees:view', 'fees:create', 'fees:edit', 'fees:delete', 'fees:approve', 'fees:export',
      'exams:view', 'exams:create', 'exams:edit', 'exams:delete', 'exams:approve',
      'homework:view', 'homework:create', 'homework:edit',
      'study_materials:view', 'study_materials:create', 'study_materials:edit', 'study_materials:delete',
      'library:view', 'library:create', 'library:edit', 'library:delete',
      'notifications:view', 'notifications:create', 'notifications:manage',
      'reports:view', 'reports:export',
      'settings:view', 'settings:configure',
      'website:view', 'website:create', 'website:edit', 'website:delete',
      'admissions:view', 'admissions:create', 'admissions:edit', 'admissions:approve',
    ],
  },
  {
    code: 'principal',
    name: 'Principal',
    description: 'Academic oversight and institutional leadership',
    isSystemRole: true,
    permissions: [
      'students:view', 'students:export',
      'teachers:view', 'teachers:export',
      'attendance:view', 'attendance:export',
      'fees:view', 'fees:export',
      'exams:view', 'exams:approve', 'exams:export',
      'homework:view',
      'study_materials:view',
      'library:view',
      'reports:view', 'reports:export',
      'notifications:view', 'notifications:create',
      'admissions:view', 'admissions:approve',
    ],
  },
  {
    code: 'teacher',
    name: 'Teacher',
    description: 'Teaching and academic management',
    isSystemRole: true,
    permissions: [
      'students:view',
      'attendance:view', 'attendance:create', 'attendance:edit',
      'exams:view', 'exams:create', 'exams:edit',
      'homework:view', 'homework:create', 'homework:edit', 'homework:delete',
      'study_materials:view', 'study_materials:create', 'study_materials:edit',
      'library:view',
      'notifications:view',
      'reports:view',
    ],
  },
  {
    code: 'student',
    name: 'Student',
    description: 'Student academic access',
    isSystemRole: true,
    permissions: [
      'attendance:view',
      'fees:view',
      'exams:view',
      'homework:view',
      'study_materials:view',
      'library:view',
      'notifications:view',
      'reports:view',
    ],
  },
  {
    code: 'parent',
    name: 'Parent',
    description: 'Parent/guardian visibility',
    isSystemRole: true,
    permissions: [
      'students:view',
      'attendance:view',
      'fees:view',
      'exams:view',
      'homework:view',
      'notifications:view',
      'reports:view',
    ],
  },
  {
    code: 'accountant',
    name: 'Accountant',
    description: 'Fee and financial management',
    isSystemRole: true,
    permissions: [
      'fees:view', 'fees:create', 'fees:edit', 'fees:delete', 'fees:approve', 'fees:export',
      'students:view',
      'reports:view', 'reports:export',
      'notifications:view', 'notifications:create',
    ],
  },
  {
    code: 'librarian',
    name: 'Librarian',
    description: 'Library management',
    isSystemRole: true,
    permissions: [
      'library:view', 'library:create', 'library:edit', 'library:delete', 'library:manage',
      'students:view',
      'teachers:view',
      'reports:view',
    ],
  },
  {
    code: 'receptionist',
    name: 'Receptionist',
    description: 'Front-desk and admissions operations',
    isSystemRole: true,
    permissions: [
      'admissions:view', 'admissions:create', 'admissions:edit',
      'students:view', 'students:create',
      'parents:view', 'parents:create',
      'notifications:view', 'notifications:create',
    ],
  },
  {
    code: 'hr_manager',
    name: 'HR Manager',
    description: 'Staff and HR operations',
    isSystemRole: true,
    permissions: [
      'teachers:view', 'teachers:create', 'teachers:edit', 'teachers:delete',
      'attendance:view', 'attendance:create', 'attendance:approve', 'attendance:export',
      'reports:view', 'reports:export',
    ],
  },
  {
    code: 'vice_principal',
    name: 'Vice Principal',
    description: 'Vice Principal — academic oversight support',
    isSystemRole: true,
    permissions: [
      'students:view', 'students:export',
      'teachers:view',
      'attendance:view', 'attendance:approve', 'attendance:export',
      'exams:view', 'exams:approve', 'exams:export',
      'homework:view',
      'reports:view', 'reports:export',
      'notifications:view', 'notifications:create',
    ],
  },
  {
    code: 'hod',
    name: 'Head of Department',
    description: 'Department-level academic management',
    isSystemRole: true,
    permissions: [
      'students:view',
      'teachers:view',
      'attendance:view', 'attendance:create', 'attendance:edit',
      'exams:view', 'exams:create', 'exams:edit',
      'homework:view', 'homework:create', 'homework:edit',
      'study_materials:view', 'study_materials:create', 'study_materials:edit',
      'reports:view',
      'notifications:view',
    ],
  },
  {
    code: 'transport_manager',
    name: 'Transport Manager',
    description: 'School transport and routes management',
    isSystemRole: true,
    permissions: [
      'students:view',
      'attendance:view',
      'reports:view',
      'notifications:view', 'notifications:create',
    ],
  },
  {
    code: 'hostel_warden',
    name: 'Hostel Warden',
    description: 'Hostel and residential facility management',
    isSystemRole: true,
    permissions: [
      'students:view',
      'attendance:view', 'attendance:create',
      'reports:view',
      'notifications:view', 'notifications:create',
    ],
  },
  {
    code: 'inventory_manager',
    name: 'Inventory Manager',
    description: 'School inventory and asset management',
    isSystemRole: true,
    permissions: [
      'reports:view',
      'notifications:view',
    ],
  },
  {
    code: 'staff',
    name: 'Staff',
    description: 'General staff access',
    isSystemRole: true,
    permissions: [
      'attendance:view',
      'notifications:view',
    ],
  },
];

export async function seedRolesAndPermissions(prisma: PrismaClient, tenantId: string) {
  // 1. Create all permissions
  const allPermissions: Array<{ code: string; name: string; module: string; action: string }> = [];

  for (const module of MODULES) {
    for (const action of ACTIONS) {
      const code = `${module}:${action}`;
      const name = `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.replace('_', ' ')}`;
      allPermissions.push({ code, name, module, action });
    }
  }

  // Upsert all permissions
  for (const perm of allPermissions) {
    await prisma.permission.upsert({
      where: { tenantId_code: { tenantId, code: perm.code } },
      update: { name: perm.name, module: perm.module, action: perm.action },
      create: {
        tenantId,
        code: perm.code,
        name: perm.name,
        module: perm.module,
        action: perm.action,
      },
    });
  }

  // 2. Create roles and assign permissions
  for (const roleDef of ROLE_DEFINITIONS) {
    const role = await prisma.role.upsert({
      where: { tenantId_code: { tenantId, code: roleDef.code } },
      update: { name: roleDef.name, description: roleDef.description },
      create: {
        tenantId,
        code: roleDef.code,
        name: roleDef.name,
        description: roleDef.description,
        isSystemRole: roleDef.isSystemRole,
      },
    });

    // Determine which permission codes this role gets
    let permCodes: string[];
    if (roleDef.permissions === '*') {
      permCodes = allPermissions.map((p) => p.code);
    } else {
      permCodes = roleDef.permissions as string[];
    }

    // Assign permissions to role
    for (const permCode of permCodes) {
      const permission = await prisma.permission.findUnique({
        where: { tenantId_code: { tenantId, code: permCode } },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          update: {},
          create: { roleId: role.id, permissionId: permission.id },
        });
      }
    }
  }
}
