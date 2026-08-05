'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function ReceptionDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any>('/reports/dashboard').then(res => { if (res.success) setStats(res.data?.kpis || res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reception Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Admissions, enquiries, and visitor management.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total Students</p>
          {loading ? <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200" /> : <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{stats?.totalStudents || 0}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Status</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">Active</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Module</p>
          <p className="mt-1 text-xl font-bold text-blue-600">Reception</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[{l:'New Admission',h:'/admissions'},{l:'Enquiries',h:'/reception/enquiries'},{l:'Register Student',h:'/reception/register'},{l:'View Students',h:'/students'},{l:'Parents',h:'/parents'}].map(i=>(
              <Link key={i.l} href={i.h} className="block text-sm text-blue-600 hover:text-blue-700 py-1">{i.l} &rarr;</Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Recent Enquiries</h3>
          <p className="text-sm text-slate-500">Enquiries and admission requests will appear here.</p>
          <Link href="/reception/enquiries" className="text-sm text-blue-600 mt-3 inline-block">View all &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
