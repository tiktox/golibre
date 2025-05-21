
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/icons/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Car } from 'lucide-react'; // Icons for the new buttons

export default function HomePage() {
  const { user, role, loading, isInitializing, signIn } = useAuth(); // Added signIn
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !loading) { // Ensure local storage check is complete
      if (user && role) {
        if (role === 'customer') {
          router.replace('/customer/request-trip');
        } else if (role === 'driver') {
          router.replace('/driver/dashboard');
        }
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
      <h1 className="text-5xl font-bold text-primary mb-4">Bienvenido a GoLibre</h1>
      <p className="text-xl text-foreground mb-6">
        Conectando pasajeros y conductores. ¡Tu viaje, tu libertad!
      </p>

      {!user ? (
        <div className="space-y-6 mt-8 w-full max-w-md">
          <p className="text-lg font-medium text-foreground">Elige tu experiencia:</p>
          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={signIn} 
              variant="default" 
              size="lg" 
              className="w-full py-6 text-lg"
            >
              <Users className="mr-3 h-6 w-6" />
              Entrar como Cliente
            </Button>
            <Button 
              onClick={signIn} 
              variant="secondary" 
              size="lg" 
              className="w-full py-6 text-lg"
            >
              <Car className="mr-3 h-6 w-6" />
              Entrar como Conductor
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Serás redirigido para iniciar sesión con Google. La selección de rol se confirmará después si es necesario.
          </p>
        </div>
      ) : !role ? (
        // Fallback if redirect hasn't happened yet or user lands here unexpectedly
        <Button onClick={() => router.push('/role-selection')} variant="default" size="lg">
          Seleccionar Rol
        </Button>
      ) : null}
    </div>
  );
}
