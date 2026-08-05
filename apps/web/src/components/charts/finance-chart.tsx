'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '@/lib/api-client';

interface MonthlyFinance {
  name: string;
  income: number;
  expense: number;
}

export function FinanceChart() {
  const [data, setData] = useState<MonthlyFinance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await apiClient.get<any>(`/fees/reports/revenue?year=${year}`);
        if (res.success && res.data && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          setData(months.map((name) => ({ name, income: 0, expense: 0 })));
        }
      } catch {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setData(months.map((name) => ({ name, income: 0, expense: 0 })));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-section-title text-slate-900">Finance</h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[80%]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: '#d1d5db' }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: '#d1d5db' }}
              tickLine={false}
              tickMargin={20}
            />
            <Tooltip />
            <Legend
              align="center"
              verticalAlign="top"
              wrapperStyle={{ paddingTop: '10px', paddingBottom: '30px' }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#C3EBFA"
              strokeWidth={5}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#CFCEFF"
              strokeWidth={5}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
