'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function ParentMessagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get<any>('/notifications?limit=20');
      if (res.success) setItems(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <PageHeader title="Notices & Communication" description="Messages from school and teachers." />
      {loading ? <TableSkeleton rows={5} /> : items.length === 0 ? (
        <EmptyState title="No notices" description="School notices and messages will appear here." />
      ) : (
        <div className="space-y-2">
          {items.map((n: any) => (
            <div key={n.id} className={`rounded-xl border p-4 ${n.readAt ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900' : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'}`}>
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
