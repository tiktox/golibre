
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/icons/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { Car } from 'lucide-react'; 

export default function HomePage() {
  const { user, role, loading, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !loading) {
      if (user && role) {
        router.replace('/driver/dashboard');
      } else if (user && !role) {
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
              onClick={() => router.push('/driver/dashboard')} // Changed to redirect to service selection
              variant="secondary" 
              size="lg" 
              className="w-full py-6 text-lg"
            >
              <Car className="mr-3 h-6 w-6" />
              Formo parte de Golibre
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Explora los servicios que puedes ofrecer.
          </p>
        </div>
      ) : !role ? (
        <Button onClick={() => router.push('/role-selection')} variant="default" size="lg">
          Configurar Cuenta
        </Button>
      ) : null}
    </div>
  );
}
