'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { UserCard } from '@/components/ui/user-card';
import { CountChart } from '@/components/charts/count-chart';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { FinanceChart } from '@/components/charts/finance-chart';
import { Announcements } from '@/components/ui/announcements';
import { EventCalendar } from '@/components/calendar/event-calendar';
import { EventList } from '@/components/calendar/event-list';

function DashboardContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date') || undefined;
  const { user } = useAuth();
  const { hasAnyPermission } = usePermissions();

  const canViewStudents = hasAnyPermission(['students:view']);
  const canViewTeachers = hasAnyPermission(['teachers:view']);
  const canViewAttendance = hasAnyPermission(['attendance:view']);
  const canViewFinance = hasAnyPermission(['fees:view']);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-page-title text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.firstName}. Here&apos;s your institution overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {canViewStudents && <UserCard type="student" />}
        {canViewTeachers && <UserCard type="teacher" />}
        <UserCard type="parent" />
        <UserCard type="staff" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {canViewStudents && (
          <div className="card p-6 h-[400px]">
            <CountChart />
          </div>
        )}
        {canViewAttendance && (
          <div className="card p-6 h-[400px] lg:col-span-2">
            <AttendanceChart />
          </div>
        )}
      </div>

      {/* Finance + Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {canViewFinance && (
          <div className="card p-6 h-[400px] lg:col-span-2">
            <FinanceChart />
          </div>
        )}
        <div className="space-y-6">
          <div className="card p-5">
            <EventCalendar />
            <div className="mt-4">
              <EventList dateParam={dateParam} />
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <Announcements />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-card animate-pulse" />)}
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
