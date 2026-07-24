'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState, Modal } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', examType: 'unit_test', classId: '', subjectId: '', totalMarks: '100', examDate: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<any>('/exams?limit=30');
    if (res.success) setExams(Array.isArray(res.data) ? res.data : res.data?.exams || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await apiClient.post('/exams', { ...form, totalMarks: Number(form.totalMarks) });
    if (res.success) { setShowCreate(false); setToast('Exam created'); fetch_(); }
    setSaving(false);
  };

  const statusColor: Record<string, string> = { draft: 'bg-slate-100 text-slate-600', scheduled: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', published: 'bg-purple-100 text-purple-700' };

  return (
    <>
      <PageHeader title="Exams & Marks Entry" description="Create exams and enter student marks."
        actions={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Create Exam</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      {loading ? <TableSkeleton rows={5} /> : exams.length === 0 ? (
        <EmptyState title="No exams created" action={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ Create Exam</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium">Exam</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Subject</th>
              <th className="px-4 py-3 text-center font-medium">Marks</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {exams.map((ex: any) => (
                <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{ex.name}</td>
                  <td className="px-4 py-3 text-xs capitalize text-slate-500">{ex.examType?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-slate-600">{ex.subject?.name || '—'}</td>
                  <td className="px-4 py-3 text-center">{ex.totalMarks}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{ex.examDate ? new Date(ex.examDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[ex.status] || 'bg-slate-100'}`}>{ex.status?.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Exam">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Exam Name *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.examType} onChange={e => setForm({...form, examType: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm">
                <option value="unit_test">Unit Test</option><option value="mid_term">Mid Term</option><option value="final">Final</option><option value="quiz">Quiz</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Exam Date</label>
            <input type="date" value={form.examDate} onChange={e => setForm({...form, examDate: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button></div>
        </form>
      </Modal>
    </>
  );
}
