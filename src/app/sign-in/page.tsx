'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChromeIcon, Loader2 } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfileData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


export default function SignInPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (userProfile?.role) {
        router.replace(userProfile.role === 'Driver Partner' ? '/driver/dashboard' : '/customer/dashboard');
      } else {
        router.replace('/role-selection');
      }
    }
  }, [user, userProfile, authLoading, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if user document exists, if not, create a basic one. Role will be set later.
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const newUserProfile: Partial<UserProfileData> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          role: null, // Role to be selected next
        };
        await setDoc(userDocRef, newUserProfile);
      }
      // AuthProvider will handle redirection based on role or lack thereof
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      toast({
        title: "Sign-In Failed",
        description: error.message || "An unexpected error occurred during sign-in.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  if (authLoading || (user && !isSigningIn)) { // Show loader if auth is loading or if user is logged in and redirecting
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In to RideShare</CardTitle>
          <CardDescription>Access your account or create a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ChromeIcon className="mr-2 h-5 w-5" />
            )}
            {isSigningIn ? 'Signing In...' : 'Sign In with Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
