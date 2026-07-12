import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About Us - Education ERP', description: 'Learn about our institution, mission, vision, and values.' };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">About Us</h1>
      <div className="mt-8 prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-slate-600 dark:text-slate-400">
          We are committed to providing quality education and fostering an environment of academic excellence, innovation, and holistic development.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-slate-900 dark:text-slate-100">Our Mission</h2>
        <p className="text-slate-600 dark:text-slate-400">To empower students with knowledge, skills, and values to become responsible global citizens.</p>
        <h2 className="mt-8 text-xl font-semibold text-slate-900 dark:text-slate-100">Our Vision</h2>
        <p className="text-slate-600 dark:text-slate-400">To be a leading institution recognized for academic excellence, innovation, and community impact.</p>
        <h2 className="mt-8 text-xl font-semibold text-slate-900 dark:text-slate-100">Infrastructure</h2>
        <p className="text-slate-600 dark:text-slate-400">Our campus features modern classrooms, well-equipped laboratories, a comprehensive library, sports facilities, and digital learning spaces.</p>
      </div>
    </div>
  );
}
