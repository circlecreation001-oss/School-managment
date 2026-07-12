'use client';

import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import Link from 'next/link';

export default function StudentDashboard() {
  const quickLinks = [
    { label: 'My Profile', href: '/student/profile', icon: 'UserCheck' },
    { label: 'Attendance', href: '/student/attendance', icon: 'CalendarCheck' },
    { label: 'Homework', href: '/student/homework', icon: 'BookOpen' },
    { label: 'Study Material', href: '/student/materials', icon: 'FolderOpen' },
    { label: 'Fee Status', href: '/student/fees', icon: 'IndianRupee' },
    { label: 'Online Exams', href: '/student/exams', icon: 'FileText' },
    { label: 'Results', href: '/student/results', icon: 'BarChart3' },
    { label: 'Timetable', href: '/student/timetable', icon: 'CalendarCheck' },
    { label: 'Notifications', href: '/student/notifications', icon: 'Bell' },
  ];

  return (
    <>
      <PageHeader title="Student Dashboard" description="Your academic progress, assignments, and schedule." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Attendance %', v: '—', icon: 'CalendarCheck', color: 'bg-green-50 text-green-600' },
          { l: 'Pending Homework', v: '—', icon: 'BookOpen', color: 'bg-yellow-50 text-yellow-600' },
          { l: 'Fee Due', v: '—', icon: 'IndianRupee', color: 'bg-red-50 text-red-600' },
          { l: 'Next Exam', v: '—', icon: 'FileText', color: 'bg-blue-50 text-blue-600' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{s.l}</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{s.v}</p></div>
              <div className={`rounded-lg p-2.5 ${s.color}`}><SidebarIcon name={s.icon} className="h-5 w-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Access</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
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
