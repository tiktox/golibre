'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/auth-provider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle2 } from 'lucide-react';

export default function AppHeader() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      // Handle error (e.g., show a toast message)
    }
  };

  return (
    <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          RideShare DriverAds
        </Link>
        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
          ) : user ? (
            <>
              {userProfile?.role === 'Driver Partner' && (
                <>
                  <Link href="/driver/dashboard" passHref>
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                  <Link href="/driver/profile" passHref>
                    <Button variant="ghost" size="sm">Profile</Button>
                  </Link>
                </>
              )}
               {userProfile?.role === 'Customer' && (
                <Link href="/customer/dashboard" passHref>
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              )}
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback>
                  <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/sign-in" passHref>
              <Button variant="default" size="sm">Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
