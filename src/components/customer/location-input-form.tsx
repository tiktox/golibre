
"use client";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, MapPin, CreditCard, Coins, LocateFixed } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const locationSchema = z.object({
  origin: z.string().min(3, { message: "El origen debe tener al menos 3 caracteres." }),
  destination: z.string().min(3, { message: "El destino debe tener al menos 3 caracteres." }),
  paymentMethod: z.enum(['card', 'cash'], { required_error: "Por favor, selecciona un método de pago." }),
});

type LocationFormData = z.infer<typeof locationSchema>;

const PER_KM_FARE = 300; // RD$ per km
const CURRENCY_SYMBOL = "RD$";

export default function LocationInputForm() {
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      origin: "",
      destination: "",
      paymentMethod: "card",
    },
  });

  const { watch, setValue } = form;
  const originValue = watch("origin");
  const destinationValue = watch("destination");

  useEffect(() => {
    if (originValue && destinationValue && originValue.length >=3 && destinationValue.length >=3) {
      // Mock distance calculation
      const mockDistance = Math.random() * 20 + 1; // Random distance between 1 and 21 km
      setDistance(parseFloat(mockDistance.toFixed(1)));
      setEstimatedFare(mockDistance * PER_KM_FARE);
    } else {
      setDistance(null);
      setEstimatedFare(null);
    }
  }, [originValue, destinationValue]);

  const handleUseCurrentLocation = () => {
    // Mock fetching current location
    const mockCurrentLocation = "Ubicación Actual: Av. Winston Churchill 100, Santo Domingo";
    setValue("origin", mockCurrentLocation, { shouldValidate: true });
    toast({
      title: "¡Ubicación actual establecida!",
      description: `Origen establecido como: ${mockCurrentLocation}`,
    });
  };

  function onSubmit(data: LocationFormData) {
    console.log("Datos de Solicitud de Viaje:", data);
    toast({
      title: "¡Viaje Solicitado!",
      description: `Buscando conductores para tu viaje de ${data.origin} a ${data.destination}.`,
    });
    // Simulate API call and redirect to trip details page with a mock trip ID
    setTimeout(() => {
      router.push(`/customer/trip-details/mockTrip123?fare=${estimatedFare?.toFixed(2)}&distance=${distance}`);
    }, 1500);
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          ¿A dónde vas?
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Origen</FormLabel>
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <FormControl>
                      <Input placeholder="ej., Mi Casa, Plaza Central" {...field} className="text-base flex-grow"/>
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleUseCurrentLocation} className="w-full sm:w-auto">
                      <LocateFixed className="mr-2 h-4 w-4" /> Usar mi ubicación actual
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Destino (barra de búsqueda)</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., Aeropuerto Las Américas, Agora Mall" {...field} className="text-base"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {estimatedFare !== null && distance !== null && (
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                <div className="flex items-center justify-between text-lg font-semibold text-accent">
                  <span>Tarifa Estimada:</span>
                  <span>{CURRENCY_SYMBOL}{estimatedFare.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  Distancia: {distance.toFixed(1)} km
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-md">Método de Pago</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="card" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary"/> Tarjeta de Crédito/Débito
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cash" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Coins className="h-5 w-5 text-primary"/> Efectivo
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={form.formState.isSubmitting || estimatedFare === null}>
              {form.formState.isSubmitting ? "Solicitando..." : "Solicitar Viaje"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

