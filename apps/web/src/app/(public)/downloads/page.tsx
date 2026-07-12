'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MaterialItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  downloadCount: number;
}

export default function DownloadsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/study-materials?visibility=all`,
          { headers: { 'x-tenant-id': 'default' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) setMaterials(data.data);
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchMaterials();
  }, []);

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-28 pb-16 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900">Study Material Downloads</h1>
          <p className="mt-3 text-slate-600">Access study materials, notes, and resources shared by our faculty.</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white">
            <p className="text-slate-500">No study materials available for public download at this time.</p>
            <p className="text-xs text-slate-400 mt-1">Materials will appear here when published by faculty.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((mat) => (
              <div key={mat.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="shrink-0 h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="text-lg">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{mat.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {mat.category && <span className="bg-slate-100 px-2 py-0.5 rounded">{mat.category}</span>}
                    <span>{formatSize(mat.fileSize)}</span>
                    <span>{mat.downloadCount} downloads</span>
                  </div>
                </div>
                <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/study-materials/${mat.id}/download`}
                  className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors">
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
