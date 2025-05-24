
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Utensils, Coffee, IceCream, Sparkles, Users, Vegan, DollarSign, Loader2, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const dishCategories = [
  { value: "platos", label: "Platos", icon: Utensils },
  { value: "entradas", label: "Entradas", icon: Sparkles },
  { value: "bebidas", label: "Bebidas", icon: Coffee },
  { value: "postres", label: "Postres", icon: IceCream },
  { value: "especiales", label: "Especiales del Día", icon: Sparkles },
  { value: "combos", label: "Combos Familiares", icon: Users },
  { value: "vegano", label: "Vegano", icon: Vegan },
];

const dishFormSchema = z.object({
  category: z.string().min(1, "Selecciona una categoría."),
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }).max(200, {message: "Máximo 200 caracteres."}),
  price: z.string()
    .min(1, {message: "El precio es requerido."})
    .regex(/^\d+(\.\d{1,2})?$/, "Ingresa un precio válido (ej: 450 o 450.00).")
    .transform(val => parseFloat(val))
    .refine(val => val > 0, { message: "El precio debe ser mayor a 0."}),
});

export type DishFormData = z.infer<typeof dishFormSchema>;

interface AddDishFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDishAdd: (data: DishFormData, imageFile: File | null) => Promise<void>; 
}

const DEFAULT_DISH_PLACEHOLDER_IMAGE = "https://placehold.co/400x300.png";

export default function AddDishForm({ isOpen, onOpenChange, onDishAdd }: AddDishFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(DEFAULT_DISH_PLACEHOLDER_IMAGE);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<DishFormData>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      category: "",
      title: "Tacos de Birria",
      description: "Tradicionales tacos mexicanos con consomé.",
      price: 450,
    },
  });

  const { formState: { isSubmitting }, control, handleSubmit, reset, setValue } = form;

  useEffect(() => {
    if (!isOpen) {
      reset({
        category: "",
        title: "Tacos de Birria",
        description: "Tradicionales tacos mexicanos con consomé.",
        price: 450,
      });
      setImagePreview(DEFAULT_DISH_PLACEHOLDER_IMAGE);
      setImageFile(null);
    }
  }, [isOpen, reset]);

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
      setImageFile(null);
      setImagePreview(DEFAULT_DISH_PLACEHOLDER_IMAGE);
    }
  };

  async function onSubmit(data: DishFormData) {
    await onDishAdd(data, imageFile);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            Actualizar menú
          </DialogTitle>
          <DialogDescription>
            Completa los siguientes detalles para actualizar el menú.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Vende de forma creativa!</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dishCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4 text-muted-foreground" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="flex flex-col items-center">
              <FormLabel htmlFor="dish-image-upload" className="cursor-pointer w-full aspect-[4/3] rounded-md border-2 border-dashed border-primary/50 hover:border-primary transition-colors flex items-center justify-center relative overflow-hidden bg-muted/50">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Vista previa del plato" layout="fill" objectFit="cover" data-ai-hint="food dish"/>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>Subir Imagen del Plato</p>
                  </div>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  id="dish-image-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </FormControl>
              <FormDescription className="mt-1 text-center text-xs">
                PNG, JPG, WEBP (Recomendado: 400x300px o similar).
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md flex items-center gap-1"><Type className="h-4 w-4" />Título de la publicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tacos de Birria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Tradicionales tacos mexicanos con consomé."
                      {...field}
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="price"
              render={({ field: { onChange, value, ...restField } }) => (
                <FormItem>
                  <FormLabel className="text-md flex items-center gap-1"><DollarSign className="h-4 w-4"/>Precio (RD$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Ej: 450.00" 
                      value={value === undefined || isNaN(value) ? "" : String(value)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d{0,2}$/.test(val)) {
                           onChange(val); 
                        } else if (val === "") {
                           onChange("");
                        }
                      }}
                      {...restField} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publicar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    