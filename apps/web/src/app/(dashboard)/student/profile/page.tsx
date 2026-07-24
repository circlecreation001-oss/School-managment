'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

export default function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  useEffect(() => { if (user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: '' }); }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await apiClient.patch(`/users/${user?.id}`, form);
    if (res.success) { setToast('Profile updated'); await refreshUser(); }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="My Profile" description="View and update your profile information." />
      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}</div>}
      <div className="max-w-lg rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl font-bold text-blue-600">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-blue-600 mt-0.5">{user?.roles?.join(', ')}</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
              <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
              <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input disabled value={user?.email || ''} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed" /></div>
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </>
  );
}
