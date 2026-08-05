'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface StudentProfile {
  id: string;
  classId: string;
}

interface TimetableEntry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subject?: { name: string; code: string };
  teacher?: { firstName: string; lastName: string };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const meRes = await apiClient.get<StudentProfile>('/students/me');
      if (meRes.success && meRes.data) {
        setClassId(meRes.data.classId);
      } else {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!classId) return;
    const load = async () => {
      setLoading(true);
      const res = await apiClient.get<TimetableEntry[]>(`/academics/timetable?classId=${classId}`);
      if (res.success) {
        setEntries(Array.isArray(res.data) ? res.data : []);
      }
      setLoading(false);
    };
    load();
  }, [classId]);

  const entriesByDay = DAYS.map((_, dayIndex) => ({
    day: DAYS[dayIndex],
    entries: entries.filter((e) => e.dayOfWeek === dayIndex),
  }));

  const hasEntries = entries.length > 0;

  return (
    <>
      <PageHeader title="Timetable" description="Your weekly class schedule." />
      {loading ? (
        <TableSkeleton rows={8} />
      ) : !hasEntries ? (
        <EmptyState title="Timetable not yet configured" description="Your class timetable will be displayed here once set up by the admin." />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
          <div className="grid grid-cols-6 border-b bg-slate-50 dark:bg-slate-800">
            {DAYS.slice(1).map((d) => (
              <div key={d} className="px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-6 min-h-[300px]">
            {entriesByDay.slice(1).map(({ day, entries: dayEntries }) => (
              <div key={day} className="border-r last:border-r-0 border-slate-100 dark:border-slate-800 p-2 space-y-2">
                {dayEntries.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No classes</p>
                ) : (
                  dayEntries.map((entry) => (
                    <div key={entry.id} className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2 text-xs">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{entry.subject?.name || 'Subject'}</p>
                      <p className="text-slate-500">{entry.startTime} - {entry.endTime}</p>
                      {entry.teacher && (
                        <p className="text-slate-400 mt-0.5">{entry.teacher.firstName} {entry.teacher.lastName}</p>
                      )}
                      {entry.room && <p className="text-slate-400">Room: {entry.room}</p>}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}