'use client';

import { useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

/**
 * Hook to refresh dashboard data after CRUD operations.
 * Call invalidate() after any mutation to clear the API cache,
 * causing the next render to fetch fresh data.
 */
export function useDashboardRefresh() {
  const invalidate = useCallback(() => {
    apiClient.invalidateCache();
  }, []);

  return { invalidate };
}