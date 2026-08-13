'use client';

import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { usePermissions } from '@/hooks/use-permissions';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'react-toastify';
import {
  GraduationCap, Plus, Search, Filter, Download, Eye, Pencil,
  Trash2, ChevronLeft, ChevronRight, X, Check, AlertCircle,
  Loader2, User, Phone, Mail, BookOpen, Calendar,
} from 'lucide-react';
import { StudentFormModal } from './student-form-modal';

// ─── Types ────────────────────────────────────────────────
interface Student {
  id: string;
  admissionNumber: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  status: string;
  dob?: string;
  photoUrl?: string;
  class?: { id: string; name: string; code: string };
  section?: { id: string; name: string };
  parentLinks?: { parent: { firstName: string; lastName: string; phone?: string; relation: string } }[];
}

interface Meta { page: number; limit: number; total: number; totalPages: number; }

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  transferred: 'bg-blue-50 text-blue-700 border-blue-200',
  graduated: 'bg-purple-50 text-purple-700 border-purple-200',
  archived: 'bg-red-50 text-red-600 border-red-200',
};

// ─── Main Component ───────────────────────────────────────
function StudentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { hasPermission } = usePermissions();

  // URL state
  const page = parseInt(searchParams.get('page') || '1');
  const urlSearch = searchParams.get('search') || '';
  const urlClass = searchParams.get('classId') || '';
  const urlStatus = searchParams.get('status') || '';

  // Local state
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlSearch);
  const [classFilter, setClassFilter] = useState(urlClass);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch classes for filter dropdown
  useEffect(() => {
    apiClient.get<any>('/academics/classes?limit=100').then(r => {
      if (r.success) setClasses(Array.isArray(r.data) ? r.data : r.data?.items || []);
    });
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (classFilter) params.set('classId', classFilter);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', '1');
    router.push(`/students?${params.toString()}`);
  }, [debouncedSearch, classFilter, statusFilter]);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (urlSearch) params.set('search', urlSearch);
      if (urlClass) params.set('classId', urlClass);
      if (urlStatus) params.set('status', urlStatus);

      const res = await apiClient.get<any>(`/students?${params}`, { skipCache: true });
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : res.data.items || res.data.students || [];
        setStudents(items);
        setMeta(res.data.meta || res.data.pagination || null);
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, urlSearch, urlClass, urlStatus]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Delete student
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await apiClient.delete<any>(`/students/${deleteTarget.id}`);
      if (res.success) {
        toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} archived`);
        setDeleteTarget(null);
        fetchStudents();
      } else {
        toast.error(res.error?.message || 'Delete failed');
      }
    } catch {
      toast.error('Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  // Export students
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get<any>('/students/export');
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) { toast.info('No students to export'); setExporting(false); return; }

        const headers = ['Admission No', 'First Name', 'Last Name', 'Gender', 'DOB', 'Email', 'Phone', 'Roll No', 'Class', 'Section', 'Status', 'Address'];
        const rows = data.map((s: any) => [
          s.admissionNumber, s.firstName, s.lastName, s.gender || '',
          s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '',
          s.email || '', s.phone || '', s.rollNumber || '',
          s.class?.name || '', s.section?.name || '', s.status,
          [s.address, s.city, s.state].filter(Boolean).join(', '),
        ]);

        const csv = [headers, ...rows].map(r => r.map((c: any) => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        toast.success(`Exported ${data.length} students`);
      } else {
        toast.error('Export failed');
      }
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const changePage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`/students?${params.toString()}`);
  };

  const totalPages = meta?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            {meta ? `${meta.total.toLocaleString()} total students` : 'Manage all student records'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {hasPermission('students:export') && (
            <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </button>
          )}
          {hasPermission('students:create') && (
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all">
              <Plus className="h-4 w-4" />
              Add Student
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, admission no, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all"
            />
          </div>
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200/60 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 min-w-[140px]"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200/60 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 min-w-[130px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="transferred">Transferred</option>
            <option value="graduated">Graduated</option>
            <option value="archived">Archived</option>
          </select>
          {(search || classFilter || statusFilter) && (
            <button onClick={() => { setSearch(''); setClassFilter(''); setStatusFilter(''); }} className="inline-flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">No students found</h3>
            <p className="text-sm text-slate-500 mb-6">
              {urlSearch || urlClass || urlStatus ? 'Try adjusting your search filters.' : 'Add your first student to get started.'}
            </p>
            {!urlSearch && !urlClass && !urlStatus && hasPermission('students:create') && (
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" /> Add First Student
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Student</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Admission No.</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Class</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Contact</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            {s.photoUrl ? (
                              <img src={s.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              <span className="text-xs font-semibold text-blue-700">
                                {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{s.firstName} {s.lastName}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{s.gender || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm font-mono text-slate-700">{s.admissionNumber}</span>
                        {s.rollNumber && <p className="text-[11px] text-slate-400 mt-0.5">Roll: {s.rollNumber}</p>}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-sm text-slate-700">{s.class?.name || <span className="text-slate-400">—</span>}</p>
                        {s.section && <p className="text-[11px] text-slate-400 mt-0.5">Section {s.section.name}</p>}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {s.email && <p className="text-xs text-slate-600 flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</p>}
                        {s.phone && <p className="text-xs text-slate-600 flex items-center gap-1 mt-1"><Phone className="h-3 w-3" />{s.phone}</p>}
                        {!s.email && !s.phone && <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${STATUS_COLORS[s.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/students/${s.id}`} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View Profile">
                            <Eye className="h-4 w-4" />
                          </Link>
                          {hasPermission('students:edit') && (
                            <button onClick={() => setEditStudent(s)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission('students:delete') && (
                            <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        {/* Always visible on mobile */}
                        <div className="flex items-center justify-end gap-1 md:hidden">
                          <Link href={`/students/${s.id}`} className="p-1.5 rounded-md text-blue-600 bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="border-t border-slate-100 px-5 py-3.5 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing {((page - 1) * meta.limit) + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total.toLocaleString()}
                </p>
                <div className="flex items-center gap-1">
                  <button disabled={page <= 1} onClick={() => changePage(page - 1)} className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 7) {
                      if (page <= 4) p = i + 1;
                      else if (page >= totalPages - 3) p = totalPages - 6 + i;
                      else p = page - 3 + i;
                    }
                    return (
                      <button key={p} onClick={() => changePage(p)} className={`min-w-[32px] h-8 rounded-md text-xs font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button disabled={page >= totalPages} onClick={() => changePage(page + 1)} className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <StudentFormModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSuccess={(result) => { setShowCreate(false); fetchStudents(); }}
        />
      )}

      {/* Edit Modal */}
      {editStudent && (
        <StudentFormModal
          mode="edit"
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSuccess={() => { setEditStudent(null); fetchStudents(); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-in">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">Archive Student</h3>
            <p className="text-sm text-slate-500 text-center mt-2">
              Are you sure you want to archive <span className="font-semibold text-slate-700">{deleteTarget.firstName} {deleteTarget.lastName}</span>? The student record will be preserved but removed from active lists.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    }>
      <StudentsContent />
    </Suspense>
  );
}
