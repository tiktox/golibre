
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
  const { user, role, loading, isInitializing, setRole } = useAuth(); // Added setRole
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitializing || loading) return; // Wait for auth state to be fully loaded

    if (!user) {
      router.replace(`/auth?redirect=${pathname}`); // Redirect to auth page if not authenticated
      return;
    }

    // Handling for pages like /role-selection (which is now a state-fixer)
    if (allowedRoles === null) { 
      if (role) { // If role is already set, redirect away from role selection-like pages
        if (role === 'customer') router.replace('/customer/request-trip');
        else if (role === 'driver') router.replace('/driver/dashboard');
        else router.replace('/'); 
      }
      // If no role, user should be on the role-selection page, which will call setRole('customer')
      return;
    }
    
    // For role-specific pages
    if (!role) { 
      // Authenticated but no role. AuthContext should set 'customer' by default.
      // If this state persists, it's an edge case.
      // Attempt to set to customer, or redirect to home as a fallback.
      // The RoleSelectionPage or AuthContext's onAuthStateChanged should typically handle this.
      // Forcing a role here might be too aggressive; redirecting allows other mechanisms to fix state.
      router.replace('/'); // Redirect to home, expecting AuthContext to resolve role or user to re-navigate.
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      // If role is set but not allowed for this page, redirect to their default dashboard
      if (role === 'customer') router.replace('/customer/request-trip');
      else if (role === 'driver') router.replace('/driver/dashboard');
      else router.replace('/'); // Fallback to home
      return;
    }

  }, [user, role, loading, isInitializing, router, allowedRoles, pathname, setRole]);

  // Conditions for showing loading/skeleton
  const showLoading = isInitializing || loading || !user ||
                      (allowedRoles === null && !!role) || // On role-selection page but role already set (waiting for redirect)
                      (allowedRoles !== null && !role && user); // On role-specific page, user exists, but role not yet (transient, waiting for redirect/role set)
                     

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
