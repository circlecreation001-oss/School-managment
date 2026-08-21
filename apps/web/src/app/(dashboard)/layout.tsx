'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { apiClient } from '@/lib/api-client';
import { ROLE_PORTALS, getPortalForRole } from '@/config/role-navigation';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, GraduationCap, Users, UserCheck,
  BookOpen, School, CalendarCheck, ClipboardList,
  FileText, IndianRupee, Library, Bell, BarChart3,
  Shield, Settings, ChevronLeft, ChevronRight, Search,
  LogOut, Menu,
} from 'lucide-react';

// Static sidebar structure — badges fetched live
interface NavItem {
  icon: any;
  label: string;
  href: string;
  permissions?: string[];
  badgeKey?: string; // key to lookup in live counts
  badgeType?: 'count' | 'percent' | 'alert';
  description?: string;
  statsEndpoint?: string; // API to fetch hover stats
  actions?: { label: string; href: string }[];
}

interface NavSection { section: string; items: NavItem[]; }

const sidebarNav: NavSection[] = [
  { section: 'OVERVIEW', items: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', description: 'Institution overview, analytics and quick insights.' },
  ]},
  { section: 'PEOPLE', items: [
    { icon: GraduationCap, label: 'Students', href: '/students', permissions: ['students:view'], badgeKey: 'students', badgeType: 'count', description: 'Manage all student records, admissions and profiles.', statsEndpoint: '/students?page=1&limit=1', actions: [{ label: 'Add Student', href: '/students' }, { label: 'View All Students', href: '/students' }] },
    { icon: Users, label: 'Teachers', href: '/teachers', permissions: ['teachers:view'], badgeKey: 'teachers', badgeType: 'count', description: 'Manage all teaching staff, subjects, classes and schedules.', statsEndpoint: '/teachers?page=1&limit=1', actions: [{ label: 'Add Teacher', href: '/teachers' }, { label: 'View All Teachers', href: '/teachers' }] },
    { icon: UserCheck, label: 'Parents', href: '/parents', permissions: ['parents:view'], badgeKey: 'parents', badgeType: 'count', description: 'Parent and guardian accounts linked to students.' },
  ]},
  { section: 'ACADEMICS', items: [
    { icon: School, label: 'Academics', href: '/academics', permissions: ['settings:view'], description: 'Classes, sections, subjects, departments and sessions.' },
    { icon: CalendarCheck, label: 'Attendance', href: '/attendance', permissions: ['attendance:view'], description: 'Daily attendance tracking and reports.' },
    { icon: FileText, label: 'Exams', href: '/exams', permissions: ['exams:view'], description: 'Schedule exams, enter marks, publish results.' },
    { icon: ClipboardList, label: 'Homework', href: '/homework', permissions: ['homework:view'], description: 'Create and manage homework assignments.' },
  ]},
  { section: 'FINANCE', items: [
    { icon: IndianRupee, label: 'Fees', href: '/fees', permissions: ['fees:view'], badgeKey: 'overdueFees', badgeType: 'alert', description: 'Fee collection, invoices and payment tracking.' },
  ]},
  { section: 'RESOURCES', items: [
    { icon: Library, label: 'Library', href: '/library', permissions: ['library:view'], description: 'Book catalog, issue/return and inventory.' },
    { icon: Bell, label: 'Notifications', href: '/notifications', permissions: ['notifications:view'], badgeKey: 'unreadNotifications', badgeType: 'alert', description: 'Send and manage notifications across channels.' },
  ]},
  { section: 'REPORTS', items: [
    { icon: BarChart3, label: 'Reports', href: '/reports', permissions: ['reports:view'], description: 'Analytics, reports and data exports.' },
  ]},
  { section: 'ADMIN', items: [
    { icon: Shield, label: 'Users', href: '/users', permissions: ['users:view'], description: 'Manage users, roles and access control.' },
    { icon: Settings, label: 'Settings', href: '/settings', permissions: ['settings:view'], description: 'Institution configuration and preferences.' },
  ]},
];

