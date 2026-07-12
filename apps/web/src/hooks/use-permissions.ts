'use client';

import { useAuth } from '@/providers/auth-provider';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.roles.includes('super_admin')) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.roles.includes('super_admin')) return true;
    return permissions.some((p) => user.permissions?.includes(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.roles.includes('super_admin')) return true;
    return permissions.every((p) => user.permissions?.includes(p));
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.some((r) => user.roles.includes(r));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole };
}
