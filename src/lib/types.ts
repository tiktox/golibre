export type UserRole = 'Customer' | 'Driver Partner';

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole | null;
  firstName?: string;
  lastName?: string;
  idNumber?: string; // Optional or according to local regulations
  // Driver specific
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
  vehicleColor?: string;
  driverLicensePhotoUrl?: string; // URL to uploaded photo
  idCardPhotoUrl?: string; // URL to uploaded photo
  vehicleInsurancePolicyPhotoUrl?: string; // URL to uploaded photo
}

export interface RideRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientRating: number;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  distanceKm: number;
  estimatedFare: number;
  status: 'pending' | 'accepted' | 'declined' | 'ongoing' | 'completed';
}

export interface AdData {
  displayAd: boolean;
  adContent: string;
  reason: string;
}