// Hook to fetch live sidebar counts
function useSidebarCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    const results: Record<string, number> = {};
    try {
      const [studentsRes, teachersRes, notifRes] = await Promise.allSettled([
        apiClient.get<any>('/students?page=1&limit=1'),
        apiClient.get<any>('/teachers?page=1&limit=1'),
        apiClient.get<any>('/notifications?limit=1'),
      ]);

      if (studentsRes.status === 'fulfilled' && studentsRes.value.success) {
        results.students = studentsRes.value.data?.total ?? 0;
      }
      if (teachersRes.status === 'fulfilled' && teachersRes.value.success) {
        results.teachers = teachersRes.value.data?.total ?? 0;
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.success) {
        const items = Array.isArray(notifRes.value.data) ? notifRes.value.data : notifRes.value.data?.items || [];
        results.unreadNotifications = items.filter((n: any) => !n.readAt).length;
      }
    } catch { /* silent */ }
    setCounts(results);
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  return { counts, refresh: fetchCounts };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<NavItem | null>(null);
  const [hoverPos, setHoverPos] = useState(0);
  const [hoverData, setHoverData] = useState<{ total?: number } | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const { counts } = useSidebarCounts();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const userRoles = user?.roles || [];

  // Determine which navigation to show based on user role
  const isAdminRole = userRoles.some(r => ['super_admin', 'tenant_admin', 'institution_admin', 'principal', 'vice_principal'].includes(r));
  const portalConfig = !isAdminRole ? getPortalForRole(userRoles) : null;

  // Icon mapping for role-specific nav items
  const iconMap: Record<string, any> = {
    LayoutDashboard, GraduationCap, Users, UserCheck, BookOpen, School, CalendarCheck, ClipboardList,
    FileText, IndianRupee, Library, Bell, BarChart3, Shield, Settings,
    FolderOpen: ClipboardList, UserPlus: UserCheck, Briefcase: Shield,
  };

  const isVisible = (item: NavItem): boolean => {
    if (item.permissions) return hasAnyPermission(item.permissions);
    return true;
  };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const handleHoverEnter = async (item: NavItem, e: React.MouseEvent) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoverPos(rect.top);
    setHoveredItem(item);
    setHoverData(null);

    // Fetch live hover data
    if (item.statsEndpoint) {
      try {
        const res = await apiClient.get<any>(item.statsEndpoint);
        if (res.success && res.data) {
          setHoverData({ total: res.data.total ?? 0 });
        }
      } catch { /* silent */ }
    }
  };

  const handleHoverLeave = () => {
    hoverTimeout.current = setTimeout(() => { setHoveredItem(null); setHoverData(null); }, 200);
  };

  const getBadge = (item: NavItem): string | null => {
    if (!item.badgeKey) return null;
    const value = counts[item.badgeKey];
    if (value === undefined || value === 0) return null;
    return value.toLocaleString();
  };

  const BadgeEl = ({ value, type }: { value: string; type?: string }) => {
    const styles: Record<string, string> = {
      count: 'bg-slate-700 text-slate-200',
      percent: 'bg-emerald-500/20 text-emerald-400',
      alert: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-md ${styles[type || 'count']}`}>
        {value}
      </span>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F172A]">
      {/* Brand */}
      <div className={`flex items-center h-[64px] shrink-0 border-b border-slate-800 ${collapsed ? 'justify-center px-3' : 'px-5 gap-3'}`}>
        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        {!collapsed && <span className="font-bold text-[15px] text-white">SchoolNex</span>}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="ml-auto p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav — role-based navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-4 px-2.5 space-y-5">
        {portalConfig ? (
          /* Role-specific navigation (student, teacher, parent, etc.) */
          <div>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                {portalConfig.label}
              </p>
            )}
            <div className="space-y-0.5">
              {portalConfig.navigation.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    } ${collapsed ? 'justify-center px-2.5' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                      active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* Admin navigation (tenant_admin, super_admin, etc.) */
          sidebarNav.map((group) => {
          const visibleItems = group.items.filter(isVisible);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.section}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  {group.section}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const badge = getBadge(item);

                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onMouseEnter={(e) => handleHoverEnter(item, e)}
                      onMouseLeave={handleHoverLeave}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-[13px] font-medium transition-all duration-200
                        ${active
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }
                        ${collapsed ? 'justify-center px-2.5' : ''}
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                        active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                      }`} />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {badge && <BadgeEl value={badge} type={item.badgeType} />}
                          {!badge && item.actions && (
                            <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })
        )}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-slate-800 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[11px] text-slate-500 capitalize truncate">{userRoles[0]?.replace(/_/g, ' ')}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button onClick={handleLogout} className="p-2 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col shrink-0 relative transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        <SidebarContent />
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="absolute -right-3 top-[76px] z-20 h-6 w-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-all">
            <ChevronRight className="h-3 w-3 text-slate-600" />
          </button>
        )}
      </aside>

      {/* Hover Info Panel — live data */}
      {hoveredItem && hoveredItem.description && !collapsed && (
        <div
          className="hidden lg:block fixed z-50 animate-fade-in"
          style={{ left: '268px', top: `${Math.min(hoverPos, window.innerHeight - 280)}px` }}
          onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
          onMouseLeave={handleHoverLeave}
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-5 w-[260px]">
            <h3 className="text-sm font-bold text-slate-900">{hoveredItem.label}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{hoveredItem.description}</p>

            {hoveredItem.statsEndpoint && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">At a Glance</p>
                {hoverData ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Total</span>
                    <span className="text-xs font-semibold text-slate-900">{hoverData.total?.toLocaleString() || '0'}</span>
                  </div>
                ) : (
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                )}
              </div>
            )}

            {hoveredItem.actions && hoveredItem.actions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Actions</p>
                <div className="space-y-1">
                  {hoveredItem.actions.map((action) => (
                    <Link key={action.label} href={action.href} className="block text-xs text-blue-600 hover:text-blue-700 font-medium py-1">
                      • {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[280px] shadow-2xl animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Nav */}
        <header className="h-[64px] flex items-center gap-4 px-4 lg:px-8 bg-white border-b border-slate-200/70 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search anything..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all duration-200" />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200">
              <Bell className="h-[18px] w-[18px]" />
              {(counts.unreadNotifications ?? 0) > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
            <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2" />
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-slate-900 leading-tight">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-slate-500 capitalize leading-tight">{userRoles[0]?.replace(/_/g, ' ')}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-white">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
