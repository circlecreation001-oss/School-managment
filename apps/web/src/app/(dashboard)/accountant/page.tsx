'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function AccountantDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/reports/dashboard').then(res => { if (res.success) setStats(res.data?.kpis || res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finance Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Fee collection, invoices, and financial overview.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Invoices" value={stats?.totalInvoices} loading={loading} />
        <StatCard label="Paid Invoices" value={stats?.paidInvoices} loading={loading} />
        <StatCard label="Pending Fees" value={stats ? `₹${(stats.pendingFeeAmount||0).toLocaleString('en-IN')}` : undefined} loading={loading} color="red" />
        <StatCard label="Collection Rate" value={stats ? `${stats.collectionRate}%` : undefined} loading={loading} color="green" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[{l:'Collect Fee',h:'/fees'},{l:'Create Invoice',h:'/fees'},{l:'View Receipts',h:'/accountant/receipts'},{l:'Expenses',h:'/accountant/expenses'},{l:'Fee Reports',h:'/reports'},{l:'Due List',h:'/fees'}].map(i=>(
              <Link key={i.l} href={i.h} className="text-sm text-blue-600 hover:text-blue-700 py-1.5 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">{i.l}</Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Students</span><span className="font-medium text-slate-900 dark:text-white">{stats?.totalStudents || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Invoices Generated</span><span className="font-medium text-slate-900 dark:text-white">{stats?.totalInvoices || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payments Received</span><span className="font-medium text-emerald-600">{stats?.paidInvoices || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({label,value,loading,color}:{label:string;value?:number|string;loading:boolean;color?:string}) {
  const textColor = color === 'red' ? 'text-red-600' : color === 'green' ? 'text-emerald-600' : 'text-slate-900 dark:text-white';
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      {loading ? <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /> : <p className={`mt-1 text-xl font-bold ${textColor}`}>{value ?? 0}</p>}
    </div>
  );
}
