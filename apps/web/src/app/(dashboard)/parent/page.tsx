'use client';

import { Suspense } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Announcements } from '@/components/ui/announcements';
import { EventCalendar } from '@/components/calendar/event-calendar';
import { EventList } from '@/components/calendar/event-list';
import { useSearchParams } from 'next/navigation';

function ParentDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date') || undefined;

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* Welcome Card */}
        <div className="bg-lamaPurpleLight p-6 rounded-xl">
          <h1 className="text-2xl font-semibold">
            Welcome, {user?.firstName || 'Parent'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay updated on your child&apos;s progress, attendance, and school activities.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Attendance</h3>
            <p className="text-2xl font-bold mt-1">-</p>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Fee Status</h3>
            <p className="text-2xl font-bold mt-1 text-green-600">Paid</p>
            <p className="text-xs text-gray-400 mt-1">Current term</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Homework</h3>
            <p className="text-2xl font-bold mt-1">-</p>
            <p className="text-xs text-gray-400 mt-1">Pending</p>
          </div>
        </div>

        <Announcements />
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
          <EventCalendar />
          <div className="mt-4">
            <EventList dateParam={dateParam} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <ParentDashboardContent />
    </Suspense>
  );
}
