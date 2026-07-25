'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function ParentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [feeRes, hwRes] = await Promise.all([
          apiClient.get<any>('/fees/invoices?status=issued&limit=10'),
          apiClient.get<any>('/homework?status=published&limit=10'),
        ]);
        setStats({
          pendingFees: feeRes.success ? (Array.isArray(feeRes.data) ? feeRes.data.length : 0) : 0,
          homework: hwRes.success ? (Array.isArray(hwRes.data) ? hwRes.data.length : 0) : 0,
        });
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const links = [
    { label: 'Attendance', href: '/parent/attendance', icon: 'CalendarCheck' },
    { label: 'Fee Status', href: '/parent/fees', icon: 'IndianRupee' },
    { label: 'Homework', href: '/parent/homework', icon: 'BookOpen' },
    { label: 'Results', href: '/parent/results', icon: 'BarChart3' },
    { label: 'Notices', href: '/parent/messages', icon: 'Bell' },
    { label: 'Leave Request', href: '/parent/leaves', icon: 'UserCheck' },
  ];

  return (
    <>
      <PageHeader title="Parent Dashboard" description="Track your child's academic progress, attendance, and fees." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { l: 'Pending Fees', v: loading ? '—' : stats?.pendingFees, color: 'bg-red-50 text-red-600' },
          { l: 'Active Homework', v: loading ? '—' : stats?.homework, color: 'bg-yellow-50 text-yellow-600' },
          { l: 'Attendance %', v: '—', color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{s.l}</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{s.v}</p></div>
              <div className={`rounded-lg p-2.5 ${s.color}`}><SidebarIcon name="BarChart3" className="h-5 w-5" /></div>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {links.map(link => (
          <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
            <SidebarIcon name={link.icon} className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{link.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
