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
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: string;
  lastLogin?: string;
  lastBookingDate?: string;
  bookingsCount?: number;
  totalSpent?: number;
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
  vehicleType?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface BookingDetail {
  id: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  pickupDate: string;
  pickupTime: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  locations: {
    pickup: Location;
    dropoff: Location;
    additionalStops?: Location[];
  };
  passengers: {
    count: number;
    checkedLuggage: number;
    handLuggage: number;
    mediumLuggage: number;
    babySeat: number;
    childSeat: number;
    boosterSeat: number;
    wheelchair: number;
  };
  vehicle: {
    id: string;
    name: string;
    price: {
      amount: number;
      currency: string;
    };
  };
  journey: {
    distance_miles: number;
    duration_minutes: number;
  };
  specialRequests?: string;
  travelInformation?: {
    type: string;
    details: {
      airline?: string;
      flightNumber?: string;
      scheduledDeparture?: string;
    };
  };
  timeline?: Array<{
    status: string;
    timestamp: string;
    updatedBy?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  actualPickupTime?: string;
  actualDropoffTime?: string;
}

export interface BookingCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  customer: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
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
    timezone: string;
    weekdays: {
      start: string;
      end: string;
    };
    weekends: {
      start: string;
      end: string;
    };
  };
  pricing?: {
    congestionCharge: number;
    dartfordCrossing: number;
    airportFees: Record<string, number>;
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
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushNotifications?: boolean;
    bookingConfirmations: boolean;
    statusUpdates: boolean;
  };
  updatedAt?: string;
  updatedBy?: string;
}

// Vehicle Information
export interface VehicleType {
  id: string;
  name: string;
  capacity: number;
  class: string;
  minimumFare: number;
  additionalStopFee: number;
  waitingTimePerMin: number;
  additionalWaitingPerHour: number;
  pricing: {
    [key: string]: number; // Distance-based pricing
  };
}

// System Logs
export interface SystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata?: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
}
