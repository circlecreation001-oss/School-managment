'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface PlatformUser {
  id: string; firstName: string; lastName: string; email: string;
  phone: string | null; status: string; lastLoginAt: string | null; createdAt: string;
  tenant: { name: string; slug: string };
  userRoles: Array<{ role: { name: string; code: string } }>;
}

export default function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    const res = await apiClient.get<PlatformUser[]>(`/saas/users?${params}`);
    if (res.success) {
      setUsers((res as any).data);
      setMeta((res as any).meta);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSuspend = async (id: string) => {
    await apiClient.patch(`/saas/users/${id}/status`, { status: 'suspended' });
    fetchUsers();
  };

  const handleActivate = async (id: string) => {
    await apiClient.patch(`/saas/users/${id}/status`, { status: 'active' });
    fetchUsers();
  };

  const handleForceLogout = async (id: string) => {
    await apiClient.post(`/saas/users/${id}/force-logout`);
    fetchUsers();
  };

  return (
    <>
      <PageHeader title="Platform Users" description="View and manage all users across organizations." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
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
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={10} /> : users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Organization</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Last Login</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.tenant.name}</td>
                  <td className="px-4 py-3 text-xs capitalize text-slate-600 dark:text-slate-400">
                    {u.userRoles.map((r) => r.role.name).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      u.status === 'active' ? 'bg-success-50 text-success-700 dark:bg-green-900/20 dark:text-green-400' :
                      u.status === 'suspended' ? 'bg-danger-50 text-danger-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {u.status === 'active' && <button onClick={() => handleSuspend(u.id)} className="rounded px-2 py-1 text-xs text-warning-600 hover:bg-warning-50">Suspend</button>}
                      {u.status === 'suspended' && <button onClick={() => handleActivate(u.id)} className="rounded px-2 py-1 text-xs text-success-600 hover:bg-success-50">Activate</button>}
                      <button onClick={() => handleForceLogout(u.id)} className="rounded px-2 py-1 text-xs text-danger-600 hover:bg-danger-50">Logout</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
