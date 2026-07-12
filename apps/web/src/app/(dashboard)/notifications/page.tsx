'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { apiClient } from '@/lib/api-client';

interface NotificationItem {
  id: string; subject: string | null; body: string; channel: string;
  status: string; readAt: string | null; createdAt: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>('/notifications?limit=50');
    if (res.success && res.data) setItems(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const markRead = async (id: string) => {
    await apiClient.patch(`/notifications/${id}/read`);
    setItems(items.map(n => n.id === id ? { ...n, readAt: new Date().toISOString(), status: 'delivered' } : n));
  };

  return (
    <>
      <PageHeader title="Notifications" description="View and manage your notifications." />
      {loading ? (
        <div className="space-y-2">{Array.from({length: 6}).map((_, i) => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-500">No notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} onClick={() => !n.readAt && markRead(n.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-colors ${n.readAt ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900' : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'}`}>
              <div className="flex items-start justify-between">
                <div>
                  {n.subject && <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.subject}</h3>}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{n.body}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                  {!n.readAt && <span className="block mt-1 h-2 w-2 rounded-full bg-blue-500 ml-auto" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
