'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface MaterialItem {
  id: string; title: string; description: string | null; category: string | null;
  fileUrl: string | null; externalUrl: string | null; downloadCount: number;
  class: { name: string } | null; subject: { name: string } | null;
  teacher: { firstName: string; lastName: string } | null;
}

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    const res = await apiClient.get<MaterialItem[]>(`/study-materials?${params}`);
    if (res.success) { setMaterials((res as any).data); setMeta((res as any).meta); }
    setLoading(false);
  }, [page, search, categoryFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <>
      <PageHeader title="Study Materials" description="Manage and share learning resources with students."
        actions={<button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">+ Upload Material</button>} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Search materials..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <option value="">All Types</option><option value="notes">Notes</option><option value="pdf">PDF</option>
          <option value="video">Video</option><option value="ppt">PPT</option><option value="link">Link</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={8} /> : materials.length === 0 ? <EmptyState title="No materials" description="Upload study materials for students." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{m.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{m.subject?.name || '—'} • {m.class?.name || '—'}</p>
                </div>
                {m.category && <span className="inline-flex rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 capitalize">{m.category}</span>}
              </div>
              {m.description && <p className="mt-2 text-xs text-slate-500 line-clamp-2">{m.description}</p>}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{m.teacher ? `${m.teacher.firstName} ${m.teacher.lastName}` : '—'}</span>
                <span>{m.downloadCount} downloads</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-slate-600">Prev</button>
          <span className="text-xs text-slate-500 py-1">Page {meta.page} of {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-slate-600">Next</button>
        </div>
      )}
    </>
  );
}
