'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Breadcrumbs } from './breadcrumbs';

/**
 * LayoutWrapper - Conditional layout based on route type
 *
 * This component checks if the current route is public (auth pages)
 * and renders the appropriate layout:
 * - Public routes: Clean layout without sidebar/topbar (login, register, etc)
 * - Protected routes: Full layout with sidebar, topbar, and breadcrumbs
 */

// Public routes that should have a clean layout without sidebar/topbar
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/reset-senha',
];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current route is a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // Render clean layout for public routes (authentication pages)
  if (isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        {children}
      </div>
    );
  }

  // Render full layout for protected routes (dashboard, applications, etc)
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
