'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function PrincipalDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any>('/reports/dashboard').then(res => { if (res.success) setStats(res.data?.kpis || res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Principal Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Academic overview and institutional insights.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Students" value={stats?.totalStudents} loading={loading} />
        <StatCard label="Teachers" value={stats?.totalTeachers} loading={loading} />
        <StatCard label="Staff" value={stats?.totalStaff} loading={loading} />
        <StatCard label="Collection Rate" value={stats ? `${stats.collectionRate}%` : undefined} loading={loading} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Access</h3>
          <div className="space-y-2">
            {[{l:'View Students',h:'/students'},{l:'View Teachers',h:'/teachers'},{l:'Attendance Reports',h:'/reports'},{l:'Exam Results',h:'/exams'},{l:'Notifications',h:'/notifications'}].map(i=>(
              <Link key={i.h} href={i.h} className="block text-sm text-blue-600 hover:text-blue-700 py-1">{i.l} &rarr;</Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Approvals</h3>
          <p className="text-sm text-slate-500">No pending approvals at this time.</p>
          <Link href="/admissions" className="text-sm text-blue-600 mt-3 inline-block">View Admissions &rarr;</Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({label,value,loading}:{label:string;value?:number|string;loading:boolean}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      {loading ? <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /> : <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{value ?? 0}</p>}
    </div>
  );
}
