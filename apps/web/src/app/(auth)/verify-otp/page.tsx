'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 6) return;
    setIsVerifying(true);
    setError('');

    const res = await apiClient.post<any>('/auth/otp/verify', {
      email,
      otp: code,
      purpose: 'signup',
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setError(res.error?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setError('');

    const res = await apiClient.post<any>('/auth/otp/send', {
      email,
      purpose: 'signup',
    });

    if (res.success) {
      setResendCooldown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(res.error?.message || 'Failed to resend OTP.');
    }
    setIsResending(false);
  };

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">Missing email address</h2>
          <p className="mt-2 text-sm text-slate-500">Please start the signup process again.</p>
          <Link href="/signup" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">Go to Signup</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md text-center rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Email Verified!</h2>
          <p className="mt-2 text-sm text-slate-500">Your account is now active. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verify your email</h1>
            <p className="mt-2 text-sm text-slate-500">
              We sent a 6-digit code to<br />
              <span className="font-medium text-slate-700">{email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                  error ? 'border-red-300 bg-red-50' : digit ? 'border-blue-500 bg-blue-50' : 'border-slate-200 focus:border-blue-500'
                }`}
                disabled={isVerifying}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-red-600 mb-4">{error}</p>
          )}

          {/* Loading */}
          {isVerifying && (
            <div className="flex justify-center mb-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          )}

          {/* Resend */}
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-slate-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </p>
          </div>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link href="/signup" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
