
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/icons/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, User } from 'lucide-react';

export default function HomePage() {
  const { user, role, loading, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !loading && user && role) {
      // If user is logged in and has a role, redirect to the appropriate dashboard
      if (role === 'customer') {
        router.replace('/customer/dashboard');
      } else if (role === 'driver') {
        router.replace('/driver/dashboard');
      }
    }
    // If no user, or user without role, they stay on the homepage
  }, [user, role, loading, router, isInitializing]);

  if (loading || isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] bg-background p-8 text-center">
        <LogoIcon className="w-20 h-20 mb-6 text-primary animate-pulse" />
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-6 w-64" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] bg-background p-8 text-center">
      <LogoIcon className="w-24 h-24 mb-6 text-primary" />
      <h1 className="text-5xl font-bold text-primary mb-4">Te damos la bienvenida a GoLibre</h1>
      <p className="text-xl text-foreground mb-6">
        Digitalizando tu entorno para estar mas cerca de ti!
      </p>

      {!user ? (
        <div className="space-y-6 mt-8 w-full max-w-md">
          <p className="text-lg font-medium text-foreground">Elige cómo quieres empezar:</p>
          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={() => router.push('/auth?next=/customer/dashboard')} 
              variant="default" 
              size="lg" 
              className="w-full py-6 text-lg"
            >
              <User className="mr-3 h-6 w-6" />
              Soy Cliente
            </Button>
            <Button 
              onClick={() => router.push('/auth?next=/driver/dashboard')} 
              variant="secondary" 
              size="lg" 
              className="w-full py-6 text-lg"
            >
              <Briefcase className="mr-3 h-6 w-6" />
              Ofrecer servicios
            </Button>
          </div>
        </div>
      ) : !role ? (
        // This case should ideally lead to some role selection if not handled by auth page
        // For now, offers same choices as non-logged in, but could be a dedicated component
         <div className="space-y-6 mt-8 w-full max-w-md">
          <p className="text-lg font-medium text-foreground">Completa tu configuración:</p>
          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={() => router.push('/customer/dashboard')} 
              variant="default" 
              size="lg" 
              className="w-full py-6 text-lg"
            >
              <User className="mr-3 h-6 w-6" />
              Continuar como Cliente
            </Button>
            <Button 
              onClick={() => router.push('/driver/dashboard')} 
              variant="secondary" 
              size="lg" 
              className="w-full py-6 text-lg"
            >
              <Briefcase className="mr-3 h-6 w-6" />
              Configurar Servicios
            </Button>
          </div>
        </div>
      ) : null }
      {/* If user and role are set, useEffect will redirect, so nothing more needed here */}
    </div>
  );
}
