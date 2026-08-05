'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { InputField } from './input-field';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  code: z.string().min(1, 'Class code is required'),
  academicSessionId: z.string().min(1, 'Session is required'),
  numericLevel: z.coerce.number().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormProps {
  type: 'create' | 'update';
  data?: any;
  relatedData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClassForm({ type, data, relatedData, onClose, onSuccess }: ClassFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: data
      ? { name: data.name || '', code: data.code || '', academicSessionId: data.academicSessionId || '', numericLevel: data.numericLevel }
      : undefined,
  });

  const sessions = relatedData?.sessions || [];

  const onSubmit = async (formData: ClassFormData) => {
    setLoading(true);
    setError('');
    try {
      const res = type === 'create'
        ? await apiClient.post('/academics/classes', formData)
        : await apiClient.patch(`/academics/classes/${data.id}`, formData);
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

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new class' : 'Update class'}
      </h1>
      {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Class Name" register={register} name="name" error={errors.name} />
        <InputField label="Class Code" register={register} name="code" error={errors.code} />
        <InputField label="Numeric Level" type="number" register={register} name="numericLevel" error={errors.numericLevel} />
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
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md border border-gray-300 text-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="bg-primary-500 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50 hover:bg-primary-600">
          {loading ? 'Saving...' : type === 'create' ? 'Create' : 'Update'}
        </button>
      </div>
    </form>
  );
}