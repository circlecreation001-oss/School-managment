'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { apiClient } from '@/lib/api-client';

interface DashboardKPIs {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingFeeAmount: number;
  collectionRate: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/reports/dashboard');
      if (res.success && res.data) setKpis(res.data.kpis || res.data);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const stats = [
    { label: 'Total Students', value: kpis?.totalStudents ?? '—', icon: 'GraduationCap', color: 'primary' },
    { label: 'Total Teachers', value: kpis?.totalTeachers ?? '—', icon: 'Users', color: 'accent' },
    { label: 'Fee Collected', value: kpis ? `₹${(kpis.paidInvoices || 0).toLocaleString()}` : '—', icon: 'IndianRupee', color: 'success' },
    { label: 'Collection Rate', value: kpis ? `${kpis.collectionRate || 0}%` : '—', icon: 'CalendarCheck', color: 'warning' },
  ];

  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-purple-900/20 dark:text-purple-400',
    success: 'bg-success-50 text-success-600 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  };

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${user?.firstName || 'Admin'}. Here's what's happening today.`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {loading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /> : stat.value}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${colorMap[stat.color]}`}>
                <SidebarIcon name={stat.icon} className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 dark:border-slate-700 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Add Student', icon: 'UserPlus', href: '/students' },
              { label: 'Mark Attendance', icon: 'CalendarCheck', href: '/attendance' },
              { label: 'Create Invoice', icon: 'FileText', href: '/fees' },
              { label: 'Schedule Exam', icon: 'BookOpen', href: '/exams' },
              { label: 'Assign Homework', icon: 'BookOpen', href: '/homework' },
              { label: 'Issue Book', icon: 'Library', href: '/library' },
              { label: 'Send Notice', icon: 'Bell', href: '/notifications' },
              { label: 'View Reports', icon: 'BarChart3', href: '/reports' },
            ].map((action) => (
              <a key={action.label} href={action.href} className="flex flex-col items-center gap-2 rounded-lg p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <SidebarIcon name={action.icon} className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 dark:border-slate-700 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Notices</h2>
          </div>
          <div className="p-5 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">No announcements at this time.</p>
          </div>
        </div>
      </div>
    </>
  );
}
