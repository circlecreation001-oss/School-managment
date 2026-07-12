'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { apiClient } from '@/lib/api-client';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  dueDate: string | null;
  student: { firstName: string; lastName: string; admissionNumber: string };
}

export default function FeesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);
    const res = await apiClient.get<any>(`/fees/invoices?${params}`);
    if (res.success && res.data) {
      setInvoices(Array.isArray(res.data) ? res.data : res.data.invoices || []);
      setMeta(res.data.meta || null);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const statusColor: Record<string, string> = {
    paid: 'bg-green-100 text-green-700', issued: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700', partially_paid: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-slate-100 text-slate-600', draft: 'bg-slate-100 text-slate-500',
  };

  return (
    <>
      <PageHeader title="Fee Management" description="Manage invoices, payments, and fee collection." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <option value="">All Statuses</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="partially_paid">Partially Paid</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length: 8}).map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />)}</div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-500">No invoices found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Invoice #</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Student</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Total</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Paid</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Due</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Due Date</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{inv.student?.firstName} {inv.student?.lastName}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{Number(inv.totalAmount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-600">₹{Number(inv.paidAmount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{Number(inv.outstandingAmount).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[inv.status] || 'bg-slate-100'}`}>{inv.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
