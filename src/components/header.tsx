
"use client";
import Link from 'next/link';
import AuthButton from './auth-button';
import LogoIcon from './icons/logo';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Car, UserCog, UserCircle, LogOut } from 'lucide-react'; // Removed Home

export default function Header() {
  const { user, role } = useAuth(); // Removed signOut as AuthButton handles it
  const router = useRouter();

  const getDashboardLink = () => {
    if (role === 'customer') return '/customer/request-trip';
    if (role === 'driver') return '/driver/dashboard';
    return '/role-selection'; // Fallback if role not set but user exists
  };

  const getHeaderText = () => {
    if (user && role) {
      if (role === 'customer') return 'Cliente / GoLibre';
      if (role === 'driver') return 'Conductor / GoLibre';
    }
    return 'GoLibre';
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50" style={{ '--header-height': '4rem' } as React.CSSProperties}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user ? getDashboardLink() : "/"} className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
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
                {role && (
                  <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full hidden md:inline-block">
                    {role === 'customer' ? 'Cliente' : 'Conductor'}
                  </span>
                )}
              </div>

              {/* Role specific buttons - consider moving to a dropdown for smaller screens if more are added */}
              {role === 'customer' && (
                <Button variant="ghost" size="sm" onClick={() => router.push('/customer/request-trip')} className="hidden sm:inline-flex">
                  <Car className="mr-2 h-4 w-4" /> Solicitar Viaje
                </Button>
              )}
              {role === 'driver' && (
                <Button variant="ghost" size="sm" onClick={() => router.push('/driver/dashboard')} className="hidden sm:inline-flex">
                  <UserCog className="mr-2 h-4 w-4" /> Panel Conductor
                </Button>
              )}
               {!role && ( // If user is logged in but no role selected
                 <Button variant="ghost" size="sm" onClick={() => router.push('/role-selection')} className="hidden sm:inline-flex">
                  <UserCircle className="mr-2 h-4 w-4" /> Seleccionar Rol
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
