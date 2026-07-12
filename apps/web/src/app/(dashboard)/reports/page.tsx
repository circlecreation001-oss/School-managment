'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { apiClient } from '@/lib/api-client';

export default function ReportsPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>('/reports/dashboard');
    if (res.success && res.data) setKpis(res.data.kpis || res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const reports = [
    { label: 'Attendance Report', desc: 'Class-wise and date-range attendance', icon: 'CalendarCheck', href: '#' },
    { label: 'Fee Collection', desc: 'Revenue and collection summary', icon: 'IndianRupee', href: '#' },
    { label: 'Student Report', desc: 'Demographics and enrollment', icon: 'GraduationCap', href: '#' },
    { label: 'Teacher Report', desc: 'Staff and workload analysis', icon: 'Users', href: '#' },
    { label: 'Exam Analytics', desc: 'Results, averages, and top performers', icon: 'FileText', href: '#' },
    { label: 'Revenue Trend', desc: 'Monthly revenue and fee trends', icon: 'BarChart3', href: '#' },
  ];

  return (
    <>
      <PageHeader title="Reports & Analytics" description="View institutional reports and key metrics." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Students', value: kpis?.totalStudents ?? '—' },
          { label: 'Teachers', value: kpis?.totalTeachers ?? '—' },
          { label: 'Fee Collected', value: kpis ? `₹${(kpis.paidInvoices || 0).toLocaleString()}` : '—' },
          { label: 'Collection %', value: kpis ? `${kpis.collectionRate || 0}%` : '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {loading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /> : s.value}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Available Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <div key={r.label} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <SidebarIcon name={r.icon} className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100">{r.label}</h3>
            </div>
            <p className="text-xs text-slate-500">{r.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}
