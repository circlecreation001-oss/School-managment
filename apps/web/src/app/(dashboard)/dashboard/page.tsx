'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { apiClient } from '@/lib/api-client';

interface KPIs {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingFeeAmount: number;
  collectionRate: number;
}

interface DashboardData {
  kpis: KPIs;
  revenueTrend: Array<{ month: string; amount: number }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<DashboardData>('/reports/dashboard');
      if (res.success && res.data) setData(res.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const k = data?.kpis;
  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{greeting}, {user?.firstName || 'Admin'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link href="/reports" className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-lg">View Reports</Link>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Students" value={k?.totalStudents} loading={loading} href="/students" color="blue" />
        <KPICard label="Teachers" value={k?.totalTeachers} loading={loading} href="/teachers" color="indigo" />
        <KPICard label="Staff" value={k?.totalStaff} loading={loading} href="/hr" color="purple" />
        <KPICard label="Invoices" value={k?.totalInvoices} loading={loading} href="/fees" color="slate" />
        <KPICard label="Paid" value={k?.paidInvoices} loading={loading} href="/fees" color="green" />
        <KPICard label="Collection" value={k ? `${k.collectionRate}%` : undefined} loading={loading} href="/reports" color="amber" />
      </div>

      {/* KPI Row 2 - Financial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending Fees</p>
          {loading ? <Skeleton /> : <p className="text-xl font-bold text-red-600 mt-1">&#8377;{(k?.pendingFeeAmount || 0).toLocaleString('en-IN')}</p>}
          <Link href="/fees" className="text-[11px] text-blue-600 mt-2 inline-block">View details &rarr;</Link>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Revenue</p>
          {loading ? <Skeleton /> : <p className="text-xl font-bold text-emerald-600 mt-1">&#8377;{((data?.revenueTrend?.slice(-1)[0]?.amount) || 0).toLocaleString('en-IN')}</p>}
          <Link href="/reports" className="text-[11px] text-blue-600 mt-2 inline-block">Revenue report &rarr;</Link>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Revenue ({today.getFullYear()})</p>
          {loading ? <Skeleton /> : <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">&#8377;{(data?.revenueTrend?.reduce((s, r) => s + r.amount, 0) || 0).toLocaleString('en-IN')}</p>}
          <Link href="/reports" className="text-[11px] text-blue-600 mt-2 inline-block">Annual report &rarr;</Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
            <span className="text-[11px] text-slate-400">{today.getFullYear()}</span>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />)}</div>
            ) : data?.revenueTrend && data.revenueTrend.length > 0 ? (
              <div className="space-y-1.5">
                {data.revenueTrend.map((r) => {
                  const max = Math.max(...data.revenueTrend.map(x => x.amount), 1);
                  return (
                    <div key={r.month} className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 w-14 shrink-0 font-mono">{r.month.slice(5)}/{r.month.slice(2,4)}</span>
                      <div className="flex-1 h-5 bg-slate-50 dark:bg-slate-800 rounded-md overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md" style={{ width: `${(r.amount / max) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 w-16 text-right">&#8377;{r.amount >= 1000 ? `${(r.amount/1000).toFixed(0)}K` : r.amount}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState message="No revenue data yet. Start collecting fees." />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="p-2 grid grid-cols-2 gap-1">
            {[
              { label: 'Add Student', href: '/students', emoji: '🎓' },
              { label: 'Take Attendance', href: '/attendance', emoji: '✅' },
              { label: 'Collect Fee', href: '/fees', emoji: '💰' },
              { label: 'Create Exam', href: '/exams', emoji: '📝' },
              { label: 'Homework', href: '/homework', emoji: '📖' },
              { label: 'Issue Book', href: '/library', emoji: '📚' },
              { label: 'Import Data', href: '/import', emoji: '📤' },
              { label: 'Send Notice', href: '/notifications', emoji: '🔔' },
              { label: 'Add Teacher', href: '/teachers', emoji: '👨‍🏫' },
              { label: 'View Reports', href: '/reports', emoji: '📊' },
            ].map((a) => (
              <Link key={a.label} href={a.href} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-base">{a.emoji}</span>
                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Modules */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Modules</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {[
              { label: 'Students', href: '/students', count: k?.totalStudents || 0 },
              { label: 'Teachers', href: '/teachers', count: k?.totalTeachers || 0 },
              { label: 'Staff', href: '/hr', count: k?.totalStaff || 0 },
              { label: 'Academics', href: '/academics', count: 'Manage' },
              { label: 'Library', href: '/library', count: 'Books' },
              { label: 'Website', href: '/website', count: 'CMS' },
            ].map((m) => (
              <Link key={m.label} href={m.href} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-sm text-slate-700 dark:text-slate-300">{m.label}</span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{m.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="p-4 space-y-3">
            <ActivityItem time="Just now" text="Dashboard loaded" />
            <ActivityItem time="Today" text="Session started" />
            <ActivityItem time="" text="System healthy" />
            <p className="text-[11px] text-slate-400 text-center pt-2">Activity logs appear as you use the system.</p>
          </div>
        </div>

        {/* System */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">System</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Platform</span><span className="text-slate-900 dark:text-white font-medium">SchoolNex v1.0</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Status</span><span className="text-emerald-600 font-medium">Active</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Role</span><span className="text-slate-900 dark:text-white font-medium capitalize">{user?.roles?.[0]?.replace(/_/g, ' ') || 'Admin'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Email</span><span className="text-slate-700 dark:text-slate-300 text-xs truncate max-w-[160px]">{user?.email}</span></div>
            <hr className="border-slate-100 dark:border-slate-800" />
            <div className="flex gap-2">
              <Link href="/settings" className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Settings</Link>
              <Link href="/import" className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Import</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, loading, href, color }: { label: string; value?: number | string; loading: boolean; href: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'border-l-blue-500', indigo: 'border-l-indigo-500', purple: 'border-l-purple-500',
    green: 'border-l-emerald-500', amber: 'border-l-amber-500', slate: 'border-l-slate-400', red: 'border-l-red-500',
  };
  return (
    <Link href={href} className={`rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 ${colors[color] || ''} bg-white dark:bg-slate-900 p-3 hover:shadow-sm transition-shadow`}>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      {loading ? <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /> : (
        <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{value ?? 0}</p>
      )}
    </Link>
  );
}

function Skeleton() {
  return <div className="mt-1 h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

function ActivityItem({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
      <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{text}</span>
      {time && <span className="text-[10px] text-slate-400">{time}</span>}
    </div>
  );
}
