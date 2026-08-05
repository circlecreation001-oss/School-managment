'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { apiClient } from '@/lib/api-client';
import { UserCard } from '@/components/ui/user-card';
import { CountChart } from '@/components/charts/count-chart';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { FinanceChart } from '@/components/charts/finance-chart';
import { Announcements } from '@/components/ui/announcements';
import { EventCalendar } from '@/components/calendar/event-calendar';
import { EventList } from '@/components/calendar/event-list';
import { GraduationCap, Users, CalendarCheck, IndianRupee, FileText, BookOpen, UserPlus, Bell } from 'lucide-react';

interface DashboardStats {
  students: number;
  teachers: number;
  parents: number;
  staff: number;
  todayPresent: number;
  todayAbsent: number;
  pendingFees: number;
  upcomingExams: number;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date') || undefined;
  const { user } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const canViewStudents = hasAnyPermission(['students:view']);
  const canViewTeachers = hasAnyPermission(['teachers:view']);
  const canViewAttendance = hasAnyPermission(['attendance:view']);
  const canViewFinance = hasAnyPermission(['fees:view']);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [studentsRes, teachersRes, parentsRes, usersRes, attendanceRes, feesRes, examsRes] = await Promise.all([
          apiClient.get<any>('/students?page=1&limit=1'),
          apiClient.get<any>('/teachers?page=1&limit=1'),
          apiClient.get<any>('/students/parents?page=1&limit=1'),
          apiClient.get<any>('/users?page=1&limit=1'),
          apiClient.get<any>(`/attendance/students/daily?date=${new Date().toISOString().split('T')[0]}`),
          apiClient.get<any>('/fees/invoices?status=overdue&page=1&limit=1'),
          apiClient.get<any>('/exams?status=scheduled&page=1&limit=1'),
        ]);

        const todayRecords = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
        setStats({
          students: (studentsRes as any).meta?.total || 0,
          teachers: (teachersRes as any).meta?.total || 0,
          parents: (parentsRes as any).meta?.total || 0,
          staff: (usersRes as any).meta?.total || 0,
          todayPresent: todayRecords.filter((r: any) => r.status === 'present').length,
          todayAbsent: todayRecords.filter((r: any) => r.status === 'absent').length,
          pendingFees: (feesRes as any).meta?.total || 0,
          upcomingExams: (examsRes as any).meta?.total || 0,
        });
      } catch {
        // Stats will remain null
      }
    };

    const loadActivity = async () => {
      try {
        const res = await apiClient.get<any>('/reports/dashboard');
        if (res.success && res.data) {
          setRecentActivity(Array.isArray(res.data.recentActivity) ? res.data.recentActivity.slice(0, 5) : []);
        }
      } catch {
        setRecentActivity([]);
      }
    };

    loadStats();
    loadActivity();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.firstName}. Here's your institution overview.</p>
        </div>
        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {canViewStudents && (
            <Link href="/students" className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors">
              <UserPlus className="h-3.5 w-3.5" /> Add Student
            </Link>
          )}
          {canViewAttendance && (
            <Link href="/attendance" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <CalendarCheck className="h-3.5 w-3.5" /> Mark Attendance
            </Link>
          )}
          {canViewFinance && (
            <Link href="/fees" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <IndianRupee className="h-3.5 w-3.5" /> Collect Fees
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {canViewStudents && <UserCard type="student" />}
        {canViewTeachers && <UserCard type="teacher" />}
        <UserCard type="parent" />
        <UserCard type="staff" />
      </div>

      {/* Today's Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.todayPresent}</p>
              <p className="text-xs text-slate-500">Present Today</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.todayAbsent}</p>
              <p className="text-xs text-slate-500">Absent Today</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingFees}</p>
              <p className="text-xs text-slate-500">Pending Fees</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.upcomingExams}</p>
              <p className="text-xs text-slate-500">Upcoming Exams</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Recent Activity + Announcements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {recentActivity.length > 0 && (
          <div className="card p-6">
            <h2 className="text-section-title text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Bell className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {item.action || item.message || 'Activity'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <Announcements />
      </div>
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