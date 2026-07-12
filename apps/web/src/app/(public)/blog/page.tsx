'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  authorName: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/website/blog?published=true`,
          { headers: { 'x-tenant-id': 'default' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) setPosts(data.data);
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-28 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Blog & Current Affairs</h1>
          <p className="mt-3 text-lg text-slate-600">Latest news, educational updates, and insights from our institution.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse">
                <div className="h-40 bg-slate-200 rounded-xl mb-4" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No posts yet</h3>
            <p className="text-sm text-slate-500 mt-1">Blog posts will appear here once published from the CMS.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                <div className="h-44 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  {post.featuredImage ? <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" /> : <span className="text-3xl">📝</span>}
                </div>
                <div className="p-5">
                  {post.category && <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2">{post.category}</span>}
                  <h2 className="text-base font-semibold text-slate-900 line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 text-sm text-slate-600 line-clamp-3">{post.excerpt}</p>}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>{post.authorName || 'Admin'}</span>
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
