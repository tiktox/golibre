
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProtectedRoute from "@/components/protected-route";
import { useToast } from "@/hooks/use-toast";
import { Camera, Building, MapPin, FileText, Save, Check, Loader2, PlusCircle, Edit3, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db, storage } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const restaurantProfileSchema = z.object({
  restaurantName: z.string().min(2, { message: "El nombre del restaurante debe tener al menos 2 caracteres." }),
  location: z.string().min(5, { message: "La ubicación debe tener al menos 5 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }).max(300, { message: "La descripción no puede exceder los 300 caracteres." }),
  profileImageFile: z.any().optional(),
});

type RestaurantProfileFormData = z.infer<typeof restaurantProfileSchema>;

interface RestaurantDocument {
  restaurantName: string;
  location: string;
  description: string;
  imageUrl?: string | null;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/128x128.png";

export default function RestaurantProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(DEFAULT_PLACEHOLDER_IMAGE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileExistsAndLoaded, setProfileExistsAndLoaded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<RestaurantProfileFormData>({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: {
      restaurantName: "",
      location: "",
      description: "",
    },
  });

  const { formState: { isSubmitting, isDirty, isSubmitSuccessful }, control, setValue, reset, getValues } = form;

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setIsLoadingProfile(false);
      setIsEditing(true); 
      return;
    }
    setIsLoadingProfile(true);
    try {
      const profileDocRef = doc(db, "restaurants", user.uid);
      const docSnap = await getDoc(profileDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as RestaurantDocument;
        reset({
          restaurantName: data.restaurantName,
          location: data.location,
          description: data.description,
        });
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
          setCurrentImageUrl(data.imageUrl);
        } else {
          setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
          setCurrentImageUrl(null);
        }
        setProfileExistsAndLoaded(true);
        setIsEditing(false); 
      } else {
        setProfileExistsAndLoaded(false);
        setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
        setCurrentImageUrl(undefined);
        setIsEditing(true); 
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar el perfil",
        description: "No se pudo cargar la información de tu restaurante.",
      });
      setIsEditing(true); 
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user, reset, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('profileImageFile', event.target.files, { shouldDirty: true });
    } else {
      setImageFile(null);
      setImagePreview(currentImageUrl || DEFAULT_PLACEHOLDER_IMAGE);
      setValue('profileImageFile', undefined, { shouldDirty: true });
    }
  };

  async function onSubmit(data: RestaurantProfileFormData) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para guardar." });
      return;
    }

    let uploadedImageUrlOutcome: string | null = currentImageUrl === undefined ? null : currentImageUrl;

    if (imageFile) {
      const storageRef = ref(storage, `restaurants/${user.uid}/profileImage/${imageFile.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, imageFile);
        uploadedImageUrlOutcome = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          variant: "destructive",
          title: "Error al subir imagen",
          description: "No se pudo guardar la imagen de perfil.",
        });
        return;
      }
    }
    
    const restaurantDocRef = doc(db, "restaurants", user.uid);
    // uploadedImageUrlOutcome is already string | null here
    const imageUrlForFirestore = uploadedImageUrlOutcome; 

    const profileDataToSave: Omit<RestaurantDocument, 'createdAt' | 'updatedAt'> & { updatedAt: any, createdAt?: any, imageUrl: string | null } = {
      ownerId: user.uid,
      restaurantName: data.restaurantName,
      location: data.location,
      description: data.description,
      imageUrl: imageUrlForFirestore, 
      updatedAt: serverTimestamp(),
    };

    try {
      const docSnap = await getDoc(restaurantDocRef);
      if (!docSnap.exists()) {
        profileDataToSave.createdAt = serverTimestamp();
      }

      await setDoc(restaurantDocRef, profileDataToSave, { merge: true });

      toast({
        title: "¡Perfil Guardado!",
        description: "La información de tu restaurante ha sido guardada exitosamente.",
      });
      
      reset({ 
        restaurantName: data.restaurantName,
        location: data.location,
        description: data.description,
        profileImageFile: undefined
      });
      setImageFile(null);
      
      setCurrentImageUrl(imageUrlForFirestore);
      if (imageUrlForFirestore) {
        setImagePreview(imageUrlForFirestore);
      } else {
        setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
      }
      setProfileExistsAndLoaded(true);
      setIsEditing(false); 
      
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la información del restaurante.",
      });
    }
  }

  const handleAddDish = () => {
    console.log("Añadir plato clicked");
    toast({
      title: "Funcionalidad Próximamente",
      description: "Pronto podrás añadir y gestionar los platos de tu menú aquí.",
    });
  };

  let buttonText = "Guardar Cambios";
  let ButtonIcon = Save;

  if (isSubmitting) {
    buttonText = "Guardando...";
    ButtonIcon = Loader2;
  } else if (isSubmitSuccessful && !isDirty && !imageFile && profileExistsAndLoaded) {
    buttonText = "Cambios Guardados";
    ButtonIcon = Check;
  } else if (!profileExistsAndLoaded && !isDirty) {
    buttonText = "Crear Perfil";
  }


  if (isLoadingProfile) {
    return (
      <ProtectedRoute allowedRoles={['driver']}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-6" />
            <div className="flex flex-col items-center mb-6">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-20 w-full mb-6" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <div className="container mx-auto px-4 py-8">
        {isEditing ? (
          // EDITING VIEW
          <Card className="w-full max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                {profileExistsAndLoaded ? "Editar Perfil del Restaurante" : "Configura el Perfil de tu Restaurante"}
              </CardTitle>
              <CardDescription>
                Completa los detalles para que los clientes puedan encontrarte y conocerte.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={control}
                    name="profileImageFile"
                    render={({ fieldState: imageFieldState }) => ( 
                      <FormItem className="flex flex-col items-center">
                        <FormLabel htmlFor="profile-image-upload" className="cursor-pointer">
                          <Avatar className="h-32 w-32 border-2 border-primary/50 hover:border-primary transition-colors">
                            <AvatarImage src={imagePreview || undefined} alt="Logo del Restaurante" data-ai-hint="restaurant logo" />
                            <AvatarFallback>
                              <Camera className="h-12 w-12 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="profile-image-upload"
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="sr-only" 
                            onChange={handleImageChange}
                          />
                        </FormControl>
                        <FormDescription className="mt-2 text-center">
                          Haz clic en la imagen para subir o cambiar el logo (PNG, JPG, WEBP).
                        </FormDescription>
                        {imageFieldState.error && <FormMessage>{imageFieldState.error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={control}
                    name="restaurantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-md flex items-center gap-1"><Building className="h-4 w-4" />Nombre del Restaurante</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: La Esquina Sabrosa" {...field} className="text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-md flex items-center gap-1"><MapPin className="h-4 w-4" />Ubicación Exacta</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Av. Independencia #123, Santo Domingo" {...field} className="text-base" />
                        </FormControl>
                        <FormDescription>
                          Incluye calle, número y ciudad.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-md flex items-center gap-1"><FileText className="h-4 w-4" />Pequeña Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe brevemente tu restaurante, tipo de comida, ambiente, etc."
                            {...field}
                            className="text-base min-h-[100px]"
                          />
                        </FormControl>
                         <FormDescription>
                          Máximo 300 caracteres.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
                  {profileExistsAndLoaded && ( 
                    <Button type="button" variant="outline" onClick={() => {
                      setIsEditing(false);
                      fetchProfile(); 
                    }}>
                      Cancelar
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="sm:w-auto w-full" 
                    disabled={isSubmitting || (isSubmitSuccessful && !isDirty && !imageFile && profileExistsAndLoaded) || !user}
                  >
                    <ButtonIcon className={`mr-2 h-5 w-5 ${isSubmitting ? 'animate-spin' : ''}`}/>
                    {buttonText}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        ) : profileExistsAndLoaded ? (
          // DISPLAY VIEW (Only if profile exists and not editing)
          <div className="w-full max-w-5xl mx-auto">
            {/* Profile Header Section */}
            <div className="bg-muted/70 dark:bg-muted/40 p-6 md:p-8 rounded-xl shadow-lg mb-10 relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 bg-background hover:bg-accent/10 border-primary/30 text-primary hover:text-accent"
              >
                <Edit3 className="mr-1.5 h-4 w-4" /> Editar Perfil
              </Button>
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 sm:gap-8">
                <Avatar className="h-32 w-32 sm:h-36 sm:w-36 border-4 border-background shadow-md shrink-0">
                  <AvatarImage src={imagePreview || DEFAULT_PLACEHOLDER_IMAGE} alt={getValues("restaurantName")} data-ai-hint="restaurant logo" />
                  <AvatarFallback className="text-4xl"><Building /></AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h1 className="text-3xl md:text-4xl font-bold text-primary break-words">{getValues("restaurantName")}</h1>
                  <p className="text-md text-foreground/80 mt-1.5 flex items-center justify-center sm:justify-start">
                    <MapPin className="h-4 w-4 mr-1.5 shrink-0" /> {getValues("location")}
                  </p>
                  <p className="text-sm text-foreground/90 mt-2 max-w-prose mx-auto sm:mx-0">{getValues("description")}</p>
                </div>
              </div>
            </div>

            {/* Dish Categories Section */}
            <div className="mb-10">
              <ScrollArea className="w-full whitespace-nowrap pb-2.5">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full opacity-80 hover:opacity-100 hidden sm:flex"><ChevronLeft /></Button>
                  {['Platos', 'Entradas', 'Bebidas', 'Postres', 'Especiales del Día', 'Combos Familiares', 'Vegano'].map((cat, index) => (
                    <Button key={cat} variant={index === 0 ? 'default' : 'secondary'} size="sm" className="text-sm font-medium shadow-sm px-4 py-2 h-auto">
                      {cat}
                    </Button>
                  ))}
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full opacity-80 hover:opacity-100 hidden sm:flex"><ChevronRight /></Button>
                </div>
                <ScrollBar orientation="horizontal" className="h-2 [&>div]:h-full" />
              </ScrollArea>
            </div>

            {/* Dishes Grid Section */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {[
                  { name: "Filete Mignon Clásico", desc: "Con salsa de champiñones y puré rústico.", price: "RD$950", img: "https://placehold.co/600x400.png", hint: "steak mushroom" },
                  { name: "Pasta Cremosa con Pollo", desc: "Pechuga a la parrilla sobre fettuccine alfredo.", price: "RD$680", img: "https://placehold.co/600x400.png", hint: "pasta chicken" },
                  { name: "Steak con Patatas", desc: "Jugoso corte de res con patatas doradas.", price: "RD$890", img: "https://placehold.co/600x400.png", hint: "steak potatoes" },
                  { name: "Ribeye a la Parrilla", desc: "Corte premium con guarnición de temporada.", price: "RD$1200", img: "https://placehold.co/600x400.png", hint: "ribeye steak" },
                  { name: "Delicia de Salmón", desc: "Salmón fresco al horno con espárragos.", price: "RD$750", img: "https://placehold.co/600x400.png", hint: "salmon asparagus" },
                  { name: "Camarones al Ajillo", desc: "Exquisitos camarones en salsa de ajo.", price: "RD$720", img: "https://placehold.co/600x400.png", hint: "shrimp garlic" },
                  { name: "Hamburguesa Gourmet", desc: "Carne angus, queso cheddar y pan artesanal.", price: "RD$550", img: "https://placehold.co/600x400.png", hint: "burger gourmet" },
                  { name: "Tacos de Birria", desc: "Tradicionales tacos mexicanos con consomé.", price: "RD$450", img: "https://placehold.co/600x400.png", hint: "tacos birria" },
                ].map((dish, i) => (
                  <Card key={i} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={dish.img}
                        alt={dish.name}
                        width={400}
                        height={300}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={dish.hint}
                      />
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <h3 className="font-semibold text-lg text-primary leading-tight truncate">{dish.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex-grow">{dish.desc}</p>
                      <p className="text-xl font-bold text-accent mt-2">{dish.price}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Floating Action Button to Add Dish */}
            <Button
              variant="default"
              size="lg" 
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-xl p-0"
              onClick={handleAddDish}
              aria-label="Añadir Plato"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8">
             <Building className="h-16 w-16 text-muted-foreground mb-4" />
             <p className="text-lg text-muted-foreground mb-4">
               {user ? "Aún no has configurado el perfil de tu restaurante." : "Inicia sesión para configurar tu restaurante."}
             </p>
             {user && (
                <Button onClick={() => {
                    reset({ restaurantName: "", location: "", description: "" }); 
                    setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
                    setCurrentImageUrl(undefined);
                    setImageFile(null);
                    setIsEditing(true);
                }}>
                    <PlusCircle className="mr-2 h-5 w-5"/> Crear Perfil de Restaurante
                </Button>
             )}
           </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
