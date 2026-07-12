'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { apiClient } from '@/lib/api-client';

interface ExamItem {
  id: string; name: string; examType: string; totalMarks: number;
  examDate: string | null; status: string;
  class?: { name: string }; subject?: { name: string };
}

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchExams = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '30' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await apiClient.get<any>(`/exams?${params}`);
    if (res.success && res.data) setExams(Array.isArray(res.data) ? res.data : res.data.exams || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const statusColor: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600', scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700',
    published: 'bg-purple-100 text-purple-700', cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <PageHeader title="Examinations" description="Schedule exams, enter marks, and publish results." />

      <div className="flex gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="published">Published</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length: 6}).map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />)}</div>
      ) : exams.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-500">No exams found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Exam</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Type</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Class</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Subject</th>
              <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-300">Marks</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {exams.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{ex.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 capitalize">{ex.examType.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ex.class?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ex.subject?.name || '—'}</td>
                  <td className="px-4 py-3 text-center">{ex.totalMarks}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{ex.examDate ? new Date(ex.examDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[ex.status] || 'bg-slate-100'}`}>{ex.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
