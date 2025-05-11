"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Users, ShieldCheck, Car } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";


export default function RoleSelectionPage() {
  const { setRole, user, role, loading, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(!isInitializing && !loading) {
      if (!user) {
        router.replace('/'); // If not logged in, go to home/login
      } else if (user && role) {
        // If role already set, redirect to appropriate dashboard
        if (role === 'customer') router.replace('/customer/request-trip');
        if (role === 'driver') router.replace('/driver/dashboard');
      }
    }
  }, [user, role, loading, isInitializing, router]);


  if (isInitializing || loading) {
     return <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))]">Loading role selection...</div>;
  }

  if (!user) {
    // This case should be handled by redirect, but as a fallback UI:
    return <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))]">Redirecting to login...</div>;
  }
  
  if (user && role) {
    // This case should be handled by redirect, but as a fallback UI:
    return <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))]">Redirecting to dashboard...</div>;
  }


  return (
    <ProtectedRoute allowedRoles={null}> {/* null means any authenticated user without a role */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] bg-secondary/30 p-4 sm:p-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <Users className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Select Your Role</CardTitle>
            <CardDescription className="text-md">
              Choose how you want to use GoLibre. You can change this later if needed (feature not implemented).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={() => setRole('customer')} 
              className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <Car className="mr-3 h-6 w-6" />
              I'm a Customer
            </Button>
            <Button 
              onClick={() => setRole('driver')} 
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              <ShieldCheck className="mr-3 h-6 w-6" />
              I'm a Driver Partner
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
