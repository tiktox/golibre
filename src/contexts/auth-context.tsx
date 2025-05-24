
"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
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
  signIn: (email: string, password: string) => Promise<boolean>; // Returns boolean success
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>; // Returns boolean success
  signOut: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false); // Generic loading for auth operations
  const [isInitializing, setIsInitializing] = useState(true); // Specific for initial auth state check
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  const setAndStoreRole = useCallback((newRole: UserRole, userId?: string) => {
    const currentUserId = userId || user?.uid;
    setRoleState(newRole);
    if (currentUserId && newRole) {
      try {
        localStorage.setItem('golibre-role-' + currentUserId, newRole);
      } catch (error) {
        console.error("Error writing role to localStorage", error);
      }
    } else if (currentUserId && !newRole) { // Clear role if newRole is null
      try {
        localStorage.removeItem('golibre-role-' + currentUserId);
      } catch (error) {
        console.error("Error removing role from localStorage", error);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setLoading(true); // Start loading for auth state change processing
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
            // If no role is stored, setRoleState to null.
            // Role assignment will be handled by the auth page flow or other specific logic.
            setRoleState(null); 
          }
        } catch (error) {
          console.error("Error reading role from localStorage", error);
          setRoleState(null); // Default to null on error
        }
      } else {
        setUser(null);
        setRoleState(null);
        // If on a protected route and user signs out, redirect to home or auth
        if (pathname !== '/' && pathname !== '/auth' && !pathname.startsWith('/services/restaurant/profile')) { // Keep restaurant profile accessible for now if direct link
          // router.replace('/'); // Or '/auth'
        }
      }
      setIsInitializing(false); // Initial check is done
      setLoading(false); 
    });
    
    // Ensure isInitializing is set to false if onAuthStateChanged doesn't fire quickly
    // (e.g., if Firebase SDK is slow to load or there's no initial user)
    const timer = setTimeout(() => {
      if (isInitializing) {
        setIsInitializing(false);
        setLoading(false);
      }
    }, 2000); // Adjust timeout as needed


    return () => {
      unsubscribe();
      clearTimeout(timer);
    }
  }, [isInitializing, setAndStoreRole, pathname]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
      // onAuthStateChanged handles user state updates.
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Firebase Sign-In Error:", error);
      toast({ variant: "destructive", title: "Error de inicio de sesión", description: error.message });
      setLoading(false);
      return false;
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
           // The onAuthStateChanged listener will pick up the new user and set them.
           // We don't setUser directly here to avoid race conditions with onAuthStateChanged.
        }
        // Role assignment will be handled in AuthClientContent based on 'next' param
        toast({ title: "Registro exitoso", description: "¡Bienvenido a GoLibre!" });
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error: any) {
      console.error("Firebase Sign-Up Error:", error);
      toast({ variant: "destructive", title: "Error de registro", description: error.message });
      setLoading(false);
      return false;
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // User and role will be set to null by onAuthStateChanged
      router.push('/'); // Redirect to homepage after sign out
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    } catch (error: any) {
      console.error("Firebase Sign-Out Error:", error);
      toast({ variant: "destructive", title: "Error al cerrar sesión", description: error.message });
    }
    setLoading(false);
  }, [router, toast]);

  // This setRole is now more explicit, called from AuthClientContent or other role selection mechanisms
  const setRoleAndUpdateStorage = useCallback((newRole: UserRole) => {
    setLoading(true);
    if (user) {
      setAndStoreRole(newRole, user.uid);
    } else {
      // This case should be rare if setRole is called after user is confirmed
      setRoleState(newRole); 
    }
    setLoading(false);
  }, [user, setAndStoreRole]);

  return (
    <AuthContext.Provider value={{ user, role, loading, isInitializing, signIn, signUp, signOut, setRole: setRoleAndUpdateStorage }}>
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
