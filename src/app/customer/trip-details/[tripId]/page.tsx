"use client";
import TripInfoDisplay from "@/components/customer/trip-info-display";
import ProtectedRoute from "@/components/protected-route";

// params.tripId can be used if fetching real data
export default function TripDetailsPage({ params }: { params: { tripId: string } }) {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <TripInfoDisplay />
      </div>
    </ProtectedRoute>
  );
}
