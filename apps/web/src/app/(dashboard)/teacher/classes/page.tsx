'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get<any>('/academics/classes');
      if (res.success) setClasses(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <PageHeader title="My Classes" description="View your assigned classes and sections." />
      {loading ? <TableSkeleton rows={5} /> : classes.length === 0 ? (
        <EmptyState title="No classes assigned" description="Your assigned classes will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls: any) => (
            <div key={cls.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{cls.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Code: {cls.code}</p>
              <p className="text-xs text-slate-400 mt-0.5">{cls.status}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
