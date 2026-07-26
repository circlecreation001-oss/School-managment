import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Read from environment variables in production, fallback to defaults for first setup
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'shivam95ku@gmail.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Circle@123';

export async function seedSuperAdmin(prisma: PrismaClient, tenantId: string) {
  // Check if super admin already exists - prevent duplicates
  const existing = await prisma.user.findFirst({
    where: { tenantId, email: SUPER_ADMIN_EMAIL },
  });

  if (existing) {
    console.info(`   Super Admin already exists: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  // Hash password securely with bcrypt (12 rounds)
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

  // Create super admin user
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId, email: SUPER_ADMIN_EMAIL } },
    update: {},
    create: {
      tenantId,
      firstName: 'Shivam',
      lastName: 'Kumar',
      email: SUPER_ADMIN_EMAIL,
      username: 'superadmin',
      passwordHash,
      phone: '+919572495969',
      status: 'active',
      emailVerified: true,
    },
  });

  // Assign SUPER_ADMIN role with full system permissions
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

  console.info(`   Super Admin created: ${SUPER_ADMIN_EMAIL}`);
}
