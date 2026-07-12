import { PrismaClient } from '@prisma/client';
import { seedRolesAndPermissions } from './roles-permissions';
import { seedSuperAdmin } from './super-admin';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting database seed...\n');

  // 1. Seed default tenant
  const tenant = await seedDefaultTenant();
  console.info('✅ Default tenant created');

  // 2. Seed roles and permissions
  await seedRolesAndPermissions(prisma, tenant.id);
  console.info('✅ Roles and permissions seeded');

  // 3. Seed super admin user
  await seedSuperAdmin(prisma, tenant.id);
  console.info('✅ Super admin user created');

  console.info('\n🎉 Database seed completed successfully!');
  console.info('   Login: admin@educationerp.com / Admin@123456');
}

async function seedDefaultTenant() {
  return prisma.tenant.upsert({
    where: { slug: 'platform' },
    update: {},
    create: {
      name: 'Education ERP Platform',
      slug: 'platform',
      status: 'active',
      subscriptionStatus: 'active',
      planCode: 'enterprise',
      settings: {
        create: {
          brandingName: 'Education ERP',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          accentColor: '#7c3aed',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          currencySymbol: '₹',
          language: 'en',
          dateFormat: 'DD/MM/YYYY',
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
