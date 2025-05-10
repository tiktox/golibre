import type { RideRequest } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Navigation, Star, User, MapPin } from 'lucide-react';
import MiniMapPlaceholder from './MiniMapPlaceholder';

interface RideRequestCardProps {
  request: RideRequest;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export default function RideRequestCard({ request, onAccept, onDecline }: RideRequestCardProps) {
  return (
    <Card className="w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl text-primary">New Ride Request!</CardTitle>
        <CardDescription>From: {request.clientName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <User className="mr-2 h-4 w-4" /> Client Rating:
          </div>
          <div className="flex items-center font-semibold">
            {request.clientRating.toFixed(1)} <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Navigation className="mr-2 h-4 w-4" /> Distance:
          </div>
          <span className="font-semibold">{request.distanceKm.toFixed(1)} km</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Coins className="mr-2 h-4 w-4" /> Estimated Fare:
          </div>
          <span className="font-semibold text-green-600">${request.estimatedFare.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center"><MapPin className="mr-1 h-3 w-3"/>Origin</h4>
            <MiniMapPlaceholder locationName={request.origin.address} type="origin" className="h-32"/>
            <p className="text-xs mt-1 truncate" title={request.origin.address}>{request.origin.address}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center"><MapPin className="mr-1 h-3 w-3"/>Destination</h4>
            <MiniMapPlaceholder locationName={request.destination.address} type="destination" className="h-32"/>
            <p className="text-xs mt-1 truncate" title={request.destination.address}>{request.destination.address}</p>
          </div>
        </div>

      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="destructive" className="flex-1" onClick={() => onDecline(request.id)}>
          Decline
        </Button>
        <Button variant="default" className="flex-1 bg-accent hover:bg-accent/90" onClick={() => onAccept(request.id)}>
          Accept Ride
        </Button>
      </CardFooter>
    </Card>
  );
}
