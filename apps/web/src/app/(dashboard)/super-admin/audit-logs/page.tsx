'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface AuditEntry {
  id: string; tenantId: string; action: string; entityType: string;
  entityId: string | null; ipAddress: string | null; createdAt: string;
  actor: { firstName: string; lastName: string; email: string } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (actionFilter) params.set('action', actionFilter);

    const res = await apiClient.get<AuditEntry[]>(`/saas/audit-logs?${params}`);
    if (res.success) {
      setLogs((res as any).data);
      setMeta((res as any).meta);
    }
    setLoading(false);
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <>
      <PageHeader title="Audit Logs" description="Platform-wide audit trail of all administrative actions." />

      <div className="flex gap-3 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">All Actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="password_reset">Password Reset</option>
          <option value="password_changed">Password Changed</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={12} /> : logs.length === 0 ? (
        <EmptyState title="No audit logs found" description="Audit events will appear here as actions are performed." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Actor</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Action</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Entity</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">{log.entityType}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-xs text-slate-500">Page {meta.page} of {meta.totalPages}</p>
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
