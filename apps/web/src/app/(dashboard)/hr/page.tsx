'use client';
import { PageHeader } from '@/components/layout';
export default function Page() {
  return (
    <>
      <PageHeader title="HR Dashboard" description="Staff management, payroll, and leave tracking." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{l:'Total Staff',v:'0'},{l:'On Leave',v:'0'},{l:'Pending Approvals',v:'0'},{l:'Payroll Due',v:'—'}].map(s=>(
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><p className="text-sm text-slate-500">{s.l}</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{s.v}</p></div>
        ))}
      </div>
    </>
  );
}
