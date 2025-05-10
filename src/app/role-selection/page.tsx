'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/types';
import { Loader2, User, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RoleSelectionPage() {
  const { user, userProfile, loading, setUserRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/sign-in');
      } else if (userProfile?.role) {
        router.replace(userProfile.role === 'Driver Partner' ? '/driver/dashboard' : '/customer/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  const handleRoleSelection = async (role: UserRole) => {
    setIsSubmitting(true);
    try {
      await setUserRole(role);
      // AuthProvider's setUserRole will handle redirection
      toast({
        title: "Role Selected",
        description: `You are now registered as a ${role}.`,
      });
    } catch (error: any) {
      console.error("Error setting user role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set your role. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (loading || (!loading && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (userProfile?.role) {
     // Already has a role, should be redirected by useEffect
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Redirecting...</p>
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Choose Your Role</CardTitle>
          <CardDescription>Select how you want to use RideShare DriverAds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleRoleSelection('Customer')}
            className="w-full"
            variant="outline"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-5 w-5" />}
            I'm a Customer (Looking for rides)
          </Button>
          <Button
            onClick={() => handleRoleSelection('Driver Partner')}
            className="w-full"
            variant="default"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            I'm a Driver Partner (Offering rides)
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">You can change your role later if needed, but this sets your primary account type.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
