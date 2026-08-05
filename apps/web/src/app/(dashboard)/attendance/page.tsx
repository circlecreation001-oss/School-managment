'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { TableSearch } from '@/components/ui/table-search';
import { CalendarCheck, UserCheck, UserX } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  attendanceDate: string;
  status: string;
  student?: { firstName: string; lastName: string; admissionNumber: string };
  teacher?: { firstName: string; lastName: string };
  staff?: { firstName: string; lastName: string };
  class?: { name: string };
  remarks: string | null;
}

const statusColor: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  half_day: 'bg-orange-100 text-orange-700',
  leave: 'bg-blue-100 text-blue-700',
  holiday: 'bg-purple-100 text-purple-700',
};

function AttendanceContent() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'student' | 'teacher' | 'staff'>('student');

  // Stats
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('date', date);
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);

      const endpoint = type === 'student'
        ? `/attendance/students/daily?${params}`
        : `/attendance/${type}s/daily?${params}`;

      const res = await apiClient.get<any>(endpoint);
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : res.data.records || res.data.items || [];
        setRecords(items);
        setTotal(res.data.total || items.length);

        // Calculate stats
        const present = items.filter((r: any) => r.status === 'present').length;
        const absent = items.filter((r: any) => r.status === 'absent').length;
        const late = items.filter((r: any) => r.status === 'late').length;
        setStats({ present, absent, late, total: items.length });
      }
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [date, type, page, search]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* STATS CARDS */}
      <div className="flex gap-4 justify-between flex-wrap">
        <div className="rounded-2xl bg-lamaSkyLight p-4 flex-1 min-w-[130px]">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Present</span>
          </div>
          <h1 className="text-2xl font-semibold mt-2">{stats.present}</h1>
        </div>
        <div className="rounded-2xl bg-lamaPurpleLight p-4 flex-1 min-w-[130px]">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-500">Absent</span>
          </div>
          <h1 className="text-2xl font-semibold mt-2">{stats.absent}</h1>
        </div>
        <div className="rounded-2xl bg-lamaYellowLight p-4 flex-1 min-w-[130px]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-500">Late</span>
          </div>
          <h1 className="text-2xl font-semibold mt-2">{stats.late}</h1>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 flex-1 min-w-[130px] border border-slate-200">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h1 className="text-2xl font-semibold mt-2">{stats.total}</h1>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-md">
        {/* TOP BAR */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-lg font-semibold">Attendance Records</h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm focus:ring-primary-500 focus:outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm focus:ring-primary-500 focus:outline-none"
            >
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="staff">Staff</option>
            </select>
            <TableSearch />
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No attendance records for this date.</p>
          </div>
        ) : (
          <table className="w-full mt-4">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th className="p-2">Name</th>
                <th className="hidden md:table-cell p-2">Date</th>
                <th className="p-2">Status</th>
                <th className="hidden lg:table-cell p-2">Class</th>
                <th className="hidden lg:table-cell p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                >
                  <td className="flex items-center gap-4 p-4">
                    <div className="h-10 w-10 rounded-full bg-lamaSky flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {r.student
                          ? `${r.student.firstName?.charAt(0)}${r.student.lastName?.charAt(0)}`
                          : r.teacher
                            ? `${r.teacher.firstName?.charAt(0)}${r.teacher.lastName?.charAt(0)}`
                            : '??'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold">
                        {r.student
                          ? `${r.student.firstName} ${r.student.lastName}`
                          : r.teacher
                            ? `${r.teacher.firstName} ${r.teacher.lastName}`
                            : r.staff
                              ? `${r.staff.firstName} ${r.staff.lastName}`
                              : '—'}
                      </h3>
                      {r.student?.admissionNumber && (
                        <p className="text-xs text-gray-500">{r.student.admissionNumber}</p>
                      )}
                    </div>
                  </td>
                  <td className="hidden md:table-cell p-2">
                    {new Date(r.attendanceDate).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[r.status] || 'bg-slate-100 text-slate-600'}`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell p-2 text-sm text-gray-500">
                    {r.class?.name || '—'}
                  </td>
                  <td className="hidden lg:table-cell p-2 text-xs text-gray-400">
                    {r.remarks || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        <Pagination page={page} count={total} />
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <AttendanceContent />
    </Suspense>
  );
}
