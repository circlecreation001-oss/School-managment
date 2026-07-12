'use client';

import { PageHeader } from '@/components/layout';

interface PortalPageProps {
  title: string;
  description?: string;
  items?: Array<{ label: string; value: string | number; icon?: string }>;
  actions?: Array<{ label: string; href: string }>;
}

export function PortalPage({ title, description, items, actions }: PortalPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{item.value}</p>
            </div>
          ))}
        </div>
      )}
      {actions && actions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actions.map((a) => (
              <a key={a.label} href={a.href} className="px-4 py-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                {a.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
