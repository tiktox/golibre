'use client'; // Top-level client component for state management of mock data

import React, { useState } from 'react';
import RideRequestCard from '@/components/driver/RideRequestCard';
import type { RideRequest } from '@/lib/types';
import AdBanner from '@/components/driver/AdBanner'; // This will be a server component rendered via Next.js magic
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock Data - In a real app, this would come from a backend/API
const initialMockRideRequests: RideRequest[] = [
  {
    id: '1',
    clientId: 'client123',
    clientName: 'Alice Wonderland',
    clientRating: 4.8,
    origin: { lat: 34.0522, lng: -118.2437, address: '123 Fantasy Lane, Dream City' },
    destination: { lat: 34.0522, lng: -118.2437, address: '456 Reality Ave, Worksville' },
    distanceKm: 5.2,
    estimatedFare: 15.75,
    status: 'pending',
  },
  {
    id: '2',
    clientId: 'client456',
    clientName: 'Bob The Builder',
    clientRating: 4.5,
    origin: { lat: 34.0522, lng: -118.2437, address: '789 Construction Rd, Tooltown' },
    destination: { lat: 34.0522, lng: -118.2437, address: '101 Project Site, Buildburg' },
    distanceKm: 12.8,
    estimatedFare: 30.50,
    status: 'pending',
  },
];

export default function DriverDashboardPage() {
  const [rideRequests, setRideRequests] = useState<RideRequest[]>(initialMockRideRequests);
  const { toast } = useToast();

  const handleAcceptRide = (requestId: string) => {
    console.log('Accepted ride:', requestId);
    setRideRequests(prev => prev.filter(req => req.id !== requestId));
    toast({
      title: "Ride Accepted!",
      description: `You have accepted ride ${requestId}. Navigate to pickup.`,
    });
    // In a real app: API call to accept, update UI, navigate to trip screen
  };

  const handleDeclineRide = (requestId: string) => {
    console.log('Declined ride:', requestId);
    setRideRequests(prev => prev.filter(req => req.id !== requestId));
     toast({
      title: "Ride Declined",
      description: `You have declined ride ${requestId}.`,
      variant: "default",
    });
    // In a real app: API call to decline, update UI
  };
  
  const refreshRequests = () => {
    // Simulate fetching new requests
    setRideRequests(initialMockRideRequests.map(r => ({...r, id: r.id + Date.now()}))); // make IDs unique for re-render
    toast({
        title: "Requests Refreshed",
        description: "Showing available ride requests."
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
        <Button onClick={refreshRequests} variant="outline">
            <RefreshCcw size={18} className="mr-2"/>
            Refresh Requests
        </Button>
      </div>

      {/* Ad Banner - This is a Server Component instance, Next.js handles its rendering */}
      {/* @ts-expect-error Async Server Component */}
      <AdBanner driverStatus="WAITING" tripHistory="Frequent city trips, occasional airport runs." />

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Available Ride Requests</h2>
        {rideRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rideRequests.map(request => (
              <RideRequestCard
                key={request.id}
                request={request}
                onAccept={handleAcceptRide}
                onDecline={handleDeclineRide}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-background rounded-lg shadow">
            <p className="text-muted-foreground text-lg">No ride requests available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon or tap refresh!</p>
          </div>
        )}
      </section>
    </div>
  );
}
