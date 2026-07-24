'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { EmptyState, Modal } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function TeacherLeavesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const days = Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000) + 1;
    const res = await apiClient.post('/teachers/me/leaves', { ...form, totalDays: days });
    if (res.success) { setShowCreate(false); setToast('Leave request submitted'); }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Leave Requests" description="Apply for leave and track your requests."
        actions={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Apply Leave</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}</div>}

      <EmptyState title="No leave requests" description="Your leave history will appear here." />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Apply for Leave">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Leave Type</label>
            <select value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="casual">Casual Leave</option><option value="sick">Sick Leave</option><option value="earned">Earned Leave</option>
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">From *</label>
              <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">To *</label>
              <input type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Reason</label>
            <textarea rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Submitting...' : 'Submit'}</button></div>
        </form>
      </Modal>
    </>
  );
}
