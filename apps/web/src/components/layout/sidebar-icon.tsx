'use client';

import {
  LayoutDashboard, GraduationCap, Users, UserCheck, CalendarCheck,
  FileText, BookOpen, FolderOpen, IndianRupee, Library, Bell,
  BarChart3, Globe, UserPlus, Settings, Menu, X, Search,
  Moon, Sun, Monitor, ChevronLeft, ChevronRight, LogOut,
  User, ChevronsUpDown, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  CalendarCheck,
  FileText,
  BookOpen,
  FolderOpen,
  IndianRupee,
  Library,
  Bell,
  BarChart3,
  Globe,
  UserPlus,
  Settings,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  Monitor,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  ChevronsUpDown,
};

interface SidebarIconProps {
  name: string;
  className?: string;
}

export function SidebarIcon({ name, className }: SidebarIconProps) {
  const Icon = iconMap[name];
  if (!Icon) return <div className={className} />;
  return <Icon className={className} />;
}
