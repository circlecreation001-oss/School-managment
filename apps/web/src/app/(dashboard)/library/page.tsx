'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { apiClient } from '@/lib/api-client';

interface BookItem {
  id: string; title: string; author: string | null; isbn: string | null;
  category: string | null; totalCopies: number; availableCopies: number; status: string;
}

export default function LibraryPage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '30' });
    if (search) params.set('search', search);
    const res = await apiClient.get<any>(`/library/books?${params}`);
    if (res.success && res.data) setBooks(Array.isArray(res.data) ? res.data : res.data.books || []);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  return (
    <>
      <PageHeader title="Library" description="Manage book catalog, issue/return, and inventory." />

      <div className="mb-6">
        <input type="text" placeholder="Search by title, author, or ISBN..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length: 6}).map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />)}</div>
      ) : books.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-500">No books found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Title</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Author</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Category</th>
              <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-300">Available</th>
              <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-300">Total</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{b.title}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{b.author || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{b.category || '—'}</td>
                  <td className="px-4 py-3 text-center"><span className={`font-medium ${b.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>{b.availableCopies}</span></td>
                  <td className="px-4 py-3 text-center text-slate-600">{b.totalCopies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
