'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { BigCalendar } from '@/components/calendar/big-calendar';
import { Announcements } from '@/components/ui/announcements';
import {
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Droplets,
  GraduationCap,
} from 'lucide-react';

interface StudentDetail {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  admissionNumber: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  photoUrl?: string;
  status: string;
  class?: { name: string };
  section?: { name: string };
  batch?: { name: string };
  branch?: { name: string };
}

export default function StudentDetailPage() {
  const params = useParams();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await apiClient.get<any>(`/students/${params.id}`);
        if (res.success && res.data) {
          setStudent(res.data);
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchStudent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!student) {
    return <div className="p-4 text-center text-gray-500">Student not found</div>;
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.firstName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  {student.firstName} {student.middleName || ''} {student.lastName}
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {student.class?.name || ''}{student.section ? ` - ${student.section.name}` : ''}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-gray-500" />
                  <span>{student.bloodGroup || 'N/A'}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span>{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{student.email || 'N/A'}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{student.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <GraduationCap className="w-6 h-6 text-primary-500" />
              <div>
                <h1 className="text-xl font-semibold">{student.admissionNumber}</h1>
                <span className="text-sm text-gray-400">Admission No.</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <MapPin className="w-6 h-6 text-primary-500" />
              <div>
                <h1 className="text-sm font-medium">{student.address || 'No address'}</h1>
                <span className="text-sm text-gray-400">Address</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM - Schedule */}
        <div className="mt-4 bg-white dark:bg-slate-900 rounded-md p-4 h-[800px]">
          <h1 className="text-xl font-semibold">Student Schedule</h1>
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
