'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { TableSkeleton, EmptyState } from '@/components/common';
import { apiClient } from '@/lib/api-client';

interface StudentProfile {
  id: string;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate?: string;
  status: string;
}

export default function StudentFeesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const meRes = await apiClient.get<StudentProfile>('/students/me');
      if (meRes.success && meRes.data) {
        setStudentId(meRes.data.id);
      } else {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!studentId) return;
    const load = async () => {
      setLoading(true);
      const res = await apiClient.get<InvoiceItem[]>(`/fees/ledger/${studentId}`);
      if (res.success) {
        setInvoices(Array.isArray(res.data) ? res.data : []);
      }
      setLoading(false);
    };
    load();
  }, [studentId]);

  const statusColor: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    issued: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700',
    partially_paid: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <>
      <PageHeader title="Fee Status" description="View your invoices and payment history." />
      {loading ? (
        <TableSkeleton rows={6} />
      ) : invoices.length === 0 ? (
        <EmptyState title="No fee records" description="Your fee invoices will appear here once generated." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium">Invoice #</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Paid</th>
                <th className="px-4 py-3 text-right font-medium">Due</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{Number(inv.totalAmount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-600">₹{Number(inv.paidAmount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{Number(inv.outstandingAmount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[inv.status] || 'bg-slate-100'}`}>
                      {inv.status?.replace('_', ' ')}
                    </span>
                  </td>
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