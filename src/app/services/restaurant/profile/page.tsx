
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
import { Camera, Building, MapPin, FileText, Save, Check, Loader2, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db, storage } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Skeleton } from "@/components/ui/skeleton";

const restaurantProfileSchema = z.object({
  restaurantName: z.string().min(2, { message: "El nombre del restaurante debe tener al menos 2 caracteres." }),
  location: z.string().min(5, { message: "La ubicación debe tener al menos 5 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }).max(300, { message: "La descripción no puede exceder los 300 caracteres." }),
  profileImageFile: z.any().optional(), // For the file input - Changed from z.instanceof(FileList)
});

type RestaurantProfileFormData = z.infer<typeof restaurantProfileSchema>;

interface RestaurantDocument {
  restaurantName: string;
  location: string;
  description: string;
  imageUrl?: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function RestaurantProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>("https://placehold.co/128x128.png?text=Logo");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileExistsAndLoaded, setProfileExistsAndLoaded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);


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
        }
        setProfileExistsAndLoaded(true);
      } else {
        // No profile exists yet, form will be blank
        setProfileExistsAndLoaded(false); 
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar el perfil",
        description: "No se pudo cargar la información de tu restaurante.",
      });
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
      // If no file selected, and there's a current image URL, show that. Otherwise, placeholder.
      setImagePreview(currentImageUrl || "https://placehold.co/128x128.png?text=Logo");
      setValue('profileImageFile', undefined, { shouldDirty: true });
    }
  };

  async function onSubmit(data: RestaurantProfileFormData) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para guardar." });
      return;
    }

    let uploadedImageUrl = currentImageUrl; // Keep existing image URL by default

    if (imageFile) { // If a new file was selected for upload
      const storageRef = ref(storage, `restaurants/${user.uid}/profileImage/${imageFile.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, imageFile);
        uploadedImageUrl = await getDownloadURL(snapshot.ref);
        setCurrentImageUrl(uploadedImageUrl); // Update current image URL after successful upload
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          variant: "destructive",
          title: "Error al subir imagen",
          description: "No se pudo guardar la imagen de perfil.",
        });
        return; // Stop submission if image upload fails
      }
    }
    
    const restaurantDocRef = doc(db, "restaurants", user.uid);
    const profileDataToSave: Omit<RestaurantDocument, 'createdAt' | 'updatedAt'> & { updatedAt: any, createdAt?: any } = {
      ownerId: user.uid,
      restaurantName: data.restaurantName,
      location: data.location,
      description: data.description,
      imageUrl: uploadedImageUrl, // This will be undefined if no image was ever set and no new one uploaded
      updatedAt: serverTimestamp(),
    };

    try {
      // Check if doc exists to set createdAt only once
      const docSnap = await getDoc(restaurantDocRef);
      if (!docSnap.exists()) {
        profileDataToSave.createdAt = serverTimestamp();
      }

      await setDoc(restaurantDocRef, profileDataToSave, { merge: true }); // Merge to avoid overwriting createdAt

      toast({
        title: "¡Perfil Guardado!",
        description: "La información de tu restaurante ha sido guardada exitosamente.",
      });
      
      // Reset form with new data to make it not dirty
      reset({ 
        restaurantName: data.restaurantName,
        location: data.location,
        description: data.description,
        profileImageFile: undefined // Clear the file input state
      });
      setImageFile(null); // Clear the image file state
      if(uploadedImageUrl) setImagePreview(uploadedImageUrl); // Update preview with potentially new URL
      setProfileExistsAndLoaded(true); // Ensure "Mis Platos" shows
      
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar la información del restaurante.",
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
  } else if (isSubmitSuccessful && !isDirty) {
    buttonText = "Cambios Guardados";
    ButtonIcon = Check;
  }

  if (isLoadingProfile) {
    return (
      <ProtectedRoute allowedRoles={['driver']}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="w-full shadow-xl">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-12 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="w-full shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                Configura el Perfil de tu Restaurante
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
                            // No 'ref' or 'value' needed here directly from field, onChange handles it
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
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6" 
                    size="lg" 
                    disabled={isSubmitting || (isSubmitSuccessful && !isDirty && !imageFile) || !user}
                  >
                    <ButtonIcon className={`mr-2 h-5 w-5 ${isSubmitting ? 'animate-spin' : ''}`}/>
                    {buttonText}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {profileExistsAndLoaded && (
            <Card className="w-full shadow-xl mt-8">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                  Mis Platos
                </CardTitle>
                <CardDescription>
                  Añade y gestiona los platos que ofreces en tu menú.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Button variant="outline" size="lg" onClick={handleAddDish} className="py-6 px-8 text-lg">
                  <PlusCircle className="mr-2 h-6 w-6" />
                  Añadir Plato
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Haz clic aquí para empezar a construir tu menú digital.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


    