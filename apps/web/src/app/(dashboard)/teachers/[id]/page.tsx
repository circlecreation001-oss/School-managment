'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { BigCalendar } from '@/components/calendar/big-calendar';
import { Announcements } from '@/components/ui/announcements';
import { CalendarDays, Phone, Mail, Briefcase } from 'lucide-react';

interface TeacherDetail {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  qualification?: string;
  designation?: string;
  photoUrl?: string;
  status: string;
  department?: { name: string };
  branch?: { name: string };
  subjects?: { id: string; name: string }[];
}

export default function TeacherDetailPage() {
  const params = useParams();
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await apiClient.get<any>(`/teachers/${params.id}`);
        if (res.success && res.data) {
          setTeacher(res.data);
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchTeacher();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!teacher) {
    return <div className="p-4 text-center text-gray-500">Teacher not found</div>;
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaYellow py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                {teacher.photoUrl ? (
                  <img
                    src={teacher.photoUrl}
                    alt={teacher.firstName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  {teacher.firstName} {teacher.lastName}
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  teacher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {teacher.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{teacher.designation || 'Teacher'}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span>{teacher.employeeCode}</span>
                </div>
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span>{teacher.dob ? new Date(teacher.dob).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{teacher.email || 'N/A'}</span>
                </div>
                <div className="w-full md:w-1/3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{teacher.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Briefcase className="w-6 h-6 text-primary-500" />
              <div>
                <h1 className="text-sm font-semibold">{teacher.department?.name || 'General'}</h1>
                <span className="text-sm text-gray-400">Department</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Briefcase className="w-6 h-6 text-primary-500" />
              <div>
                <h1 className="text-sm font-medium">{teacher.qualification || 'N/A'}</h1>
                <span className="text-sm text-gray-400">Qualification</span>
              </div>
            </div>
            {teacher.subjects && teacher.subjects.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-md w-full">
                <h2 className="text-sm font-medium text-gray-500 mb-2">Subjects</h2>
                <div className="flex flex-wrap gap-1">
                  {teacher.subjects.map((sub) => (
                    <span key={sub.id} className="px-2 py-1 rounded bg-lamaPurpleLight text-xs">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* BOTTOM - Schedule */}
        <div className="mt-4 bg-white dark:bg-slate-900 rounded-md p-4 h-[800px]">
          <h1 className="text-xl font-semibold">Teacher Schedule</h1>
          <BigCalendar />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <Announcements />
      </div>
    </div>
  );
}
