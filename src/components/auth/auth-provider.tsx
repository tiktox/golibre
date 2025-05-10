'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfileData, UserRole } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  setUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as UserProfileData;
          setUserProfile(profileData);
          if (!profileData.role && pathname !== '/role-selection' && pathname !== '/sign-in') {
            router.push('/role-selection');
          } else if (profileData.role === 'Driver Partner' && (pathname === '/' || pathname === '/sign-in' || pathname === '/role-selection')) {
            router.push('/driver/dashboard');
          } else if (profileData.role === 'Customer' && (pathname === '/' || pathname === '/sign-in' || pathname === '/role-selection')) {
            router.push('/customer/dashboard');
          }
        } else {
          // New user, profile will be created upon role selection
          setUserProfile(null);
           if (pathname !== '/role-selection' && pathname !== '/sign-in') {
            router.push('/role-selection');
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        if (pathname !== '/sign-in' && pathname !== '/') {
           // Allow access to '/' for initial landing logic
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const setUserRole = async (role: UserRole) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const profileUpdate: Partial<UserProfileData> = { 
        role,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      };
      await setDoc(userDocRef, profileUpdate, { merge: true });
      setUserProfile(prev => ({ ...prev, ...profileUpdate } as UserProfileData));
      if (role === 'Driver Partner') {
        router.push('/driver/dashboard');
      } else if (role === 'Customer') {
        router.push('/customer/dashboard');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
