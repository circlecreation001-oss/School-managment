'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState, Modal } from '@/components/common';
import { apiClient } from '@/lib/api-client';

type Tab = 'sessions' | 'classes' | 'subjects' | 'departments';

export default function AcademicsPage() {
  const [tab, setTab] = useState<Tab>('sessions');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const endpoints: Record<Tab, string> = { sessions: '/academics/sessions', classes: '/academics/classes', subjects: '/academics/subjects', departments: '/academics/departments' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>(endpoints[tab]);
    if (res.success) setData(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await apiClient.post(endpoints[tab], form);
    if (res.success) { setShowCreate(false); setForm({}); setToast(`Created successfully`); fetchData(); }
    setSaving(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sessions', label: 'Sessions' }, { key: 'classes', label: 'Classes' },
    { key: 'subjects', label: 'Subjects' }, { key: 'departments', label: 'Departments' },
  ];

  return (
    <>
      <PageHeader title="Academic Structure" description="Manage sessions, classes, subjects, and departments."
        actions={<button onClick={() => { setForm({}); setShowCreate(true); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Create</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t.label}</button>
        ))}
      </div>

      {loading ? <TableSkeleton rows={5} /> : data.length === 0 ? (
        <EmptyState title={`No ${tab} found`} description={`Create your first ${tab.slice(0, -1)}.`}
          action={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ Create</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.code || '—'}</td>
                  <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">{item.status || 'active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={`Create ${tab.slice(0, -1)}`}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
            <input required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code *</label>
            <input required value={form.code || ''} onChange={e => setForm({...form, code: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          {tab === 'sessions' && <>
            <div><label className="block text-sm font-medium mb-1">Start Date</label><input type="date" value={form.startDate || ''} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={form.endDate || ''} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </>}
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button></div>
        </form>
      </Modal>
    </>
  );
}
