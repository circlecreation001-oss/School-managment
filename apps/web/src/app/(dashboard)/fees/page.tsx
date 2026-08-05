'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Pagination } from '@/components/ui/pagination';
import { TableSearch } from '@/components/ui/table-search';
import { usePermissions } from '@/hooks/use-permissions';
import { IndianRupee, SlidersHorizontal, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

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

const statusColor: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  issued: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-slate-100 text-slate-600',
  draft: 'bg-slate-100 text-slate-500',
};

function FeesContent() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ totalCollected: 0, totalPending: 0, overdue: 0, totalInvoices: 0 });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await apiClient.get<any>(`/fees/invoices?${params}`);
      if (res.success && res.data) {
        const items = res.data.invoices || res.data.items || (Array.isArray(res.data) ? res.data : []);
        setInvoices(items);
        setTotal(res.data.total || res.data.meta?.total || items.length);

        // Compute stats from data
        const paid = items.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0);
        const pending = items.filter((i: any) => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum: number, i: any) => sum + Number(i.outstandingAmount), 0);
        const overdueCount = items.filter((i: any) => i.status === 'overdue').length;
        setStats({ totalCollected: paid, totalPending: pending, overdue: overdueCount, totalInvoices: items.length });
      }
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* STATS */}
      <div className="flex gap-4 justify-between flex-wrap">
        <div className="rounded-2xl bg-lamaSkyLight p-4 flex-1 min-w-[130px]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Collected</span>
          </div>
          <h1 className="text-xl font-semibold mt-2">₹{stats.totalCollected.toLocaleString('en-IN')}</h1>
        </div>
        <div className="rounded-2xl bg-lamaYellowLight p-4 flex-1 min-w-[130px]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <h1 className="text-xl font-semibold mt-2">₹{stats.totalPending.toLocaleString('en-IN')}</h1>
        </div>
        <div className="rounded-2xl bg-lamaPurpleLight p-4 flex-1 min-w-[130px]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-500">Overdue</span>
          </div>
          <h1 className="text-xl font-semibold mt-2">{stats.overdue}</h1>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 flex-1 min-w-[130px] border border-slate-200">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary-600" />
            <span className="text-sm text-gray-500">Invoices</span>
          </div>
          <h1 className="text-xl font-semibold mt-2">{stats.totalInvoices}</h1>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-lg font-semibold">Fee Invoices</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="issued">Issued</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="partially_paid">Partially Paid</option>
            </select>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <IndianRupee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No invoices found.</p>
          </div>
        ) : (
          <table className="w-full mt-4">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th className="p-2">Student</th>
                <th className="hidden md:table-cell p-2">Invoice #</th>
                <th className="p-2 text-right">Total</th>
                <th className="hidden md:table-cell p-2 text-right">Paid</th>
                <th className="hidden lg:table-cell p-2 text-right">Outstanding</th>
                <th className="p-2">Status</th>
                <th className="hidden lg:table-cell p-2">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                >
                  <td className="flex items-center gap-4 p-4">
                    <div className="h-10 w-10 rounded-full bg-lamaYellow flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {inv.student?.firstName?.charAt(0)}{inv.student?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold">{inv.student?.firstName} {inv.student?.lastName}</h3>
                      <p className="text-xs text-gray-500">{inv.student?.admissionNumber}</p>
                    </div>
                  </td>
                  <td className="hidden md:table-cell p-2 font-mono text-xs">{inv.invoiceNumber}</td>
                  <td className="p-2 text-right font-medium">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="hidden md:table-cell p-2 text-right text-green-600">₹{Number(inv.paidAmount).toLocaleString('en-IN')}</td>
                  <td className="hidden lg:table-cell p-2 text-right text-red-600">₹{Number(inv.outstandingAmount).toLocaleString('en-IN')}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[inv.status] || 'bg-slate-100'}`}>
                      {inv.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell p-2 text-xs text-gray-500">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination page={page} count={total} />
      </div>
    </div>
  );
}

export default function FeesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <FeesContent />
    </Suspense>
  );
}
