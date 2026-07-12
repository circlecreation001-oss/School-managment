'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { apiClient } from '@/lib/api-client';

interface AttendanceRecord {
  id: string;
  attendanceDate: string;
  status: string;
  student?: { firstName: string; lastName: string; admissionNumber: string };
  teacher?: { firstName: string; lastName: string };
  class?: { name: string };
  remarks: string | null;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('student');

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>(`/attendance/students/daily?date=${date}&classId=all`);
    if (res.success && res.data) setRecords(Array.isArray(res.data) ? res.data : res.data.records || []);
    setLoading(false);
  }, [date, type]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const statusColor: Record<string, string> = {
    present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700', half_day: 'bg-orange-100 text-orange-700',
    leave: 'bg-blue-100 text-blue-700', holiday: 'bg-purple-100 text-purple-700',
  };

  return (
    <>
      <PageHeader title="Attendance" description="Mark and view daily attendance records." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length: 8}).map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />)}</div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-500">No attendance records for this date.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Remarks</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {r.student ? `${r.student.firstName} ${r.student.lastName}` : r.teacher ? `${r.teacher.firstName} ${r.teacher.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(r.attendanceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[r.status] || 'bg-slate-100 text-slate-600'}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
