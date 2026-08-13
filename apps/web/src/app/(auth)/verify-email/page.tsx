'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${apiUrl}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error?.message || 'Verification failed. The link may have expired.');
        }
      } catch {
        setStatus('error');
        setMessage('Unable to verify email. Please try again later.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <h2 className="text-lg font-semibold text-slate-900">Verifying your email...</h2>
            <p className="text-sm text-slate-500">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Email Verified!</h2>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <div className="mt-6 space-y-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Create New Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
