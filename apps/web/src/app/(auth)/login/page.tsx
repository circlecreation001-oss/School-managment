'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';

const FEATURES = [
  { icon: '🎓', title: 'Student Management', desc: 'Admissions, records, promotions' },
  { icon: '👨\u200D🏫', title: 'Teacher Portal', desc: 'Classes, attendance, grading' },
  { icon: '💰', title: 'Fee Collection', desc: 'Online payments, receipts' },
  { icon: '📊', title: 'Attendance', desc: 'Real-time tracking, reports' },
  { icon: '📝', title: 'Examination', desc: 'Exams, results, report cards' },
  { icon: '📚', title: 'Library', desc: 'Books, issues, inventory' },
  { icon: '🚌', title: 'Transport', desc: 'Routes, tracking, fees' },
  { icon: '👨\u200D👩\u200D👧', title: 'Parent App', desc: 'Live updates, communication' },
];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      import('@/config/role-navigation').then(({ getLoginRedirect }) => {
        router.replace(getLoginRedirect(user.roles));
      });
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(identifier, password);
    if (result.success) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const u = stored ? JSON.parse(stored) : user;
      const { getLoginRedirect } = await import('@/config/role-navigation');
      router.push(getLoginRedirect(u?.roles || []));
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-[#f8fafc]" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-[120px]" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-[100px]" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-sky-100/40 blur-[80px]" />

      {/* LEFT PANEL - Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-8 xl:p-16">
        <div className={`relative max-w-xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-xl font-black text-white">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">SchoolNex</h1>
              <p className="text-xs text-slate-500 -mt-0.5">by Circle Creation</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
            Complete School<br />Management Platform
          </h2>
          <p className="text-base text-slate-500 leading-relaxed mb-10 max-w-lg">
            Manage admissions, attendance, fees, academics, communication, HR, transport, examinations, library and more - all from one secure platform.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:border-slate-300/80 transition-all duration-200"
              >
                <span className="text-lg mt-0.5 shrink-0">{f.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{f.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span className="text-slate-500 font-medium">Trusted by Schools</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <span>99.9% Uptime</span>
            <div className="h-3 w-px bg-slate-200" />
            <span>256-bit Encrypted</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Card */}
      <div className="flex w-full lg:w-[45%] items-center justify-center p-6 sm:p-8 relative">
        <div className={`w-full max-w-[420px] transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold">S</span>
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">SchoolNex</span>
              <p className="text-[10px] text-slate-400 -mt-0.5">by Circle Creation</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in securely to access your SchoolNex dashboard.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="h-3 w-3 text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identifier */}
              <div className="space-y-1.5">
                <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
                  Email, Username, or ID
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="Email, admission no, employee ID..."
                    className="w-full h-[54px] rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full h-[54px] rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[54px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                )}
              </button>
            </form>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                <span>Secure Login</span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <span>256-bit Encryption</span>
              <div className="h-3 w-px bg-slate-200" />
              <span>ISO-ready</span>
            </div>
          </div>

          {/* Below Card Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Want to register your institute?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Start Free Trial
              </Link>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-slate-600 transition-colors">Support</Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-slate-400">&copy; 2026 SchoolNex &middot; Built by Circle Creation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
