import { PrismaClient } from '@prisma/client';
import { seedRolesAndPermissions } from './roles-permissions';
import { seedSuperAdmin } from './super-admin';

const prisma = new PrismaClient();

async function main() {
  console.info('ðŸŒ± Starting database seed...\n');

  // 1. Seed default tenant
  const tenant = await seedDefaultTenant();
  console.info('âœ… Default tenant created');

  // 2. Seed roles and permissions
  await seedRolesAndPermissions(prisma, tenant.id);
  console.info('âœ… Roles and permissions seeded');

  // 3. Seed super admin user
  await seedSuperAdmin(prisma, tenant.id);
  console.info('âœ… Super admin user created');

  console.info('\nðŸŽ‰ Database seed completed successfully!');
  console.info('   Login: admin@schoolnex.in / Admin@123456');
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
          currencySymbol: 'â‚¹',
          language: 'en',
          dateFormat: 'DD/MM/YYYY',
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error('âŒ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
