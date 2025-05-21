
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
  const { user, role, loading, isInitializing, setRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitializing || loading) return; 

    if (!user) {
      router.replace(`/auth?redirect=${pathname}`); 
      return;
    }

    if (allowedRoles === null) { 
      if (role) { 
        // If role is already set, redirect to driver dashboard (focus on driver)
        router.replace('/driver/dashboard');
      }
      return;
    }
    
    if (!role) { 
      // Authenticated but no role. AuthContext should set 'customer' (which redirects to driver) by default.
      router.replace('/'); 
      return;
    }

    // If current role is 'customer', it's treated as 'driver' for UI purposes.
    // So, if allowedRoles expects 'driver', a 'customer' role should pass.
    // If allowedRoles specifically and only expects 'customer' (which is now removed),
    // then access should be denied (redirected).
    const effectiveRole = role === 'customer' ? 'driver' : role;

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
      // Role is not allowed for this page.
      // Redirect to driver dashboard as the main available authenticated section.
      router.replace('/driver/dashboard');
      return;
    }

  }, [user, role, loading, isInitializing, router, allowedRoles, pathname, setRole]);

  const showLoading = isInitializing || loading || !user ||
                      (allowedRoles === null && !!role) || 
                      (allowedRoles !== null && !role && user);                     

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
