'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { apiClient } from '@/lib/api-client';

const localizer = momentLocalizer(moment);

interface TimetableEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export function BigCalendar() {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await apiClient.get<any>('/academics/timetable');
        if (res.success && res.data && Array.isArray(res.data)) {
          const mapped = res.data.map((item: any) => ({
            id: item.id,
            title: item.subjectName || item.title || 'Class',
            start: new Date(item.startTime || item.start),
            end: new Date(item.endTime || item.end),
          }));
          setEvents(mapped);
        }
      } catch {
        // Empty timetable
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={['work_week', 'day']}
      view={view}
      onView={setView}
      style={{ height: '98%' }}
      min={new Date(2024, 0, 1, 8, 0, 0)}
      max={new Date(2024, 0, 1, 17, 0, 0)}
    />
  );
}
