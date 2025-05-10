'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Loader2 } from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/sign-in');
      } else if (userProfile?.role !== 'Customer') {
        // If role is not set or is 'Driver Partner', redirect
        router.replace(userProfile?.role ? '/driver/dashboard' : '/role-selection');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !user || userProfile?.role !== 'Customer') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Customer Dashboard</CardTitle>
          <CardDescription>This area is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome, {userProfile?.displayName || 'Customer'}! Features for requesting rides, viewing history, managing payments, and rating drivers are coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
