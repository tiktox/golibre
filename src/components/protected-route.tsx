
"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, type UserRole } from '@/contexts/auth-context';
import LogoIcon from './icons/logo';
import { Skeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[] | null; 
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading, isInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitializing || loading) return; 

    if (!user) {
      router.replace(`/auth?next=${pathname}`); 
      return;
    }
    
    // If allowedRoles is explicitly null, it means any authenticated user can access (used for /role-selection before stricter logic)
    // However, this state should be rare now. More typically, pages will have specific allowedRoles.
    if (allowedRoles === null) {
        // This path might be for pages like /role-selection that decide where to go next.
        // If user has a role, they shouldn't linger here.
        if (role === 'customer') {
            router.replace('/customer/dashboard');
            return;
        }
        if (role === 'driver') {
            router.replace('/driver/dashboard');
            return;
        }
        // If user is authenticated but no role, they should be on a page that helps them get a role or homepage.
        // For now, if allowedRoles is null and no role, let it pass, assuming the page handles it.
        return; 
    }
    
    // If there's no role yet, and the page requires specific roles, redirect to auth or homepage.
    // This handles the case where user is authenticated but role assignment is pending or failed.
    if (!role) { 
      router.replace(`/auth?next=${pathname}`); // Or perhaps to '/' to choose a path
      return;
    }

    // Standard role check
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      // User's role is not in the allowed list. Redirect to their respective dashboard.
      if (role === 'customer') {
        router.replace('/customer/dashboard');
      } else if (role === 'driver') {
        router.replace('/driver/dashboard');
      } else {
        // Fallback if role is somehow invalid, go to homepage
        router.replace('/');
      }
      return;
    }

  }, [user, role, loading, isInitializing, router, allowedRoles, pathname]);

  // Determine if loading screen should be shown
  let showLoadingScreen = isInitializing || loading;
  if (user && allowedRoles && allowedRoles.length > 0 && !role) {
    // User is logged in, page requires specific roles, but role is not yet determined
    showLoadingScreen = true;
  }
  if (user && role && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // User is logged in, has a role, but it's not allowed - redirection is happening, show loader
    showLoadingScreen = true;
  }
  if (!user && allowedRoles && allowedRoles.length > 0) {
    // User is not logged in, but page requires roles (implies auth needed) - redirection to auth is happening
    showLoadingScreen = true;
  }


  if (showLoadingScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] p-4">
        <LogoIcon className="w-16 h-16 mb-4 text-primary animate-pulse" />
        <p className="text-lg text-muted-foreground mb-2">Cargando...</p> {/* Simplified message */}
        <div className="space-y-2 w-full max-w-sm">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
