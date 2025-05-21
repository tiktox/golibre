
"use client";
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react'; // Removed UserPlus and router as they are no longer needed here when user is not logged in.

export default function AuthButton() {
  const { user, signOut, loading } = useAuth();
  // const router = useRouter(); // No longer needed if we don't redirect from here

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Por favor espera
      </Button>
    );
  }

  if (user) {
    return (
      <Button onClick={signOut} variant="outline" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    );
  }

  // If user is not logged in, render nothing (button removed as requested)
  return null;
}
