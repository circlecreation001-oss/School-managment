'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { GraduationCap, Users, UserCheck, Briefcase } from 'lucide-react';

interface UserCardProps {
  type: 'student' | 'teacher' | 'parent' | 'staff';
}

const cardConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  student: { icon: GraduationCap, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  teacher: { icon: Users, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  parent: { icon: UserCheck, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  staff: { icon: Briefcase, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
};

export function UserCard({ type }: UserCardProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const endpoint = type === 'staff' ? '/users' : `/${type}s`;
        const res = await apiClient.get<any>(`${endpoint}?page=1&limit=1`);
        if (res.success && res.data) {
          setCount(res.data.total ?? res.data.count ?? 0);
        } else {
          setCount(0);
        }
      } catch {
        setCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, [type]);

  const config = cardConfig[type];
  const Icon = config.icon;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900">
          {loading ? (
            <span className="inline-block h-7 w-12 bg-slate-200 rounded animate-pulse" />
          ) : (
            (count ?? 0).toLocaleString()
          )}
        </p>
        <p className="text-sm text-slate-500 mt-1 capitalize">{type}s</p>
      </div>
    </div>
  );
}
