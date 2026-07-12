'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { apiClient } from '@/lib/api-client';

interface HomeworkItem {
  id: string; title: string; description: string | null; dueDate: string;
  status: string; maxMarks: number | null;
  class?: { name: string }; subject?: { name: string }; teacher?: { firstName: string; lastName: string };
}

export default function HomeworkPage() {
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>('/homework?limit=30');
    if (res.success && res.data) setItems(Array.isArray(res.data) ? res.data : res.data.homework || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const statusColor: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600', published: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700', archived: 'bg-purple-100 text-purple-700',
  };

  return (
    <>
      <PageHeader title="Homework & Assignments" description="Create, manage, and review homework assignments." />
      {loading ? (
        <div className="space-y-2">{Array.from({length: 6}).map((_, i) => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-500">No homework assignments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((hw) => (
            <div key={hw.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{hw.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {hw.class && <span>{hw.class.name}</span>}
                    {hw.subject && <span>• {hw.subject.name}</span>}
                    {hw.teacher && <span>• {hw.teacher.firstName} {hw.teacher.lastName}</span>}
                  </div>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[hw.status] || 'bg-slate-100'}`}>{hw.status}</span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                {hw.maxMarks && <span>Max Marks: {hw.maxMarks}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
