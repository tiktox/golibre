import DriverProfileForm from '@/components/driver/DriverProfileForm';
import AdBanner from '@/components/driver/AdBanner'; // Server Component

export default function DriverProfilePage() {
  // In a real app, tripHistory might be fetched based on the logged-in driver
  const mockTripHistory = "Completed 15 trips this week. Mostly short city rides during peak hours. Average rating 4.9 stars.";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
      
      <DriverProfileForm />

      {/* Ad Banner - This is a Server Component instance */}
      {/* @ts-expect-error Async Server Component */}
      <AdBanner driverStatus="WAITING" tripHistory={mockTripHistory} />
    </div>
  );
}
