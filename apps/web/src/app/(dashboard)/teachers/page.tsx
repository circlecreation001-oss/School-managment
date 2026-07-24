'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState, Modal, ConfirmDialog } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface TeacherItem {
  id: string; firstName: string; lastName: string; employeeCode: string;
  email: string | null; phone: string | null; designation: string | null;
  status: string; department: { name: string } | null;
}

const initialForm = { firstName: '', lastName: '', email: '', phone: '', designation: '', departmentId: '', gender: '' };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', sortBy: 'createdAt', sortOrder: 'desc' });
    if (search) params.set('search', search);
    const res = await apiClient.get<any>(`/teachers?${params}`);
    if (res.success) { setTeachers(res.data || []); setMeta((res as any).meta || null); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { setFormError('Name is required'); return; }
    setSaving(true); setFormError('');
    const res = await apiClient.post('/teachers', form);
    if (res.success) { setShowCreate(false); setForm(initialForm); setToast('Teacher created'); fetchTeachers(); }
    else setFormError((res as any).error?.message || 'Failed');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await apiClient.delete(`/teachers/${deleteTarget}`);
    setToast('Teacher deleted'); setDeleteTarget(null); setDeleting(false); fetchTeachers();
  };

  return (
    <>
      <PageHeader title="Teachers" description="Manage teaching staff, subjects, and assignments."
        actions={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Add Teacher</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      <div className="mb-6">
        <input type="text" placeholder="Search by name, employee code, email..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-80 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm dark:bg-slate-800 dark:text-slate-100" />
      </div>

      {loading ? <TableSkeleton rows={8} /> : teachers.length === 0 ? (
        <EmptyState title="No teachers found" description="Add a new teacher to get started."
          action={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ Add Teacher</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Teacher</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Employee ID</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Department</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Designation</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{t.firstName} {t.lastName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{t.employeeCode}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{t.designation || '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Link href={`/teachers/${t.id}`} className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">View</Link>
                    <button onClick={() => setDeleteTarget(t.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-xs text-slate-500">Page {meta.page} of {meta.totalPages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50">Prev</button>
                <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Teacher" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
              <input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm">
                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create Teacher'}</button></div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Teacher" message="Are you sure? This will remove the teacher record." confirmText="Delete" loading={deleting} destructive />
    </>
  );
}
