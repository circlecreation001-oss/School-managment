'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { NAVIGATION } from '@/config/navigation';
import {
  Search, MessageSquare, Bell, LogOut, User, Settings,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

const ICON_MAP: Record<string, string> = {
  LayoutDashboard: '/home.png',
  GraduationCap: '/student.png',
  UserPlus: '/student.png',
  UserCheck: '/parent.png',
  BookOpen: '/lesson.png',
  FileEdit: '/assignment.png',
  FolderOpen: '/lesson.png',
  CalendarCheck: '/attendance.png',
  FileText: '/exam.png',
  IndianRupee: '/finance.png',
  Calculator: '/finance.png',
  Users: '/teacher.png',
  Briefcase: '/teacher.png',
  Library: '/class.png',
  Bell: '/announcement.png',
  Upload: '/assignment.png',
  BarChart3: '/result.png',
  Globe: '/home.png',
  Shield: '/setting.png',
  Settings: '/setting.png',
};

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();
  const { hasAnyPermission, hasAnyRole } = usePermissions();
  const pathname = usePathname();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await apiClient.get<any>('/notifications/unread-count');
        if (res.success && typeof res.data === 'number') {
          setUnreadCount(res.data);
        } else if (res.success && res.data?.count != null) {
          setUnreadCount(res.data.count);
        }
      } catch {
        // ignore
      }
    };
    loadUnread();
    const interval = setInterval(loadUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const isItemVisible = (item: typeof NAVIGATION[0]['items'][0]): boolean => {
    if (item.permissions && item.permissions.length > 0) {
      return hasAnyPermission(item.permissions);
    }
    if (item.roles && item.roles.length > 0) {
      return hasAnyRole(item.roles);
    }
    return true;
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="h-screen flex">
      {/* LEFT - SIDEBAR */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 overflow-y-auto">
        <Link
          href="/dashboard"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">SchoolNex</span>
        </Link>

        {/* Menu */}
        <div className="mt-4 text-sm">
          {NAVIGATION.map((group) => {
            const visibleItems = group.items.filter(isItemVisible);
            if (visibleItems.length === 0) return null;

            return (
              <div className="flex flex-col gap-2" key={group.label}>
                <span className="hidden lg:block text-gray-400 font-light my-4">
                  {group.label}
                </span>
                {visibleItems.map((item) => (
                  <Link
                    href={item.href}
                    key={item.label}
                    className={`flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight relative ${
                      isActive(item.href) ? 'bg-lamaSkyLight text-blue-600 font-medium' : ''
                    }`}
                  >
                    {ICON_MAP[item.icon] ? (
                      <Image src={ICON_MAP[item.icon]} alt="" width={20} height={20} />
                    ) : (
                      <div className="w-5 h-5 rounded bg-gray-200" />
                    )}
                    <span className="hidden lg:block">{item.label}</span>
                    {item.badge && (
                      <span className="hidden lg:inline-flex ml-auto text-[10px] bg-primary-100 text-primary-700 rounded-full px-1.5 py-0.5 font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            );
          })}

          {/* OTHER section */}
          <div className="flex flex-col gap-2">
            <span className="hidden lg:block text-gray-400 font-light my-4">
              OTHER
            </span>
            <Link
              href="/settings/profile"
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
            >
              <Image src="/profile.png" alt="" width={20} height={20} />
              <span className="hidden lg:block">Profile</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
            >
              <Image src="/setting.png" alt="" width={20} height={20} />
              <span className="hidden lg:block">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight w-full"
            >
              <Image src="/logout.png" alt="" width={20} height={20} />
              <span className="hidden lg:block">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT - CONTENT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        {/* NAVBAR */}
        <div className="flex items-center justify-between p-4">
          {/* SEARCH BAR */}
          <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-[200px] p-2 bg-transparent outline-none"
            />
          </div>
          {/* ICONS AND USER */}
          <div className="flex items-center gap-6 justify-end w-full">
            <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
              <MessageSquare className="w-4 h-4 text-gray-500" />
            </div>
            <Link href="/notifications" className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
              <Bell className="w-4 h-4 text-gray-500" />
              {unreadCount > 0 && (
                <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </Link>
            <div className="flex flex-col">
              <span className="text-xs leading-3 font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-gray-500 text-right capitalize">
                {user?.roles?.[0]?.replace(/_/g, ' ') || 'User'}
              </span>
            </div>
            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <div
                onClick={() => setShowProfile(!showProfile)}
                className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer"
              >
                <span className="text-xs font-semibold text-primary-700">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setShowProfile(false); router.push('/settings/profile'); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4" /> Profile
                    </button>
                    <button
                      onClick={() => { setShowProfile(false); router.push('/settings'); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </button>
                  </div>
                  <div className="border-t border-gray-200 p-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        {children}
      </div>
    </div>
  );
}