'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { EmptyState, Modal } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function ParentLeavesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const days = Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000) + 1;
    // Parent submits leave on behalf of child
    const res = await apiClient.post('/notifications', {
      recipientIds: [],
      channel: 'in_app',
      subject: 'Leave Request',
      body: `Leave request: ${form.leaveType} from ${form.startDate} to ${form.endDate}. Reason: ${form.reason}. Days: ${days}`,
    });
    if (res.success) { setShowCreate(false); setToast('Leave request submitted to school'); }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Leave Requests" description="Request leave for your child."
        actions={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Request Leave</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}</div>}

      <EmptyState title="No leave history" description="Your child's leave requests will appear here." />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Request Leave for Child">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Leave Type</label>
            <select value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="casual">Casual</option><option value="sick">Sick</option><option value="family">Family Emergency</option>
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">From Date *</label>
              <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">To Date *</label>
              <input type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Reason *</label>
            <textarea rows={3} required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Submitting...' : 'Submit Request'}</button></div>
        </form>
      </Modal>
    </>
  );
}
