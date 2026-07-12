'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { PageLoading } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface OrgDetail {
  id: string; name: string; slug: string; domain: string | null;
  status: string; planCode: string | null; createdAt: string; trialEndsAt: string | null;
  settings: {
    brandingName: string | null; logoUrl: string | null; primaryColor: string;
    timezone: string; currency: string; language: string;
  } | null;
  institutions: Array<{ id: string; name: string; code: string; status: string }>;
  featureFlags: Array<{ feature: string; enabled: boolean }>;
  subscription: { plan: { name: string; code: string }; endDate: string; status: string } | null;
  usage: { users: number; students: number; teachers: number; institutions: number };
  _count: { users: number; institutions: number };
}

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'branding' | 'subscription' | 'admins' | 'config'>('overview');

  useEffect(() => {
    apiClient.get<OrgDetail>(`/organizations/${id}`).then((res) => {
      if (res.success) setOrg(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageLoading />;
  if (!org) return <div className="text-center py-10 text-slate-500">Organization not found</div>;

  const statusColors: Record<string, string> = {
    active: 'bg-success-50 text-success-700',
    trial: 'bg-warning-50 text-warning-700',
    suspended: 'bg-danger-50 text-danger-700',
    expired: 'bg-slate-100 text-slate-600',
  };

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'branding', label: 'Branding' },
    { key: 'subscription', label: 'Subscription' },
    { key: 'admins', label: 'Admins' },
    { key: 'config', label: 'Configuration' },
  ] as const;

  return (
    <>
      <PageHeader
        title={org.name}
        description={`Slug: ${org.slug} • Created: ${new Date(org.createdAt).toLocaleDateString()}`}
        actions={
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[org.status] || 'bg-slate-100 text-slate-600'}`}>
            {org.status}
          </span>
        }
      />

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Users" value={org.usage.users} />
          <StatCard label="Students" value={org.usage.students} />
          <StatCard label="Teachers" value={org.usage.teachers} />
          <StatCard label="Branches" value={org.usage.institutions} />

          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <InfoBlock title="Domain" value={org.domain || 'Not configured'} />
            <InfoBlock title="Plan" value={org.planCode || 'No plan'} />
            <InfoBlock title="Timezone" value={org.settings?.timezone || 'Asia/Kolkata'} />
            <InfoBlock title="Currency" value={org.settings?.currency || 'INR'} />
            <InfoBlock title="Trial Ends" value={org.trialEndsAt ? new Date(org.trialEndsAt).toLocaleDateString() : 'N/A'} />
            <InfoBlock title="Language" value={org.settings?.language || 'en'} />
          </div>
        </div>
      )}

      {tab === 'branding' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Branding Settings</h3>
          <div className="space-y-4">
            <InfoBlock title="Branding Name" value={org.settings?.brandingName || org.name} />
            <InfoBlock title="Primary Color" value={org.settings?.primaryColor || '#2563eb'} />
            <InfoBlock title="Logo" value={org.settings?.logoUrl || 'No logo uploaded'} />
          </div>
          <p className="mt-4 text-xs text-slate-400">Edit branding via the PATCH /organizations/:id/branding API</p>
        </div>
      )}

      {tab === 'subscription' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Subscription</h3>
          {org.subscription ? (
            <div className="space-y-3">
              <InfoBlock title="Plan" value={org.subscription.plan.name} />
              <InfoBlock title="Status" value={org.subscription.status} />
              <InfoBlock title="Valid Until" value={new Date(org.subscription.endDate).toLocaleDateString()} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">No active subscription. Assign a plan to activate.</p>
          )}
        </div>
      )}

      {tab === 'admins' && (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Organization Admins</h3>
          </div>
          <div className="p-5 text-sm text-slate-500">
            Manage admins via POST /organizations/:id/admins API endpoint.
          </div>
        </div>
      )}

      {tab === 'config' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Module Configuration</h3>
          <p className="text-sm text-slate-500">
            Configure attendance, examination, fee, and notification settings for this organization.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {['General', 'Attendance', 'Examination', 'Fees', 'Notifications', 'Email', 'SMS', 'WhatsApp'].map((mod) => (
              <div key={mod} className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{mod}</p>
                <p className="text-xs text-slate-400">Configure via API</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{value.toLocaleString()}</p>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-4 py-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
