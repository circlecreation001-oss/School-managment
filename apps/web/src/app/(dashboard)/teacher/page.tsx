'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [hwRes, examRes] = await Promise.all([
          apiClient.get<any>('/homework?status=published&limit=50'),
          apiClient.get<any>('/exams?limit=10'),
        ]);
        setStats({
          homework: hwRes.success ? (Array.isArray(hwRes.data) ? hwRes.data.length : 0) : 0,
          exams: examRes.success ? (Array.isArray(examRes.data) ? examRes.data.length : 0) : 0,
        });
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const links = [
    { label: 'Mark Attendance', href: '/teacher/attendance', icon: 'CalendarCheck' },
    { label: 'Homework', href: '/teacher/homework', icon: 'BookOpen' },
    { label: 'Study Material', href: '/teacher/materials', icon: 'FolderOpen' },
    { label: 'Marks Entry', href: '/teacher/exams', icon: 'FileText' },
    { label: 'My Timetable', href: '/teacher/timetable', icon: 'CalendarCheck' },
    { label: 'Leave Requests', href: '/teacher/leaves', icon: 'UserCheck' },
    { label: 'Messages', href: '/teacher/messages', icon: 'Bell' },
    { label: 'My Profile', href: '/settings/profile', icon: 'UserCheck' },
  ];

  return (
    <>
      <PageHeader title="Teacher Dashboard" description="Your classes, assignments, and schedule at a glance." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Active Homework', v: loading ? '—' : stats?.homework, color: 'bg-green-50 text-green-600' },
          { l: 'Upcoming Exams', v: loading ? '—' : stats?.exams, color: 'bg-blue-50 text-blue-600' },
          { l: 'Today\'s Classes', v: '—', color: 'bg-purple-50 text-purple-600' },
          { l: 'Pending Leaves', v: '—', color: 'bg-orange-50 text-orange-600' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{s.l}</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{s.v}</p></div>
              <div className={`rounded-lg p-2.5 ${s.color}`}><SidebarIcon name="BookOpen" className="h-5 w-5" /></div>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
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
