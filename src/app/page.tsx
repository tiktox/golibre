'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (!userProfile?.role) {
          router.replace('/role-selection');
        } else if (userProfile.role === 'Driver Partner') {
          router.replace('/driver/dashboard');
        } else if (userProfile.role === 'Customer') {
          router.replace('/customer/dashboard');
        }
      }
      // If not user, stay on this page to show sign-in options
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-secondary text-center">
        <div className="bg-background p-8 rounded-xl shadow-xl max-w-md w-full">
          <h1 className="text-4xl font-bold text-primary mb-6">Welcome to RideShare DriverAds</h1>
          <p className="text-muted-foreground mb-8">
            Connect with passengers or drivers. Drivers enjoy a free platform, supported by relevant ads.
          </p>
          <Link href="/sign-in" passHref>
            <Button size="lg" className="w-full">
              Get Started / Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Fallback for scenarios where user is logged in but redirection logic is still processing or failed.
  // This should ideally not be reached if useEffect logic is correct.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-secondary">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Finalizing setup...</p>
    </div>
  );
}
