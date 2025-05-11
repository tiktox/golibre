"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import AuthButton from '@/components/auth-button';
import LogoIcon from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user, role, loading, isInitializing } = useAuth();
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
  
  // This content is primarily for non-logged-in users, as others are redirected.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] bg-background p-8 text-center">
      <LogoIcon className="w-24 h-24 mb-6 text-primary" />
      <h1 className="text-5xl font-bold text-primary mb-4">GoLibre</h1>
      <p className="text-xl text-foreground mb-8">Your Ride, Your Freedom. Drivers ride free!</p>
      {!user ? (
        <AuthButton />
      ) : !role ? (
        // Fallback if redirect hasn't happened yet or user lands here unexpectedly
        <Button onClick={() => router.push('/role-selection')} variant="default" size="lg">
          Select Your Role
        </Button>
      ) : null}
    </div>
  );
}
