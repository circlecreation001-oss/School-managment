import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'HimanshiTech Education ERP', template: '%s | Education ERP' },
  description: 'Complete School Management System — Admissions, Attendance, Fees, Exams, Library, and more for every institute.',
  keywords: ['school management', 'education erp', 'school software', 'attendance', 'fee management', 'exam management', 'student portal'],
  authors: [{ name: 'HimanshiTech' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'HimanshiTech Education ERP',
    title: 'HimanshiTech Education ERP — Complete School Management',
    description: 'One platform to manage admissions, attendance, fees, exams, and more for schools, colleges, and coaching institutes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HimanshiTech Education ERP',
    description: 'Complete School Management System for modern institutions.',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://educationerp.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
