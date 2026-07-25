import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'SchoolNex — Complete School Management ERP', template: '%s | SchoolNex' },
  description: 'SchoolNex is a cloud-based School Management ERP by Circle Creation. Manage admissions, attendance, fees, exams, library, and more for schools, colleges & coaching institutes.',
  keywords: ['school management software', 'school erp', 'education erp', 'schoolnex', 'attendance management', 'fee management', 'exam management', 'student portal', 'circle creation'],
  authors: [{ name: 'Shivam Kumar', url: 'https://schoolnex.in' }],
  creator: 'Circle Creation',
  publisher: 'Circle Creation',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://schoolnex.in',
    siteName: 'SchoolNex',
    title: 'SchoolNex — Complete School Management ERP Software',
    description: 'One platform to manage admissions, attendance, fees, exams, and more. Built for schools, colleges, and coaching institutes by Circle Creation.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SchoolNex — School Management ERP',
    description: 'Complete School Management Software for modern educational institutions.',
    creator: '@circlecreation',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://schoolnex.in'),
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
