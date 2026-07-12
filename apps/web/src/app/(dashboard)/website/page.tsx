'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface PageItem { id: string; slug: string; title: string; pageType: string; isPublished: boolean; sortOrder: number }

export default function WebsiteCMSPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pages' | 'blog' | 'gallery' | 'enquiries'>('pages');

  useEffect(() => {
    apiClient.get<PageItem[]>('/website/pages').then((res) => {
      if (res.success) setPages(res.data);
      setLoading(false);
    });
  }, []);

  const TABS = [
    { key: 'pages', label: 'Pages' },
    { key: 'blog', label: 'Blog Posts' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'enquiries', label: 'Enquiries' },
  ] as const;

  return (
    <>
      <PageHeader title="Website CMS" description="Manage your institution's public website content."
        actions={<button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">+ New Page</button>} />

      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="flex gap-6">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'pages' && (
        <div className="space-y-3">
          {pages.length === 0 ? (
            <EmptyState title="No pages" description="Create website pages to build your public site." />
          ) : pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{p.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">/{p.slug} • {p.pageType}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.isPublished ? 'bg-success-50 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
                {p.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'blog' && <EmptyState title="Blog Management" description="Create and manage blog posts via the blog API." />}
      {tab === 'gallery' && <EmptyState title="Gallery Management" description="Upload and organize gallery images via the gallery API." />}
      {tab === 'enquiries' && <EmptyState title="Contact Enquiries" description="View and manage visitor enquiries submitted from the public website." />}
    </>
  );
}
