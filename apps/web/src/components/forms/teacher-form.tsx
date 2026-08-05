'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { InputField } from './input-field';

const teacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  qualification: z.string().optional(),
  designation: z.string().optional(),
  employeeCode: z.string().min(1, 'Employee code is required'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  type: 'create' | 'update';
  data?: any;
  relatedData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TeacherForm({ type, data, onClose, onSuccess }: TeacherFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: data
      ? {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || undefined,
          qualification: data.qualification || '',
          designation: data.designation || '',
          employeeCode: data.employeeCode || '',
        }
      : undefined,
  });

  const onSubmit = async (formData: TeacherFormData) => {
    setLoading(true);
    setError('');

    try {
      let res;
      if (type === 'create') {
        res = await apiClient.post('/teachers', formData);
      } else {
        res = await apiClient.patch(`/teachers/${data.id}`, formData);
      }

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error?.message || 'Operation failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new teacher' : 'Update teacher'}
      </h1>

      {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Employee Code" register={register} name="employeeCode" error={errors.employeeCode} />
        <InputField label="First Name" register={register} name="firstName" error={errors.firstName} />
        <InputField label="Last Name" register={register} name="lastName" error={errors.lastName} />
        <InputField label="Email" type="email" register={register} name="email" error={errors.email} />
        <InputField label="Phone" register={register} name="phone" error={errors.phone} />
        <InputField label="Qualification" register={register} name="qualification" error={errors.qualification} />
        <InputField label="Designation" register={register} name="designation" error={errors.designation} />
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
          {errors.gender?.message && <p className="text-xs text-red-400">{errors.gender.message}</p>}
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
