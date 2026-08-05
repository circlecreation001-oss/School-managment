'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface StudentProfile {
  id: string;
  classId: string;
}

interface HomeworkItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  maxMarks?: number;
  status: string;
  subject?: { name: string };
  class?: { name: string };
  teacher?: { firstName: string; lastName: string };
}

export default function StudentHomeworkPage() {
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const meRes = await apiClient.get<StudentProfile>('/students/me');
      if (meRes.success && meRes.data) {
        setClassId(meRes.data.classId);
      } else {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!classId) return;
    const load = async () => {
      setLoading(true);
      const res = await apiClient.get<HomeworkItem[]>(`/homework?classId=${classId}&status=published&limit=30`);
      if (res.success) {
        setItems(Array.isArray(res.data) ? res.data : []);
      }
      setLoading(false);
    };
    load();
  }, [classId]);

  return (
    <>
      <PageHeader title="Homework" description="View and submit your assignments." />
      {loading ? (
        <TableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <EmptyState title="No homework assigned" description="Your homework will appear here when assigned by teachers." />
      ) : (
        <div className="space-y-3">
          {items.map((hw) => (
            <div key={hw.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{hw.title}</h3>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    {hw.subject && <span>{hw.subject.name}</span>}
                    {hw.class && <span>• {hw.class.name}</span>}
                    {hw.teacher && <span>• {hw.teacher.firstName} {hw.teacher.lastName}</span>}
                  </div>
                  {hw.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{hw.description}</p>}
                </div>
                <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${hw.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {hw.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
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