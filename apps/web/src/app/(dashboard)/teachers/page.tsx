'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface TeacherItem {
  id: string; firstName: string; lastName: string; employeeCode: string;
  email: string | null; phone: string | null; designation: string | null;
  status: string; photoUrl: string | null;
  department: { name: string } | null;
  subjects: Array<{ subject: { name: string } }>;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', sortBy: 'createdAt', sortOrder: 'desc' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const res = await apiClient.get<TeacherItem[]>(`/teachers?${params}`);
    if (res.success) { setTeachers((res as any).data); setMeta((res as any).meta); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const statusBadge = (s: string) => {
    const c: Record<string, string> = {
      active: 'bg-success-50 text-success-700 dark:bg-green-900/20 dark:text-green-400',
      on_leave: 'bg-warning-50 text-warning-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      resigned: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      probation: 'bg-primary-50 text-primary-700 dark:bg-blue-900/20 dark:text-blue-400',
    };
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${c[s] || c.resigned}`}>{s.replace(/_/g, ' ')}</span>;
  };

  return (
    <>
      <PageHeader title="Teachers" description="Manage teaching staff, qualifications, and assignments."
        actions={<Link href="/teachers/new" className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">+ Add Teacher</Link>} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Search name, employee code, email..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="probation">Probation</option>
          <option value="on_leave">On Leave</option>
          <option value="resigned">Resigned</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={10} /> : teachers.length === 0 ? (
        <EmptyState title="No teachers found" description="Add a teacher or adjust your filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Teacher</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Code</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Department</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Subjects</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-accent-600 dark:text-purple-400">{t.firstName.charAt(0)}{t.lastName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{t.firstName} {t.lastName}</p>
                        {t.designation && <p className="text-xs text-slate-400">{t.designation}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.employeeCode}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{t.subjects.slice(0, 3).map((s) => s.subject.name).join(', ') || '—'}</td>
                  <td className="px-4 py-3">{statusBadge(t.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/teachers/${t.id}`} className="rounded px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-xs text-slate-500">Page {meta.page} of {meta.totalPages} ({meta.total} total)</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-slate-600">Prev</button>
                <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-slate-600">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
