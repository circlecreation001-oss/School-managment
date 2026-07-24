'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState, Modal, ConfirmDialog } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface StudentItem {
  id: string; firstName: string; lastName: string; admissionNumber: string;
  rollNumber: string | null; email: string | null; phone: string | null;
  gender: string | null; status: string; photoUrl: string | null;
  class: { name: string } | null; section: { name: string } | null;
  parentLinks: Array<{ parent: { firstName: string; lastName: string; phone: string | null } }>;
}

const initialForm = { firstName: '', lastName: '', email: '', phone: '', gender: '', classId: '', sectionId: '', dob: '' };

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', sortBy: 'createdAt', sortOrder: 'desc' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const res = await apiClient.get<any>(`/students?${params}`);
    if (res.success) { setStudents(res.data || []); setMeta((res as any).meta || null); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { setFormError('First and last name are required'); return; }
    setSaving(true); setFormError('');
    const res = await apiClient.post('/students', form);
    if (res.success) { setShowCreate(false); setForm(initialForm); setToast('Student created successfully'); fetchStudents(); }
    else setFormError((res as any).error?.message || 'Failed to create student');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await apiClient.delete(`/students/${deleteTarget}`);
    if (res.success) { setToast('Student deleted'); fetchStudents(); }
    setDeleteTarget(null); setDeleting(false);
  };

  const statusBadge = (s: string) => {
    const c: Record<string, string> = { active: 'bg-green-100 text-green-700', transferred: 'bg-yellow-100 text-yellow-700', graduated: 'bg-blue-100 text-blue-700', archived: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${c[s] || c.archived}`}>{s}</span>;
  };

  return (
    <>
      <PageHeader title="Students" description="Manage student admissions, profiles, and records."
        actions={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Add Student</button>} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Search name, admission no, phone..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm dark:bg-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm dark:bg-slate-800 dark:text-slate-100">
          <option value="">All Statuses</option>
          <option value="active">Active</option><option value="transferred">Transferred</option><option value="graduated">Graduated</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={10} /> : students.length === 0 ? (
        <EmptyState title="No students found" description="Add a new student or adjust your filters."
          action={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ Add Student</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Student</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Adm. No</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Class</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Guardian</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">{s.firstName[0]}{s.lastName[0]}</span>
                      </div>
                      <div><p className="font-medium text-slate-900 dark:text-slate-100">{s.firstName} {s.lastName}</p>
                        {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{s.admissionNumber}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.class?.name || '—'}{s.section ? ` - ${s.section.name}` : ''}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{s.parentLinks[0]?.parent ? `${s.parentLinks[0].parent.firstName} ${s.parentLinks[0].parent.lastName}` : '—'}</td>
                  <td className="px-4 py-3">{statusBadge(s.status)}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Link href={`/students/${s.id}`} className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">View</Link>
                    <button onClick={() => setDeleteTarget(s.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-xs text-slate-500">Page {meta.page} of {meta.totalPages} ({meta.total} total)</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 text-xs disabled:opacity-50">Prev</button>
                <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 text-xs disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Student" size="lg">
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
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm">
                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create Student'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Student" message="Are you sure you want to delete this student? This action cannot be undone." confirmText="Delete" loading={deleting} destructive />
    </>
  );
}
