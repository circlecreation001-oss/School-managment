'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { TableSearch } from '@/components/ui/table-search';
import { usePermissions } from '@/hooks/use-permissions';
import { BookOpen, Calendar, User, SlidersHorizontal } from 'lucide-react';

interface HomeworkItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
  maxMarks: number | null;
  class?: { name: string };
  subject?: { name: string };
  teacher?: { firstName: string; lastName: string };
}

const statusColor: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
  archived: 'bg-purple-100 text-purple-700',
};

const cardColors = ['border-l-blue-400', 'border-l-yellow-400', 'border-l-purple-400', 'border-l-pink-400', 'border-l-green-400'];

function HomeworkContent() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await apiClient.get<any>(`/homework?${params}`);
      if (res.success && res.data) {
        setItems(res.data.items || res.data.homework || (Array.isArray(res.data) ? res.data : []));
        setTotal(res.data.total || 0);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-lg font-semibold">Homework & Assignments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No homework assignments found.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {items.map((hw, idx) => (
            <div
              key={hw.id}
              className={`rounded-xl border-l-4 ${cardColors[idx % cardColors.length]} border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{hw.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    {hw.class && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {hw.class.name}
                      </span>
                    )}
                    {hw.subject && <span>• {hw.subject.name}</span>}
                    {hw.teacher && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {hw.teacher.firstName} {hw.teacher.lastName}
                      </span>
                    )}
                  </div>
                  {hw.description && (
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">{hw.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${statusColor[hw.status] || 'bg-slate-100'}`}>
                  {hw.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Due: {new Date(hw.dueDate).toLocaleDateString()}
                </span>
                {hw.maxMarks && <span>Max Marks: {hw.maxMarks}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} count={total} />
    </div>
  );
}

export default function HomeworkPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <HomeworkContent />
    </Suspense>
  );
}
