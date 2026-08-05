'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { TableSearch } from '@/components/ui/table-search';
import { usePermissions } from '@/hooks/use-permissions';
import { UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdmissionItem {
  id: string;
  applicantName: string;
  email: string | null;
  phone: string | null;
  guardianName: string | null;
  classApplied: string | null;
  status: string;
  source?: string;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  inquiry: 'bg-slate-100 text-slate-600',
  applied: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  document_verification: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  enrolled: 'bg-purple-100 text-purple-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

function AdmissionsContent() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [items, setItems] = useState<AdmissionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ applicantName: '', email: '', phone: '', guardianName: '', guardianPhone: '', classApplied: '', source: 'walk_in' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await apiClient.get<any>(`/students/admissions?${params}`);
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
        setItems(data);
        setTotal((res as any).meta?.total || (res.data as any)?.total || 0);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiClient.post<any>('/students/admissions', form);
    if (res.success) {
      setShowCreate(false);
      setForm({ applicantName: '', email: '', phone: '', guardianName: '', guardianPhone: '', classApplied: '', source: 'walk_in' });
      setToast('Admission created successfully');
      setTimeout(() => setToast(''), 3000);
      fetchAdmissions();
    } else {
      setToast(res.error?.message || 'Failed to create');
      setTimeout(() => setToast(''), 3000);
    }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await apiClient.patch<any>(`/students/admissions/${id}`, { status });
    if (res.success) {
      setToast(`Status updated to ${status}`);
      setTimeout(() => setToast(''), 3000);
      fetchAdmissions();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex-1 m-4 mt-0">
      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}</div>}
      {/* TOP */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-lg font-semibold">Admissions</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="inquiry">Inquiry</option>
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="enrolled">Enrolled</option>
          </select>
          {hasPermission('students:create') && (
            <button
              onClick={() => setShowCreate(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No admission records found.</p>
        </div>
      ) : (
        <table className="w-full mt-4">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-2">Applicant</th>
              <th className="hidden md:table-cell p-2">Contact</th>
              <th className="hidden md:table-cell p-2">Class</th>
              <th className="p-2">Status</th>
              <th className="hidden lg:table-cell p-2">Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr
                key={a.id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
              >
                <td className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-full bg-lamaSky flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {a.applicantName?.split(' ').map(w => w.charAt(0)).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold">{a.applicantName}</h3>
                    {a.guardianName && <p className="text-xs text-gray-500">Guardian: {a.guardianName}</p>}
                  </div>
                </td>
                <td className="hidden md:table-cell p-2 text-xs text-gray-500">
                  {a.phone || a.email || '—'}
                </td>
                <td className="hidden md:table-cell p-2 text-sm">{a.classApplied || '—'}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[a.status] || 'bg-slate-100'}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="hidden lg:table-cell p-2 text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    {a.status === 'inquiry' && hasPermission('students:edit') && (
                      <button onClick={() => updateStatus(a.id, 'under_review')} className="w-7 h-7 rounded-full bg-lamaSky flex items-center justify-center" title="Review">
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {a.status === 'under_review' && hasPermission('students:edit') && (
                      <>
                        <button onClick={() => updateStatus(a.id, 'approved')} className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center" title="Approve">
                          <CheckCircle className="w-3.5 h-3.5 text-green-700" />
                        </button>
                        <button onClick={() => updateStatus(a.id, 'rejected')} className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center" title="Reject">
                          <XCircle className="w-3.5 h-3.5 text-red-700" />
                        </button>
                      </>
                    )}
                    {a.status === 'approved' && hasPermission('students:edit') && (
                      <button onClick={() => updateStatus(a.id, 'enrolled')} className="w-7 h-7 rounded-full bg-lamaPurple flex items-center justify-center" title="Enroll">
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} count={total} />

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-md relative w-[90%] md:w-[60%] lg:w-[50%] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">New Admission</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Applicant Name *</label>
                  <input required value={form.applicantName} onChange={e => setForm({...form, applicantName: e.target.value})}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Class Applied</label>
                  <input value={form.classApplied} onChange={e => setForm({...form, classApplied: e.target.value})}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Guardian Name</label>
                  <input value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Guardian Phone</label>
                  <input value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="py-2 px-4 rounded-md border border-gray-300 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary-500 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50">
                  {saving ? 'Creating...' : 'Submit'}
                </button>
              </div>
            </form>
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdmissionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <AdmissionsContent />
    </Suspense>
  );
}