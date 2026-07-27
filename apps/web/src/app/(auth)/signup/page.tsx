'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface FormData {
  instituteName: string;
  ownerName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  instituteName?: string;
  ownerName?: string;
  email?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    instituteName: '',
    ownerName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.instituteName.trim()) e.instituteName = 'Institute name is required';
    if (!form.ownerName.trim()) e.ownerName = 'Owner name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^\+?[1-9]\d{6,14}$/.test(form.mobile.replace(/\s/g, ''))) e.mobile = 'Please enter a valid mobile number (e.g. +919876543210)';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must contain an uppercase letter';
    else if (!/[a-z]/.test(form.password)) e.password = 'Must contain a lowercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Must contain a number';
    else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = 'Must contain a special character';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!agreed) { setServerError('Please agree to the Terms of Service and Privacy Policy.'); return; }

    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: { id: string; email: string; firstName: string; lastName: string; roles: string[]; tenantId: string };
      }>('/auth/signup-institute', {
        instituteName: form.instituteName.trim(),
        ownerName: form.ownerName.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.replace(/\s/g, ''),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (res.success && res.data) {
        // Store tokens and user
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('user', JSON.stringify({
          ...res.data.user,
          permissions: [],
        }));
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setServerError(res.error?.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        setServerError('Cannot connect to server. Please check your internet connection.');
      } else {
        setServerError(msg || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent)]" />
        <div className="relative text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl font-black text-white">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">SchoolNex</h1>
              <p className="text-blue-200 text-sm">by Circle Creation</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">Start Your Free 30-Day Trial</h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Set up your institute in under 2 minutes. No credit card required. Full access to all features during trial.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-green-400/20 flex items-center justify-center shrink-0">
                <svg className="h-3 w-3 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="font-medium">Complete ERP Platform</p>
                <p className="text-blue-200 text-sm">Admissions, Attendance, Fees, Exams, Communication - all in one place</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-green-400/20 flex items-center justify-center shrink-0">
                <svg className="h-3 w-3 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="font-medium">Multi-Role Portals</p>
                <p className="text-blue-200 text-sm">Dedicated dashboards for Admin, Teachers, Students, and Parents</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-green-400/20 flex items-center justify-center shrink-0">
                <svg className="h-3 w-3 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="font-medium">Free Migration Support</p>
                <p className="text-blue-200 text-sm">Our team helps you import existing data at no extra charge</p>
              </div>
            </div>
          </div>
          <div className="mt-10 p-4 rounded-xl bg-white/10 backdrop-blur border border-white/10">
            <p className="text-sm text-blue-100">Trusted by <span className="text-white font-semibold">500+</span> institutes across India</p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full lg:w-7/12 items-center justify-center p-6 sm:p-8 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">SchoolNex</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Register Your Institute</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start your 30-day free trial. No credit card needed.</p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-3.5">
              <svg className="h-4 w-4 text-red-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
              <p className="text-sm text-red-700 dark:text-red-300">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="instituteName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institute Name <span className="text-red-500">*</span></label>
                <input id="instituteName" type="text" value={form.instituteName} onChange={handleChange('instituteName')} placeholder="e.g. Delhi Public School"
                  className={`w-full rounded-lg border ${errors.instituteName ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`} />
                {errors.instituteName && <p className="mt-1 text-xs text-red-500">{errors.instituteName}</p>}
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner / Director Name <span className="text-red-500">*</span></label>
                <input id="ownerName" type="text" value={form.ownerName} onChange={handleChange('ownerName')} placeholder="e.g. Rajesh Sharma"
                  className={`w-full rounded-lg border ${errors.ownerName ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`} />
                {errors.ownerName && <p className="mt-1 text-xs text-red-500">{errors.ownerName}</p>}
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                <input id="mobile" type="tel" value={form.mobile} onChange={handleChange('mobile')} placeholder="+91 9876543210"
                  className={`w-full rounded-lg border ${errors.mobile ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`} />
                {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input id="email" type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" placeholder="you@institute.com"
                  className={`w-full rounded-lg border ${errors.email ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} autoComplete="new-password" placeholder="Min. 8 characters"
                    className={`w-full rounded-lg border ${errors.password ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password visibility">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} autoComplete="new-password" placeholder="Re-enter password"
                  className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="agree" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                I agree to the <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>. I understand that only I (the institute owner/admin) can create accounts for students, teachers, and parents.
              </label>
            </div>

            <button type="submit" disabled={isSubmitting || !agreed}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm mt-2">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Creating your institute...
                </span>
              ) : 'Start Free Trial'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
          </p>

          <div className="mt-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">What happens after signup?</p>
            <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <li>1. Your institute account is created instantly</li>
              <li>2. You get a 30-day free trial with full access</li>
              <li>3. You are logged in as Institute Admin</li>
              <li>4. Add students, teachers, and parents from your dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
