
"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase'; // Import Firebase auth and provider
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  type User as FirebaseUser 
} from 'firebase/auth';

export type UserRole = 'customer' | 'driver' | null;

// Updated User interface to align with Firebase User properties
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
  signIn: () => void;
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

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: User = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setUser(appUser);
        // Load role from localStorage if user is authenticated
        try {
          const storedRole = localStorage.getItem('golibre-role-' + firebaseUser.uid) as UserRole;
          if (storedRole) {
            setRoleState(storedRole);
          } else {
            setRoleState(null); // No role stored for this user
          }
        } catch (error) {
          console.error("Error reading role from localStorage", error);
          setRoleState(null);
        }
      } else {
        setUser(null);
        setRoleState(null);
        // Clear role from localStorage on sign out
        // Consider if you want to clear all user-specific roles or just current
        // For now, we don't clear localStorage here to persist roles across sessions if user logs back in.
        // localStorage.removeItem('golibre-role'); // This was too generic.
      }
      if (isInitializing) {
        setIsInitializing(false);
      }
      setLoading(false); // Auth state change means loading is complete
    });

    // Load initial role from local storage (if user was already logged in from previous session)
    // This is now handled within onAuthStateChanged to ensure user UID is available for role key
    // However, we still need to handle the case where onAuthStateChanged might not fire immediately
    // or if there's no stored user.
    if (!auth.currentUser && isInitializing) {
         try {
            const storedRole = localStorage.getItem('golibre-role'); // Legacy or non-UID specific role
            if (storedRole) setRoleState(storedRole as UserRole);
        } catch (error) {
            console.error("Error reading initial role from localStorage", error);
        }
        setIsInitializing(false); // Ensure initialization completes
    }


    return () => unsubscribe(); // Cleanup subscription
  }, [isInitializing]);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // User state will be set by onAuthStateChanged listener
      // Redirect to role selection after successful Firebase sign-in
      router.push('/role-selection');
    } catch (error) {
      console.error("Firebase Sign-In Error:", error);
      // Handle sign-in errors (e.g., popup closed, network error)
      setLoading(false); 
    }
    // setLoading(false) will be handled by onAuthStateChanged or error catch
  }, [router]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // User and role state will be cleared by onAuthStateChanged listener
      // No need to manually clear localStorage for role here if keyed by UID
      // If a generic role key was used, clear it:
      // localStorage.removeItem('golibre-role'); 
      router.push('/');
    } catch (error) {
      console.error("Firebase Sign-Out Error:", error);
    }
    setLoading(false);
  }, [router]);

  const setRole = useCallback((newRole: UserRole) => {
    setLoading(true);
    setRoleState(newRole);
    if (user && newRole) { // Store role only if user is logged in and role is being set
      try {
        localStorage.setItem('golibre-role-' + user.uid, newRole);
      } catch (error) {
        console.error("Error writing role to localStorage", error);
      }
    } else if (user && !newRole) { // Clear role if user exists and role is set to null
        try {
            localStorage.removeItem('golibre-role-' + user.uid);
        } catch (error) {
            console.error("Error removing role from localStorage", error);
        }
    }

    // Navigation logic
    if (newRole) {
      if (newRole === 'customer') {
        router.push('/customer/request-trip');
      } else if (newRole === 'driver') {
        router.push('/driver/dashboard');
      }
    } else { // Role is being cleared or was null
      if (user) {
        router.push('/role-selection');
      } else {
        router.push('/');
      }
    }
    setLoading(false);
  }, [router, user]);

  return (
    <AuthContext.Provider value={{ user, role, loading, isInitializing, signIn, signOut, setRole }}>
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
