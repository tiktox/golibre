
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'driver';
  avatarUrl?: string;
}

export interface Vehicle {
  make: string;
  model: string;
  licensePlate: string;
  color: string;
}

export interface DriverProfile extends UserProfile {
  vehicle: Vehicle;
  rating: number; // Example: 4.8
  isAvailable: boolean;
}

export interface TripRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerRating?: number;
  origin: { address: string; lat?: number; lng?: number };
  destination: { address: string; lat?: number; lng?: number };
  distanceKm: number;
  estimatedFare: number; // In local currency
  status: 'pending' | 'accepted' | 'rejected' | 'ongoing' | 'completed' | 'cancelled';
}

export interface ActiveTrip extends TripRequest {
  driverId: string;
  driverName: string;
  driverAvatarUrl?: string;
  driverVehicle: Vehicle;
  driverRating: number;
  driverEtaMinutes?: number; // Estimated time of arrival for pickup
}

export interface AdSuggestion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  callToAction: string; // e.g., "Learn More"
  link: string;
}

export interface RestaurantDish {
  id: string; // Firestore document ID
  title: string;
  description: string;
  price: number; 
  category: string; // e.g., "platos", "bebidas"
  imageUrl?: string | null;
  restaurantId: string; // UID of the restaurant owner (matches the document ID in 'restaurants' collection)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Future considerations:
  // isAvailable: boolean;
  // ingredients: string[];
  // allergens: string[];
}
