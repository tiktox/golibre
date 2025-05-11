"use client"; // Top-level page can be client for state like availability
import AdSuggestionDisplay from "@/components/driver/ad-suggestion-display";
import RideRequestActions from "@/components/driver/ride-request-actions";
import ProtectedRoute from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function DriverDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4 sm:mb-0">Driver Dashboard</h1>
          <div className="flex items-center space-x-2 p-3 bg-card rounded-lg shadow">
            <Switch
              id="availability-toggle"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
              aria-label="Toggle availability"
            />
            <Label htmlFor="availability-toggle" className={`text-lg font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {isAvailable ? "Available for Rides" : "Unavailable"}
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Ride Management</CardTitle>
              </CardHeader>
              <CardContent>
                <RideRequestActions />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-semibold text-primary">Suggested For You</h2>
             <Suspense fallback={
                <Card className="w-full shadow-md">
                  <CardHeader><CardTitle>Loading Ad...</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              }>
              <AdSuggestionDisplay />
            </Suspense>
            {/* Future: Earnings summary, etc. */}
          </div>
        </div>
        
        <Separator className="my-12" />

        <div className="mt-8 p-6 bg-card rounded-lg shadow">
            <h3 className="text-xl font-semibold text-primary mb-3">Driver Tips & News</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Remember to keep your vehicle clean for better ratings.</li>
                <li>Peak hours are usually 7-9 AM and 4-7 PM on weekdays.</li>
                <li>Check for app updates regularly to get the latest features.</li>
            </ul>
        </div>

      </div>
    </ProtectedRoute>
  );
}
