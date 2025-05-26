"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User, Star, MapPin, DollarSign, Route } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data structure
interface MockRideRequest {
  id: string;
  customerName: string;
  customerRating: number;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedFare: number;
}

const mockRequest: MockRideRequest = {
  id: "req456",
  customerName: "Alice Smith",
  customerRating: 4.8,
  origin: "Downtown Plaza",
  destination: "Northwood Suburbs",
  distanceKm: 5.2,
  estimatedFare: 12.80,
};

export default function RideRequestActions() {
  const [request, setRequest] = useState<MockRideRequest | null>(mockRequest);
  const { toast } = useToast();

  const handleAccept = () => {
    if (!request) return;
    toast({
      title: "Ride Accepted!",
      description: `You accepted the ride from ${request.customerName}. Navigate to pickup.`,
      variant: "default",
    });
    // Add logic to navigate or update state
    setRequest(null); // Remove request from view
  };

  const handleReject = () => {
    if (!request) return;
    toast({
      title: "Ride Rejected",
      description: `You rejected the ride from ${request.customerName}.`,
      variant: "destructive",
    });
    setRequest(null); // Remove request from view
  };

  if (!request) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No new ride requests</CardTitle>
          <CardDescription>You're all caught up. We'll notify you of new requests.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">Incoming Ride Request</CardTitle>
          <Badge variant="outline" className="bg-accent text-accent-foreground">New</Badge>
        </div>
        <CardDescription>Review the details below and respond quickly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-secondary/20 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-lg text-primary flex items-center">
              <User className="h-5 w-5 mr-2" /> {request.customerName}
            </span>
            <span className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" /> {request.customerRating.toFixed(1)}
            </span>
          </div>
          <div className="text-sm space-y-1">
            <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary/70" /> <strong>From:</strong> {request.origin}</p>
            <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary/70" /> <strong>To:</strong> {request.destination}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">DISTANCE</p>
            <p className="text-lg font-semibold text-primary flex items-center justify-center">
              <Route className="h-5 w-5 mr-1" /> {request.distanceKm.toFixed(1)} km
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">EST. FARE</p>
            <p className="text-lg font-semibold text-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5 mr-1" /> ${request.estimatedFare.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="aspect-video bg-muted rounded-md overflow-hidden border">
          <Image 
            src="https://picsum.photos/600/338?random=3" 
            alt="Mini-map preview of route" 
            width={600} 
            height={338}
            className="object-cover w-full h-full"
            data-ai-hint="map route preview"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleAccept} className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="h-5 w-5 mr-2" /> Accept Ride
        </Button>
        <Button onClick={handleReject} variant="destructive" className="w-full sm:w-auto flex-1">
          <XCircle className="h-5 w-5 mr-2" /> Reject Ride
        </Button>
      </CardFooter>
    </Card>
  );
}
