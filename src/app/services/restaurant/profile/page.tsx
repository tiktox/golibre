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
import { Camera, Building, MapPin, FileText, Save, Check, Loader2, PlusCircle, Edit3, Plus, Utensils, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db, storage } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, type Timestamp, collection, addDoc, query, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import AddDishForm, { type DishFormData, dishCategories } from "@/components/services/restaurant/add-dish-form";
import type { RestaurantDish } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import RestaurantLocationMap from "@/components/services/restaurant/RestaurantLocationMap";


const restaurantProfileSchema = z.object({
  restaurantName: z.string().min(2, { message: "El nombre del restaurante debe tener al menos 2 caracteres." }),
  address: z.string().min(5, { message: "La dirección (obtenida del mapa) es requerida y debe tener al menos 5 caracteres." }),
  latitude: z.number({ required_error: "La latitud es requerida. Por favor, fija la ubicación en el mapa."}),
  longitude: z.number({ required_error: "La longitud es requerida. Por favor, fija la ubicación en el mapa."}),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }).max(300, { message: "La descripción no puede exceder los 300 caracteres." }),
  profileImageFile: z.any().optional(),
});

type RestaurantProfileFormData = z.infer<typeof restaurantProfileSchema>;

interface RestaurantDocument {
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl?: string | null;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/128x128.png";
const DEFAULT_DISH_PLACEHOLDER_IMAGE = "https://placehold.co/400x300.png";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<RestaurantDish | null>(null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);


  const form = useForm<RestaurantProfileFormData>({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: {
      restaurantName: "",
      address: "", 
      latitude: null as number | null,
      longitude: null as number | null,
      description: "",
    },
  });

  const { formState: { isSubmitting, isDirty, isSubmitSuccessful, errors }, control, setValue, reset, getValues, watch, trigger } = form;
  const currentLat = watch("latitude");
  const currentLng = watch("longitude");
  const currentAddress = watch("address");

