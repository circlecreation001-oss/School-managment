'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function StudentMaterialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get<any>('/study-materials?limit=30');
      if (res.success) setItems(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <PageHeader title="Study Material" description="Download notes, PDFs, and resources shared by teachers." />
      {loading ? <TableSkeleton rows={5} /> : items.length === 0 ? (
        <EmptyState title="No study materials available" description="Materials uploaded by your teachers will appear here." />
      ) : (
        <div className="space-y-3">
          {items.map((mat: any) => (
            <div key={mat.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 hover:border-blue-200 transition-all">
              <div className="shrink-0 h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg">📄</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{mat.title}</h3>
                <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                  {mat.category && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{mat.category}</span>}
                  <span>{mat.downloadCount || 0} downloads</span>
                </div>
              </div>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/study-materials/${mat.id}/download`}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">Download</a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
