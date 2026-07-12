'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center">
        <p className="text-7xl font-bold text-slate-200 dark:text-slate-800">403</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Access Denied
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          You do not have permission to access this page.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
