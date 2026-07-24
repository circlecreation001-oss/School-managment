'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function TeacherAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState('');

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>(`/attendance/students/daily?classId=all&date=${date}`);
    if (res.success) setRecords(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, [date]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const markAttendance = async (studentId: string, status: string) => {
    const res = await apiClient.post(`/attendance/students/${studentId}`, { date, status });
    if (res.success) { setToast(`Marked ${status}`); fetch_(); }
  };

  return (
    <>
      <PageHeader title="Mark Attendance" description="Mark daily attendance for your classes." />
      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      <div className="mb-6">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" />
      </div>

      {loading ? <TableSkeleton rows={10} /> : records.length === 0 ? (
        <EmptyState title="No students to mark" description="Select a date or check your assigned classes." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium">Student</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r: any) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{r.student?.firstName} {r.student?.lastName}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${r.status === 'present' ? 'bg-green-100 text-green-700' : r.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button onClick={() => markAttendance(r.studentId || r.id, 'present')} className="rounded px-2 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100">P</button>
                    <button onClick={() => markAttendance(r.studentId || r.id, 'absent')} className="rounded px-2 py-1 text-xs bg-red-50 text-red-700 hover:bg-red-100">A</button>
                    <button onClick={() => markAttendance(r.studentId || r.id, 'late')} className="rounded px-2 py-1 text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100">L</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
