'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function LibrarianDashboard() {
  const [books, setBooks] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/library/books?page=1&limit=1').then(res => { if (res.success) setBooks(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Library Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Book inventory, circulation, and member management.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total Books</p>
          {loading ? <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200" /> : <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{books?.meta?.total || 0}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Status</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">Active</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Module</p>
          <p className="mt-1 text-xl font-bold text-blue-600">Library</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[{l:'All Books',h:'/library'},{l:'Issue Book',h:'/librarian/circulation'},{l:'Return Book',h:'/librarian/circulation'},{l:'Collect Fine',h:'/librarian/fines'},{l:'Overdue List',h:'/library'}].map(i=>(
              <Link key={i.l} href={i.h} className="block text-sm text-blue-600 hover:text-blue-700 py-1">{i.l} &rarr;</Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Activity</h3>
          <p className="text-sm text-slate-500">Issue and return activity will appear here as you use the library module.</p>
        </div>
      </div>
    </div>
  );
}
