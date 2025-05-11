"use client";
import Link from 'next/link';
import AuthButton from './auth-button';
import LogoIcon from './icons/logo';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Home, LogOut, UserCircle, UserCog, Car } from 'lucide-react';

export default function Header() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();

  const getDashboardLink = () => {
    if (role === 'customer') return '/customer/request-trip';
    if (role === 'driver') return '/driver/dashboard';
    return '/role-selection';
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50" style={{ '--header-height': '4rem' } as React.CSSProperties}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user ? getDashboardLink() : "/"} className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <LogoIcon className="h-8 w-8" />
          <span className="text-2xl font-bold">GoLibre</span>
        </Link>
        <nav className="flex items-center gap-4">
          {user && (
            <>
              {role === 'customer' && (
                <Button variant="ghost" size="sm" onClick={() => router.push('/customer/request-trip')}>
                  <Car className="mr-2 h-4 w-4" /> Request Ride
                </Button>
              )}
              {role === 'driver' && (
                <Button variant="ghost" size="sm" onClick={() => router.push('/driver/dashboard')}>
                  <UserCog className="mr-2 h-4 w-4" /> Driver Dashboard
                </Button>
              )}
               {!role && (
                 <Button variant="ghost" size="sm" onClick={() => router.push('/role-selection')}>
                  <UserCircle className="mr-2 h-4 w-4" /> Select Role
                </Button>
               )}
            </>
          )}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
