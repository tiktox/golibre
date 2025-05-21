
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
import { useToast } from '@/hooks/use-toast'; // Import useToast

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
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
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
            setRoleState(null); 
          }
        } catch (error) {
          console.error("Error reading role from localStorage", error);
          setRoleState(null);
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
         try {
            const storedRole = localStorage.getItem('golibre-role'); 
            if (storedRole) setRoleState(storedRole as UserRole);
        } catch (error) {
            console.error("Error reading initial role from localStorage", error);
        }
        setIsInitializing(false);
    }
    return () => unsubscribe();
  }, [isInitializing]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be set by onAuthStateChanged
      // Redirection will be handled by useEffect in pages based on user/role state
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
    } catch (error: any) {
      console.error("Firebase Sign-In Error:", error);
      toast({ variant: "destructive", title: "Error de inicio de sesión", description: error.message });
      setLoading(false);
    }
    // setLoading(false) will be effectively handled by onAuthStateChanged or error catch
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user && displayName) {
        await updateProfile(userCredential.user, { displayName });
         // Manually update user state here as onAuthStateChanged might be slow or not pick up displayName immediately
        setUser(prevUser => prevUser ? { ...prevUser, displayName } : null);
      }
      // User state will be set by onAuthStateChanged for other properties
      toast({ title: "Registro exitoso", description: "¡Bienvenido a GoLibre!" });
      // Redirection to role-selection will be handled by useEffect in pages
    } catch (error: any) {
      console.error("Firebase Sign-Up Error:", error);
      toast({ variant: "destructive", title: "Error de registro", description: error.message });
      setLoading(false);
    }
    // setLoading(false) will be effectively handled by onAuthStateChanged or error catch
  }, [toast]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      if(user) { // Clear role for the specific user that signed out
        localStorage.removeItem('golibre-role-' + user.uid);
      }
      router.push('/');
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    } catch (error: any) {
      console.error("Firebase Sign-Out Error:", error);
      toast({ variant: "destructive", title: "Error al cerrar sesión", description: error.message });
    }
    setLoading(false);
  }, [router, toast, user]);

  const setRole = useCallback((newRole: UserRole) => {
    setLoading(true);
    setRoleState(newRole);
    if (user && newRole) { 
      try {
        localStorage.setItem('golibre-role-' + user.uid, newRole);
      } catch (error) {
        console.error("Error writing role to localStorage", error);
      }
    } else if (user && !newRole) { 
        try {
            localStorage.removeItem('golibre-role-' + user.uid);
        } catch (error) {
            console.error("Error removing role from localStorage", error);
        }
    }

    if (newRole) {
      if (newRole === 'customer') {
        router.push('/customer/request-trip');
      } else if (newRole === 'driver') {
        router.push('/driver/dashboard');
      }
    } else { 
      if (user) {
        router.push('/role-selection');
      } else {
        router.push('/');
      }
    }
    setLoading(false);
  }, [router, user]);

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
