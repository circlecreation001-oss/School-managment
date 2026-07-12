'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ResultsPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [examType, setExamType] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/exams/results/public?rollNumber=${rollNumber}&examType=${examType}`,
        { headers: { 'x-tenant-id': 'default' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) setResult(data.data);
        else setError('No results found for the given roll number.');
      } else {
        setError('No results found. Please check your roll number and try again.');
      }
    } catch {
      setError('Unable to fetch results. Please try again later.');
    }
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-28 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900">Exam Results</h1>
          <p className="mt-3 text-slate-600">Enter your roll number to view your examination results.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number / Admission Number *</label>
              <input type="text" required value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="Enter your roll number"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type</label>
              <select value={examType} onChange={(e) => setExamType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="">All Exams</option>
                <option value="unit_test">Unit Test</option>
                <option value="mid_term">Mid Term</option>
                <option value="final">Final Exam</option>
                <option value="semester">Semester</option>
              </select>
            </div>
            <button type="submit" disabled={searching}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {searching ? 'Searching...' : 'View Results'}
            </button>
          </form>

          {error && <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Results found!</p>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left">Subject</th><th className="px-4 py-2 text-center">Marks</th><th className="px-4 py-2 text-center">Grade</th></tr></thead>
                  <tbody className="divide-y">
                    {(Array.isArray(result) ? result : [result]).map((r: any, i: number) => (
                      <tr key={i}><td className="px-4 py-2">{r.subject || r.exam?.name || 'Subject'}</td><td className="px-4 py-2 text-center">{r.marksObtained}</td><td className="px-4 py-2 text-center">{r.grade?.name || '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
