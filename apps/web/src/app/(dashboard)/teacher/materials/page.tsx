'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState, Modal } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function TeacherMaterialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'notes', classId: '', subjectId: '', externalUrl: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>('/study-materials?limit=30');
    if (res.success) setItems(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await apiClient.post('/study-materials', form);
    if (res.success) { setShowCreate(false); setToast('Material uploaded'); fetch_(); }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Study Material" description="Upload and manage study resources for your students."
        actions={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Upload Material</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      {loading ? <TableSkeleton rows={5} /> : items.length === 0 ? (
        <EmptyState title="No materials uploaded" description="Upload study materials for your students."
          action={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ Upload</button>} />
      ) : (
        <div className="space-y-3">
          {items.map((mat: any) => (
            <div key={mat.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
              <div className="shrink-0 h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg">📄</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{mat.title}</h3>
                <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{mat.category || 'notes'}</span>
                  <span>{mat.downloadCount || 0} downloads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Upload Study Material">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="notes">Notes</option><option value="pdf">PDF</option><option value="ppt">PPT</option><option value="video">Video</option><option value="link">Link</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">External URL (optional)</label>
            <input value={form.externalUrl} onChange={e => setForm({...form, externalUrl: e.target.value})} placeholder="https://..." className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Uploading...' : 'Upload'}</button></div>
        </form>
      </Modal>
    </>
  );
}
