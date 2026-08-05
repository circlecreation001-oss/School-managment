'use client';

import { Suspense } from 'react';
import { Announcements } from '@/components/ui/announcements';
import { BigCalendar } from '@/components/calendar/big-calendar';

function TeacherDashboardContent() {
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white dark:bg-slate-900 p-4 rounded-md">
          <h1 className="text-xl font-semibold">My Schedule</h1>
          <div className="h-[800px]">
            <BigCalendar />
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
}

export default function TeacherPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <TeacherDashboardContent />
    </Suspense>
  );
}
