'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState, Modal } from '@/components/common';
import { apiClient } from '@/lib/api-client';

type Tab = 'pages' | 'blog' | 'gallery' | 'settings';

export default function WebsiteCMSPage() {
  const [tab, setTab] = useState<Tab>('pages');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [settings, setSettings] = useState<any>({});

  const endpoints: Record<string, string> = { pages: '/website/pages', blog: '/website/blog', gallery: '/website/gallery' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (tab === 'settings') {
      const res = await apiClient.get<any>('/organizations/me/config?module=website');
      if (res.success) {
        const configs = Array.isArray(res.data) ? res.data : [];
        const obj: any = {};
        configs.forEach((c: any) => { obj[c.key] = c.value; });
        setSettings(obj);
      }
    } else {
      const res = await apiClient.get<any>(endpoints[tab]!);
      if (res.success) setData(Array.isArray(res.data) ? res.data : []);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await apiClient.post(endpoints[tab]!, form);
    if (res.success) { setShowCreate(false); setForm({}); setToast('Created successfully'); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await apiClient.delete(`${endpoints[tab]}/${id}`);
    setToast('Deleted'); fetchData();
  };

  const saveSettings = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await apiClient.post('/website/pages', { slug: `setting-${key}`, title: key, content: value as string, pageType: 'custom', seoTitle: '', seoDescription: '' });
    }
    setToast('Settings saved'); setSaving(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pages', label: 'Pages & Hero' }, { key: 'blog', label: 'Blog' },
    { key: 'gallery', label: 'Gallery' }, { key: 'settings', label: 'SEO & Settings' },
  ];

  return (
    <>
      <PageHeader title="Website CMS" description="Manage your institution's public website content."
        actions={tab !== 'settings' ? <button onClick={() => { setForm({}); setShowCreate(true); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Create</button> : undefined} />

      {toast && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{toast}<button onClick={() => setToast('')} className="float-right font-bold">×</button></div>}

      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'settings' ? (
        <div className="max-w-2xl space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">SEO & Branding</h3>
          {[
            { key: 'site_title', label: 'Site Title' },
            { key: 'site_description', label: 'Meta Description' },
            { key: 'hero_title', label: 'Hero Title' },
            { key: 'hero_subtitle', label: 'Hero Subtitle' },
            { key: 'navbar_logo_text', label: 'Navbar Logo Text' },
            { key: 'footer_text', label: 'Footer Copyright Text' },
            { key: 'whatsapp_number', label: 'WhatsApp Number' },
            { key: 'google_analytics', label: 'Google Analytics ID' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{f.label}</label>
              <input value={settings[f.key] || ''} onChange={e => setSettings({...settings, [f.key]: e.target.value})}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" />
            </div>
          ))}
          <button onClick={saveSettings} disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      ) : loading ? <TableSkeleton rows={5} /> : data.length === 0 ? (
        <EmptyState title={`No ${tab} found`} action={<button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ Create</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">{tab === 'gallery' ? 'Category' : 'Slug/Category'}</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.title || item.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{item.slug || item.category || '—'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{item.isPublished ? 'Published' : 'Draft'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(item.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={`Create ${tab === 'pages' ? 'Page' : tab === 'blog' ? 'Blog Post' : 'Gallery Item'}`} size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          {tab === 'pages' && <>
            <div><label className="block text-sm font-medium mb-1">Title *</label><input required value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Slug *</label><input required value={form.slug || ''} onChange={e => setForm({...form, slug: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Page Type</label>
              <select value={form.pageType || 'custom'} onChange={e => setForm({...form, pageType: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm">
                <option value="home">Home / Hero</option><option value="about">About</option><option value="custom">Custom</option><option value="testimonials">Testimonials</option><option value="faculty">Faculty</option><option value="banners">Banners</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Content</label><textarea rows={5} value={form.content || ''} onChange={e => setForm({...form, content: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">SEO Title</label><input value={form.seoTitle || ''} onChange={e => setForm({...form, seoTitle: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">SEO Description</label><input value={form.seoDescription || ''} onChange={e => setForm({...form, seoDescription: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished || false} onChange={e => setForm({...form, isPublished: e.target.checked})} /><span className="text-sm">Publish immediately</span></label>
          </>}
          {tab === 'blog' && <>
            <div><label className="block text-sm font-medium mb-1">Title *</label><input required value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Slug *</label><input required value={form.slug || ''} onChange={e => setForm({...form, slug: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Category</label><input value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Excerpt</label><textarea rows={2} value={form.excerpt || ''} onChange={e => setForm({...form, excerpt: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Content *</label><textarea rows={6} required value={form.content || ''} onChange={e => setForm({...form, content: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Author Name</label><input value={form.authorName || ''} onChange={e => setForm({...form, authorName: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished || false} onChange={e => setForm({...form, isPublished: e.target.checked})} /><span className="text-sm">Publish immediately</span></label>
          </>}
          {tab === 'gallery' && <>
            <div><label className="block text-sm font-medium mb-1">Title</label><input value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Image URL *</label><input required value={form.imageUrl || ''} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm">
                <option value="">Select</option><option value="Campus">Campus</option><option value="Events">Events</option><option value="Sports">Sports</option><option value="Labs">Labs</option><option value="Cultural">Cultural</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Alt Text</label><input value={form.altText || ''} onChange={e => setForm({...form, altText: e.target.value})} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-3 py-2 text-sm" /></div>
          </>}
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button></div>
        </form>
      </Modal>
    </>
  );
}
