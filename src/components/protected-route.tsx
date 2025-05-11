"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, type UserRole } from '@/contexts/auth-context';
import LogoIcon from './icons/logo';
import { Skeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  /** 
   * List of roles allowed to access this route. 
   * If `null`, any authenticated user without a specific role can access (e.g., role selection page).
   * If `undefined` or empty array, any authenticated user with *any* role can access.
   */
  allowedRoles?: UserRole[] | null; 
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading, isInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitializing || loading) return; // Wait for auth state to be fully loaded

    if (!user) {
      router.replace(`/?redirect=${pathname}`); // Redirect to login if not authenticated
      return;
    }

    if (allowedRoles === null) { // For pages like role selection
      if (role) { // If role is already set, redirect away from role selection
        if (role === 'customer') router.replace('/customer/request-trip');
        else if (role === 'driver') router.replace('/driver/dashboard');
        else router.replace('/'); 
      }
      // If no role, user should be on this page (e.g. /role-selection), so no redirect.
      return;
    }
    
    // For role-specific pages
    if (!role) { // If authenticated but no role, and not on a page allowing this (allowedRoles !== null)
      router.replace('/role-selection');
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      // If role is set but not allowed for this page, redirect to their default dashboard
      if (role === 'customer') router.replace('/customer/request-trip');
      else if (role === 'driver') router.replace('/driver/dashboard');
      else router.replace('/'); // Fallback to home
      return;
    }

  }, [user, role, loading, isInitializing, router, allowedRoles, pathname]);

  // Conditions for showing loading/skeleton
  const showLoading = isInitializing || loading || !user || 
                      (allowedRoles === null && role) || // waiting for redirect from role-selection if role is set
                      (allowedRoles !== null && !role) || // waiting for redirect to role-selection
                      (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)); // waiting for redirect due to wrong role

  if (showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] p-4">
        <LogoIcon className="w-16 h-16 mb-4 text-primary animate-pulse" />
        <p className="text-lg text-muted-foreground mb-2">Securing your session...</p>
        <div className="space-y-2 w-full max-w-sm">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
