'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { TableSearch } from '@/components/ui/table-search';
import { FormModal } from '@/components/forms/form-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { SlidersHorizontal, ArrowDownAZ, FileText } from 'lucide-react';

interface ExamItem {
  id: string;
  name: string;
  examType: string;
  totalMarks: number;
  passingMarks?: number;
  examDate: string | null;
  status: string;
  class?: { name: string };
  subject?: { name: string };
}

const statusColor: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  published: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

function ExamsContent() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await apiClient.get<any>(`/exams?${params}`);
      if (res.success && res.data) {
        setExams(res.data.items || res.data.exams || (Array.isArray(res.data) ? res.data : []));
        setTotal(res.data.total || 0);
      }
    } catch {
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-lg font-semibold">Examinations</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm focus:ring-primary-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="published">Published</option>
          </select>
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            {hasPermission('exams:create') && (
              <FormModal table="exam" type="create" onSuccess={fetchExams} />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No exams found.</p>
        </div>
      ) : (
        <table className="w-full mt-4">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-2">Exam</th>
              <th className="hidden md:table-cell p-2">Type</th>
              <th className="hidden md:table-cell p-2">Class</th>
              <th className="hidden lg:table-cell p-2">Subject</th>
              <th className="p-2 text-center">Marks</th>
              <th className="hidden lg:table-cell p-2">Date</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((ex) => (
              <tr
                key={ex.id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
              >
                <td className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-full bg-lamaPurple flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold">{ex.name}</h3>
                </td>
                <td className="hidden md:table-cell p-2 capitalize text-xs text-gray-500">
                  {ex.examType.replace('_', ' ')}
                </td>
                <td className="hidden md:table-cell p-2 text-sm">{ex.class?.name || '—'}</td>
                <td className="hidden lg:table-cell p-2 text-sm">{ex.subject?.name || '—'}</td>
                <td className="p-2 text-center text-sm font-medium">{ex.totalMarks}</td>
                <td className="hidden lg:table-cell p-2 text-xs text-gray-500">
                  {ex.examDate ? new Date(ex.examDate).toLocaleDateString() : '—'}
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[ex.status] || 'bg-slate-100'}`}>
                    {ex.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} count={total} />
    </div>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <ExamsContent />
    </Suspense>
  );
}
