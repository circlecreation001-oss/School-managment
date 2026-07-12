'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';

export default function AdmissionsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(false); }, []);

  return (
    <>
      <PageHeader title="Admissions" description="Manage admission inquiries, applications, and enrollment pipeline."
        actions={<button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">+ New Inquiry</button>} />

      {loading ? <TableSkeleton rows={8} /> : (
        <div className="space-y-6">
          {/* Pipeline Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ label: 'Inquiries', value: '0', color: 'bg-slate-50 dark:bg-slate-800' }, { label: 'Under Review', value: '0', color: 'bg-warning-50 dark:bg-yellow-900/20' }, { label: 'Approved', value: '0', color: 'bg-success-50 dark:bg-green-900/20' }, { label: 'Enrolled', value: '0', color: 'bg-primary-50 dark:bg-blue-900/20' }].map((s) => (
              <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">{s.value}</p>
              </div>
            ))}
          </div>

          <EmptyState title="No admissions yet" description="Create admission inquiries or enable online admissions through the public website." />
        </div>
      )}
    </>
  );
}
