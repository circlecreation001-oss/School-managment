'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <p className="text-7xl font-bold text-slate-200 dark:text-slate-800">500</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Something went wrong
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
