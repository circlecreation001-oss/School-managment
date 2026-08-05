'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { InputField } from './input-field';

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  classId: z.string().min(1, 'Class is required'),
  academicSessionId: z.string().min(1, 'Academic session is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  sectionId: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  type: 'create' | 'update';
  data?: any;
  relatedData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentForm({ type, data, relatedData, onClose, onSuccess }: StudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: data
      ? {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          classId: data.classId || '',
          academicSessionId: data.academicSessionId || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || undefined,
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          address: data.address || '',
          sectionId: data.sectionId || '',
        }
      : undefined,
  });

  const onSubmit = async (formData: StudentFormData) => {
    setLoading(true);
    setError('');

    try {
      let res;
      if (type === 'create') {
        res = await apiClient.post('/students', formData);
      } else {
        res = await apiClient.patch(`/students/${data.id}`, formData);
      }

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error?.message || res.error?.details?.map((d: any) => d.message).join(', ') || 'Operation failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const classes = relatedData?.classes || [];
  const sessions = relatedData?.sessions || [];

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new student' : 'Update student'}
      </h1>

      {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

      <span className="text-xs text-gray-400 font-medium">Personal Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="First Name" register={register} name="firstName" error={errors.firstName} />
        <InputField label="Last Name" register={register} name="lastName" error={errors.lastName} />
        <InputField label="Email" type="email" register={register} name="email" error={errors.email} />
        <InputField label="Phone" register={register} name="phone" error={errors.phone} />
        <InputField label="Date of Birth" type="date" register={register} name="dob" error={errors.dob} />
        <InputField label="Address" register={register} name="address" error={errors.address} />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Gender</label>
          <select
            {...register('gender')}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <span className="text-xs text-gray-400 font-medium">Academic Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Academic Session *</label>
          <select
            {...register('academicSessionId')}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Select Session</option>
            {sessions.map((ses: any) => (
              <option key={ses.id} value={ses.id}>{ses.name}</option>
            ))}
          </select>
          {errors.academicSessionId && <p className="text-xs text-red-400">{errors.academicSessionId.message}</p>}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class *</label>
          <select
            {...register('classId')}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Select Class</option>
            {classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          {errors.classId && <p className="text-xs text-red-400">{errors.classId.message}</p>}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Section</label>
          <select
            {...register('sectionId')}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Select Section</option>
            {relatedData?.sections?.map((sec: any) => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-4 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-500 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50 hover:bg-primary-600"
        >
          {loading ? 'Saving...' : type === 'create' ? 'Create' : 'Update'}
        </button>
      </div>
    </form>
  );
}