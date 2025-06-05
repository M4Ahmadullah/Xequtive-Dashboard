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
  uid: string;
  email: string;
  displayName: string;
  phone: string | null;
  role: "admin" | "user";
  token: string;
  expiresIn: string;
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
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    comparisonPercentage: number;
  };
  revenue: {
    total: number;
    currency: string;
    comparisonPercentage: number;
  };
  users: {
    total: number;
    new: number;
    comparisonPercentage: number;
  };
  vehicles: {
    mostBooked: string;
    distribution: {
      name: string;
      percentage: number;
    }[];
  };
  popularRoutes: {
    route: string;
    count: number;
  }[];
}

export interface VehicleDistributionItem {
  type: string;
  count: number;
  percentage: number;
}

export interface RevenueAnalytics {
  total: number;
  currency: string;
  averagePerBooking: number;
  timeline: {
    date: string;
    amount: number;
    bookings: number;
  }[];
  byVehicleType: {
    type: string;
    amount: number;
    percentage: number;
  }[];
  byStatus: {
    status: string;
    amount: number;
  }[];
}

export interface BookingAnalytics {
  total: number;
  completed: number;
  cancelled: number;
  timeline: {
    date: string;
    count: number;
    completed: number;
    cancelled: number;
  }[];
  byHour: {
    hour: number;
    count: number;
  }[];
  byWeekday: {
    day: string;
    count: number;
  }[];
  byVehicleType: {
    type: string;
    count: number;
  }[];
  cancellationReasons: {
    reason: string;
    count: number;
  }[];
}

export interface UserAnalytics {
  total: number;
  new: number;
  active: number;
  timeline: {
    date: string;
    newUsers: number;
    totalBookings: number;
  }[];
  topBookers: {
    uid: string;
    email: string;
    bookings: number;
    spent: number;
  }[];
  retention: {
    returning: number;
    oneTime: number;
  };
  devices: {
    device: string;
    percentage: number;
  }[];
}

export interface TrafficAnalytics {
  visitors: {
    total: number;
    unique: number;
    returning: number;
  };
  timeline: {
    date: string;
    visitors: number;
    unique: number;
  }[];
  pages: {
    path: string;
    views: number;
  }[];
  referrers: {
    source: string;
    visits: number;
  }[];
  devices: {
    type: string;
    percentage: number;
  }[];
  locations: {
    city: string;
    visits: number;
  }[];
  conversionRate: number;
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
  status: string;
  vehicle: {
    type?: string;
    model: string;
  };
  userId: string;
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
    maxDistance?: number;
    excludedAreas?: string[];
    includedIslands?: string[];
    name?: string;
    coordinates?: { lat: number; lng: number }[];
  };
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}
