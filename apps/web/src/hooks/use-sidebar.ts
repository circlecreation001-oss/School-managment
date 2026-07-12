'use client';

import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_KEY = 'sidebar-collapsed';
const MOBILE_BREAKPOINT = 1024;

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored) setIsCollapsed(stored === 'true');

    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return { isCollapsed, isMobileOpen, toggle, toggleMobile, closeMobile };
}
