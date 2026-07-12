'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    applicantName: '', dob: '', gender: '', classApplied: '',
    email: '', phone: '', address: '',
    guardianName: '', guardianPhone: '', guardianRelation: '', guardianOccupation: '',
    previousSchool: '', source: 'website',
  });

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/students/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
        body: JSON.stringify(form),
      });
      if (res.ok) setSuccess(true);
    } catch { /* handle error */ }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center rounded-2xl border border-green-200 bg-green-50 p-10">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800">Application Submitted!</h2>
          <p className="mt-3 text-green-700">Your admission application has been received. Our team will review it and contact you shortly.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-28 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Online Admission Form</h1>
          <p className="mt-2 text-slate-600">Fill in the details below to apply for admission.</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500 px-2">
            <span>Student Info</span><span>Guardian</span><span>Review</span>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input type="text" required value={form.applicantName} onChange={(e) => update('applicantName', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input type="date" required value={form.dob} onChange={(e) => update('dob', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                  <select required value={form.gender} onChange={(e) => update('gender', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Class Applying For *</label>
                  <select required value={form.classApplied} onChange={(e) => update('classApplied', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Class</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input type="tel" required value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Previous School</label>
                <input type="text" value={form.previousSchool} onChange={(e) => update('previousSchool', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="pt-4 flex justify-end">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Next →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Guardian Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Guardian Name *</label>
                  <input type="text" required value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Guardian Phone *</label>
                  <input type="tel" required value={form.guardianPhone} onChange={(e) => update('guardianPhone', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Relation</label>
                  <select value={form.guardianRelation} onChange={(e) => update('guardianRelation', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select</option><option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                  <input type="text" value={form.guardianOccupation} onChange={(e) => update('guardianOccupation', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              </div>
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
                <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Review & Submit</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">Name</span><p className="font-medium text-slate-900">{form.applicantName || '—'}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">Class</span><p className="font-medium text-slate-900">{form.classApplied || '—'}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">Phone</span><p className="font-medium text-slate-900">{form.phone || '—'}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">Email</span><p className="font-medium text-slate-900">{form.email || '—'}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">Guardian</span><p className="font-medium text-slate-900">{form.guardianName || '—'}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">Guardian Phone</span><p className="font-medium text-slate-900">{form.guardianPhone || '—'}</p></div>
              </div>
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
                <button type="submit" disabled={submitting} className="px-8 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
