"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase'; // Firebase auth, db, storage
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore"; // Firestore functions
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage functions
import { useToast } from '@/hooks/use-toast'; 

export type UserRole = 'customer' | 'driver' | null;

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  // phoneNumber?: string | null; // Might be useful to add to the local User object
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    email: string, 
    password: string, 
    fullName: string, 
    phoneNumber: string, 
    profileImageFile: File | null
  ) => Promise<boolean>;
  signOut: () => void;
  setRole: (role: UserRole) => Promise<void>; // Now async as it updates Firestore
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  const setAndStoreRole = useCallback(async (newRole: UserRole, userIdToUpdate?: string) => {
    const currentUserId = userIdToUpdate || user?.uid;
    
    if (currentUserId) {
      setLoading(true);
      try {
        setRoleState(newRole); // Update local state immediately for responsiveness
        if (newRole) {
          localStorage.setItem('golibre-role-' + currentUserId, newRole);
          const userDocRef = doc(db, "users", currentUserId);
          // Check if doc exists before updating, or use setDoc with merge if creating
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            await updateDoc(userDocRef, { role: newRole, updatedAt: serverTimestamp() });
          } else {
            // This case might happen if user doc wasn't created properly during sign-up
            // Or if setRole is called before user doc creation.
            // For now, we assume user doc exists if we are setting a role.
            // Consider creating it if it doesn't:
            // await setDoc(userDocRef, { role: newRole, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
            console.warn(`User document for ${currentUserId} not found when trying to set role.`);
          }

        } else { // Clearing role
          localStorage.removeItem('golibre-role-' + currentUserId);
          const userDocRef = doc(db, "users", currentUserId);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            await updateDoc(userDocRef, { role: null, updatedAt: serverTimestamp() });
          }
        }
      } catch (error) {
        console.error("Error updating role in localStorage/Firestore", error);
        toast({ variant: "destructive", title: "Error al actualizar rol", description: "No se pudo guardar la selección de rol." });
        // Optionally revert local state if Firestore update fails
        // const previousRole = localStorage.getItem('golibre-role-' + currentUserId) as UserRole;
        // setRoleState(previousRole);
      } finally {
        setLoading(false);
      }
    } else {
      // Handle case where there's no currentUserId (e.g., user not logged in)
      // This might just be a local state update for a pending user
      setRoleState(newRole);
    }
  }, [user?.uid, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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
          // Try to get role from Firestore first as primary source of truth
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          let userRoleFromDb: UserRole = null;

          if (docSnap.exists()) {
            userRoleFromDb = docSnap.data()?.role as UserRole || null;
          }

          if (userRoleFromDb) {
            setRoleState(userRoleFromDb);
            localStorage.setItem('golibre-role-' + firebaseUser.uid, userRoleFromDb);
          } else {
            // Fallback to localStorage if not in DB (e.g. older users or if DB write failed)
            const storedRole = localStorage.getItem('golibre-role-' + firebaseUser.uid) as UserRole;
            if (storedRole) {
              setRoleState(storedRole);
               // Optionally update Firestore if missing role there but present in localStorage
              // await setDoc(userDocRef, { role: storedRole, updatedAt: serverTimestamp() }, { merge: true });
            } else {
              setRoleState(null); 
            }
          }
        } catch (error) {
          console.error("Error reading role from Firestore/localStorage", error);
          setRoleState(null); 
        }
      } else {
        setUser(null);
        setRoleState(null);
      }
      setIsInitializing(false); 
      setLoading(false); 
    });
    
    const timer = setTimeout(() => {
      if (isInitializing) {
        setIsInitializing(false);
        setLoading(false);
      }
    }, 2500); 

    return () => {
      unsubscribe();
      clearTimeout(timer);
    }
  }, [isInitializing]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Role is set by onAuthStateChanged effect
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Firebase Sign-In Error:", error);
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Correo electrónico o contraseña incorrectos. Por favor, verifica tus credenciales.";
      } else if (error.message) {
        description = error.message;
      }
      toast({ variant: "destructive", title: "Error de inicio de sesión", description });
      setLoading(false);
      return false;
    }
  }, [toast]);

  const signUp = useCallback(
    async (
      email: string, 
      password: string, 
      fullName: string, 
      phoneNumber: string, 
      profileImageFile: File | null
    ): Promise<boolean> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        let uploadedPhotoURL: string | null = null;
        if (profileImageFile) {
          const maxRetries = 3;
          let retryCount = 0;
          let lastError: any = null;

          while (retryCount < maxRetries) {
            try {
              const imageRef = ref(storage, `users/${userCredential.user.uid}/profileImage/${Date.now()}-${profileImageFile.name}`);
              await uploadBytes(imageRef, profileImageFile);
              uploadedPhotoURL = await getDownloadURL(imageRef);
              break; // Si la subida es exitosa, salimos del bucle
            } catch (storageError) {
              lastError = storageError;
              retryCount++;
              if (retryCount < maxRetries) {
                // Esperamos un tiempo exponencial antes de reintentar
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
              }
            }
          }

          if (retryCount === maxRetries && lastError) {
            console.error("Error uploading profile image after retries:", lastError);
            toast({ 
              variant: "destructive", 
              title: "Error de Imagen", 
              description: "No se pudo subir la foto de perfil después de varios intentos, pero tu cuenta fue creada." 
            });
          }
        }

        await updateProfile(userCredential.user, { 
          displayName: fullName, 
          photoURL: uploadedPhotoURL 
        });
        
        // Create user document in Firestore
        const userDocRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userDocRef, {
          uid: userCredential.user.uid,
          email,
          fullName,
          phoneNumber,
          photoURL: uploadedPhotoURL,
          role: null, // Role will be set by AuthClientContent after this returns
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        // User object will be updated by onAuthStateChanged, including new displayName/photoURL
        setLoading(false);
        return true; // Success, role assignment handled by AuthClientContent
      }
      setLoading(false);
      return false; 
    } catch (error) {
      console.error("Error in signUp:", error);
      toast({
        variant: "destructive",
        title: "Error al crear cuenta",
        description: (error as Error).message || "No se pudo crear la cuenta. Por favor, intenta nuevamente."
      });
      setLoading(false);
      return false;
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // User and role will be set to null by onAuthStateChanged
      router.push('/'); // Redirigir a la página de bienvenida
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    } catch (error: any) {
      console.error("Firebase Sign-Out Error:", error);
      toast({ variant: "destructive", title: "Error al cerrar sesión", description: (error as Error).message });
    }
    setLoading(false);
  }, [router, toast]);


  return (
    <AuthContext.Provider value={{ user, role, loading, isInitializing, signIn, signUp, signOut, setRole: setAndStoreRole }}>
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
