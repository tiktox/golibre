
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserRole } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/icons/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, User, Loader2, Eye, EyeOff, Camera } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const customerSignUpSchema = z.object({
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

const signInSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type CustomerSignUpFormData = z.infer<typeof customerSignUpSchema>;
type SignInFormData = z.infer<typeof signInSchema>;

const DEFAULT_AVATAR_PLACEHOLDER = "https://placehold.co/128x128.png";

export default function HomePage() {
  const { user, role, loading: authLoading, isInitializing, signUp, signIn, setRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(DEFAULT_AVATAR_PLACEHOLDER);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const customerSignUpForm = useForm<CustomerSignUpFormData>({
    resolver: zodResolver(customerSignUpSchema),
    defaultValues: {
      profileImageFile: undefined,
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isInitializing && !authLoading && user && role) {
      if (role === 'customer') {
        router.replace('/customer/dashboard');
      } else if (role === 'driver') { 
        router.replace('/driver/dashboard');
      }
    }
  }, [user, role, authLoading, isInitializing, router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      customerSignUpForm.setValue('profileImageFile', file, { shouldDirty: true });
    } else {
      setImageFile(null);
      setImagePreview(DEFAULT_AVATAR_PLACEHOLDER);
      customerSignUpForm.setValue('profileImageFile', undefined, { shouldDirty: true });
    }
  };

  const handleCustomerSignUpSubmit = async (data: CustomerSignUpFormData) => {
    const success = await signUp(data.email, data.password, data.fullName, data.phoneNumber, imageFile);
    if (success) {
      await setRole('customer'); 
      toast({ title: "¡Registro Exitoso!", description: `Bienvenido ${data.fullName}. Ahora eres un cliente.`});
      // Redirection is handled by useEffect after role and user state update
    }
  };

  const handleSignInSubmit = async (data: SignInFormData) => {
    // For users signing in on the homepage, we don't explicitly set their role here.
    // Their existing role (customer or driver) will be loaded by AuthContext,
    // and the useEffect will redirect them accordingly.
    await signIn(data.email, data.password);
    // Redirection is handled by useEffect
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  if (isInitializing || (authLoading && !user)) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] bg-background p-8 text-center">
        <LogoIcon className="w-20 h-20 mb-6 text-primary animate-pulse" />
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-6 w-64" />
      </div>
    );
  }
  
  if (user && !authLoading && !isInitializing) {
    // This state means user is logged in but redirection useEffect hasn't kicked in yet
    // or is in progress. Show a loader.
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    );
  }

  // If !user (and not initializing/loading), show auth forms
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))] bg-secondary/10 p-4 sm:p-8">
      <LogoIcon className="w-20 h-20 mb-6 text-primary" />
      <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 text-center">Te damos la bienvenida a GoLibre</h1>
      <p className="text-lg sm:text-xl text-foreground mb-8 text-center max-w-xl">
        Digitalizando tu entorno para estar mas cerca de ti!
      </p>

      <Tabs defaultValue="signup" className="w-full max-w-md mb-10">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="signup">Registrarse (Cliente)</TabsTrigger>
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
              <CardTitle className="text-2xl">Crear Cuenta de Cliente</CardTitle>
              <CardDescription>Únete a la comunidad GoLibre con tu información.</CardDescription>
            </CardHeader>
            <Form {...customerSignUpForm}>
              <form onSubmit={customerSignUpForm.handleSubmit(handleCustomerSignUpSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={customerSignUpForm.control}
                    name="profileImageFile"
                    render={() => (
                      <FormItem className="flex flex-col items-center">
                        <FormLabel htmlFor="profile-image-upload-home" className="cursor-pointer">
                          <Avatar className="h-24 w-24 border-2 border-primary/50 hover:border-primary transition-colors">
                            <AvatarImage src={imagePreview || undefined} alt="Foto de perfil" data-ai-hint="user avatar"/>
                            <AvatarFallback>
                              <Camera className="h-10 w-10 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="profile-image-upload-home"
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
                    control={customerSignUpForm.control}
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
                    control={customerSignUpForm.control}
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
                    control={customerSignUpForm.control}
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
                    control={customerSignUpForm.control}
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
                    control={customerSignUpForm.control}
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
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={authLoading || customerSignUpForm.formState.isSubmitting}
                  >
                    {(authLoading || customerSignUpForm.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrarme como cliente
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-center w-full max-w-md">
        <p className="text-md font-medium text-foreground mb-3">¿Quieres ofrecer tus servicios en GoLibre?</p>
        <Button
          onClick={() => router.push('/auth?next=/driver/dashboard')} 
          variant="secondary"
          size="lg"
          className="w-full py-5 text-md"
        >
          <Briefcase className="mr-3 h-5 w-5" />
          Ofrecer servicios
        </Button>
      </div>
    </div>
  );
}
