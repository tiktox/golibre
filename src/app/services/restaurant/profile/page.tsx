
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Camera, Building, MapPin, FileText, Save } from "lucide-react";

const restaurantProfileSchema = z.object({
  restaurantName: z.string().min(2, { message: "El nombre del restaurante debe tener al menos 2 caracteres." }),
  location: z.string().min(5, { message: "La ubicación debe tener al menos 5 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }).max(300, { message: "La descripción no puede exceder los 300 caracteres." }),
  profileImage: z.any().optional(), // Can be FileList or string (URL)
});

type RestaurantProfileFormData = z.infer<typeof restaurantProfileSchema>;

export default function RestaurantProfilePage() {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>("https://placehold.co/128x128.png?text=Logo");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<RestaurantProfileFormData>({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: {
      restaurantName: "",
      location: "",
      description: "",
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
    } else {
      // If no file is selected, or selection is cleared, revert to placeholder
      setImageFile(null);
      setImagePreview("https://placehold.co/128x128.png?text=Logo");
    }
  };

  async function onSubmit(data: RestaurantProfileFormData) {
    // Here you would typically handle image upload to a storage service (e.g., Firebase Storage)
    // and then save the profile data (including the image URL) to your database.
    console.log("Restaurant Profile Data:", data);
    console.log("Image File:", imageFile);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "¡Perfil Guardado!",
      description: "La información de tu restaurante ha sido guardada exitosamente.",
    });
    // Potentially redirect to a restaurant dashboard or back to service selection
    // router.push('/services/restaurant/dashboard'); 
  }

  return (
    <ProtectedRoute allowedRoles={['driver']}> {/* Assuming 'driver' role allows access to service setup */}
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Card className="w-full max-w-2xl shadow-xl">
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
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
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
                          className="sr-only" // Hidden, triggered by label
                          onChange={(e) => {
                            handleImageChange(e);
                            field.onChange(e.target.files); // Inform react-hook-form
                          }}
                        />
                      </FormControl>
                      <FormDescription className="mt-2 text-center">
                        Haz clic en la imagen para subir o cambiar el logo (PNG, JPG, WEBP).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={form.formState.isSubmitting}>
                  <Save className="mr-2 h-5 w-5"/>
                  {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
