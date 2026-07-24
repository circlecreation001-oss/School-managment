'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const [y, m] = month.split('-');
    const start = `${y}-${m}-01`;
    const end = `${y}-${m}-${new Date(+y, +m, 0).getDate()}`;
    const res = await apiClient.get<any>(`/attendance/students/daily?classId=all&date=${start}`);
    if (res.success) setRecords(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, [month]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const statusColor: Record<string, string> = { present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700', late: 'bg-yellow-100 text-yellow-700', half_day: 'bg-orange-100 text-orange-700', leave: 'bg-blue-100 text-blue-700' };

  return (
    <>
      <PageHeader title="My Attendance" description="View your daily attendance record." />
      <div className="mb-6">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" />
      </div>
      {loading ? <TableSkeleton rows={10} /> : records.length === 0 ? (
        <EmptyState title="No attendance records" description="Your attendance for this period will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 dark:bg-slate-800"><th className="px-4 py-3 text-left font-medium">Date</th><th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-left font-medium">Remarks</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r: any) => (
                <tr key={r.id}><td className="px-4 py-3 text-slate-700 dark:text-slate-300">{new Date(r.attendanceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[r.status] || 'bg-slate-100'}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.remarks || '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
