'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { PageLoading } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface TeacherDetail {
  id: string; employeeCode: string; firstName: string; lastName: string;
  email: string | null; phone: string | null; gender: string | null;
  dob: string | null; designation: string | null; qualification: string | null;
  experience: string | null; joiningDate: string | null; status: string;
  department: { name: string } | null;
  subjects: Array<{ subject: { id: string; name: string; code: string } }>;
  qualifications: Array<{ id: string; degree: string; institution: string; year: number; percentage: number | null }>;
  experiences: Array<{ id: string; organization: string; position: string; fromDate: string; toDate: string | null; isCurrent: boolean }>;
  salary: { basic: number; hra: number; da: number; other: number; deductions: number; bankName: string | null; bankAccount: string | null } | null;
  documents: Array<{ id: string; documentType: string; fileName: string; createdAt: string }>;
}

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'qualifications' | 'experience' | 'salary' | 'subjects' | 'documents'>('profile');

  useEffect(() => {
    apiClient.get<TeacherDetail>(`/teachers/${id}`).then((res) => {
      if (res.success) setTeacher(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageLoading />;
  if (!teacher) return <div className="py-10 text-center text-slate-500">Teacher not found</div>;

  const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'qualifications', label: 'Qualifications' },
    { key: 'experience', label: 'Experience' },
    { key: 'salary', label: 'Salary' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'documents', label: 'Documents' },
  ] as const;

  return (
    <>
      <PageHeader title={`${teacher.firstName} ${teacher.lastName}`}
        description={`Employee Code: ${teacher.employeeCode} • ${teacher.designation || 'Teacher'}`}
        actions={<span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${teacher.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-slate-100 text-slate-600'}`}>{teacher.status.replace(/_/g, ' ')}</span>} />

      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="flex gap-4 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="Department" value={teacher.department?.name || '—'} />
          <Info label="Email" value={teacher.email || '—'} />
          <Info label="Phone" value={teacher.phone || '—'} />
          <Info label="Gender" value={teacher.gender || '—'} />
          <Info label="Date of Birth" value={teacher.dob ? new Date(teacher.dob).toLocaleDateString() : '—'} />
          <Info label="Joining Date" value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : '—'} />
          <Info label="Qualification" value={teacher.qualification || '—'} />
          <Info label="Experience" value={teacher.experience || '—'} />
        </div>
      )}

      {tab === 'qualifications' && (
        <div className="space-y-3">
          {teacher.qualifications.length === 0 ? <p className="text-sm text-slate-500">No qualifications added.</p> :
            teacher.qualifications.map((q) => (
              <div key={q.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="font-medium text-slate-900 dark:text-slate-100">{q.degree}</p>
                <p className="text-xs text-slate-500">{q.institution} • {q.year}{q.percentage ? ` • ${q.percentage}%` : ''}</p>
              </div>
            ))}
        </div>
      )}

      {tab === 'experience' && (
        <div className="space-y-3">
          {teacher.experiences.length === 0 ? <p className="text-sm text-slate-500">No experience added.</p> :
            teacher.experiences.map((e) => (
              <div key={e.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="font-medium text-slate-900 dark:text-slate-100">{e.position} at {e.organization}</p>
                <p className="text-xs text-slate-500">{new Date(e.fromDate).toLocaleDateString()} – {e.isCurrent ? 'Present' : e.toDate ? new Date(e.toDate).toLocaleDateString() : '—'}</p>
              </div>
            ))}
        </div>
      )}

      {tab === 'salary' && (
        <div className="max-w-md">
          {teacher.salary ? (
            <div className="grid grid-cols-2 gap-3">
              <Info label="Basic" value={`₹${teacher.salary.basic}`} />
              <Info label="HRA" value={`₹${teacher.salary.hra}`} />
              <Info label="DA" value={`₹${teacher.salary.da}`} />
              <Info label="Other" value={`₹${teacher.salary.other}`} />
              <Info label="Deductions" value={`₹${teacher.salary.deductions}`} />
              <Info label="Net" value={`₹${teacher.salary.basic + teacher.salary.hra + teacher.salary.da + teacher.salary.other - teacher.salary.deductions}`} />
              <Info label="Bank" value={teacher.salary.bankName || '—'} />
              <Info label="Account" value={teacher.salary.bankAccount || '—'} />
            </div>
          ) : <p className="text-sm text-slate-500">No salary information configured.</p>}
        </div>
      )}

      {tab === 'subjects' && (
        <div className="flex flex-wrap gap-2">
          {teacher.subjects.length === 0 ? <p className="text-sm text-slate-500">No subjects assigned.</p> :
            teacher.subjects.map((s) => (
              <span key={s.subject.id} className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                {s.subject.name}
              </span>
            ))}
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-3">
          {teacher.documents.length === 0 ? <p className="text-sm text-slate-500">No documents uploaded.</p> :
            teacher.documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{d.fileName}</p>
                  <p className="text-xs text-slate-500 capitalize">{d.documentType.replace(/_/g, ' ')}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
        </div>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-4 py-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">{value}</p>
    </div>
  );
}
