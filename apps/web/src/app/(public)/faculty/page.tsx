'use client';

import { motion } from 'framer-motion';
import type { Metadata } from 'next';

const FACULTY = [
  { name: 'Dr. Rajesh Kumar', designation: 'Principal', department: 'Administration', qualification: 'Ph.D. Education', experience: '25+ years', image: null },
  { name: 'Mrs. Priya Sharma', designation: 'Vice Principal', department: 'Science', qualification: 'M.Sc., B.Ed.', experience: '18 years', image: null },
  { name: 'Mr. Arun Patel', designation: 'HOD - Mathematics', department: 'Mathematics', qualification: 'M.Sc. Mathematics', experience: '15 years', image: null },
  { name: 'Dr. Sunita Verma', designation: 'HOD - Science', department: 'Science', qualification: 'Ph.D. Physics', experience: '20 years', image: null },
  { name: 'Mr. Deepak Singh', designation: 'HOD - English', department: 'English', qualification: 'M.A. English, B.Ed.', experience: '12 years', image: null },
  { name: 'Mrs. Kavita Gupta', designation: 'Senior Teacher', department: 'Computer Science', qualification: 'MCA, B.Ed.', experience: '10 years', image: null },
  { name: 'Mr. Sanjay Tiwari', designation: 'Sports Director', department: 'Physical Education', qualification: 'M.P.Ed.', experience: '14 years', image: null },
  { name: 'Mrs. Anjali Mishra', designation: 'Senior Teacher', department: 'Social Studies', qualification: 'M.A. History, B.Ed.', experience: '11 years', image: null },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function FacultyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-28 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Our Faculty</h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">Meet our experienced and dedicated team of educators committed to nurturing excellence.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACULTY.map((member, i) => (
            <motion.div key={member.name} initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">{member.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">{member.name}</h3>
              <p className="text-sm font-medium text-blue-600 mt-1">{member.designation}</p>
              <p className="text-xs text-slate-500 mt-2">{member.department}</p>
              <p className="text-xs text-slate-400 mt-1">{member.qualification}</p>
              <p className="text-xs text-slate-400">{member.experience} experience</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">Faculty profiles are managed through the admin dashboard.</p>
        </div>
      </div>
    </div>
  );
}
