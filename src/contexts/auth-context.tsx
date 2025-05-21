
"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase'; // Firebase auth
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast'; 

export type UserRole = 'customer' | 'driver' | null;

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const setAndStoreRole = useCallback((newRole: UserRole, userId?: string) => {
    const currentUserId = userId || user?.uid;
    setRoleState(newRole);
    if (currentUserId && newRole) {
      try {
        localStorage.setItem('golibre-role-' + currentUserId, newRole);
      } catch (error) {
        console.error("Error writing role to localStorage", error);
      }
    } else if (currentUserId && !newRole) {
      try {
        localStorage.removeItem('golibre-role-' + currentUserId);
      } catch (error) {
        console.error("Error removing role from localStorage", error);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        const appUser: User = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setUser(appUser);
        try {
          const storedRole = localStorage.getItem('golibre-role-' + firebaseUser.uid) as UserRole;
          if (storedRole) {
            setRoleState(storedRole);
          } else {
            // New user or role wiped, default to customer (will be redirected to driver UI)
            setAndStoreRole('customer', firebaseUser.uid);
          }
        } catch (error) {
          console.error("Error reading role from localStorage", error);
          setAndStoreRole('customer', firebaseUser.uid); // Default on error
        }
      } else {
        setUser(null);
        setRoleState(null);
      }
      if (isInitializing) {
        setIsInitializing(false);
      }
      setLoading(false); 
    });

    if (!auth.currentUser && isInitializing) {
        setIsInitializing(false);
        setLoading(false);
    }
    return () => unsubscribe();
  }, [isInitializing, setAndStoreRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
      // onAuthStateChanged handles state updates. Redirection is handled by pages.
    } catch (error: any) {
      console.error("Firebase Sign-In Error:", error);
      toast({ variant: "destructive", title: "Error de inicio de sesión", description: error.message });
      setLoading(false);
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
           setUser({ 
            uid: userCredential.user.uid, 
            displayName, 
            email: userCredential.user.email, 
            photoURL: userCredential.user.photoURL 
          });
        }
        // Default new users to customer (which redirects to driver UI)
        setAndStoreRole('customer', userCredential.user.uid);
        toast({ title: "Registro exitoso", description: "¡Bienvenido a GoLibre!" });
        // Redirection handled by pages (e.g. AuthPage useEffect)
      }
    } catch (error: any) {
      console.error("Firebase Sign-Up Error:", error);
      toast({ variant: "destructive", title: "Error de registro", description: error.message });
      setLoading(false);
    }
  }, [toast, setAndStoreRole]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      router.push('/');
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    } catch (error: any) {
      console.error("Firebase Sign-Out Error:", error);
      toast({ variant: "destructive", title: "Error al cerrar sesión", description: error.message });
    }
    setLoading(false);
  }, [router, toast]);

  const setRole = useCallback((newRole: UserRole) => {
    setLoading(true);
    if (user) {
      setAndStoreRole(newRole, user.uid);
    } else {
      setRoleState(newRole); 
    }

    // Redirect based on the new role, focusing on driver UI
    if (newRole && user) { 
      router.push('/driver/dashboard');
    } else if (!newRole && user) { 
       router.push('/');
    } else if (!user) { 
      router.push('/');
    }
    setLoading(false);
  }, [router, user, setAndStoreRole]);

  return (
    <AuthContext.Provider value={{ user, role, loading, isInitializing, signIn, signUp, signOut, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
