'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface NotificationItem {
  id: string;
  subject?: string;
  body: string;
  readAt?: string;
  createdAt: string;
}

export default function StudentNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await apiClient.get<NotificationItem[]>('/notifications/me');
      if (res.success) {
        setItems(Array.isArray(res.data) ? res.data : []);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <PageHeader title="Notifications" description="Stay updated with important announcements." />
      {loading ? (
        <TableSkeleton rows={5} />
      ) : items.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className={`rounded-xl border p-4 transition-colors ${n.readAt ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900' : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'}`}>
              {n.subject && <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.subject}</h3>}
              <p className="text-sm text-slate-600 dark:text-slate-400">{n.body}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}