  const fetchDishes = useCallback(async (userId: string) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error de Autenticación", description: "Debes iniciar sesión para ver los platos." });
      setIsLoadingDishes(false);
      return;
    }
    if (!userId) return;
    setIsLoadingDishes(true);
    try {
      const dishesColRef = collection(db, "restaurants", userId, "dishes");
      const q = query(dishesColRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedDishes: RestaurantDish[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedDishes.push({ id: docSnap.id, ...docSnap.data() } as RestaurantDish);
      });
      setDishesData(fetchedDishes);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      toast({ variant: "destructive", title: "Error al cargar platos", description: "No se pudieron cargar los platos. Verifique los permisos de Firebase o la consola del navegador para más detalles." });
    } finally {
      setIsLoadingDishes(false);
    }
  }, [toast, user]);

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
          address: data.address || "",
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
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
        if (data.latitude === undefined || data.longitude === undefined || !data.address) {
          setIsEditing(true);
          toast({ title: "Perfil Incompleto", description: "Por favor, completa la ubicación de tu restaurante en el mapa.", variant: "default"});
        } else {
          setIsEditing(false);
        }
        await fetchDishes(user.uid);
      } else {
        setProfileExistsAndLoaded(false);
        setImagePreview(DEFAULT_PLACEHOLDER_IMAGE);
        setCurrentImageUrl(undefined); 
        setIsEditing(true); 
        setDishesData([]); 
        toast({ title: "Bienvenido", description: "Configura el perfil de tu restaurante, incluyendo la ubicación en el mapa.", duration: 5000});
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar el perfil",
        description: (error as Error).message || "No se pudo cargar la información de tu restaurante. Verifique los permisos de Firebase o la consola del navegador para más detalles.",
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
      setValue('profileImageFile', file, { shouldDirty: true });
    } else {
      setImageFile(null);
      setImagePreview(currentImageUrl || DEFAULT_PLACEHOLDER_IMAGE);
      setValue('profileImageFile', undefined, { shouldDirty: true });
    }
  };

  async function onSubmitProfile(data: RestaurantProfileFormData) {
    if (!user) {
      toast({ variant: "destructive", title: "Error de Autenticación", description: "Debes iniciar sesión para guardar el perfil." });
      return;
    }

    // Explicit validation check before attempting to save
    if (data.latitude === null || data.longitude === null || !data.address || data.address.length < 5) {
        await trigger(['latitude', 'longitude', 'address']); // Trigger validation messages
        toast({ variant: "destructive", title: "Ubicación Requerida", description: "Por favor, fija la ubicación de tu restaurante en el mapa y asegúrate de que la dirección sea válida antes de guardar." });
        return;
    }

    let uploadedImageUrlOutcome: string | null = currentImageUrl === undefined ? null : currentImageUrl; 

    if (imageFile) { 
      const storageRefPath = `restaurants/${user.uid}/profileImage/${Date.now()}-${imageFile.name}`;
      const imageStorageRef = ref(storage, storageRefPath);
      
      const maxRetries = 3;
      let retryCount = 0;
      let lastError: any = null;

      while (retryCount < maxRetries) {
        try {
          const snapshot = await uploadBytes(imageStorageRef, imageFile);
          uploadedImageUrlOutcome = await getDownloadURL(snapshot.ref);
          break; // Si la subida es exitosa, salimos del bucle
        } catch (error) {
          lastError = error;
          retryCount++;
          if (retryCount < maxRetries) {
            // Esperamos un tiempo exponencial antes de reintentar
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      }

      if (retryCount === maxRetries && lastError) {
        console.error("Error uploading image after retries:", lastError);
        toast({
          variant: "destructive",
          title: "Error al subir imagen",
          description: "No se pudo guardar la imagen de perfil después de varios intentos. Por favor, intenta nuevamente más tarde."
        });
        return;
      }
    }
    
    const restaurantDocRef = doc(db, "restaurants", user.uid);
    const imageUrlForFirestore = uploadedImageUrlOutcome === undefined ? null : uploadedImageUrlOutcome;

    console.log("Image upload potential outcome URL:", imageUrlForFirestore);

    const profileDataToSave: Omit<RestaurantDocument, 'createdAt' | 'updatedAt'> & { updatedAt: any, createdAt?: any, imageUrl: string | null } = {
      ownerId: user.uid,
      restaurantName: data.restaurantName,
      address: data.address, // Comes from form data, updated by map
      latitude: data.latitude, // Comes from form data, updated by map
      longitude: data.longitude, // Comes from form data, updated by map
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
      
      reset({ // Reset form with the successfully saved data
        restaurantName: data.restaurantName,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
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
      if (!docSnap.exists()) { 
        await fetchDishes(user.uid);
      }
      
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar perfil",
        description: (error as Error).message || "No se pudo guardar la información del restaurante. Verifique los permisos de Firestore o la consola del navegador para más detalles.",
      });
    }
  }

  const handleOpenAddDishModal = () => {
    if (!user) {
        toast({ variant: "destructive", title: "Error de Autenticación", description: "Debes iniciar sesión para añadir platos." });
        return;
    }
    const values = getValues();
    if (!profileExistsAndLoaded || values.latitude === null || values.longitude === null || !values.address) {
        toast({ variant: "default", title: "Perfil Incompleto", description: "Primero completa y guarda el perfil de tu restaurante (incluyendo la ubicación en el mapa) para poder añadir platos." });
        setIsEditing(true); 
        return;
    }
    setIsAddDishModalOpen(true);
  };

  const handleDishAdded = async (dishData: DishFormData, dishImageFile: File | null) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error de Autenticación", description: "Debes iniciar sesión para añadir un plato." });
      return;
    }
    let dishImageUrl: string | null = null;
    try {
      if (dishImageFile) {
        const imageName = `${Date.now()}-${dishImageFile.name}`;
        const dishImageRef = ref(storage, `restaurants/${user.uid}/dishes/${imageName}`);
        
        const maxRetries = 3;
        let retryCount = 0;
        let lastError: any = null;

        while (retryCount < maxRetries) {
          try {
            await uploadBytes(dishImageRef, dishImageFile);
            dishImageUrl = await getDownloadURL(dishImageRef);
            break; // Si la subida es exitosa, salimos del bucle
          } catch (error) {
            lastError = error;
            retryCount++;
            if (retryCount < maxRetries) {
              // Esperamos un tiempo exponencial antes de reintentar
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
          }
        }

        if (retryCount === maxRetries && lastError) {
          console.error("Error uploading dish image after retries:", lastError);
          toast({ 
            variant: "destructive", 
            title: "Error al Subir Imagen", 
            description: "No se pudo subir la imagen del plato después de varios intentos. Por favor, intenta nuevamente más tarde."
          });
          return;
        }
      }

      const newDish: Omit<RestaurantDish, 'id' | 'createdAt' | 'updatedAt'> = {
        title: dishData.title,
        description: dishData.description,
        price: dishData.price,
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
      await fetchDishes(user.uid); 
    } catch (error) {
      console.error("Error adding dish:", error);
      toast({ 
        variant: "destructive", 
        title: "Error al Añadir Plato", 
        description: (error as Error).message || "No se pudo guardar el plato. Verifique los permisos de Firebase o la consola del navegador para más detalles." 
      });
    }
  };
  
  const handleDeleteDish = async () => {
    if (!dishToDelete || !user) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo determinar el plato a eliminar o el usuario no está autenticado." });
      return;
    }

    const { id: dishId, imageUrl } = dishToDelete;

    try {
      const dishDocRef = doc(db, "restaurants", user.uid, "dishes", dishId);
      await deleteDoc(dishDocRef);

      if (imageUrl && imageUrl.startsWith("https://firebasestorage.googleapis.com")) {
        try {
          const imageStorageRef = ref(storage, imageUrl); 
          await deleteObject(imageStorageRef);
        } catch (storageError) {
          console.error("Error deleting image from Storage:", storageError);
          toast({
            variant: "default", 
            title: "Advertencia al Eliminar Imagen",
            description: "El plato se eliminó de la base de datos, pero hubo un problema al eliminar la imagen asociada del almacenamiento. Puede que necesites eliminarla manualmente.",
          });
        }
      }

      toast({
        title: "¡Plato Eliminado!",
        description: `El plato "${dishToDelete.title}" ha sido eliminado de tu menú.`,
      });
      await fetchDishes(user.uid); 
    } catch (error) {
      console.error("Error deleting dish:", error);
      toast({ 
        variant: "destructive", 
        title: "Error al Eliminar Plato", 
        description: (error as Error).message || "No se pudo eliminar el plato. Verifique los permisos de Firebase o la consola del navegador para más detalles." 
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDishToDelete(null);
    }
  };

  const openDeleteConfirmation = (dish: RestaurantDish) => {
    setDishToDelete(dish);
    setIsDeleteDialogOpen(true);
  };
  
  const filteredDishes = selectedCategoryFilter
    ? dishesData.filter(dish => dish.category === selectedCategoryFilter)
    : dishesData;

  const handleLocationSelectedFromMap = (location: { lat: number; lng: number; address?: string }) => {
    setValue('latitude', location.lat, { shouldDirty: true, shouldValidate: true });
    setValue('longitude', location.lng, { shouldDirty: true, shouldValidate: true });
    setValue('address', location.address || `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`, { shouldDirty: true, shouldValidate: true });
    setIsMapModalOpen(false);
    toast({ title: "Ubicación Seleccionada", description: `Dirección: ${location.address || `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`}`});
  };

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
            <Skeleton className="h-10 w-full mb-4" /> {/* Restaurant Name */}
            <Skeleton className="h-10 w-full mb-4" /> {/* Location Button */}
            <Skeleton className="h-20 w-full mb-6" /> {/* Description */}
            <Skeleton className="h-12 w-full" /> {/* Save Button */}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <div className="container mx-auto px-4 py-8">
        {isEditing || !profileExistsAndLoaded ? (
          // EDITING OR CREATING VIEW
          <Card className="w-full max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                {profileExistsAndLoaded ? "Editar Perfil del Restaurante" : "Configura el Perfil de tu Restaurante"}
              </CardTitle>
              <CardDescription>
                Completa los detalles para que los clientes puedan encontrarte. La ubicación se fija mediante el mapa y es obligatoria.
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

                  {/* Location Section */}
                  <div className="space-y-2">
                    <FormLabel className="text-md flex items-center gap-1"><MapPin className="h-4 w-4" />Ubicación del Restaurante</FormLabel>
                     <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
                      <DialogTrigger asChild>
                         <Button type="button" variant="outline" className="w-full">
                          <MapPin className="mr-2 h-4 w-4" /> 
                          {currentLat && currentLng ? "Modificar Ubicación en Mapa" : "Fijar Ubicación en Mapa (Obligatorio)"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl md:max-h-[85vh] overflow-y-auto"> {/* Adjusted modal size */}
                        <DialogHeader>
                          <DialogTitle>Selecciona la Ubicación de tu Restaurante</DialogTitle>
                          <DialogDescription>
                            Busca una dirección o haz clic/arrastra el marcador en el mapa para fijar la ubicación exacta.
                          </DialogDescription>
                        </DialogHeader>
                        {GOOGLE_MAPS_API_KEY ? (
                          <RestaurantLocationMap
                            apiKey={GOOGLE_MAPS_API_KEY}
                            initialLat={currentLat}
                            initialLng={currentLng}
                            onLocationSelect={handleLocationSelectedFromMap}
                            setMapManuallyClosed={setIsMapModalOpen}
                          />
                        ) : (
                          <p className="text-destructive text-center py-4">La clave API de Google Maps no está configurada. No se puede mostrar el mapa.</p>
                        )}
                      </DialogContent>
                    </Dialog>
                    {(!profileExistsAndLoaded && (!currentLat || !currentLng)) && (
                       <FormDescription className="text-sm text-destructive font-medium">
                         Es obligatorio fijar la ubicación en el mapa para crear el perfil.
                       </FormDescription>
                    )}
                    {currentAddress && (
                        <p className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/30">
                            <span className="font-medium">Dirección Seleccionada:</span> {currentAddress}
                        </p>
                    )}
                     {/* Hidden inputs for form state, messages will show via FormField for each */}
                     <FormField name="address" control={control} render={() => <FormMessage />} />
                     <FormField name="latitude" control={control} render={() => <FormMessage />} />
                     <FormField name="longitude" control={control} render={() => <FormMessage />} />
                  </div>
                 
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
                  {profileExistsAndLoaded && isEditing && ( 
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
        ) : ( 
          // DISPLAY VIEW
          <div className="w-full max-w-5xl mx-auto">
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
                  {getValues("address") ? (
                    <>
                      <p className="text-md text-foreground/80 mt-1.5 flex items-center justify-center sm:justify-start">
                        <MapPin className="h-4 w-4 mr-1.5 shrink-0" /> {getValues("address")}
                      </p>
                      {(getValues("latitude") && getValues("longitude")) && (
                        <p className="text-xs text-foreground/70 mt-0.5 flex items-center justify-center sm:justify-start">
                            (Lat: {getValues("latitude")?.toFixed(4)}, Lng: {getValues("longitude")?.toFixed(4)})
                            <a 
                                href={`https://www.google.com/maps?q=${getValues("latitude")},${getValues("longitude")}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-primary hover:underline"
                                title="Ver en Google Maps"
                            >
                              <ExternalLink className="h-3 w-3"/>
                            </a>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-md text-destructive mt-1.5">Ubicación no configurada.</p>
                  )}
                  <p className="text-sm text-foreground/90 mt-2 max-w-prose mx-auto sm:mx-0">{getValues("description") || "Descripción no disponible"}</p>
                </div>
              </div>
            </div>

            {/* Dish Categories Filter */}
            <div className="mb-10">
              <ScrollArea className="w-full whitespace-nowrap pb-2.5">
                <div className="flex items-center space-x-3">
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
                          data-ai-hint="restaurant dish"
                        />
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-destructive/80"
                            onClick={() => openDeleteConfirmation(dish)}
                            aria-label="Eliminar plato"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-3 flex flex-col flex-grow">
                        <h3 className="text-base font-semibold text-primary truncate group-hover:text-accent transition-colors">{dish.title}</h3>
                        <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2 flex-grow">{dish.description}</p>
                        <p className="text-sm font-bold text-accent">{`RD$${dish.price.toFixed(2)}`}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* FAB to Add Dish - Only shown if profile is loaded and location is set */}
            {profileExistsAndLoaded && getValues("latitude") && getValues("longitude") && getValues("address") && (
                <Button
                variant="default"
                size="lg" 
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-xl p-0" 
                onClick={handleOpenAddDishModal}
                aria-label="Añadir Plato"
                disabled={!user} 
                >
                <Plus className="h-7 w-7" />
                </Button>
            )}
          </div>
        )}
      </div>
      {/* Add Dish Modal */}
      {profileExistsAndLoaded && user && (
          <AddDishForm 
            isOpen={isAddDishModalOpen} 
            onOpenChange={setIsAddDishModalOpen}
            onDishAdd={handleDishAdded}
          />
      )}
      {/* Delete Dish Confirmation Dialog */}
      {dishToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar el plato: <strong>{dishToDelete.title}</strong>. 
                Esta acción no se puede deshacer y también se eliminará la imagen asociada (si existe).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDishToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDish} className="bg-destructive hover:bg-destructive/90">
                Eliminar Plato
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ProtectedRoute>
  );
}
    

    

    