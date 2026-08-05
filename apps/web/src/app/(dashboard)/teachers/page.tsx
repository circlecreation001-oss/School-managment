'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { TableSearch } from '@/components/ui/table-search';
import { FormModal } from '@/components/forms/form-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { SlidersHorizontal, ArrowDownAZ, Eye } from 'lucide-react';
import Link from 'next/link';

interface Teacher {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  designation?: string;
  status: string;
  department?: { name: string };
}

const columns: Column<Teacher>[] = [
  { header: 'Info', accessor: 'info' },
  { header: 'Employee Code', accessor: 'employeeCode', className: 'hidden md:table-cell' },
  { header: 'Department', accessor: 'department', className: 'hidden md:table-cell' },
  { header: 'Phone', accessor: 'phone', className: 'hidden lg:table-cell' },
  { header: 'Status', accessor: 'status', className: 'hidden lg:table-cell' },
  { header: 'Actions', accessor: 'actions' },
];

function TeachersContent() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);

      const res = await apiClient.get<any>(`/teachers?${params}`);
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.items || (res.data as any)?.teachers || [];
        setTeachers(data);
        setTotal((res as any).meta?.total || (res.data as any)?.total || 0);
      }
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const renderRow = (item: Teacher) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="h-10 w-10 rounded-full bg-lamaYellow flex items-center justify-center">
          <span className="text-xs font-semibold">
            {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
          </span>
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
          <p className="text-xs text-gray-500">{item.designation || item.email || ''}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.employeeCode}</td>
      <td className="hidden md:table-cell">{item.department?.name || '-'}</td>
      <td className="hidden lg:table-cell">{item.phone || '-'}</td>
      <td className="hidden lg:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {item.status}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          {hasPermission('teachers:edit') && (
            <FormModal table="teacher" type="update" data={item} onSuccess={fetchTeachers} />
          )}
          {hasPermission('teachers:delete') && (
            <FormModal table="teacher" type="delete" id={item.id} onSuccess={fetchTeachers} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <ArrowDownAZ className="w-4 h-4" />
            </button>
            {hasPermission('teachers:create') && (
              <FormModal table="teacher" type="create" onSuccess={fetchTeachers} />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <DataTable columns={columns} data={teachers} renderRow={renderRow} />
      )}
      {/* PAGINATION */}
      <Pagination page={page} count={total} />
    </div>
  );
}

export default function TeachersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <TeachersContent />
    </Suspense>
  );
}
