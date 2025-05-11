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
import { DollarSign, MapPin, CreditCard, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const locationSchema = z.object({
  origin: z.string().min(3, { message: "Origin must be at least 3 characters." }),
  destination: z.string().min(3, { message: "Destination must be at least 3 characters." }),
  paymentMethod: z.enum(['card', 'cash'], { required_error: "Please select a payment method." }),
});

type LocationFormData = z.infer<typeof locationSchema>;

const BASE_FARE = 5; // dollars
const PER_KM_FARE = 1.5; // dollars per km

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

  const { watch } = form;
  const originValue = watch("origin");
  const destinationValue = watch("destination");

  useEffect(() => {
    if (originValue && destinationValue && originValue.length >=3 && destinationValue.length >=3) {
      // Mock distance calculation
      const mockDistance = Math.random() * 20 + 5; // Random distance between 5 and 25 km
      setDistance(parseFloat(mockDistance.toFixed(1)));
      setEstimatedFare(BASE_FARE + mockDistance * PER_KM_FARE);
    } else {
      setDistance(null);
      setEstimatedFare(null);
    }
  }, [originValue, destinationValue]);

  function onSubmit(data: LocationFormData) {
    console.log("Trip Request Data:", data);
    toast({
      title: "Ride Requested!",
      description: `Searching for drivers for your trip from ${data.origin} to ${data.destination}.`,
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
          Where to?
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
                  <FormLabel className="text-md">Origin</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Current Location or Address" {...field} className="text-base"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Airport or Specific Address" {...field} className="text-base"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {estimatedFare !== null && distance !== null && (
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                <div className="flex items-center justify-between text-lg font-semibold text-accent">
                  <span>Estimated Fare:</span>
                  <span>${estimatedFare.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  Distance: {distance.toFixed(1)} km
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-md">Payment Method</FormLabel>
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
                          <CreditCard className="h-5 w-5 text-primary"/> Credit/Debit Card
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cash" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Coins className="h-5 w-5 text-primary"/> Cash
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
            <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Requesting..." : "Find a Ride"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
