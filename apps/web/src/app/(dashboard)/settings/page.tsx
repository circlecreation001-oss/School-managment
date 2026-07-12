'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { usePermissions } from '@/hooks/use-permissions';

const SETTINGS_SECTIONS = [
  {
    title: 'Institution Profile',
    description: 'Manage institution name, address, contact details, and branding.',
    href: '/settings/profile',
    icon: 'Globe',
    permission: 'settings:view',
  },
  {
    title: 'Academic Session',
    description: 'Configure academic years, terms, and session preferences.',
    href: '/settings/academic-session',
    icon: 'CalendarCheck',
    permission: 'settings:configure',
  },
  {
    title: 'Roles & Permissions',
    description: 'Manage user roles, permissions, and access control.',
    href: '/settings/roles',
    icon: 'Users',
    permission: 'settings:configure',
  },
  {
    title: 'Branding & Theme',
    description: 'Customize logo, colors, and appearance of the platform.',
    href: '/settings/branding',
    icon: 'Settings',
    permission: 'settings:configure',
  },
  {
    title: 'Notifications',
    description: 'Configure email, SMS, and WhatsApp notification settings.',
    href: '/settings/notifications',
    icon: 'Bell',
    permission: 'settings:configure',
  },
  {
    title: 'Payment Gateway',
    description: 'Set up Razorpay and payment collection preferences.',
    href: '/settings/payments',
    icon: 'IndianRupee',
    permission: 'settings:configure',
  },
];

export default function SettingsPage() {
  const { hasPermission } = usePermissions();

  const visibleSections = SETTINGS_SECTIONS.filter((s) => hasPermission(s.permission));

  return (
    <>
      <PageHeader title="Settings" description="Manage your institution configuration and preferences." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-primary-300 hover:shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-700"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-slate-100 p-2.5 group-hover:bg-primary-50 dark:bg-slate-800 dark:group-hover:bg-primary-900/20 transition-colors">
                <SidebarIcon name={section.icon} className="h-5 w-5 text-slate-600 group-hover:text-primary-600 dark:text-slate-400 dark:group-hover:text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{section.title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{section.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
