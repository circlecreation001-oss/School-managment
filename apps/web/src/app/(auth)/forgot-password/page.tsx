'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

type Step = 'email' | 'otp' | 'new-password' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');

    const res = await apiClient.post<any>('/auth/forgot-password', { email: email.trim().toLowerCase() });
    if (res.success) {
      setStep('otp');
      setResendCooldown(30);
    } else {
      // Always show success-like message (don't reveal if email exists)
      setStep('otp');
      setResendCooldown(30);
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); verifyOtp(pasted); }
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setError('');
    const res = await apiClient.post<any>('/auth/otp/verify', { email: email.trim().toLowerCase(), otp: code, purpose: 'reset' });
    if (res.success) {
      setStep('new-password');
    } else {
      setError(res.error?.message || 'Invalid code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  // Step 2.5: Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');
    await apiClient.post<any>('/auth/otp/send', { email: email.trim().toLowerCase(), purpose: 'reset' });
    setResendCooldown(30);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    setLoading(false);
  };

  // Step 3: Set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 12) { setError('Password must be at least 12 characters.'); return; }
    if (!/[A-Z]/.test(password)) { setError('Password needs an uppercase letter.'); return; }
    if (!/[a-z]/.test(password)) { setError('Password needs a lowercase letter.'); return; }
    if (!/[0-9]/.test(password)) { setError('Password needs a number.'); return; }
    if (!/[^A-Za-z0-9]/.test(password)) { setError('Password needs a special character.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    // Send OTP again for server-side verification during password reset
    const otpCode = otp.join('');
    const res = await apiClient.post<any>('/auth/reset-password', {
      email: email.trim().toLowerCase(),
      otp: otpCode,
      password,
      confirmPassword,
    });

    if (res.success) {
      setStep('success');
    } else {
      setError(res.error?.message || 'Failed to reset password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">

          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp}>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900">Forgot Password</h1>
                <p className="mt-2 text-sm text-slate-500">Enter your email and we&apos;ll send you a verification code.</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@school.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" required />
              </div>
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <p className="mt-4 text-center text-sm text-slate-500">
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">← Back to Login</Link>
              </p>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <div>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900">Enter Verification Code</h1>
                <p className="mt-2 text-sm text-slate-500">Enter the 6-digit code sent to<br /><span className="font-medium text-slate-700">{email}</span></p>
              </div>
              <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${error ? 'border-red-300 bg-red-50' : digit ? 'border-blue-500 bg-blue-50' : 'border-slate-200 focus:border-blue-500'}`} disabled={loading} autoFocus={i === 0} />
                ))}
              </div>
              {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}
              {loading && <div className="flex justify-center mb-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>}
              <div className="text-center">
                <p className="text-sm text-slate-500">
                  Didn&apos;t receive the code?{' '}
                  {resendCooldown > 0 ? <span className="text-slate-400">Resend in {resendCooldown}s</span> : <button onClick={handleResend} disabled={loading} className="font-medium text-blue-600 hover:text-blue-700">Resend OTP</button>}
                </p>
              </div>
              <p className="mt-4 text-center text-sm"><button onClick={() => { setStep('email'); setError(''); setOtp(['','','','','','']); }} className="text-slate-500 hover:text-slate-700">← Change email</button></p>
            </div>
          )}

          {/* STEP 3: New Password */}
          {step === 'new-password' && (
            <form onSubmit={handleResetPassword}>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900">Create New Password</h1>
                <p className="mt-2 text-sm text-slate-500">Your identity has been verified. Set a new password.</p>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Min 12 chars, upper+lower+number+special" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} placeholder="Re-enter password" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" required />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 'success' && (
            <div className="text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Password Reset!</h2>
              <p className="mt-2 text-sm text-slate-500">Your password has been updated successfully.</p>
              <Link href="/login" className="mt-6 inline-flex items-center justify-center w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                Continue to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
