'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { CardSkeleton } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  expiredTenants: number;
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: Array<{
    id: string; action: string; entityType: string;
    createdAt: string; actor?: { firstName: string; lastName: string };
  }>;
  monthlyGrowth: Array<{ month: string; count: number }>;
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<DashboardData>('/saas/dashboard').then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Platform Overview" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  const stats = data?.stats;

  const CARDS = [
    { label: 'Total Organizations', value: stats?.totalTenants ?? 0, icon: 'Globe', color: 'primary' },
    { label: 'Active', value: stats?.activeTenants ?? 0, icon: 'CalendarCheck', color: 'success' },
    { label: 'Trial', value: stats?.trialTenants ?? 0, icon: 'Users', color: 'warning' },
    { label: 'Suspended', value: stats?.suspendedTenants ?? 0, icon: 'X', color: 'danger' },
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: 'Users', color: 'accent' },
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: 'GraduationCap', color: 'primary' },
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: 'BookOpen', color: 'success' },
    { label: 'Expired', value: stats?.expiredTenants ?? 0, icon: 'FileText', color: 'danger' },
  ];

  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
    success: 'bg-success-50 text-success-600 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    danger: 'bg-danger-50 text-danger-600 dark:bg-red-900/20 dark:text-red-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  return (
    <>
      <PageHeader title="Platform Overview" description="Super Admin Dashboard — Platform-wide metrics and activity." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{card.value.toLocaleString()}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${colorMap[card.color]}`}>
                <SidebarIcon name={card.icon} className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-700 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Platform Activity</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    <span className="font-medium">{item.actor?.firstName} {item.actor?.lastName}</span>{' '}
                    <span className="text-slate-500">{item.action}</span>{' '}
                    <span className="text-slate-700 dark:text-slate-300">{item.entityType}</span>
                  </p>
                </div>
                <time className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</time>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-sm text-slate-500 dark:text-slate-400">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </>
  );
}
