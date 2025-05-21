
"use client";
import Link from 'next/link';
import AuthButton from './auth-button';
import LogoIcon from './icons/logo';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { UserCog } from 'lucide-react'; // Removed Car and UserCircle

export default function Header() {
  const { user, role } = useAuth();
  const router = useRouter();

  const getDashboardLink = () => {
    // Always point to driver dashboard if user is logged in, given the current focus
    if (user) return '/driver/dashboard';
    return '/'; // Fallback for no user
  };

  const getHeaderText = () => {
    // If user is logged in, display "Conductor / GoLibre" due to focus on driver UI
    if (user) return 'Conductor / GoLibre';
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
                {/* Show 'Conductor' badge if logged in, as customer UI is removed */}
                <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full hidden md:inline-block">
                  Conductor
                </span>
              </div>

              {/* Always show driver dashboard button if logged in */}
              <Button variant="ghost" size="sm" onClick={() => router.push('/driver/dashboard')} className="hidden sm:inline-flex">
                <UserCog className="mr-2 h-4 w-4" /> Panel Conductor
              </Button>
            </>
          )}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
