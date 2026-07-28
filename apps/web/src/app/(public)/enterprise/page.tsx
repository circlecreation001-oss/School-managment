'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

const STEPS = ['Institution', 'Details', 'Modules', 'Integrations', 'Hosting', 'Requirements', 'Timeline', 'Budget'];

const SCHOOL_TYPES = ['School', 'College', 'University', 'Coaching', 'Institute'];
const STUDENT_RANGES = ['Below 300', '300-1000', '1000-3000', '3000-5000', '5000+'];
const BUDGET_RANGES = ['Below ₹50,000', '₹50,000 - ₹1,00,000', '₹1,00,000 - ₹3,00,000', '₹3,00,000 - ₹5,00,000', 'Above ₹5,00,000'];
const HOSTING_OPTIONS = ['Cloud Hosted', 'Dedicated Server', 'Self Hosted'];

const MODULES = [
  'Admission', 'Student Management', 'Attendance', 'Fees', 'Examination', 'Library',
  'Transport', 'Hostel', 'HR', 'Payroll', 'Inventory', 'Communication',
  'Parent App', 'Teacher App', 'Admin App', 'Homework', 'Assignments',
  'Online Classes', 'LMS', 'Certificates', 'Reports', 'Analytics',
];

const INTEGRATIONS = [
  'WhatsApp API', 'SMS Gateway', 'Email', 'Biometric Device', 'RFID',
  'GPS Tracking', 'Google Meet', 'Zoom', 'Microsoft Teams', 'Google Classroom',
  'Razorpay', 'PhonePe', 'Paytm', 'UPI', 'Tally', 'API Integration', 'ERP Integration', 'Custom API',
];

interface FormData {
  schoolName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  website: string;
  schoolType: string;
  students: string;
  staff: string;
  branches: string;
  city: string;
  state: string;
  country: string;
  modules: string[];
  integrations: string[];
  hosting: string;
  requirements: string;
  goLiveDate: string;
  demoDate: string;
  demoTime: string;
  budget: string;
}

