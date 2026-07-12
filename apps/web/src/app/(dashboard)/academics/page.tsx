'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { SidebarIcon } from '@/components/layout/sidebar-icon';
import { CardSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface AcademicSession { id: string; name: string; startDate: string; endDate: string; isCurrent: boolean; }
interface ClassItem { id: string; name: string; code: string; numericLevel: number | null; sections: Array<{ id: string; name: string }>; _count: { students: number } }

export default function AcademicsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'sessions' | 'classes' | 'subjects' | 'calendar'>('classes');

  useEffect(() => {
    Promise.all([
      apiClient.get<AcademicSession[]>('/academics/sessions'),
      apiClient.get<ClassItem[]>('/academics/classes?branchId=default'),
    ]).then(([sessRes, clsRes]) => {
      if (sessRes.success) setSessions(sessRes.data);
      if (clsRes.success) setClasses(clsRes.data);
      setLoading(false);
    });
  }, []);

  const TABS = [
    { key: 'classes', label: 'Classes & Sections' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'sessions', label: 'Academic Sessions' },
    { key: 'calendar', label: 'Calendar' },
  ] as const;

  const currentSession = sessions.find((s) => s.isCurrent);

  return (
    <>
      <PageHeader
        title="Academic Structure"
        description={currentSession ? `Current Session: ${currentSession.name}` : 'Configure your academic structure'}
        actions={
          <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
            + Add New
          </button>
        }
      />

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="flex gap-6">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {tab === 'classes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.length === 0 ? (
                <div className="col-span-full"><EmptyState title="No classes configured" description="Add classes to start building your academic structure." /></div>
              ) : classes.map((cls) => (
                <div key={cls.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{cls.name}</h3>
                    <span className="text-xs font-mono text-slate-400">{cls.code}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>{cls.sections.length} section{cls.sections.length !== 1 ? 's' : ''}</span>
                    <span>{cls._count.students} student{cls._count.students !== 1 ? 's' : ''}</span>
                  </div>
                  {cls.sections.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cls.sections.map((sec) => (
                        <span key={sec.id} className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">{sec.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'sessions' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Session</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Start</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">End</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sessions.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">No sessions configured</td></tr>
                  ) : sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(s.startDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(s.endDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {s.isCurrent ? (
                          <span className="inline-flex rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-green-900/20 dark:text-green-400">Current</span>
                        ) : (
                          <span className="text-xs text-slate-400">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'subjects' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <EmptyState title="Subjects" description="View and manage subjects from the dedicated subjects endpoint." />
            </div>
          )}

          {tab === 'calendar' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <EmptyState title="Academic Calendar" description="Calendar events will be displayed here. Add events via the calendar API." />
            </div>
          )}
        </>
      )}
    </>
  );
}
