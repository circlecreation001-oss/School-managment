'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { PageLoading } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface StudentDetail {
  id: string; admissionNumber: string; firstName: string; lastName: string; middleName: string | null;
  dob: string | null; gender: string | null; bloodGroup: string | null; email: string | null; phone: string | null;
  address: string | null; city: string | null; state: string | null; pincode: string | null;
  rollNumber: string | null; status: string; admissionDate: string | null; photoUrl: string | null;
  class: { id: string; name: string; code: string } | null;
  section: { id: string; name: string } | null;
  batch: { id: string; name: string } | null;
  parentLinks: Array<{ parent: { id: string; firstName: string; lastName: string; relation: string | null; phone: string | null; email: string | null; occupation: string | null } }>;
  documents: Array<{ id: string; documentType: string; fileName: string; isVerified: boolean; createdAt: string }>;
  certificates: Array<{ id: string; type: string; title: string; certificateNo: string; issuedDate: string | null }>;
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'parents' | 'documents' | 'timeline'>('profile');

  useEffect(() => {
    apiClient.get<StudentDetail>(`/students/${id}`).then((res) => {
      if (res.success) setStudent(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageLoading />;
  if (!student) return <div className="py-10 text-center text-slate-500">Student not found</div>;

  const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'parents', label: 'Parents / Guardian' },
    { key: 'documents', label: 'Documents' },
    { key: 'timeline', label: 'Timeline' },
  ] as const;

  return (
    <>
      <PageHeader title={`${student.firstName} ${student.lastName}`}
        description={`Admission No: ${student.admissionNumber} • Class: ${student.class?.name || 'N/A'}${student.section ? ' - ' + student.section.name : ''}`}
        actions={<span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${student.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-slate-100 text-slate-600'}`}>{student.status}</span>} />

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

      {tab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString() : '—'} />
          <InfoCard label="Gender" value={student.gender || '—'} />
          <InfoCard label="Blood Group" value={student.bloodGroup || '—'} />
          <InfoCard label="Email" value={student.email || '—'} />
          <InfoCard label="Phone" value={student.phone || '—'} />
          <InfoCard label="Roll Number" value={student.rollNumber || '—'} />
          <InfoCard label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '—'} />
          <InfoCard label="Address" value={[student.address, student.city, student.state, student.pincode].filter(Boolean).join(', ') || '—'} />
        </div>
      )}

      {tab === 'parents' && (
        <div className="space-y-4">
          {student.parentLinks.length === 0 ? <p className="text-sm text-slate-500">No guardians linked.</p> : (
            student.parentLinks.map((pl) => (
              <div key={pl.parent.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{pl.parent.firstName} {pl.parent.lastName}</p>
                    <p className="text-xs text-slate-500 capitalize">{pl.parent.relation}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {pl.parent.phone && <p>{pl.parent.phone}</p>}
                    {pl.parent.email && <p>{pl.parent.email}</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-3">
          {student.documents.length === 0 ? <p className="text-sm text-slate-500">No documents uploaded.</p> : (
            student.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{doc.fileName}</p>
                  <p className="text-xs text-slate-500 capitalize">{doc.documentType.replace(/_/g, ' ')}</p>
                </div>
                <span className={`text-xs font-medium ${doc.isVerified ? 'text-success-600' : 'text-warning-600'}`}>
                  {doc.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'timeline' && <p className="text-sm text-slate-500">Timeline events from audit logs.</p>}
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-4 py-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">{value}</p>
    </div>
  );
}
