'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { TableSearch } from '@/components/ui/table-search';
import { usePermissions } from '@/hooks/use-permissions';
import { Library, BookOpen, SlidersHorizontal, ArrowDownAZ } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  category: string | null;
  totalCopies: number;
  availableCopies: number;
  status: string;
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [books, setBooks] = useState<BookItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);

      const res = await apiClient.get<any>(`/library/books?${params}`);
      if (res.success && res.data) {
        setBooks(res.data.items || res.data.books || (Array.isArray(res.data) ? res.data : []));
        setTotal(res.data.total || 0);
      }
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-lg font-semibold">Library — Book Catalog</h1>
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

      {/* TABLE */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <Library className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No books found.</p>
        </div>
      ) : (
        <table className="w-full mt-4">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-2">Book</th>
              <th className="hidden md:table-cell p-2">Author</th>
              <th className="hidden lg:table-cell p-2">Category</th>
              <th className="hidden lg:table-cell p-2">ISBN</th>
              <th className="p-2 text-center">Available</th>
              <th className="p-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr
                key={b.id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
              >
                <td className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-full bg-lamaSky flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold">{b.title}</h3>
                </td>
                <td className="hidden md:table-cell p-2 text-sm text-gray-500">{b.author || '—'}</td>
                <td className="hidden lg:table-cell p-2">
                  {b.category ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-lamaPurpleLight">{b.category}</span>
                  ) : '—'}
                </td>
                <td className="hidden lg:table-cell p-2 font-mono text-xs text-gray-400">{b.isbn || '—'}</td>
                <td className="p-2 text-center">
                  <span className={`font-semibold ${b.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {b.availableCopies}
                  </span>
                </td>
                <td className="p-2 text-center text-gray-600">{b.totalCopies}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} count={total} />
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}
