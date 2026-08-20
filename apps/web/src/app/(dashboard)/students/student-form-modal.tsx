'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import { X, Loader2, User, Copy, Check, Eye, EyeOff } from 'lucide-react';

// ─── Validation Schema (matches backend exactly) ─────────
const createSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  middleName: z.string().max(100).optional(),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  academicSessionId: z.string().min(1, 'Academic session is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().optional(),
  bloodGroup: z.string().optional(),
  rollNumber: z.string().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  // Guardian
  guardianFirstName: z.string().optional(),
  guardianLastName: z.string().optional(),
  guardianRelation: z.enum(['father', 'mother', 'guardian']).optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal('')),
});

const editSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  middleName: z.string().max(100).optional(),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  rollNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'promoted', 'transferred', 'graduated', 'archived']).optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

interface Props {
  mode: 'create' | 'edit';
  student?: any;
  onClose: () => void;
  onSuccess: (result?: any) => void;
}

interface Credentials { username: string; password: string; }

// ─── Form Field Component ─────────────────────────────────
function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}

const inputClass = (error?: string) =>
  `w-full px-3 py-2.5 rounded-lg border text-sm transition-all duration-150 focus:outline-none focus:ring-2 ${
    error
      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400 bg-red-50/30'
      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-400 bg-white'
  } placeholder:text-slate-400`;

