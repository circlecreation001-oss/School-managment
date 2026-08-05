'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface StudentProfile {
  id: string;
}

interface ResultItem {
  id: string;
  marksObtained: number;
  percentage?: number;
  grade?: { name: string };
  exam: { name: string; examType: string; totalMarks: number; examDate?: string; subject?: { name: string } };
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const meRes = await apiClient.get<StudentProfile>('/students/me');
      if (meRes.success && meRes.data) {
        setStudentId(meRes.data.id);
      } else {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!studentId) return;
    const load = async () => {
      setLoading(true);
      const res = await apiClient.get<ResultItem[]>(`/exams/results/student/${studentId}`);
      if (res.success) {
        setResults(Array.isArray(res.data) ? res.data : []);
      }
      setLoading(false);
    };
    load();
  }, [studentId]);

  return (
    <>
      <PageHeader title="Exam Results" description="View your published examination results." />
      {loading ? (
        <TableSkeleton rows={5} />
      ) : results.length === 0 ? (
        <EmptyState title="No results published" description="Your exam results will appear here once published by your teachers." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium">Exam</th>
                <th className="px-4 py-3 text-left font-medium">Subject</th>
                <th className="px-4 py-3 text-center font-medium">Marks</th>
                <th className="px-4 py-3 text-center font-medium">%</th>
                <th className="px-4 py-3 text-center font-medium">Grade</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{r.exam.name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.exam.subject?.name || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {r.marksObtained} / {r.exam.totalMarks}
                  </td>
                  <td className="px-4 py-3 text-center">{r.percentage != null ? `${r.percentage}%` : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {r.grade ? (
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">{r.grade.name}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.exam.examDate ? new Date(r.exam.examDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}