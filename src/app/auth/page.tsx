
import { Suspense } from 'react';
import AuthClientContent from './auth-client-content';
import { Skeleton } from '@/components/ui/skeleton';
import LogoIcon from '@/components/icons/logo';

function AuthPageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] bg-secondary/20 p-4 sm:p-8">
      <LogoIcon className="w-20 h-20 mb-6 text-primary animate-pulse" />
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-10 w-full" /> {/* TabsList skeleton */}
        <Skeleton className="h-12 w-full" /> {/* CardHeader title skeleton */}
        <Skeleton className="h-8 w-3/4" />   {/* CardHeader description skeleton */}
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-full" /> {/* Email input skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Password input skeleton */}
        </div>
        <Skeleton className="h-12 w-full" /> {/* Button skeleton */}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthClientContent />
    </Suspense>
  );
}
