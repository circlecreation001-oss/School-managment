import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Gallery - Education ERP', description: 'Explore our campus, events, and student activities.' };

export default function GalleryPage() {
  const CATEGORIES = ['Campus', 'Events', 'Sports', 'Labs', 'Cultural'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Gallery</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">Explore our campus life, events, and facilities.</p>

      <div className="mt-8 flex gap-3 flex-wrap">
        <button className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white">All</button>
        {CATEGORIES.map((cat) => (
          <button key={cat} className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800">
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            <span className="text-sm text-slate-400">Image {i + 1}</span>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-slate-500">Gallery images are managed through the CMS dashboard.</p>
    </div>
  );
}
