'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, memo } from 'react';

const ITEMS_PER_PAGE = 10;

interface PaginationProps {
  page: number;
  count: number;
  itemsPerPage?: number;
}

export const Pagination = memo(function Pagination({ page, count, itemsPerPage = ITEMS_PER_PAGE }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(count / itemsPerPage);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  }, [searchParams, router]);

  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-xs text-slate-500">
        Showing {Math.min((page - 1) * itemsPerPage + 1, count)}–{Math.min(page * itemsPerPage, count)} of {count}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={!hasPrev}
          onClick={() => changePage(page - 1)}
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPages().map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => changePage(p)}
              className={`min-w-[32px] h-8 rounded-md text-xs font-medium transition-colors ${
                page === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={!hasNext}
          onClick={() => changePage(page + 1)}
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
