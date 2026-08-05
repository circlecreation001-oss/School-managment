'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export function TableSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');
  const debouncedValue = useDebounce(value, 400);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render to avoid unnecessary navigation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set('search', debouncedValue);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`${window.location.pathname}?${params}`);
  }, [debouncedValue]); // Only trigger on debounced value change

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full sm:w-[240px] pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all duration-200"
      />
    </div>
  );
}
