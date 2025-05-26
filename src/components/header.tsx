
"use client";
import Link from 'next/link';
import AuthButton from './auth-button';
import LogoIcon from './icons/logo';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { UserCog, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { user, role } = useAuth();
  const router = useRouter();

  const getDashboardLink = () => {
    if (user) {
      if (role === 'customer') return '/customer/dashboard';
      if (role === 'driver') return '/driver/dashboard';
    }
    return '/'; // Fallback for no user or no role yet determined
  };

  const getHeaderText = () => {
    return 'GoLibre';
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50" style={{ '--header-height': '4rem' } as React.CSSProperties}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={getDashboardLink()} className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <LogoIcon className="h-8 w-8" />
          <span className="text-xl sm:text-2xl font-bold">{getHeaderText()}</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-foreground truncate max-w-[100px] sm:max-w-[150px]" title={user.displayName || user.email || "User"}>
                  {user.displayName || user.email}
                </span>
              </div>

              {role === 'customer' && (
                 <Button variant="ghost" size="sm" onClick={() => router.push('/customer/dashboard')} className="hidden sm:inline-flex">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Panel Cliente
                </Button>
              )}
              
              {role === 'driver' && (
                <Button variant="ghost" size="sm" onClick={() => router.push('/driver/dashboard')} className="hidden sm:inline-flex">
                  <UserCog className="mr-2 h-4 w-4" /> 
                  Panel Servicios
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
