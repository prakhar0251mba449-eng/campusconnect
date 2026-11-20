export type ServiceCategory =
  | 'Food'
  | 'Laundry'
  | 'Printing'
  | 'Stationery'
  | 'Transport'
  | 'Accommodation';

export type AccommodationType = 'Hostel' | 'PG' | 'Rented';

export type RequestStatus = 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';

export type SortOption = 'nearest' | 'cheapest' | 'top_rated';

export type AnalyticsEventType =
  | 'search'
  | 'provider_view'
  | 'request_created'
  | 'request_completed';

export interface Student {
  id: string;
  name: string;
  phone: string;
  college: string;
  area: string;
  accommodationType: AccommodationType;
  createdAt: string;
}

export interface ProviderServiceItem {
  name: string;
  price: number;
  unit: string;
}

export interface Provider {
  id: string;
  name: string;
  category: ServiceCategory;
  area: string;
  distanceKm: number;
  priceMin: number;
  priceMax: number;
  description: string;
  services: ProviderServiceItem[];
  hours: string;
  phone: string;
  verified: boolean;
  studentOffer: string;
  avgRating: number;
  ratingCount: number;
}

export interface ServiceRequest {
  id: string;
  studentId: string;
  providerId: string;
  serviceDetails: string;
  quantity: number;
  preferredTime: string;
  address: string;
  notes: string;
  estimatedPrice: number;
  status: RequestStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  providerId: string;
  studentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PilotFeedback {
  id: string;
  requestId: string;
  studentId: string;
  easyToFind: 'Yes' | 'Somewhat' | 'No';
  wouldReuse: 'Yes' | 'Maybe' | 'No';
  willingToPay: 'Yes' | 'Maybe' | 'No';
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  userId: string;
  meta?: string;
  timestamp: string;
}

export interface ProviderFilters {
  query: string;
  category: ServiceCategory | 'All';
  maxPrice: number | null;
  minRating: number;
  verifiedOnly: boolean;
  offersOnly: boolean;
  sortBy: SortOption;
}
