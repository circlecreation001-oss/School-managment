'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function ParentHomeworkPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get<any>('/homework?status=published&limit=20');
      if (res.success) setItems(Array.isArray(res.data) ? res.data : res.data?.homework || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <PageHeader title="Child's Homework" description="Track homework assignments given to your child." />
      {loading ? <TableSkeleton rows={5} /> : items.length === 0 ? (
        <EmptyState title="No homework assigned" description="Homework for your child will appear here." />
      ) : (
        <div className="space-y-3">
          {items.map((hw: any) => (
            <div key={hw.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{hw.title}</h3>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    {hw.subject && <span>{hw.subject.name}</span>}
                    {hw.teacher && <span>• {hw.teacher.firstName} {hw.teacher.lastName}</span>}
                  </div>
                  {hw.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{hw.description}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${new Date(hw.dueDate) < new Date() ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {new Date(hw.dueDate) < new Date() ? 'Overdue' : 'Active'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Due: {new Date(hw.dueDate).toLocaleDateString()}{hw.maxMarks ? ` • Max Marks: ${hw.maxMarks}` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
