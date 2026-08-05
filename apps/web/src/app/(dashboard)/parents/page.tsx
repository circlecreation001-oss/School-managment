'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { TableSearch } from '@/components/ui/table-search';
import { usePermissions } from '@/hooks/use-permissions';
import { SlidersHorizontal, ArrowDownAZ, Phone } from 'lucide-react';

interface ParentItem {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relation?: string;
  status: string;
  studentLinks?: { student: { firstName: string; lastName: string } }[];
}

function ParentsContent() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [parents, setParents] = useState<ParentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);

      const res = await apiClient.get<any>(`/students/parents?${params}`);
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.items || (res.data as any)?.parents || [];
        setParents(data);
        setTotal((res as any).meta?.total || (res.data as any)?.total || 0);
      }
    } catch {
      setParents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Parents & Guardians</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <ArrowDownAZ className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : parents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">No parent records found. Parents are linked through student admissions.</p>
        </div>
      ) : (
        <table className="w-full mt-4">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-2">Name</th>
              <th className="hidden md:table-cell p-2">Contact</th>
              <th className="hidden md:table-cell p-2">Relation</th>
              <th className="hidden lg:table-cell p-2">Children</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
              >
                <td className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-full bg-lamaPurple flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
                    <p className="text-xs text-gray-500">{item.email || ''}</p>
                  </div>
                </td>
                <td className="hidden md:table-cell p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    {item.phone || 'N/A'}
                  </div>
                </td>
                <td className="hidden md:table-cell p-2 capitalize text-sm text-gray-500">
                  {item.relation || '—'}
                </td>
                <td className="hidden lg:table-cell p-2 text-sm text-gray-500">
                  {item.studentLinks?.map((l) => `${l.student.firstName} ${l.student.lastName}`).join(', ') || '—'}
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} count={total} />
    </div>
  );
}

export default function ParentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <ParentsContent />
    </Suspense>
  );
}