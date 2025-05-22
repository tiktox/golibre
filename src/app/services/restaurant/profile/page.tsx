
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
import { Camera, Building, MapPin, FileText, Save, Check, Loader2, PlusCircle, Edit3, Plus, ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db, storage } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, type Timestamp, collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import AddDishForm, { type DishFormData, dishCategories } from "@/components/services/restaurant/add-dish-form";
import type { RestaurantDish } from "@/types";

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
const DEFAULT_DISH_PLACEHOLDER_IMAGE = "https://placehold.co/400x300.png";

export default function RestaurantProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(DEFAULT_PLACEHOLDER_IMAGE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileExistsAndLoaded, setProfileExistsAndLoaded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [dishesData, setDishesData] = useState<RestaurantDish[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(dishCategories[0]?.value || null);


  const form = useForm<RestaurantProfileFormData>({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: {
      restaurantName: "",
      location: "",
      description: "",
    },
  });

  const { formState: { isSubmitting, isDirty, isSubmitSuccessful }, control, setValue, reset, getValues } = form;

  const fetchDishes = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsLoadingDishes(true);
    try {
      const dishesColRef = collection(db, "restaurants", userId, "dishes");
      const q = query(dishesColRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedDishes: RestaurantDish[] = [];
      querySnapshot.forEach((doc) => {
        fetchedDishes.push({ id: doc.id, ...doc.data() } as RestaurantDish);
      });
      setDishesData(fetchedDishes);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      toast({ variant: "destructive", title: "Error al cargar platos", description: "No se pudieron cargar los platos." });
    } finally {
      setIsLoadingDishes(false);
    }
  }, [toast]);

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
        await fetchDishes(user.uid); // Fetch dishes after profile loads
      } else {
        setProfileExistsAndLoaded(false);
        setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
        setCurrentImageUrl(undefined);
        setIsEditing(true); 
        setDishesData([]);
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
  }, [user, reset, toast, fetchDishes]);

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
      setValue('profileImageFile', file, { shouldDirty: true }); // Keep Zod aware of file change
    } else {
      setImageFile(null);
      setImagePreview(currentImageUrl || DEFAULT_PLACEHOLDER_IMAGE);
      setValue('profileImageFile', undefined, { shouldDirty: true });
    }
  };

  async function onSubmitProfile(data: RestaurantProfileFormData) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para guardar." });
      return;
    }

    let uploadedImageUrlOutcome: string | null = currentImageUrl === undefined ? null : currentImageUrl;

    if (imageFile) {
      const storageRef = ref(storage, `restaurants/${user.uid}/profileImage/${imageFile.name}-${Date.now()}`);
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
      if (!docSnap.exists()) { // If it was a new profile, fetch dishes
        await fetchDishes(user.uid);
      }
      
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la información del restaurante.",
      });
    }
  }

  const handleOpenAddDishModal = () => {
    if (!profileExistsAndLoaded) {
        toast({ variant: "default", title: "Perfil Requerido", description: "Primero guarda el perfil de tu restaurante." });
        setIsEditing(true); // Prompt to edit profile if not saved
        return;
    }
    setIsAddDishModalOpen(true);
  };

  const handleDishAdded = async (dishData: DishFormData, dishImageFile: File | null) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión." });
      return;
    }
    let dishImageUrl: string | null = null;
    try {
      if (dishImageFile) {
        const imageName = `${Date.now()}-${dishImageFile.name}`;
        const dishImageRef = ref(storage, `restaurants/${user.uid}/dishes/${imageName}`);
        await uploadBytes(dishImageRef, dishImageFile);
        dishImageUrl = await getDownloadURL(dishImageRef);
      }

      const newDish: Omit<RestaurantDish, 'id' | 'createdAt' | 'updatedAt'> = {
        title: dishData.title,
        description: dishData.description,
        price: dishData.price, // Already a number from Zod transform
        category: dishData.category,
        imageUrl: dishImageUrl,
        restaurantId: user.uid,
      };
      
      const dishesColRef = collection(db, "restaurants", user.uid, "dishes");
      await addDoc(dishesColRef, {
        ...newDish,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "¡Plato Añadido!",
        description: `El plato "${dishData.title}" ha sido añadido a tu menú.`,
      });
      setIsAddDishModalOpen(false);
      await fetchDishes(user.uid); // Re-fetch dishes to update the list
    } catch (error) {
      console.error("Error adding dish:", error);
      toast({ variant: "destructive", title: "Error al Añadir Plato", description: "No se pudo guardar el plato." });
    }
  };
  
  const filteredDishes = selectedCategoryFilter
    ? dishesData.filter(dish => dish.category === selectedCategoryFilter)
    : dishesData;


  let buttonText = "Guardar Cambios";
  let ButtonIcon = Save;

  if (isSubmitting) {
    buttonText = "Guardando...";
    ButtonIcon = Loader2;
  } else if (isSubmitSuccessful && !isDirty && !imageFile && profileExistsAndLoaded && isEditing) {
    buttonText = "Cambios Guardados";
    ButtonIcon = Check;
  } else if (!profileExistsAndLoaded && !isDirty && isEditing) {
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
              <form onSubmit={form.handleSubmit(onSubmitProfile)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={control}
                    name="profileImageFile"
                    render={({ fieldState: imageFieldState }) => ( 
                      <FormItem className="flex flex-col items-center">
                        <FormLabel htmlFor="profile-image-upload" className="cursor-pointer">
                          <Avatar className="h-32 w-32 border-2 border-primary/50 hover:border-primary transition-colors">
                            <AvatarImage src={imagePreview || undefined} alt="Logo del Restaurante" data-ai-hint="restaurant logo"/>
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
                    disabled={isSubmitting || (isSubmitSuccessful && !isDirty && !imageFile && profileExistsAndLoaded && isEditing) || !user}
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
                  <AvatarImage src={imagePreview || DEFAULT_PLACEHOLDER_IMAGE} alt={getValues("restaurantName") || "Restaurant"} data-ai-hint="restaurant logo"/>
                  <AvatarFallback className="text-4xl"><Building /></AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h1 className="text-3xl md:text-4xl font-bold text-primary break-words">{getValues("restaurantName") || "Nombre no disponible"}</h1>
                  <p className="text-md text-foreground/80 mt-1.5 flex items-center justify-center sm:justify-start">
                    <MapPin className="h-4 w-4 mr-1.5 shrink-0" /> {getValues("location") || "Ubicación no disponible"}
                  </p>
                  <p className="text-sm text-foreground/90 mt-2 max-w-prose mx-auto sm:mx-0">{getValues("description") || "Descripción no disponible"}</p>
                </div>
              </div>
            </div>

            {/* Dish Categories Section */}
            <div className="mb-10">
              <ScrollArea className="w-full whitespace-nowrap pb-2.5">
                <div className="flex items-center space-x-3">
                  {/* TODO: Add real scroll buttons if many categories */}
                  {/* <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full opacity-80 hover:opacity-100 hidden sm:flex"><ChevronLeft /></Button> */}
                  {dishCategories.map((cat) => (
                    <Button 
                      key={cat.value} 
                      variant={selectedCategoryFilter === cat.value ? 'default' : 'secondary'} 
                      size="sm" 
                      className="text-sm font-medium shadow-sm px-4 py-2 h-auto"
                      onClick={() => setSelectedCategoryFilter(cat.value)}
                    >
                      <cat.icon className="mr-2 h-4 w-4" /> {cat.label}
                    </Button>
                  ))}
                  {/* <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full opacity-80 hover:opacity-100 hidden sm:flex"><ChevronRight /></Button> */}
                </div>
                <ScrollBar orientation="horizontal" className="h-2 [&>div]:h-full" />
              </ScrollArea>
            </div>

            {/* Dishes Grid Section */}
            <div>
              {isLoadingDishes ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="overflow-hidden shadow-md rounded-lg flex flex-col">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <CardContent className="p-4 flex flex-col flex-grow space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-1/3 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredDishes.length === 0 ? (
                <div className="text-center py-10">
                    <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">
                      {selectedCategoryFilter ? `No hay platos en la categoría "${dishCategories.find(c=>c.value === selectedCategoryFilter)?.label || selectedCategoryFilter}".` : "Aún no has añadido ningún plato."}
                    </p>
                    <p className="text-sm text-muted-foreground">¡Haz clic en el botón '+' para empezar a construir tu menú!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {filteredDishes.map((dish) => ( 
                    <Card key={dish.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col group">
                      <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <Image
                          src={dish.imageUrl || DEFAULT_DISH_PLACEHOLDER_IMAGE}
                          alt={dish.title}
                          layout="fill"
                          objectFit="cover"
                          className="group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={`${dish.category} food`}
                        />
                      </div>
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-lg text-primary leading-tight truncate" title={dish.title}>{dish.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 flex-grow" title={dish.description}>{dish.description}</p>
                        <p className="text-xl font-bold text-accent mt-2">RD${dish.price.toFixed(2)}</p>
                      </CardContent>
                       {/* Future: Add edit/delete buttons for dishes here */}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Floating Action Button to Add Dish */}
            <Button
              variant="default"
              size="lg" 
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-xl p-0"
              onClick={handleOpenAddDishModal}
              aria-label="Añadir Plato"
              disabled={!profileExistsAndLoaded || isSubmitting}
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
      {profileExistsAndLoaded && user && ( // Only render modal if profile exists and user is logged in
          <AddDishForm 
            isOpen={isAddDishModalOpen} 
            onOpenChange={setIsAddDishModalOpen}
            onDishAdd={handleDishAdded}
          />
      )}
    </ProtectedRoute>
  );
}
