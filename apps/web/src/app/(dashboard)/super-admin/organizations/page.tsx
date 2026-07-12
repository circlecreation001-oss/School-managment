'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface Tenant {
  id: string; name: string; slug: string; domain: string | null;
  status: string; planCode: string | null; createdAt: string;
  _count: { users: number; institutions: number };
}

interface PaginationMeta {
  page: number; limit: number; total: number; totalPages: number;
}

export default function OrganizationsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    const res = await apiClient.get<Tenant[]>(`/saas/tenants?${params}`);
    if (res.success) {
      setTenants((res as any).data);
      setMeta((res as any).meta);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const handleAction = async (id: string, action: 'suspend' | 'activate' | 'delete') => {
    if (action === 'delete' && !confirm('Are you sure you want to delete this organization?')) return;

    if (action === 'delete') await apiClient.delete(`/saas/tenants/${id}`);
    else await apiClient.post(`/saas/tenants/${id}/${action}`);

    fetchTenants();
  };

  const statusColors: Record<string, string> = {
    active: 'bg-success-50 text-success-700 dark:bg-green-900/20 dark:text-green-400',
    trial: 'bg-warning-50 text-warning-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    suspended: 'bg-danger-50 text-danger-700 dark:bg-red-900/20 dark:text-red-400',
    expired: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Manage all tenant institutions on the platform."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            + New Organization
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, slug, or domain..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : tenants.length === 0 ? (
        <EmptyState title="No organizations found" description="Try adjusting your filters or create a new organization." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Organization</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Users</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Created</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{t.name}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{t.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[t.status] || ''}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">{t.planCode || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t._count.users}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {t.status !== 'suspended' && (
                        <button onClick={() => handleAction(t.id, 'suspend')} className="rounded px-2 py-1 text-xs text-warning-600 hover:bg-warning-50 dark:hover:bg-yellow-900/20">
                          Suspend
                        </button>
                      )}
                      {t.status === 'suspended' && (
                        <button onClick={() => handleAction(t.id, 'activate')} className="rounded px-2 py-1 text-xs text-success-600 hover:bg-success-50 dark:hover:bg-green-900/20">
                          Activate
                        </button>
                      )}
                      <button onClick={() => handleAction(t.id, 'delete')} className="rounded px-2 py-1 text-xs text-danger-600 hover:bg-danger-50 dark:hover:bg-red-900/20">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </p>
              <div className="flex gap-1">
                <button disabled={meta.page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-slate-600">Prev</button>
                <button disabled={meta.page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-slate-600">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
