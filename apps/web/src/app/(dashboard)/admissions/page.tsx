'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState, Modal } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface AdmissionItem {
  id: string; applicantName: string; email: string | null; phone: string | null;
  guardianName: string | null; classApplied: string | null; status: string; createdAt: string;
}

export default function AdmissionsPage() {
  const [items, setItems] = useState<AdmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ applicantName: '', email: '', phone: '', guardianName: '', guardianPhone: '', classApplied: '', source: 'walk_in' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '30' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await apiClient.get<any>(`/students/admissions?${params}`);
    if (res.success) setItems(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await apiClient.post('/students/admissions', form);
    if (res.success) { setShowCreate(false); setToast('Admission created'); fetchAdmissions(); }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await apiClient.patch(`/students/admissions/${id}`, { status });
    setToast(`Status updated to ${status}`); fetchAdmissions();
  };

  const statusColor: Record<string, string> = {
    inquiry: 'bg-slate-100 text-slate-600', applied: 'bg-blue-100 text-blue-700', under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', enrolled: 'bg-purple-100 text-purple-700',
  };

  return (
    <>
      <PageHeader title="Admissions" description="Manage admission inquiries and applications."
        actions={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ New Admission</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      <div className="mb-6">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm dark:bg-slate-800">
          <option value="">All Statuses</option>
          <option value="inquiry">Inquiry</option><option value="applied">Applied</option>
          <option value="under_review">Under Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="enrolled">Enrolled</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={6} /> : items.length === 0 ? (
        <EmptyState title="No admissions found" action={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ New Admission</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-600">Applicant</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Class</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{a.applicantName}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{a.phone || a.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.classApplied || '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[a.status] || 'bg-slate-100'}`}>{a.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {a.status === 'inquiry' && <button onClick={() => updateStatus(a.id, 'under_review')} className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">Review</button>}
                    {a.status === 'under_review' && <>
                      <button onClick={() => updateStatus(a.id, 'approved')} className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50">Approve</button>
                      <button onClick={() => updateStatus(a.id, 'rejected')} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Reject</button>
                    </>}
                    {a.status === 'approved' && <button onClick={() => updateStatus(a.id, 'enrolled')} className="rounded px-2 py-1 text-xs text-purple-600 hover:bg-purple-50">Enroll</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Admission" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Applicant Name *</label><input required value={form.applicantName} onChange={e => setForm({...form, applicantName: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Class Applied</label><input value={form.classApplied} onChange={e => setForm({...form, classApplied: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Guardian Name</label><input value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Guardian Phone</label><input value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Submit'}</button></div>
        </form>
      </Modal>
    </>
  );
}
