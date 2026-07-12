import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const SUPER_ADMIN_EMAIL = 'admin@educationerp.com';
const SUPER_ADMIN_PASSWORD = 'Admin@123456';

export async function seedSuperAdmin(prisma: PrismaClient, tenantId: string) {
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

  // Create or update super admin user
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId, email: SUPER_ADMIN_EMAIL } },
    update: {},
    create: {
      tenantId,
      firstName: 'Super',
      lastName: 'Admin',
      email: SUPER_ADMIN_EMAIL,
      username: 'superadmin',
      passwordHash,
      phone: '+919999999999',
      status: 'active',
      emailVerified: true,
    },
  });

  // Find the super_admin role
  const superAdminRole = await prisma.role.findUnique({
    where: { tenantId_code: { tenantId, code: 'super_admin' } },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId_tenantId: {
          userId: user.id,
          roleId: superAdminRole.id,
          tenantId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: superAdminRole.id,
        tenantId,
      },
    });
  }
}
