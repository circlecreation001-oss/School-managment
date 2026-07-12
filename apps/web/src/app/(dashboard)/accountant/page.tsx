'use client';
import { PageHeader } from '@/components/layout';
export default function Page() {
  return (
    <>
      <PageHeader title="Finance Dashboard" description="Fee collection, expenses, and financial overview." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{l:"Today's Collection",v:'₹0'},{l:'Pending Dues',v:'₹0'},{l:'Total Revenue',v:'₹0'},{l:'Expenses',v:'₹0'}].map(s=>(
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><p className="text-sm text-slate-500">{s.l}</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{s.v}</p></div>
        ))}
      </div>
    </>
  );
}
