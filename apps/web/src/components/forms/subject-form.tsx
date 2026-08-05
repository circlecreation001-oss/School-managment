'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { InputField } from './input-field';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  type: z.enum(['theory', 'practical', 'both']).optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  type: 'create' | 'update';
  data?: any;
  relatedData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubjectForm({ type, data, onClose, onSuccess }: SubjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: data
      ? { name: data.name || '', code: data.code || '', type: data.type || undefined }
      : undefined,
  });

  const onSubmit = async (formData: SubjectFormData) => {
    setLoading(true);
    setError('');
    try {
      const res = type === 'create'
        ? await apiClient.post('/academics/subjects', formData)
        : await apiClient.patch(`/academics/subjects/${data.id}`, formData);
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
        {type === 'create' ? 'Create a new subject' : 'Update subject'}
      </h1>
      {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Subject Name" register={register} name="name" error={errors.name} />
        <InputField label="Subject Code" register={register} name="code" error={errors.code} />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Type</label>
          <select
            {...register('type')}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Select Type</option>
            <option value="theory">Theory</option>
            <option value="practical">Practical</option>
            <option value="both">Both</option>
          </select>
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
