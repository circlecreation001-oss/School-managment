'use client';

import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/common';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetablePage() {
  // Timetable is currently managed at DB level. Static display for now.
  return (
    <>
      <PageHeader title="Timetable" description="Your weekly class schedule." />
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        <div className="grid grid-cols-6 border-b bg-slate-50 dark:bg-slate-800">
          {DAYS.map(d => <div key={d} className="px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-700">{d}</div>)}
        </div>
        <div className="p-8">
          <EmptyState title="Timetable not yet configured" description="Your class timetable will be displayed here once set up by the admin." />
        </div>
      </div>
    </>
  );
}
