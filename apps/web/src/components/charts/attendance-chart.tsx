'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '@/lib/api-client';

interface AttendanceDay {
  name: string;
  present: number;
  absent: number;
}

export function AttendanceChart() {
  const [data, setData] = useState<AttendanceDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        const startStr = startDate.toISOString().split('T')[0];
        const res = await apiClient.get<any>(`/attendance/analytics?startDate=${startStr}&endDate=${endDate}`);
        if (res.success && res.data?.trend && Array.isArray(res.data.trend)) {
          setData(res.data.trend);
        } else {
          setData([]);
        }
      } catch {
        setData([
          { name: 'Mon', present: 0, absent: 0 },
          { name: 'Tue', present: 0, absent: 0 },
          { name: 'Wed', present: 0, absent: 0 },
          { name: 'Thu', present: 0, absent: 0 },
          { name: 'Fri', present: 0, absent: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-section-title text-slate-900">Attendance</h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[90%]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: '#d1d5db' }}
              tickLine={false}
            />
            <YAxis axisLine={false} tick={{ fill: '#d1d5db' }} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '10px', borderColor: 'lightgray' }}
            />
            <Legend
              align="left"
              verticalAlign="top"
              wrapperStyle={{ paddingTop: '20px', paddingBottom: '40px' }}
            />
            <Bar
              dataKey="present"
              fill="#FAE27C"
              legendType="circle"
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="absent"
              fill="#C3EBFA"
              legendType="circle"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}