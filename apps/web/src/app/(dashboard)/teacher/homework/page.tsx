'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState, Modal } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function TeacherHomeworkPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', classId: '', subjectId: '', dueDate: '', maxMarks: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>('/homework?limit=30');
    if (res.success) setItems(Array.isArray(res.data) ? res.data : res.data?.homework || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, maxMarks: form.maxMarks ? Number(form.maxMarks) : undefined };
    const res = await apiClient.post('/homework', payload);
    if (res.success) { setShowCreate(false); setForm({ title: '', description: '', classId: '', subjectId: '', dueDate: '', maxMarks: '' }); setToast('Homework created'); fetch_(); }
    setSaving(false);
  };

  const publish = async (id: string) => {
    await apiClient.post(`/homework/${id}/publish`);
    setToast('Homework published'); fetch_();
  };

  return (
    <>
      <PageHeader title="Homework" description="Create and manage homework for your classes."
        actions={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Create Homework</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      {loading ? <TableSkeleton rows={5} /> : items.length === 0 ? (
        <EmptyState title="No homework created" description="Create your first homework assignment."
          action={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ Create Homework</button>} />
      ) : (
        <div className="space-y-3">
          {items.map((hw: any) => (
            <div key={hw.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{hw.title}</h3>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    {hw.class && <span>{hw.class.name}</span>}
                    {hw.subject && <span>• {hw.subject.name}</span>}
                    <span>• Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${hw.status === 'published' ? 'bg-green-100 text-green-700' : hw.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>{hw.status}</span>
                  {hw.status === 'draft' && <button onClick={() => publish(hw.id)} className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">Publish</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Homework" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Due Date *</label>
              <input type="date" required value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Max Marks</label>
              <input type="number" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button></div>
        </form>
      </Modal>
    </>
  );
}
