'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function HRDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any>('/reports/dashboard').then(res => { if (res.success) setStats(res.data?.kpis || res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">HR & Payroll Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Staff management, attendance, leave, and payroll.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Teachers</p>
          {loading ? <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200" /> : <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{stats?.totalTeachers || 0}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Staff</p>
          {loading ? <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200" /> : <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{stats?.totalStaff || 0}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total Employees</p>
          {loading ? <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200" /> : <p className="mt-1 text-xl font-bold text-blue-600">{(stats?.totalTeachers||0)+(stats?.totalStaff||0)}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Module</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">Active</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[{l:'All Teachers',h:'/teachers'},{l:'Staff List',h:'/hr/staff'},{l:'Leave Requests',h:'/hr/leaves'},{l:'Payroll',h:'/hr/payroll'},{l:'Attendance',h:'/attendance'},{l:'Reports',h:'/reports'}].map(i=>(
              <Link key={i.l} href={i.h} className="block text-sm text-blue-600 hover:text-blue-700 py-1">{i.l} &rarr;</Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Pending</h3>
          <p className="text-sm text-slate-500">Leave requests and payroll actions will appear here.</p>
        </div>
      </div>
    </div>
  );
}
