'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

const ENTITIES = [
  { value: 'students', label: 'Students', icon: '🎓' },
  { value: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
  { value: 'staff', label: 'Staff', icon: '👤' },
  { value: 'classes', label: 'Classes', icon: '🏫' },
  { value: 'parents', label: 'Parents', icon: '👨‍👩‍👧' },
  { value: 'subjects', label: 'Subjects', icon: '📚' },
];

const STEPS = ['Select Type', 'Upload File', 'Map Columns', 'Validate', 'Import'];

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export default function ImportPage() {
  const [step, setStep] = useState(0);
  const [entity, setEntity] = useState('');
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [duplicateAction, setDuplicateAction] = useState('skip');
  const [autoCreate, setAutoCreate] = useState(true);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Parse CSV/Excel client-side (simple CSV parser for now)
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;

    const hdrs = lines[0]!.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      hdrs.forEach((h, i) => { obj[h] = values[i] || ''; });
      return obj;
    });

    setHeaders(hdrs);
    setRawData(rows);

    // Auto-detect mappings
    try {
      const res = await apiClient.post<{ mappings: Record<string, string>; unmapped: string[] }>('/imports/detect', { headers: hdrs });
      if (res.success && res.data) setMappings(res.data.mappings);
    } catch { /* use empty */ }

    setStep(2);
  }, []);

  const handleValidate = async () => {
    const res = await apiClient.post<any>('/imports/validate', { entity, data: rawData, mappings });
    if (res.success && res.data) setValidation(res.data);
    setStep(3);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await apiClient.post<ImportResult>('/imports/process', {
        entity, data: rawData, mappings, duplicateAction, autoCreate,
      });
      if (res.success && res.data) setResult(res.data);
    } catch { setResult({ imported: 0, updated: 0, skipped: 0, failed: rawData.length, errors: [{ row: 0, message: 'Import failed' }] }); }
    setImporting(false);
    setStep(4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Import</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Import students, teachers, and other data from CSV or Excel files.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{i + 1}</div>
            <span className={`text-xs font-medium ${i <= step ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {/* Step 0: Select Entity */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">What do you want to import?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ENTITIES.map(e => (
                <button key={e.value} onClick={() => { setEntity(e.value); setStep(1); }}
                  className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${entity === e.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                  <span className="text-2xl">{e.icon}</span>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{e.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upload your file</h2>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center">
              <svg className="h-12 w-12 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Drop your CSV or Excel file here, or click to browse</p>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="mt-4 text-sm" />
              <p className="mt-4 text-xs text-slate-400">Supported: .csv, .xlsx, .xls (max 10,000 rows)</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => setStep(0)} className="text-sm text-slate-600 hover:text-blue-600">Back</button>
            </div>
          </div>
        )}

        {/* Step 2: Map Columns */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Map Columns</h2>
            <p className="text-sm text-slate-500 mb-4">We detected {headers.length} columns and {rawData.length} rows. Verify the mappings below.</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {headers.map(h => (
                <div key={h} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400 w-40 truncate">{h}</span>
                  <span className="text-slate-400">&#8594;</span>
                  <input
                    value={mappings[h] || ''}
                    onChange={e => setMappings(p => ({ ...p, [h]: e.target.value }))}
                    placeholder="(auto-detected or type field name)"
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={autoCreate} onChange={e => setAutoCreate(e.target.checked)} className="rounded" />
                Auto-create missing classes/sections
              </label>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-slate-600">Duplicates:</span>
              {['skip', 'update', 'create_new'].map(a => (
                <button key={a} onClick={() => setDuplicateAction(a)}
                  className={`text-xs px-3 py-1 rounded-full border ${duplicateAction === a ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
                  {a.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg">Back</button>
              <button onClick={handleValidate} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Validate Data</button>
            </div>
          </div>
        )}

        {/* Step 3: Validate */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Validation Results</h2>
            {validation && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{validation.validCount}</p>
                    <p className="text-xs text-emerald-700">Valid rows</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                    <p className="text-2xl font-bold text-red-600">{validation.errorCount}</p>
                    <p className="text-xs text-red-700">Errors</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                    <p className="text-2xl font-bold text-amber-600">{validation.duplicates?.length || 0}</p>
                    <p className="text-xs text-amber-700">Duplicates</p>
                  </div>
                </div>
                {validation.errors?.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
                    {validation.errors.slice(0, 10).map((err: any, i: number) => (
                      <p key={i} className="text-xs text-red-600">Row {err.row}: {err.field} - {err.message}</p>
                    ))}
                    {validation.errors.length > 10 && <p className="text-xs text-slate-400 mt-1">...and {validation.errors.length - 10} more errors</p>}
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg">Back</button>
              <button onClick={handleImport} disabled={importing} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {importing && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                {importing ? 'Importing...' : `Import ${validation?.validCount || 0} Records`}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && result && (
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Import Complete</h2>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50"><p className="text-xl font-bold text-emerald-600">{result.imported}</p><p className="text-xs text-emerald-700">Imported</p></div>
              <div className="p-3 rounded-lg bg-blue-50"><p className="text-xl font-bold text-blue-600">{result.updated}</p><p className="text-xs text-blue-700">Updated</p></div>
              <div className="p-3 rounded-lg bg-slate-50"><p className="text-xl font-bold text-slate-600">{result.skipped}</p><p className="text-xs text-slate-700">Skipped</p></div>
              <div className="p-3 rounded-lg bg-red-50"><p className="text-xl font-bold text-red-600">{result.failed}</p><p className="text-xs text-red-700">Failed</p></div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-4 text-left max-h-32 overflow-y-auto border rounded-lg p-3">
                {result.errors.map((err, i) => <p key={i} className="text-xs text-red-600">Row {err.row}: {err.message}</p>)}
              </div>
            )}
            <div className="mt-6">
              <button onClick={() => { setStep(0); setResult(null); setRawData([]); setHeaders([]); setMappings({}); setValidation(null); }}
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Import More Data</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
