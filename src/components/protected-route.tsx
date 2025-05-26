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
    
    // Si el usuario está autenticado pero no tiene rol
    if (!role) {
      // Si la página requiere roles específicos, redirigir a auth
      if (allowedRoles && allowedRoles.length > 0) {
        router.replace(`/auth?next=${pathname}`);
      }
      return;
    }

    // Verificar si el usuario tiene el rol permitido
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      // Si el usuario es un conductor y está intentando acceder a una página de restaurante
      if (role === 'driver' && pathname.includes('/services/restaurant')) {
        // Permitir el acceso ya que los conductores pueden acceder a las páginas de restaurante
        return;
      }
      
      // Para otros casos, redirigir al dashboard correspondiente
      if (role === 'customer') {
        router.replace('/customer/dashboard');
      } else if (role === 'driver') {
        router.replace('/driver/dashboard');
      } else {
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
