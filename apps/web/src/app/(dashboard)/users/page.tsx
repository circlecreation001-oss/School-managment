'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface UserItem {
  id: string; firstName: string; lastName: string; email: string;
  phone: string | null; status: string; lastLoginAt: string | null;
  createdAt: string; avatarUrl: string | null;
  userRoles: Array<{ role: { name: string; code: string } }>;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', sortBy: 'createdAt', sortOrder: 'desc' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (roleFilter) params.set('roleCode', roleFilter);

    const res = await apiClient.get<UserItem[]>(`/users?${params}`);
    if (res.success) {
      setUsers((res as any).data);
      setMeta((res as any).meta);
    }
    setLoading(false);
  }, [page, search, statusFilter, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (id: string, action: 'activate' | 'suspend' | 'archive' | 'force-logout' | 'reset-password') => {
    if (action === 'archive' && !confirm('Archive this user?')) return;
    await apiClient.post(`/users/${id}/${action}`);
    fetchUsers();
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      active: 'bg-success-50 text-success-700 dark:bg-green-900/20 dark:text-green-400',
      suspended: 'bg-danger-50 text-danger-700 dark:bg-red-900/20 dark:text-red-400',
      inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      pending: 'bg-warning-50 text-warning-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    };
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[s] || colors.inactive}`}>{s}</span>;
  };

  return (
    <>
      <PageHeader title="Users" description="Manage all users in your organization." actions={
        <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">+ Add User</button>
      } />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Search name, email, phone..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <option value="">All Roles</option>
          <option value="tenant_admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
          <option value="accountant">Accountant</option>
          <option value="receptionist">Receptionist</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton rows={10} /> : users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search or add a new user." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">User</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Last Login</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                          {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-xs capitalize text-slate-600 dark:text-slate-400">
                    {u.userRoles.map((r) => r.role.name).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">{statusBadge(u.status)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {u.status === 'active' && <button onClick={() => handleAction(u.id, 'suspend')} className="rounded px-2 py-1 text-xs text-warning-600 hover:bg-warning-50">Suspend</button>}
                      {u.status === 'suspended' && <button onClick={() => handleAction(u.id, 'activate')} className="rounded px-2 py-1 text-xs text-success-600 hover:bg-success-50">Activate</button>}
                      <button onClick={() => handleAction(u.id, 'force-logout')} className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Logout</button>
                      <button onClick={() => handleAction(u.id, 'reset-password')} className="rounded px-2 py-1 text-xs text-primary-600 hover:bg-primary-50">Reset</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </p>
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