export default function EnterprisePage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    schoolName: '', contactPerson: '', designation: '', email: '', phone: '', website: '',
    schoolType: '', students: '', staff: '', branches: '', city: '', state: '', country: 'India',
    modules: [], integrations: [], hosting: 'Cloud Hosted',
    requirements: '', goLiveDate: '', demoDate: '', demoTime: '', budget: '',
  });

  const update = (field: keyof FormData, value: string | string[]) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const toggleArray = (field: 'modules' | 'integrations', val: string) => {
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter((v) => v !== val) : [...p[field], val],
    }));
  };

  const next = () => { if (step < STEPS.length - 1) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.post('/website/enterprise-leads', form);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Cannot connect to server. Please try again later.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Inquiry Submitted Successfully!</h1>
          <p className="text-slate-600 mb-2">Thank you for your interest in SchoolNex Enterprise.</p>
          <p className="text-sm text-slate-500 mb-8">Our enterprise solutions team will contact you within 24 hours to discuss your requirements and schedule a personalized demo.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/home" className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Back to Home</Link>
            <a href="https://wa.me/919572495969?text=Hi,%20I%20just%20submitted%20an%20Enterprise%20inquiry%20on%20SchoolNex." target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 rounded-xl bg-green-600 text-sm font-medium text-white hover:bg-green-700 transition-colors">Chat on WhatsApp</a>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors';
  const selectClass = inputClass;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Enterprise Solution</h1>
          <p className="mt-2 text-slate-600">Get a fully customized School Management ERP tailored to your institution.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs font-medium text-blue-600">{STEPS[step]}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          {/* Step 1: Institution */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Institution Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">School Name *</label><input value={form.schoolName} onChange={(e) => update('schoolName', e.target.value)} placeholder="e.g. Delhi Public School" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Contact Person *</label><input value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} placeholder="Full name" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Designation</label><input value={form.designation} onChange={(e) => update('designation', e.target.value)} placeholder="e.g. Principal, Director" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@school.com" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 9876543210" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Website (Optional)</label><input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="www.school.com" className={inputClass} /></div>
              </div>
            </div>
          )}

          {/* Step 2: Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Institution Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">School Type *</label><select value={form.schoolType} onChange={(e) => update('schoolType', e.target.value)} className={selectClass}><option value="">Select type</option>{SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Number of Students *</label><select value={form.students} onChange={(e) => update('students', e.target.value)} className={selectClass}><option value="">Select range</option>{STUDENT_RANGES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Number of Staff</label><input type="number" value={form.staff} onChange={(e) => update('staff', e.target.value)} placeholder="e.g. 50" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Number of Branches</label><input type="number" value={form.branches} onChange={(e) => update('branches', e.target.value)} placeholder="e.g. 3" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">City *</label><input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="e.g. New Delhi" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">State *</label><input value={form.state} onChange={(e) => update('state', e.target.value)} placeholder="e.g. Delhi" className={inputClass} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Country</label><input value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClass} /></div>
            </div>
          )}

          {/* Step 3: Modules */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Required Modules</h2>
              <p className="text-sm text-slate-500 mb-4">Select all modules you need. ({form.modules.length} selected)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MODULES.map((m) => (
                  <button key={m} type="button" onClick={() => toggleArray('modules', m)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${form.modules.includes(m) ? 'bg-blue-50 border-blue-300 text-blue-700 border' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    {form.modules.includes(m) && <span className="mr-1.5">&#10003;</span>}{m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Integrations */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Required Integrations</h2>
              <p className="text-sm text-slate-500 mb-4">Select integrations you need. ({form.integrations.length} selected)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTEGRATIONS.map((i) => (
                  <button key={i} type="button" onClick={() => toggleArray('integrations', i)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${form.integrations.includes(i) ? 'bg-blue-50 border-blue-300 text-blue-700 border' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    {form.integrations.includes(i) && <span className="mr-1.5">&#10003;</span>}{i}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Hosting */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Hosting Preference</h2>
              <div className="space-y-3">
                {HOSTING_OPTIONS.map((h) => (
                  <button key={h} type="button" onClick={() => update('hosting', h)}
                    className={`w-full px-4 py-4 rounded-xl text-left text-sm font-medium transition-all border ${form.hosting === h ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-3">
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${form.hosting === h ? 'border-blue-600' : 'border-slate-300'}`}>
                        {form.hosting === h && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                      </span>
                      {h}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Custom Requirements */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Custom Requirements</h2>
              <p className="text-sm text-slate-500 mb-3">Describe any specific features, workflows, or customizations you need.</p>
              <textarea rows={6} value={form.requirements} onChange={(e) => update('requirements', e.target.value)} placeholder="e.g. We need custom fee structures for different categories, biometric integration with existing devices, migration from our current software..." className={inputClass} />
            </div>
          )}

          {/* Step 7: Timeline */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Implementation Timeline</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Preferred Go-Live Date</label><input type="date" value={form.goLiveDate} onChange={(e) => update('goLiveDate', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Preferred Demo Date</label><input type="date" value={form.demoDate} onChange={(e) => update('demoDate', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Preferred Demo Time</label><input type="time" value={form.demoTime} onChange={(e) => update('demoTime', e.target.value)} className={inputClass} /></div>
            </div>
          )}

          {/* Step 8: Budget */}
          {step === 7 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Budget Range</h2>
              <p className="text-sm text-slate-500 mb-4">This helps us recommend the right solution for you.</p>
              <div className="space-y-2">
                {BUDGET_RANGES.map((b) => (
                  <button key={b} type="button" onClick={() => update('budget', b)}
                    className={`w-full px-4 py-3.5 rounded-xl text-left text-sm font-medium transition-all border ${form.budget === b ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-3">
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${form.budget === b ? 'border-blue-600' : 'border-slate-300'}`}>
                        {form.budget === b && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                      </span>
                      {b}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={prev} disabled={step === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all">
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md disabled:opacity-50 transition-all flex items-center gap-2">
                {submitting ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</>
                ) : 'Submit Inquiry'}
              </button>
            )}
          </div>
        </div>

        {/* Help */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Need help? <a href="https://wa.me/919572495969" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Chat on WhatsApp</a> or call <a href="tel:+919572495969" className="text-blue-600 hover:underline">+91 9572495969</a>
        </p>
      </div>
    </div>
  );
}
