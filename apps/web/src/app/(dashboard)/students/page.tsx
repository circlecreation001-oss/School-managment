'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface StudentItem {
  id: string; firstName: string; lastName: string; admissionNumber: string;
  rollNumber: string | null; email: string | null; phone: string | null;
  gender: string | null; status: string; photoUrl: string | null;
  class: { name: string } | null; section: { name: string } | null;
  parentLinks: Array<{ parent: { firstName: string; lastName: string; phone: string | null } }>;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', sortBy: 'createdAt', sortOrder: 'desc' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (classFilter) params.set('classId', classFilter);
    const res = await apiClient.get<StudentItem[]>(`/students?${params}`);
    if (res.success) { setStudents((res as any).data); setMeta((res as any).meta); }
    setLoading(false);
  }, [page, search, statusFilter, classFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const statusBadge = (s: string) => {
    const c: Record<string, string> = {
      active: 'bg-success-50 text-success-700 dark:bg-green-900/20 dark:text-green-400',
      transferred: 'bg-warning-50 text-warning-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      graduated: 'bg-primary-50 text-primary-700 dark:bg-blue-900/20 dark:text-blue-400',
      archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${c[s] || c.archived}`}>{s}</span>;
  };

  return (
    <>
      <PageHeader title="Students" description="Manage student admissions, profiles, and records."
        actions={<Link href="/students/new" className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">+ Admit Student</Link>} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Search name, admission no, phone..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="transferred">Transferred</option>
          <option value="graduated">Graduated</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={10} /> : students.length === 0 ? (
        <EmptyState title="No students found" description="Admit a new student or adjust your filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Student</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Adm. No</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Class</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Guardian</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">{s.firstName.charAt(0)}{s.lastName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{s.firstName} {s.lastName}</p>
                        {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{s.admissionNumber}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.class?.name || '—'}{s.section ? ` - ${s.section.name}` : ''}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{s.parentLinks[0]?.parent ? `${s.parentLinks[0].parent.firstName} ${s.parentLinks[0].parent.lastName}` : '—'}</td>
                  <td className="px-4 py-3">{statusBadge(s.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/students/${s.id}`} className="rounded px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">View</Link>
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
