'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/website/enquiries`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' }, body: JSON.stringify({ ...form, source: 'website' }) }
      );
      if (res.ok) setSuccess(true);
    } catch { /* silent */ }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Contact Us</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">Get in touch with us for admissions, general enquiries, or support.</p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Our Address</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">123 Education Street, Academic City, State - 123456</p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900 dark:text-slate-100">Phone</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">+91 99999 99999</p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900 dark:text-slate-100">Email</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">info@institution.edu</p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900 dark:text-slate-100">Office Hours</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Mon–Sat: 9:00 AM – 5:00 PM</p>

          {/* Google Map Embed */}
          <div className="mt-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.123456789!2d77.1234567!3d28.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDA3JzI0LjQiTiA3N8KwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Our Location" />
          </div>
        </div>

        <div>
          {success ? (
            <div className="rounded-xl border border-success-200 bg-success-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
              <p className="text-success-700 dark:text-green-400 font-medium">Thank you! Your enquiry has been submitted.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <textarea rows={4} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <button type="submit" disabled={submitting}
                className="w-full rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
