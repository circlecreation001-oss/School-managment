import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Seeds the platform super admin (for platform-level management only).
 * Credentials must be provided via environment variables.
 * This is NOT used for institute owner accounts (those are created via /signup).
 */
export async function seedSuperAdmin(prisma: PrismaClient, tenantId: string) {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.info('   Skipping Super Admin seed: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD env vars not set');
    return;
  }

  // Check if super admin already exists
  const existing = await prisma.user.findFirst({
    where: { tenantId, email },
  });

  if (existing) {
    console.info(`   Super Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId, email } },
    update: {},
    create: {
      tenantId,
      firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.SUPER_ADMIN_LAST_NAME || '',
      email,
      username: 'superadmin',
      passwordHash,
      phone: process.env.SUPER_ADMIN_PHONE || '',
      status: 'active',
      emailVerified: true,
    },
  });

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

  console.info(`   Super Admin created: ${email}`);
}
