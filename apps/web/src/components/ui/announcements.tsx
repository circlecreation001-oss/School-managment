'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Bell, ChevronRight } from 'lucide-react';

interface Announcement {
  id: string;
  subject?: string;
  body: string;
  createdAt: string;
}

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await apiClient.get<any>('/notifications?channel=in_app&limit=3');
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : res.data.items ?? [];
          setAnnouncements(items.slice(0, 3));
        }
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-section-title text-slate-900">Announcements</h2>
        <button className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
          View All <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No announcements yet</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="h-4 w-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.subject || 'Announcement'}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.body}</p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
