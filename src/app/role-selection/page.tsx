
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LogoIcon from '@/components/icons/logo';
import { Skeleton } from '@/components/ui/skeleton';

export default function RoleSelectionPage() {
  const { user, role, loading, isInitializing, setRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing || loading) {
      return; // Wait until auth state is confirmed
    }

    if (!user) {
      router.replace('/auth'); // If not logged in, go to auth page
      return;
    }

    if (role) { // If role is already set, redirect to driver dashboard (focusing on driver)
      router.replace('/driver/dashboard');
      return;
    }

    // If user is logged in but has no role (should be a transient state or an edge case)
    // Automatically set role to 'customer' (which will behave as driver due to UI removal) and let AuthContext handle redirection.
    if (user && !role) {
      setRole('customer'); // AuthContext redirects customer role to /driver/dashboard
    }
  }, [user, role, loading, isInitializing, router, setRole]);

  // This page should ideally not be visible for long, as it will redirect.
  // Show a generic loading/redirecting state.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] p-4">
      <LogoIcon className="w-16 h-16 mb-4 text-primary animate-pulse" />
      <p className="text-lg text-muted-foreground mb-2">Configurando tu cuenta...</p>
      <div className="space-y-2 w-full max-w-sm">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
      </div>
    </div>
  );
}
