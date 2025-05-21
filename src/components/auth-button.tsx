
"use client";
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthButton() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

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

  return (
    <Button onClick={() => router.push('/auth')} variant="default" size="sm">
      <UserPlus className="mr-2 h-4 w-4" />
      Unirme a GoLibre
    </Button>
  );
}
