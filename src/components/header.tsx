
"use client";
import Link from 'next/link';
import AuthButton from './auth-button';
import LogoIcon from './icons/logo';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Car, UserCog } from 'lucide-react'; // Removed UserCircle

export default function Header() {
  const { user, role } = useAuth();
  const router = useRouter();

  const getDashboardLink = () => {
    if (role === 'customer') return '/customer/request-trip';
    if (role === 'driver') return '/driver/dashboard';
    // Fallback if role not set but user exists - default to customer dashboard
    // This state should be transient as AuthContext defaults new users to 'customer'
    if (user) return '/customer/request-trip'; 
    return '/'; // Fallback for no user
  };

  const getHeaderText = () => {
    if (user && role) {
      if (role === 'customer') return 'Cliente / GoLibre';
      if (role === 'driver') return 'Conductor / GoLibre';
    }
    // If user exists but role isn't set yet (transient state), default to Cliente view
    if (user && !role) return 'Cliente / GoLibre';
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
                {(role || (!role && user)) && ( // Show 'Cliente' if role is customer or if role is not yet set but user exists
                  <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full hidden md:inline-block">
                    {(role === 'customer' || (!role && user)) ? 'Cliente' : (role === 'driver' ? 'Conductor' : '')}
                  </span>
                )}
              </div>

              {/* Role specific buttons */}
              {(role === 'customer' || (!role && user)) && ( // Show for customer or if role not set (defaults to customer view)
                <Button variant="ghost" size="sm" onClick={() => router.push('/customer/request-trip')} className="hidden sm:inline-flex">
                  <Car className="mr-2 h-4 w-4" /> Solicitar Viaje
                </Button>
              )}
              {role === 'driver' && (
                <Button variant="ghost" size="sm" onClick={() => router.push('/driver/dashboard')} className="hidden sm:inline-flex">
                  <UserCog className="mr-2 h-4 w-4" /> Panel Conductor
                </Button>
              )}
              {/* Removed the "Seleccionar Rol" button as per request */}
            </>
          )}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
