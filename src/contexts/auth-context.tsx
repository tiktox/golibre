"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'customer' | 'driver' | null;
export interface User {
  name: string;
  email: string;
  // photoURL?: string; 
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  isInitializing: boolean; // To track initial local storage load
  signIn: () => void;
  signOut: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false); // For async operations like sign-in/out
  const [isInitializing, setIsInitializing] = useState(true); // Tracks initial load
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('golibre-user');
      const storedRole = localStorage.getItem('golibre-role') as UserRole;
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedRole) {
        setRoleState(storedRole);
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
      // Clear potentially corrupted storage
      localStorage.removeItem('golibre-user');
      localStorage.removeItem('golibre-role');
    }
    setIsInitializing(false);
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    // Simulate Google Sign-In
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const mockUser = { name: 'Demo User', email: 'demo@example.com' };
    setUser(mockUser);
    try {
      localStorage.setItem('golibre-user', JSON.stringify(mockUser));
    } catch (error) {
      console.error("Error writing user to localStorage", error);
    }
    setLoading(false);
    router.push('/role-selection');
  }, [router]);

  const signOut = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    setRoleState(null);
    try {
      localStorage.removeItem('golibre-user');
      localStorage.removeItem('golibre-role');
    } catch (error) {
      console.error("Error removing from localStorage", error);
    }
    setLoading(false);
    router.push('/');
  }, [router]);

  const setRole = useCallback((newRole: UserRole) => {
    setLoading(true);
    setRoleState(newRole);
    if (newRole) {
      try {
        localStorage.setItem('golibre-role', newRole);
      } catch (error) {
        console.error("Error writing role to localStorage", error);
      }
      if (newRole === 'customer') {
        router.push('/customer/request-trip');
      } else if (newRole === 'driver') {
        router.push('/driver/dashboard');
      }
    } else {
      try {
        localStorage.removeItem('golibre-role');
      } catch (error) {
        console.error("Error removing role from localStorage", error);
      }
      if (user) { // Only push to role-selection if user is logged in
        router.push('/role-selection');
      } else {
        router.push('/'); // If no user, go to login
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
