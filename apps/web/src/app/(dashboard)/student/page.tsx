'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function StudentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [attRes, hwRes, feeRes] = await Promise.all([
          apiClient.get<any>('/attendance/students/daily?classId=all&date=' + new Date().toISOString().split('T')[0]),
          apiClient.get<any>('/homework?status=published&limit=5'),
          apiClient.get<any>('/fees/invoices?limit=5&status=issued'),
        ]);
        setStats({
          attendance: attRes.success ? (attRes.data?.length || 0) : 0,
          homework: hwRes.success ? (Array.isArray(hwRes.data) ? hwRes.data.length : 0) : 0,
          pendingFees: feeRes.success ? (Array.isArray(feeRes.data) ? feeRes.data.length : 0) : 0,
        });
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const links = [
    { label: 'Attendance', href: '/student/attendance', icon: 'CalendarCheck' },
    { label: 'Homework', href: '/student/homework', icon: 'BookOpen' },
    { label: 'Study Material', href: '/student/materials', icon: 'FolderOpen' },
    { label: 'Fee Status', href: '/student/fees', icon: 'IndianRupee' },
    { label: 'Online Exams', href: '/student/exams', icon: 'FileText' },
    { label: 'Results', href: '/student/results', icon: 'BarChart3' },
    { label: 'Timetable', href: '/student/timetable', icon: 'CalendarCheck' },
    { label: 'My Profile', href: '/student/profile', icon: 'UserCheck' },
  ];

  return (
    <>
      <PageHeader title="Student Dashboard" description="Your academic progress at a glance." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { l: 'Today\'s Attendance', v: loading ? '—' : (stats?.attendance > 0 ? 'Marked' : 'Pending'), color: 'bg-green-50 text-green-600' },
          { l: 'Pending Homework', v: loading ? '—' : stats?.homework, color: 'bg-yellow-50 text-yellow-600' },
          { l: 'Unpaid Fees', v: loading ? '—' : stats?.pendingFees, color: 'bg-red-50 text-red-600' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5">
            <p className="text-sm text-slate-500">{s.l}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{s.v}</p>
          </div>
        ))}
      </div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {links.map(link => (
          <Link key={link.href} href={link.href} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
            <SidebarIcon name={link.icon} className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{link.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
