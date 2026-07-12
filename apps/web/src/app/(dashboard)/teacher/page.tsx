'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ classes: 0, homework: 0, exams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [hwRes] = await Promise.all([
          apiClient.get<any>('/homework?limit=5&status=published'),
        ]);
        if (hwRes.success && hwRes.data) {
          const hw = Array.isArray(hwRes.data) ? hwRes.data : hwRes.data.homework || [];
          setStats({ classes: 5, homework: hw.length, exams: 2 });
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const quickLinks = [
    { label: 'My Classes', href: '/teacher/classes', icon: 'Users' },
    { label: 'Mark Attendance', href: '/teacher/attendance', icon: 'CalendarCheck' },
    { label: 'Assign Homework', href: '/teacher/homework', icon: 'BookOpen' },
    { label: 'Study Material', href: '/teacher/materials', icon: 'FolderOpen' },
    { label: 'Exams & Marks', href: '/teacher/exams', icon: 'FileText' },
    { label: 'My Timetable', href: '/teacher/timetable', icon: 'CalendarCheck' },
    { label: 'Leave Requests', href: '/teacher/leaves', icon: 'UserCheck' },
    { label: 'Messages', href: '/teacher/messages', icon: 'Bell' },
  ];

  return (
    <>
      <PageHeader title="Teacher Dashboard" description="Your classes, assignments, and schedule at a glance." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'My Classes', v: loading ? '—' : stats.classes, icon: 'Users', color: 'bg-blue-50 text-blue-600' },
          { l: 'Active Homework', v: loading ? '—' : stats.homework, icon: 'BookOpen', color: 'bg-green-50 text-green-600' },
          { l: 'Today\'s Periods', v: '—', icon: 'CalendarCheck', color: 'bg-purple-50 text-purple-600' },
          { l: 'Upcoming Exams', v: loading ? '—' : stats.exams, icon: 'FileText', color: 'bg-orange-50 text-orange-600' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{s.l}</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{s.v}</p></div>
              <div className={`rounded-lg p-2.5 ${s.color}`}><SidebarIcon name={s.icon} className="h-5 w-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map(link => (
          <Link key={link.href} href={link.href} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900">
            <SidebarIcon name={link.icon} className="h-5 w-5 text-primary-600" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{link.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
