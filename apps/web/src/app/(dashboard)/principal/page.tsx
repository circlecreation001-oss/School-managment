'use client';

import { PageHeader } from '@/components/layout';

export default function PrincipalDashboard() {
  const stats = [
    { label: 'Total Students', value: '850' },
    { label: 'Total Teachers', value: '42' },
    { label: 'Attendance Rate', value: '94%' },
    { label: 'Pass Rate', value: '87%' },
  ];

  return (
    <>
      <PageHeader title="Principal Dashboard" description="Institute overview, performance metrics, and academic insights." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{s.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
