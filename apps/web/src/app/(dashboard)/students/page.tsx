'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { FormModal } from '@/components/forms/form-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { Search, Eye, Filter, Download, GraduationCap } from 'lucide-react';

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  status: string;
  class?: { name: string };
  section?: { name: string };
  photoUrl?: string;
}

function StudentsContent() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();
  const page = parseInt(searchParams.get('page') || '1');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relatedData, setRelatedData] = useState<any>({});

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);
      const res = await apiClient.get<any>(`/students?${params}`);
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.items || (res.data as any)?.students || [];
        setStudents(data);
        setTotal((res as any).meta?.total || (res.data as any)?.total || 0);
      }
    } catch { setStudents([]); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const loadRelated = async () => {
      const [sessionsRes, classesRes] = await Promise.all([
        apiClient.get<any>('/academics/sessions'),
        apiClient.get<any>('/academics/classes'),
      ]);
      setRelatedData({
        sessions: sessionsRes.success ? (Array.isArray(sessionsRes.data) ? sessionsRes.data : []) : [],
        classes: classesRes.success ? (Array.isArray(classesRes.data) ? classesRes.data : []) : [],
      });
    };
    loadRelated();
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-page-title text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all student records and profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download className="h-4 w-4" /> Export
          </button>
          {hasPermission('students:create') && (
            <FormModal table="student" type="create" relatedData={relatedData} onSuccess={fetchStudents} />
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, admission number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
              className="input pl-10"
            />
          </div>
          <button className="btn-secondary">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center">
            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-900">No students found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Student</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Admission No.</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Class</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Phone</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary-700">
                            {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-slate-500">{s.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600 font-mono">{s.admissionNumber}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{s.class?.name || '—'}{s.section ? ` - ${s.section.name}` : ''}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-500">{s.phone || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={s.status === 'active' ? 'badge-success' : 'badge-neutral'}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/students/${s.id}`} className="btn-ghost p-1.5">
                          <Eye className="h-4 w-4" />
                        </Link>
                        {hasPermission('students:edit') && (
                          <FormModal table="student" type="update" data={s} relatedData={relatedData} onSuccess={fetchStudents} />
                        )}
                        {hasPermission('students:delete') && (
                          <FormModal table="student" type="delete" id={s.id} onSuccess={fetchStudents} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        <div className="border-t border-slate-100 px-6 py-3">
          <Pagination page={page} count={total} />
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />}>
      <StudentsContent />
    </Suspense>
  );
}