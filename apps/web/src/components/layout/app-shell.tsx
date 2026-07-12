'use client';

import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { Breadcrumbs } from './breadcrumbs';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isCollapsed, isMobileOpen, toggle, toggleMobile, closeMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} onCloseMobile={closeMobile} />

      <div className={cn(
        'transition-all duration-300',
        isCollapsed ? 'lg:pl-[70px]' : 'lg:pl-64'
      )}>
        <Navbar
          onToggleSidebar={toggle}
          onToggleMobile={toggleMobile}
          isSidebarCollapsed={isCollapsed}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
