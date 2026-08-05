'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  eventType: string;
}

interface EventListProps {
  dateParam?: string;
}

export function EventList({ dateParam }: EventListProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const date = dateParam || new Date().toISOString();
        const res = await apiClient.get<any>(`/academics/calendar-events?date=${date}`);
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : res.data.items ?? [];
          setEvents(items);
        }
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [dateParam]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">No events for this date</p>
    );
  }

  const eventColors = [
    'border-l-blue-300 bg-blue-50',
    'border-l-yellow-300 bg-yellow-50',
    'border-l-purple-300 bg-purple-50',
    'border-l-pink-300 bg-pink-50',
  ];

  return (
    <div className="flex flex-col gap-3">
      {events.map((event, index) => (
        <div
          key={event.id}
          className={`p-4 rounded-md border-l-4 ${eventColors[index % eventColors.length]}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-600 text-sm">{event.title}</h3>
            <span className="text-xs text-gray-400">
              {new Date(event.startDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {event.description && (
            <p className="mt-1 text-xs text-gray-400">{event.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
