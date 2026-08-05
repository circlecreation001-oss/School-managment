'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { InputField } from './input-field';

const examSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  examType: z.string().min(1, 'Exam type is required'),
  totalMarks: z.coerce.number().min(1, 'Total marks required'),
  passingMarks: z.coerce.number().optional(),
  examDate: z.string().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormProps {
  type: 'create' | 'update';
  data?: any;
  relatedData?: { classes?: any[]; subjects?: any[] };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExamForm({ type, data, relatedData, onClose, onSuccess }: ExamFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: data
      ? {
          name: data.name || '',
          examType: data.examType || '',
          totalMarks: data.totalMarks || 100,
          passingMarks: data.passingMarks || undefined,
          examDate: data.examDate ? new Date(data.examDate).toISOString().split('T')[0] : '',
          classId: data.classId || '',
          subjectId: data.subjectId || '',
        }
      : { totalMarks: 100 },
  });

  const onSubmit = async (formData: ExamFormData) => {
    setLoading(true);
    setError('');
    try {
      const res = type === 'create'
        ? await apiClient.post('/exams', formData)
        : await apiClient.patch(`/exams/${data.id}`, formData);
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
        {type === 'create' ? 'Create a new exam' : 'Update exam'}
      </h1>
      {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Exam Name" register={register} name="name" error={errors.name} />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Exam Type</label>
          <select
            {...register('examType')}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Select Type</option>
            <option value="unit_test">Unit Test</option>
            <option value="mid_term">Mid Term</option>
            <option value="final">Final</option>
            <option value="practical">Practical</option>
          </select>
          {errors.examType?.message && <p className="text-xs text-red-400">{errors.examType.message}</p>}
        </div>
        <InputField label="Total Marks" type="number" register={register} name="totalMarks" error={errors.totalMarks} />
        <InputField label="Passing Marks" type="number" register={register} name="passingMarks" error={errors.passingMarks} />
        <InputField label="Exam Date" type="date" register={register} name="examDate" error={errors.examDate} />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            {...register('classId')}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Select Class</option>
            {relatedData?.classes?.map((cls: any) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            {...register('subjectId')}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Select Subject</option>
            {relatedData?.subjects?.map((sub: any) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
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
