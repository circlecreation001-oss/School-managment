'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { apiClient } from '@/lib/api-client';

interface DashboardData {
  kpis: {
    totalStudents: number;
    totalTeachers: number;
    totalStaff: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingFeeAmount: number;
    collectionRate: number;
  };
  revenueTrend: Array<{ month: string; amount: number }>;
}

const QUICK_ACTIONS = [
  { label: 'Add Student', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', href: '/students' },
  { label: 'Take Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', href: '/attendance' },
  { label: 'Collect Fee', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', href: '/fees' },
  { label: 'Schedule Exam', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', href: '/exams' },
  { label: 'Assign Homework', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', href: '/homework' },
  { label: 'Issue Book', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', href: '/library' },
  { label: 'Send Notice', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', href: '/notifications' },
  { label: 'View Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', href: '/reports' },
];

function StatCard({ label, value, icon, color, href, loading }: { label: string; value: string | number; icon: string; color: string; href: string; loading: boolean }) {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-600 dark:text-blue-400' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', icon: 'text-indigo-600 dark:text-indigo-400' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', icon: 'text-amber-600 dark:text-amber-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: 'text-red-600 dark:text-red-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-600 dark:text-purple-400' },
  };
  const c = colors[color] || colors.blue!;

  return (
    <Link href={href} className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 ${c.bg} group-hover:scale-110 transition-transform`}>
          <svg className={`h-5 w-5 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<DashboardData>('/reports/dashboard');
      if (res.success && res.data) setData(res.data);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Welcome back, {user?.firstName || 'Admin'}. Here is your institute overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Students" value={kpis?.totalStudents ?? 0} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" color="blue" href="/students" loading={loading} />
        <StatCard label="Total Teachers" value={kpis?.totalTeachers ?? 0} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" color="indigo" href="/teachers" loading={loading} />
        <StatCard label="Total Staff" value={kpis?.totalStaff ?? 0} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" color="purple" href="/users" loading={loading} />
        <StatCard label="Fee Collected" value={kpis ? `₹${(kpis.paidInvoices || 0).toLocaleString('en-IN')}` : '₹0'} icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" color="green" href="/fees" loading={loading} />
        <StatCard label="Pending Fees" value={kpis ? `₹${(kpis.pendingFeeAmount || 0).toLocaleString('en-IN')}` : '₹0'} icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="red" href="/fees" loading={loading} />
        <StatCard label="Collection Rate" value={kpis ? `${kpis.collectionRate}%` : '0%'} icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" color="amber" href="/reports" loading={loading} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Area */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Revenue Trend ({new Date().getFullYear()})</h2>
            <Link href="/reports" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View Reports</Link>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ) : data?.revenueTrend && data.revenueTrend.length > 0 ? (
              <div className="space-y-2">
                {data.revenueTrend.slice(-6).map((item) => (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-16 shrink-0">{item.month}</span>
                    <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (item.amount / Math.max(...data.revenueTrend.map(r => r.amount), 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-20 text-right">&#8377;{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <svg className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  <p className="mt-2 text-sm text-slate-400">No revenue data yet. Start collecting fees to see trends.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.label} href={action.href} className="flex flex-col items-center gap-1.5 rounded-lg p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Modules</h2>
            <Link href="/academics" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { label: 'Academics', desc: 'Classes, Subjects, Sessions', href: '/academics', count: 'Manage' },
              { label: 'Attendance', desc: 'Mark and view attendance', href: '/attendance', count: 'Track' },
              { label: 'Examinations', desc: 'Exams, Marks, Results', href: '/exams', count: 'Grade' },
              { label: 'Homework', desc: 'Assign and review', href: '/homework', count: 'Assign' },
              { label: 'Library', desc: 'Books, Issues, Returns', href: '/library', count: 'Manage' },
              { label: 'Notifications', desc: 'Email, SMS, WhatsApp', href: '/notifications', count: 'Send' },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">{item.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Institute Overview</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Invoices</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{loading ? '...' : kpis?.totalInvoices ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Paid Invoices</span>
              <span className="text-sm font-semibold text-emerald-600">{loading ? '...' : kpis?.paidInvoices ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Subscription</span>
              <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Platform</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">SchoolNex v1.0</span>
            </div>
            <hr className="border-slate-100 dark:border-slate-800" />
            <div className="grid grid-cols-2 gap-3">
              <Link href="/settings" className="text-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Settings</p>
              </Link>
              <Link href="/website" className="text-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Website CMS</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
