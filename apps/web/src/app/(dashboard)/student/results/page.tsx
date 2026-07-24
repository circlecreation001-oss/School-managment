'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get<any>('/exams?status=published&limit=20');
      if (res.success) setResults(Array.isArray(res.data) ? res.data : res.data?.exams || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <PageHeader title="Exam Results" description="View your published examination results." />
      {loading ? <TableSkeleton rows={5} /> : results.length === 0 ? (
        <EmptyState title="No results published" description="Your exam results will appear here once published by your teachers." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium">Exam</th>
              <th className="px-4 py-3 text-left font-medium">Subject</th>
              <th className="px-4 py-3 text-center font-medium">Total Marks</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((ex: any) => (
                <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{ex.name}</td>
                  <td className="px-4 py-3 text-slate-600">{ex.subject?.name || '—'}</td>
                  <td className="px-4 py-3 text-center">{ex.totalMarks}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{ex.examDate ? new Date(ex.examDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3"><span className="capitalize text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">{ex.examType?.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
