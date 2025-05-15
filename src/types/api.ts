// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, string>;
  };
}

// Auth
export interface AuthResponse {
  token: string;
  user: User;
}

// User
export interface User {
  uid: string;
  email: string;
  role: "admin" | "user";
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: string;
  lastLogin?: string;
}

// Analytics
export interface AnalyticsOverview {
  totalBookings: number;
  totalBookingsChange: number;
  totalUsers: number;
  totalUsersChange: number;
  totalRevenue: number;
  totalRevenueChange: number;
  mostBookedVehicle: {
    type: string;
    count: number;
  };
  bookingDistribution: {
    labels: string[];
    data: number[];
  };
  vehicleDistribution: VehicleDistributionItem[];
}

export interface VehicleDistributionItem {
  type: string;
  count: number;
  percentage: number;
}

export interface RevenueAnalytics {
  total: number;
  change: number;
  timeline: {
    labels: string[];
    data: number[];
  };
  average: number;
  byVehicleType: {
    labels: string[];
    data: number[];
  };
}

export interface BookingAnalytics {
  total: number;
  change: number;
  timeline: {
    labels: string[];
    data: number[];
  };
  byStatus: {
    labels: string[];
    data: number[];
  };
  byVehicleType: {
    labels: string[];
    data: number[];
  };
}

export interface UserAnalytics {
  total: number;
  change: number;
  timeline: {
    labels: string[];
    data: number[];
  };
  active: number;
  returning: number;
  topUsers: {
    uid: string;
    name: string;
    bookings: number;
    revenue: number;
  }[];
}

export interface TrafficAnalytics {
  total: number;
  change: number;
  sources: { source: string; count: number; percentage: number }[];
  timeline: { labels: string[]; data: number[] };
  devices: { device: string; count: number; percentage: number }[];
}

// Bookings
export interface BookingParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingDetail {
  id: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  startTime: string;
  endTime: string;
  userId: string;
  user?: {
    uid: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  vehicle: {
    id: string;
    type?: string;
    model: string;
  };
  locations: {
    pickup: Location;
    dropoff: Location;
    additionalStops?: Location[];
  };
  price: {
    base: number;
    extras?: number;
    total: number;
    currency: string;
  };
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface BookingCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  userId: string;
  vehicle: {
    type?: string;
    model: string;
  };
}

// Locations
export interface Location {
  address: string;
  city?: string;
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Settings
export interface SystemSettings {
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  businessHours?: {
    start: string;
    end: string;
    days: string[];
  };
  pricing?: {
    baseRate: number;
    currency: string;
    extraFees: Record<string, number>;
  };
  serviceAreas?: {
    name: string;
    coordinates: { lat: number; lng: number }[];
  }[];
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}
