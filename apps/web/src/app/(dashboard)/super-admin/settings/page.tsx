'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';

const SETTINGS_ITEMS = [
  { title: 'SMTP / Email', description: 'Configure email sending for transactional and bulk messages.', icon: 'FileText', href: '#' },
  { title: 'SMS Gateway', description: 'Configure SMS provider credentials and sender settings.', icon: 'Bell', href: '#' },
  { title: 'WhatsApp', description: 'Configure WhatsApp Business API integration.', icon: 'Bell', href: '#' },
  { title: 'Payment Gateways', description: 'Configure Razorpay and payment processing.', icon: 'IndianRupee', href: '#' },
  { title: 'Cloud Storage', description: 'Configure S3-compatible storage for file uploads.', icon: 'FolderOpen', href: '#' },
  { title: 'Backup & Restore', description: 'Configure automated backups and restore procedures.', icon: 'Settings', href: '#' },
  { title: 'Feature Defaults', description: 'Configure default feature flags for new tenants.', icon: 'CalendarCheck', href: '#' },
  { title: 'Subscription Plans', description: 'Manage available plans, pricing, and limits.', icon: 'BarChart3', href: '#' },
];

export default function PlatformSettingsPage() {
  return (
    <>
      <PageHeader title="Platform Settings" description="Global configuration for the SaaS platform." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_ITEMS.map((item) => (
          <div
            key={item.title}
            className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-primary-300 hover:shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-700 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-slate-100 p-2.5 group-hover:bg-primary-50 dark:bg-slate-800 dark:group-hover:bg-primary-900/20 transition-colors">
                <SidebarIcon name={item.icon} className="h-5 w-5 text-slate-600 group-hover:text-primary-600 dark:text-slate-400 dark:group-hover:text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
