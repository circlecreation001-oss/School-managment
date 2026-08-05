'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

interface NotificationItem {
  id: string;
  subject: string | null;
  body: string;
  channel: string;
  status: string;
  readAt: string | null;
  createdAt: string;
}

const channelIcon: Record<string, any> = {
  email: Mail,
  sms: Smartphone,
  whatsapp: MessageSquare,
  in_app: Bell,
  push: Bell,
};

const bgColors = ['bg-lamaSkyLight', 'bg-lamaPurpleLight', 'bg-lamaYellowLight'];

function NotificationsContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');

      const res = await apiClient.get<any>(`/notifications?${params}`);
      if (res.success && res.data) {
        setItems(Array.isArray(res.data) ? res.data : res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await apiClient.patch<any>(`/notifications/${id}/read`);
    setItems(items.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Notifications</h1>
        <span className="text-xs text-gray-400">
          {items.filter(n => !n.readAt).length} unread
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n, idx) => {
            const Icon = channelIcon[n.channel] || Bell;
            return (
              <div
                key={n.id}
                onClick={() => !n.readAt && markRead(n.id)}
                className={`p-4 rounded-xl cursor-pointer transition-colors border-l-4 ${
                  n.readAt
                    ? 'border-l-gray-200 bg-white dark:bg-slate-800'
                    : 'border-l-primary-500 bg-primary-50 dark:bg-primary-900/10'
                } hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${bgColors[idx % bgColors.length]}`}>
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {n.subject && (
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {n.subject}
                      </h3>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      <span className="capitalize">{n.channel.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {!n.readAt && (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary-500 shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} count={total} />
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <NotificationsContent />
    </Suspense>
  );
}
