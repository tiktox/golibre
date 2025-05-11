"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Star, Car, Phone, XCircle } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Mock data structure, replace with actual data type from src/types
interface MockDriver {
  name: string;
  avatarUrl: string;
  vehicleModel: string;
  licensePlate: string;
  rating: number;
}

interface MockTripDetails {
  origin: string;
  destination: string;
  status: 'Driver en route' | 'Trip in progress' | 'Arrived';
  etaMinutes: number;
  driver: MockDriver;
  fare?: string;
  distance?: string;
}

export default function TripInfoDisplay() {
  const searchParams = useSearchParams();
  const [tripDetails, setTripDetails] = useState<MockTripDetails | null>(null);
  
  useEffect(() => {
    // Simulate fetching trip details based on an ID or simply mock
    const fare = searchParams.get('fare');
    const distance = searchParams.get('distance');

    setTripDetails({
      origin: "123 Main St, Cityville", // Mocked
      destination: "789 Market Ave, Townburg", // Mocked
      status: 'Driver en route',
      etaMinutes: 12,
      driver: {
        name: "John Doe",
        avatarUrl: "https://picsum.photos/seed/johndoe/100/100",
        vehicleModel: "Toyota Camry (Blue)",
        licensePlate: "XYZ 123",
        rating: 4.9,
      },
      fare: fare || undefined,
      distance: distance || undefined,
    });
  }, [searchParams]);

  if (!tripDetails) {
    return (
      <Card className="w-full max-w-2xl shadow-xl animate-pulse">
        <CardHeader>
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-muted h-16 w-16"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </CardContent>
        <CardFooter className="flex justify-between">
           <div className="h-10 bg-muted rounded w-24"></div>
           <div className="h-10 bg-muted rounded w-24"></div>
        </CardFooter>
      </Card>
    );
  }

  const { origin, destination, status, etaMinutes, driver, fare, distance } = tripDetails;

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Your Trip Details</CardTitle>
            <CardDescription>Track your ride in real-time.</CardDescription>
          </div>
          <Badge variant={status === 'Arrived' ? "default" : "outline"} className="text-sm whitespace-nowrap">
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={driver.avatarUrl} alt={driver.name} data-ai-hint="driver portrait" />
            <AvatarFallback>{driver.name.substring(0,1)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-primary">{driver.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <Car className="h-4 w-4 mr-2" /> {driver.vehicleModel} - {driver.licensePlate}
            </p>
            <p className="text-sm text-muted-foreground flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" /> {driver.rating.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-md">
            <Clock className="h-5 w-5 mr-3 text-primary" />
            <span>Estimated arrival for pickup: <strong className="text-accent">{etaMinutes} minutes</strong></span>
          </div>
          <div className="flex items-start text-md">
            <MapPin className="h-5 w-5 mr-3 text-primary mt-1" />
            <div>
              <span className="font-medium">From:</span> {origin}<br />
              <span className="font-medium">To:</span> {destination}
            </div>
          </div>
          {fare && distance && (
            <div className="flex items-center text-md">
               <DollarSign className="h-5 w-5 mr-3 text-primary" />
               <span>Fare: <strong className="text-accent">${fare}</strong> ({distance} km)</span>
            </div>
          )}
        </div>

        <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
            <Image 
              src="https://picsum.photos/800/450?random=2" 
              alt="Live map placeholder" 
              width={800} height={450} 
              className="object-cover w-full h-full"
              data-ai-hint="map tracking driver" 
            />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-3">
        <Button variant="outline">
          <Phone className="h-4 w-4 mr-2" /> Contact Driver
        </Button>
        <Button variant="destructive">
          <XCircle className="h-4 w-4 mr-2" /> Cancel Trip
        </Button>
      </CardFooter>
    </Card>
  );
}
