'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  students: 'Students',
  teachers: 'Teachers',
  parents: 'Parents',
  attendance: 'Attendance',
  fees: 'Fees',
  exams: 'Examinations',
  homework: 'Homework',
  'study-materials': 'Study Materials',
  library: 'Library',
  notifications: 'Notifications',
  reports: 'Reports',
  settings: 'Settings',
  website: 'Website',
  admissions: 'Admissions',
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  const autoBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];
    let href = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!;
      href += `/${segment}`;
      const label = PATH_LABELS[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const isLast = i === segments.length - 1;
      crumbs.push({ label, href: isLast ? undefined : href });
    }

    return crumbs;
  };

  const breadcrumbs = items || autoBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {idx > 0 && (
              <span className="text-slate-400 dark:text-slate-500">/</span>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900 dark:text-slate-100">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