// ─── Credentials Panel ────────────────────────────────────
function CredentialsPanel({ credentials, studentName }: { credentials: Credentials; studentName: string }) {
  const [copied, setCopied] = useState<'username' | 'password' | null>(null);
  const [showPass, setShowPass] = useState(false);

  const copy = async (text: string, field: 'username' | 'password') => {
    await navigator.clipboard.writeText(text).catch(() => { });
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <User className="h-4 w-4 text-emerald-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-900">Account Created for {studentName}</p>
          <p className="text-xs text-emerald-700">Share these credentials with the student. They can change the password after first login.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center justify-between bg-white rounded-lg border border-emerald-200 px-3 py-2.5">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Username</p>
            <p className="text-sm font-mono font-semibold text-slate-900 mt-0.5">{credentials.username}</p>
          </div>
          <button onClick={() => copy(credentials.username, 'username')} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
            {copied === 'username' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between bg-white rounded-lg border border-emerald-200 px-3 py-2.5">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Password</p>
            <p className="text-sm font-mono font-semibold text-slate-900 mt-0.5">{showPass ? credentials.password : '••••••••'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowPass(!showPass)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => copy(credentials.password, 'password')} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
              {copied === 'password' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-emerald-700 bg-emerald-100 rounded-md px-3 py-2">
        ⚠️ This password will not be shown again. Please copy and share it now.
      </p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────
export function StudentFormModal({ mode, student, onClose, onSuccess }: Props) {
  const [sessions, setSessions] = useState<{ id: string; name: string; isCurrent: boolean }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [sections, setSections] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'academic' | 'address' | 'guardian'>('basic');
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [createdStudent, setCreatedStudent] = useState<any>(null);

  const schema = mode === 'create' ? createSchema : editSchema;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'edit' && student ? {
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      middleName: student.middleName || '',
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
      gender: student.gender || '',
      email: student.email || '',
      phone: student.phone || '',
      classId: student.classId || '',
      sectionId: student.sectionId || '',
      rollNumber: student.rollNumber || '',
      bloodGroup: student.bloodGroup || '',
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      pincode: student.pincode || '',
      status: student.status || 'active',
    } : {
      guardianRelation: 'father',
    },
  });

  const watchClassId = watch('classId');

  // Load sessions & classes
  useEffect(() => {
    Promise.all([
      apiClient.get<any>('/academics/sessions?limit=20'),
      apiClient.get<any>('/academics/classes?limit=100'),
    ]).then(([sessRes, classRes]) => {
      if (sessRes.success) {
        const items = Array.isArray(sessRes.data) ? sessRes.data : sessRes.data?.items || [];
        setSessions(items);
        // Auto-select current session in create mode
        if (mode === 'create') {
          const current = items.find((s: any) => s.isCurrent);
          if (current) setValue('academicSessionId', current.id);
        }
      }
      if (classRes.success) {
        const items = Array.isArray(classRes.data) ? classRes.data : classRes.data?.items || [];
        setClasses(items);
      }
    });
  }, []);

  // Load sections when class changes
  useEffect(() => {
    if (!watchClassId) { setSections([]); return; }
    apiClient.get<any>(`/academics/classes/${watchClassId}/sections`).then(r => {
      if (r.success) setSections(Array.isArray(r.data) ? r.data : r.data?.items || []);
    });
  }, [watchClassId]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        // Build create payload
        const payload: any = {
          firstName: data.firstName,
          lastName: data.lastName,
          academicSessionId: data.academicSessionId,
          classId: data.classId,
        };

        // Optional fields — only include if not empty
        if (data.middleName) payload.middleName = data.middleName;
        if (data.dob) payload.dob = new Date(data.dob).toISOString();
        if (data.gender) payload.gender = data.gender;
        if (data.email) payload.email = data.email;
        if (data.phone) payload.phone = data.phone;
        if (data.sectionId) payload.sectionId = data.sectionId;
        if (data.bloodGroup) payload.bloodGroup = data.bloodGroup;
        if (data.address) payload.address = data.address;
        if (data.city) payload.city = data.city;
        if (data.state) payload.state = data.state;
        if (data.pincode) payload.pincode = data.pincode;

        // Guardian
        if (data.guardianFirstName && data.guardianLastName) {
          payload.guardian = {
            firstName: data.guardianFirstName,
            lastName: data.guardianLastName,
            relation: data.guardianRelation || 'guardian',
            phone: data.guardianPhone || undefined,
            email: data.guardianEmail || undefined,
          };
        }

        const res = await apiClient.post<any>('/students', payload);
        if (res.success && res.data) {
          const result = res.data;
          setCreatedStudent(result);
          if (result.credentials) {
            setCredentials(result.credentials);
            toast.success(`Student ${result.firstName} ${result.lastName} admitted! (${result.admissionNumber})`);
            // Don't close yet — show credentials
          } else {
            toast.success(`Student ${result.firstName} ${result.lastName} admitted! (${result.admissionNumber})`);
            onSuccess(result);
          }
        } else {
          toast.error(res.error?.message || 'Failed to admit student');
        }
      } else {
        // Edit payload
        const payload: any = {};
        const fields = ['firstName', 'lastName', 'middleName', 'gender', 'email', 'phone', 'classId', 'sectionId', 'rollNumber', 'bloodGroup', 'address', 'city', 'state', 'pincode', 'status'];
        fields.forEach(f => { if (data[f] !== undefined && data[f] !== '') payload[f] = data[f]; });
        if (data.dob) payload.dob = new Date(data.dob).toISOString();

        const res = await apiClient.patch<any>(`/students/${student.id}`, payload);
        if (res.success) {
          toast.success('Student updated successfully');
          onSuccess(res.data);
        } else {
          toast.error(res.error?.message || 'Update failed');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Personal Info' },
    { id: 'academic', label: 'Academic' },
    { id: 'address', label: 'Address' },
    ...(mode === 'create' ? [{ id: 'guardian', label: 'Guardian' }] : []),
  ] as const;

  // If credentials shown, render credentials view
  if (credentials && createdStudent) {
    return (
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Student Admitted!</h3>
            <p className="text-sm text-slate-500 mt-1">Admission No: <span className="font-mono font-semibold text-slate-700">{createdStudent.admissionNumber}</span></p>
          </div>
          <CredentialsPanel credentials={credentials} studentName={`${createdStudent.firstName} ${createdStudent.lastName}`} />
          <button
            onClick={() => onSuccess(createdStudent)}
            className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Done — Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {mode === 'create' ? 'Admit New Student' : `Edit: ${student?.firstName} ${student?.lastName}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'create' ? 'Fill in the student details. Admission number will be auto-generated.' : 'Update student information'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {tabs.map(tab => {
            // Check if this tab has errors
            const basicFields = ['firstName', 'lastName', 'middleName', 'dob', 'gender', 'email', 'phone', 'bloodGroup'];
            const academicFields = ['academicSessionId', 'classId', 'sectionId', 'rollNumber'];
            const addressFields = ['address', 'city', 'state', 'pincode'];
            const guardianFields = ['guardianFirstName', 'guardianLastName', 'guardianRelation', 'guardianPhone', 'guardianEmail'];
            const tabFields: Record<string, string[]> = { basic: basicFields, academic: academicFields, address: addressFields, guardian: guardianFields };
            const hasError = Object.keys(errors).some(e => tabFields[tab.id]?.includes(e));

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700'
                    : hasError
                      ? 'border-red-400 text-red-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {hasError && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-5">

          {/* BASIC TAB */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" required error={errors.firstName?.message as string}>
                <input {...register('firstName')} placeholder="e.g. Rahul" className={inputClass(errors.firstName?.message as string)} />
              </Field>
              <Field label="Last Name" required error={errors.lastName?.message as string}>
                <input {...register('lastName')} placeholder="e.g. Sharma" className={inputClass(errors.lastName?.message as string)} />
              </Field>
              <Field label="Middle Name" error={errors.middleName?.message as string}>
                <input {...register('middleName')} placeholder="Optional" className={inputClass()} />
              </Field>
              <Field label="Date of Birth" error={errors.dob?.message as string}>
                <input type="date" {...register('dob')} className={inputClass()} max={new Date().toISOString().split('T')[0]} />
              </Field>
              <Field label="Gender" error={errors.gender?.message as string}>
                <select {...register('gender')} className={inputClass()}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Blood Group">
                <select {...register('bloodGroup')} className={inputClass()}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </Field>
              <Field label="Email" error={errors.email?.message as string}>
                <input type="email" {...register('email')} placeholder="student@email.com" className={inputClass(errors.email?.message as string)} />
              </Field>
              <Field label="Phone" error={errors.phone?.message as string}>
                <input {...register('phone')} placeholder="+91 9876543210" className={inputClass()} />
              </Field>
              {mode === 'edit' && (
                <Field label="Status">
                  <select {...register('status')} className={inputClass()}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="transferred">Transferred</option>
                    <option value="graduated">Graduated</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>
              )}
            </div>
          )}

          {/* ACADEMIC TAB */}
          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mode === 'create' && (
                <Field label="Academic Session" required error={errors.academicSessionId?.message as string}>
                  <select {...register('academicSessionId')} className={inputClass(errors.academicSessionId?.message as string)}>
                    <option value="">Select session</option>
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.isCurrent ? ' (Current)' : ''}</option>
                    ))}
                  </select>
                  {sessions.length === 0 && <p className="text-xs text-amber-600 mt-1">No sessions found. Create an academic session first.</p>}
                </Field>
              )}
              <Field label="Class" required={mode === 'create'} error={errors.classId?.message as string}>
                <select {...register('classId')} className={inputClass(errors.classId?.message as string)}>
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {classes.length === 0 && <p className="text-xs text-amber-600 mt-1">No classes found. Create a class first.</p>}
              </Field>
              <Field label="Section">
                <select {...register('sectionId')} className={inputClass()} disabled={!watchClassId}>
                  <option value="">Select section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {watchClassId && sections.length === 0 && <p className="text-xs text-slate-400 mt-1">No sections found for this class.</p>}
              </Field>
              <Field label="Roll Number">
                <input {...register('rollNumber')} placeholder="Auto-assigned or enter manually" className={inputClass()} />
              </Field>
            </div>
          )}

          {/* ADDRESS TAB */}
          {activeTab === 'address' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Address">
                  <textarea {...register('address')} rows={2} placeholder="Street address" className={`${inputClass()} resize-none`} />
                </Field>
              </div>
              <Field label="City">
                <input {...register('city')} placeholder="City" className={inputClass()} />
              </Field>
              <Field label="State">
                <input {...register('state')} placeholder="State" className={inputClass()} />
              </Field>
              <Field label="Pincode">
                <input {...register('pincode')} placeholder="PIN Code" className={inputClass()} />
              </Field>
            </div>
          )}

          {/* GUARDIAN TAB (create only) */}
          {activeTab === 'guardian' && mode === 'create' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                Adding a guardian is optional. A parent account will be auto-created if an email is provided.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Guardian First Name">
                  <input {...register('guardianFirstName')} placeholder="First name" className={inputClass()} />
                </Field>
                <Field label="Guardian Last Name">
                  <input {...register('guardianLastName')} placeholder="Last name" className={inputClass()} />
                </Field>
                <Field label="Relation">
                  <select {...register('guardianRelation')} className={inputClass()}>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </Field>
                <Field label="Guardian Phone">
                  <input {...register('guardianPhone')} placeholder="+91 9876543210" className={inputClass()} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Guardian Email" error={errors.guardianEmail?.message as string}>
                    <input type="email" {...register('guardianEmail')} placeholder="guardian@email.com" className={inputClass(errors.guardianEmail?.message as string)} />
                    <p className="text-[11px] text-slate-400 mt-1">A parent login account will be created if email is provided.</p>
                  </Field>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-2 w-2 rounded-full transition-colors ${activeTab === tab.id ? 'bg-blue-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleSubmit(onSubmit)();
                // If validation fails, switch to the tab with the first error
                setTimeout(() => {
                  const errs = Object.keys(errors);
                  if (errs.length > 0) {
                    const basicFields = ['firstName', 'lastName', 'middleName', 'dob', 'gender', 'email', 'phone', 'bloodGroup'];
                    const academicFields = ['academicSessionId', 'classId', 'sectionId', 'rollNumber'];
                    const addressFields = ['address', 'city', 'state', 'pincode'];
                    const guardianFields = ['guardianFirstName', 'guardianLastName', 'guardianRelation', 'guardianPhone', 'guardianEmail'];
                    if (errs.some(e => academicFields.includes(e))) setActiveTab('academic');
                    else if (errs.some(e => basicFields.includes(e))) setActiveTab('basic');
                    else if (errs.some(e => addressFields.includes(e))) setActiveTab('address');
                    else if (errs.some(e => guardianFields.includes(e))) setActiveTab('guardian');
                  }
                }, 100);
              }}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Admit Student' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
