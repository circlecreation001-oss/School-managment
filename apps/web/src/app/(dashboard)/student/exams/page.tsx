'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function StudentExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get<any>('/exams?limit=20');
      if (res.success) setExams(Array.isArray(res.data) ? res.data : res.data?.exams || []);
      setLoading(false);
    };
    load();
  }, []);

  const statusColor: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700', published: 'bg-purple-100 text-purple-700' };

  return (
    <>
      <PageHeader title="Exams" description="View upcoming and past examinations." />
      {loading ? <TableSkeleton rows={5} /> : exams.length === 0 ? (
        <EmptyState title="No exams scheduled" description="Upcoming exams will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium">Exam</th>
              <th className="px-4 py-3 text-left font-medium">Subject</th>
              <th className="px-4 py-3 text-center font-medium">Marks</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {exams.map((ex: any) => (
                <tr key={ex.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{ex.name}</td>
                  <td className="px-4 py-3 text-slate-600">{ex.subject?.name || '—'}</td>
                  <td className="px-4 py-3 text-center">{ex.totalMarks}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{ex.examDate ? new Date(ex.examDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[ex.status] || 'bg-slate-100'}`}>{ex.status?.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
