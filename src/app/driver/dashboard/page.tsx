
// No "use client" - this is a Server Component
import ProtectedRoute from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DriverDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Driver Dashboard</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Driver!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is your dashboard. Content and features will be added here soon.
            </p>
          </CardContent>
        </Card>

        {/* 
          The following components and sections have been removed as per request:
          - DriverDashboardClientPart (availability toggle)
          - RideRequestActions (ride management)
          - AdSuggestionDisplay (ad suggestions)
          - Driver Tips & News section
        */}
      </div>
    </ProtectedRoute>
  );
}
