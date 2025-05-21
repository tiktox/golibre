
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/icons/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { Car } from 'lucide-react'; // Removed Users icon

export default function HomePage() {
  const { user, role, loading, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !loading) {
      if (user && role) {
        // If user has a role, redirect to driver dashboard regardless of role for now
        router.replace('/driver/dashboard');
      } else if (user && !role) {
        // Role selection page will handle setting default role and redirecting
        router.replace('/role-selection'); 
      }
    }
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
          <p className="text-lg font-medium text-foreground">Únete o inicia sesión:</p>
          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={() => router.push('/auth')} 
              variant="secondary" 
              size="lg" 
              className="w-full py-6 text-lg"
            >
              <Car className="mr-3 h-6 w-6" />
              Formo parte de Golibre
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Serás redirigido para iniciar sesión o registrarte.
          </p>
        </div>
      ) : !role ? (
         // This state should be transient, role-selection page will handle it
        <Button onClick={() => router.push('/role-selection')} variant="default" size="lg">
          Configurar Cuenta
        </Button>
      ) : null}
    </div>
  );
}
