'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { apiClient } from '@/lib/api-client';

interface Session {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<Session[]>('/auth/sessions');
    if (res.success && res.data) setSessions(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const revokeSession = async (id: string) => {
    setRevoking(id);
    await apiClient.delete(`/auth/sessions/${id}`);
    setSessions(sessions.filter(s => s.id !== id));
    setRevoking(null);
  };

  const revokeAll = async () => {
    await apiClient.post('/auth/logout', { allDevices: true });
    window.location.href = '/login';
  };

  const parseUA = (ua: string | null) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Chrome')) return '🌐 Chrome';
    if (ua.includes('Firefox')) return '🦊 Firefox';
    if (ua.includes('Safari')) return '🧭 Safari';
    if (ua.includes('Edge')) return '🌊 Edge';
    return '🖥️ Browser';
  };

  return (
    <>
      <PageHeader title="Active Sessions" description="View and manage your active login sessions across devices." />

      <div className="flex justify-end mb-4">
        <button onClick={revokeAll} className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
          Logout All Devices
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-8 text-center">
          <p className="text-slate-500 text-sm">No active sessions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg">
                  {parseUA(s.userAgent).split(' ')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {parseUA(s.userAgent).split(' ').slice(1).join(' ') || 'Session'}
                    </p>
                    {i === 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Current</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    {s.ipAddress && <span>IP: {s.ipAddress}</span>}
                    <span>Login: {new Date(s.createdAt).toLocaleString()}</span>
                    <span>Expires: {new Date(s.expiresAt).toLocaleDateString()}</span>
                  </div>
                  {s.deviceInfo && <p className="text-xs text-slate-400 mt-0.5">{s.deviceInfo}</p>}
                </div>
              </div>
              {i !== 0 && (
                <button onClick={() => revokeSession(s.id)} disabled={revoking === s.id}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                  {revoking === s.id ? 'Revoking...' : 'Revoke'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
