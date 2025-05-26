"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image'; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type UserRole } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Camera } from 'lucide-react';
import LogoIcon from '@/components/icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';


const signInSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

// This schema is now primarily for Service Provider sign-up on this page
const authPageSignUpSchema = z.object({
  profileImageFile: z.any().optional(),
  fullName: z.string().min(3, { message: "El nombre completo debe tener al menos 3 caracteres." }),
  phoneNumber: z.string()
    .min(10, { message: "El número de teléfono debe tener al menos 10 dígitos."})
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Número de teléfono inválido. Incluye el código de país si es necesario (ej: +18091234567)." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type AuthPageSignUpFormData = z.infer<typeof authPageSignUpSchema>;

const DEFAULT_AVATAR_PLACEHOLDER = "https://placehold.co/128x128.png";

export default function AuthClientContent() {
  const { user, role, signIn, signUp, loading: authLoading, isInitializing, setRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(DEFAULT_AVATAR_PLACEHOLDER);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const initialTab = searchParams.get('tab') === 'signin' ? 'signin' : 'signup';


  useEffect(() => {
     if (!isInitializing && !authLoading && user) { 
      const nextUrl = searchParams.get('next');
      const service = searchParams.get('service');
      
      // Si el usuario está autenticado y tiene rol 'driver'
      if (role === 'driver') {
        if (service === 'restaurant') {
          router.replace('/services/restaurant/profile');
        } else if (nextUrl) {
          router.replace(nextUrl);
        } else {
          router.replace('/driver/dashboard');
        }
      } else {
        // Si el usuario está autenticado pero no tiene rol 'driver'
        if (service === 'restaurant') {
          setRole('driver').then(() => {
            router.replace('/services/restaurant/profile');
          });
        } else if (nextUrl) {
          setRole('driver').then(() => {
            router.replace(nextUrl);
          });
        } else {
          setRole('driver').then(() => {
            router.replace('/driver/dashboard');
          });
        }
      }
    }
  }, [user, role, authLoading, isInitializing, router, searchParams, setRole]);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const authPageSignUpForm = useForm<AuthPageSignUpFormData>({
    resolver: zodResolver(authPageSignUpSchema),
    defaultValues: { 
      profileImageFile: undefined,
      fullName: "", 
      phoneNumber: "",
      email: "", 
      password: "", 
      confirmPassword: "" 
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      authPageSignUpForm.setValue('profileImageFile', file, { shouldDirty: true });
    } else {
      setImageFile(null);
      setImagePreview(DEFAULT_AVATAR_PLACEHOLDER);
      authPageSignUpForm.setValue('profileImageFile', undefined, { shouldDirty: true });
    }
  };

  const handleSignInSubmit = async (data: SignInFormData) => {
    await signIn(data.email, data.password);
    // Redirection is handled by useEffect
  };

  // This signup is for Service Providers coming via "Ofrecer servicios"
  const handleAuthPageSignUpSubmit = async (data: AuthPageSignUpFormData) => {
    const success = await signUp(data.email, data.password, data.fullName, data.phoneNumber, imageFile);
    if (success) {
      const service = searchParams.get('service');
      // Si el usuario se está registrando como restaurante, asignar rol 'driver'
      if (service === 'restaurant') {
        await setRole('driver');
        toast({ 
          title: "¡Registro Exitoso!", 
          description: `Bienvenido ${data.fullName}. Tu cuenta de restaurante ha sido creada.` 
        });
      } else {
        // Para otros servicios, también asignar rol 'driver' por ahora
        await setRole('driver');
        toast({ 
          title: "¡Registro Exitoso!", 
          description: `Bienvenido ${data.fullName}. Tu cuenta de proveedor ha sido creada.` 
        });
      }
      // La redirección se maneja en el useEffect después de que se actualice el rol
    }
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  if (isInitializing || (authLoading && !user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (user && !authLoading && !isInitializing) { 
     return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] bg-secondary/20 p-4 sm:p-8">
      <LogoIcon className="w-20 h-20 mb-6 text-primary" />
      <Tabs defaultValue={initialTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="signup">Registrarse (Proveedor)</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>Accede a tu cuenta GoLibre.</CardDescription>
            </CardHeader>
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(handleSignInSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="tu@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={togglePasswordVisibility}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={authLoading || signInForm.formState.isSubmitting}>
                    {(authLoading || signInForm.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Iniciar Sesión
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Crear Cuenta de Proveedor</CardTitle>
              <CardDescription>Regístrate para ofrecer tus servicios en GoLibre. Si buscas servicios como cliente, por favor regístrate en la página de inicio.</CardDescription>
            </CardHeader>
            <Form {...authPageSignUpForm}>
              <form onSubmit={authPageSignUpForm.handleSubmit(handleAuthPageSignUpSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={authPageSignUpForm.control}
                    name="profileImageFile"
                    render={() => (
                      <FormItem className="flex flex-col items-center">
                        <FormLabel htmlFor="profile-image-upload-signup" className="cursor-pointer">
                          <Avatar className="h-24 w-24 border-2 border-primary/50 hover:border-primary transition-colors">
                            <AvatarImage src={imagePreview || undefined} alt="Foto de perfil" data-ai-hint="user avatar" />
                            <AvatarFallback>
                              <Camera className="h-10 w-10 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="profile-image-upload-signup"
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </FormControl>
                        <FormDescription className="mt-1 text-center text-xs">
                          Sube tu foto de perfil (Opcional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={authPageSignUpForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={authPageSignUpForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Teléfono</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Ej: +18091234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={authPageSignUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="tu@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={authPageSignUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={togglePasswordVisibility}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={authPageSignUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={toggleConfirmPasswordVisibility}>
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={authLoading || authPageSignUpForm.formState.isSubmitting}>
                    {(authLoading || authPageSignUpForm.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrarse como Proveedor
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
