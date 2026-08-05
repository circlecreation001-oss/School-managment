'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Announcements } from '@/components/ui/announcements';
import { BigCalendar } from '@/components/calendar/big-calendar';
import { EventCalendar } from '@/components/calendar/event-calendar';
import { EventList } from '@/components/calendar/event-list';
import { apiClient } from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';

interface StudentProfile {
  id: string;
  admissionNumber: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  classId: string;
  sectionId?: string;
  class?: { name: string; code: string };
  section?: { name: string };
}

function StudentDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date') || undefined;
  const [student, setStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get<StudentProfile>('/students/me');
      if (res.success && res.data) {
        setStudent(res.data);
      }
    };
    load();
  }, []);

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* Welcome Card */}
        <div className="bg-lamaSkyLight p-6 rounded-xl">
          <h1 className="text-2xl font-semibold">
            Welcome, {user?.firstName || 'Student'}!
          </h1>
          {student && (
            <p className="text-sm text-gray-500 mt-1">
              {student.class?.name && <span>Class {student.class.name}{student.section?.name ? ` - Section ${student.section.name}` : ''}</span>}
              {student.admissionNumber && <span> • Admission #{student.admissionNumber}</span>}
              {student.rollNumber && <span> • Roll #{student.rollNumber}</span>}
            </p>
          )}
          {!student && (
            <p className="text-sm text-gray-500 mt-1">
              Here's your schedule and upcoming activities.
            </p>
          )}
        </div>
        {/* Schedule */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-md h-[800px]">
          <h1 className="text-xl font-semibold">My Schedule</h1>
          <BigCalendar />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
          <EventCalendar />
          <div className="mt-4">
            <EventList dateParam={dateParam} />
          </div>
        </div>
        <Announcements />
      </div>
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  );
}