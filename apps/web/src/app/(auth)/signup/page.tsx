'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

const INSTITUTE_TYPES = [
  { value: 'school', label: 'School (K-12)' },
  { value: 'college', label: 'College' },
  { value: 'coaching', label: 'Coaching Institute' },
  { value: 'university', label: 'University' },
  { value: 'training', label: 'Training Institute' },
  { value: 'computer_institute', label: 'Computer Institute' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

interface FormData {
  instituteName: string;
  ownerName: string;
  email: string;
  mobile: string;
  instituteType: string;
  city: string;
  state: string;
  country: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    instituteName: '',
    ownerName: '',
    email: '',
    mobile: '',
    instituteType: '',
    city: '',
    state: '',
    country: 'India',
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
    else if (!/^\+?[1-9]\d{6,14}$/.test(form.mobile.replace(/\s/g, ''))) e.mobile = 'Enter valid mobile (e.g. +919876543210)';
    if (!form.instituteType) e.instituteType = 'Please select institute type';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.country.trim()) e.country = 'Country is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 12) e.password = 'Min 12 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Need uppercase letter';
    else if (!/[a-z]/.test(form.password)) e.password = 'Need lowercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Need a number';
    else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = 'Need special character';
    if (!form.confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const res = await apiClient.post<any>('/auth/signup-institute', {
        instituteName: form.instituteName.trim(),
        ownerName: form.ownerName.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.replace(/\s/g, ''),
        instituteType: form.instituteType,
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        acceptTerms: true,
      });

      if (res.success && res.data) {
        // Don't auto-login — redirect to OTP verification
        router.push(`/verify-otp?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
      } else {
        setServerError(res.error?.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        setServerError('Cannot connect to server. Please check your internet connection.');
      } else {
        setServerError(msg || 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full rounded-lg border ${errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20'} bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`;

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
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
          <h2 className="text-3xl font-bold leading-tight mb-4">Start Your Free 7-Day Trial</h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Set up your institute in under 2 minutes. No credit card required. Full access to all features during trial.
          </p>
          <div className="space-y-4">
            {[
              { title: 'Complete ERP Platform', desc: 'Admissions, Attendance, Fees, Exams, Communication' },
              { title: 'Multi-Role Portals', desc: 'Admin, Teachers, Students, and Parents dashboards' },
              { title: 'Free Migration Support', desc: 'We help you import existing data at no extra charge' },
              { title: 'Automatic Setup', desc: 'Roles, permissions, sessions created instantly' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-green-400/20 flex items-center justify-center shrink-0">
                  <svg className="h-3 w-3 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-blue-200 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-4 rounded-xl bg-white/10 backdrop-blur border border-white/10">
            <p className="text-sm text-blue-100">Trusted by <span className="text-white font-semibold">500+</span> institutes across India</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-7/12 items-start justify-center p-6 sm:p-8 bg-white dark:bg-slate-950 overflow-y-auto min-h-screen">
        <div className="w-full max-w-lg py-8">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">SchoolNex</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Register Your Institute</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start your 7-day free trial. No credit card needed.</p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-3.5">
              <svg className="h-4 w-4 text-red-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
              <p className="text-sm text-red-700 dark:text-red-300">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Institute Name */}
            <div>
              <label htmlFor="instituteName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institute Name <span className="text-red-500">*</span></label>
              <input id="instituteName" type="text" value={form.instituteName} onChange={handleChange('instituteName')} placeholder="e.g. Delhi Public School" className={inputClass('instituteName')} />
              {errors.instituteName && <p className="mt-1 text-xs text-red-500">{errors.instituteName}</p>}
            </div>

            {/* Owner Name + Institute Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner / Director Name <span className="text-red-500">*</span></label>
                <input id="ownerName" type="text" value={form.ownerName} onChange={handleChange('ownerName')} placeholder="e.g. Rajesh Sharma" className={inputClass('ownerName')} />
                {errors.ownerName && <p className="mt-1 text-xs text-red-500">{errors.ownerName}</p>}
              </div>
              <div>
                <label htmlFor="instituteType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institute Type <span className="text-red-500">*</span></label>
                <select id="instituteType" value={form.instituteType} onChange={handleChange('instituteType')} className={inputClass('instituteType')}>
                  <option value="">Select type...</option>
                  {INSTITUTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.instituteType && <p className="mt-1 text-xs text-red-500">{errors.instituteType}</p>}
              </div>
            </div>

            {/* Email + Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email <span className="text-red-500">*</span></label>
                <input id="email" type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" placeholder="you@institute.com" className={inputClass('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile <span className="text-red-500">*</span></label>
                <input id="mobile" type="tel" value={form.mobile} onChange={handleChange('mobile')} placeholder="+91 9876543210" className={inputClass('mobile')} />
                {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
              </div>
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City <span className="text-red-500">*</span></label>
                <input id="city" type="text" value={form.city} onChange={handleChange('city')} placeholder="e.g. New Delhi" className={inputClass('city')} />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State <span className="text-red-500">*</span></label>
                <select id="state" value={form.state} onChange={handleChange('state')} className={inputClass('state')}>
                  <option value="">Select state...</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
              </div>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country <span className="text-red-500">*</span></label>
              <input id="country" type="text" value={form.country} onChange={handleChange('country')} className={inputClass('country')} />
              {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} autoComplete="new-password" placeholder="Min. 12 characters" className={inputClass('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password visibility">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} autoComplete="new-password" placeholder="Re-enter password" className={inputClass('confirmPassword')} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="agree" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. Only I (the institute owner/admin) can create accounts for students, teachers, and parents.
              </label>
            </div>

            {/* Submit */}
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
        </div>
      </div>
    </div>
  );
}
