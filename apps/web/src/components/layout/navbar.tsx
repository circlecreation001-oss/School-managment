'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/hooks/use-theme';
import { SidebarIcon } from './sidebar-icon';

interface NavbarProps {
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
  isSidebarCollapsed: boolean;
}

export function Navbar({ onToggleSidebar, onToggleMobile, isSidebarCollapsed }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const themeIcon = theme === 'dark' ? 'Moon' : theme === 'light' ? 'Sun' : 'Monitor';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 dark:border-slate-700 dark:bg-slate-900/95">
      {/* Left: Toggle buttons */}
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Toggle mobile menu"
        >
          <SidebarIcon name="Menu" className="h-5 w-5" />
        </button>

        {/* Desktop collapse button */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon name={isSidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} className="h-5 w-5" />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md">
        <button
          onClick={() => setShowSearch(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <SidebarIcon name="Search" className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-400 dark:border-slate-600">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label={`Theme: ${theme}`}
          title={`Theme: ${theme}`}
        >
          <SidebarIcon name={themeIcon} className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Notifications"
          >
            <SidebarIcon name="Bell" className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <SidebarIcon name="ChevronsUpDown" className="h-4 w-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setShowProfile(false); router.push('/settings/profile'); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <SidebarIcon name="User" className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={() => { setShowProfile(false); router.push('/settings'); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <SidebarIcon name="Settings" className="h-4 w-4" /> Settings
                </button>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                >
                  <SidebarIcon name="LogOut" className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global search modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={() => setShowSearch(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
              <SidebarIcon name="Search" className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, teachers, modules..."
                autoFocus
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100"
              />
              <kbd className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-400 dark:border-slate-600">ESC</kbd>
            </div>
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Start typing to search across all modules...
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
