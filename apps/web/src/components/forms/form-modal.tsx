'use client';

import { useState } from 'react';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load forms for code splitting
const TeacherForm = dynamic(() => import('./teacher-form'), {
  loading: () => <FormLoader />,
});
const StudentForm = dynamic(() => import('./student-form'), {
  loading: () => <FormLoader />,
});
const ClassForm = dynamic(() => import('./class-form'), {
  loading: () => <FormLoader />,
});
const SubjectForm = dynamic(() => import('./subject-form'), {
  loading: () => <FormLoader />,
});
const ExamForm = dynamic(() => import('./exam-form'), {
  loading: () => <FormLoader />,
});

function FormLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  );
}

type FormType = 'create' | 'update' | 'delete';
type TableType = 'teacher' | 'student' | 'class' | 'subject' | 'exam' | 'parent' | 'attendance' | 'event' | 'announcement';

interface FormModalProps {
  table: TableType;
  type: FormType;
  data?: any;
  id?: string;
  relatedData?: any;
  onSuccess?: () => void;
}

const forms: Record<string, (props: any) => React.ReactNode> = {
  teacher: (props) => <TeacherForm {...props} />,
  student: (props) => <StudentForm {...props} />,
  class: (props) => <ClassForm {...props} />,
  subject: (props) => <SubjectForm {...props} />,
  exam: (props) => <ExamForm {...props} />,
};

export function FormModal({ table, type, data, id, relatedData, onSuccess }: FormModalProps) {
  const [open, setOpen] = useState(false);

  const size = type === 'create' ? 'w-8 h-8' : 'w-7 h-7';
  const bgColor =
    type === 'create'
      ? 'bg-lamaYellow'
      : type === 'update'
        ? 'bg-lamaSky'
        : 'bg-lamaPurple';

  const Icon = type === 'create' ? Plus : type === 'update' ? Pencil : Trash2;

  const handleClose = () => {
    setOpen(false);
  };

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
        onClick={() => setOpen(true)}
        title={`${type} ${table}`}
      >
        <Icon className="w-4 h-4" />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto">
            {type === 'delete' ? (
              <DeleteForm
                table={table}
                id={id}
                onClose={handleClose}
                onSuccess={handleSuccess}
              />
            ) : forms[table] ? (
              forms[table]({
                type,
                data,
                relatedData,
                onClose: handleClose,
                onSuccess: handleSuccess,
              })
            ) : (
              <p className="text-center text-gray-500 py-4">Form not available for {table}</p>
            )}
            <button
              className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Delete confirmation form
function DeleteForm({
  table,
  id,
  onClose,
  onSuccess,
}: {
  table: string;
  id?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!id) return;
    setLoading(true);
    setError('');

    try {
      const { apiClient } = await import('@/lib/api-client');
      const endpoint = `/${table}s/${id}`;
      const res = await apiClient.delete(endpoint);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error?.message || 'Failed to delete');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <span className="text-center font-medium">
        All data will be lost. Are you sure you want to delete this {table}?
      </span>
      {error && <p className="text-center text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 justify-center">
        <button
          onClick={onClose}
          className="py-2 px-4 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-700 text-white py-2 px-4 rounded-md border-none text-sm disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
