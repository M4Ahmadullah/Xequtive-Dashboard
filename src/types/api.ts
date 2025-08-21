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

// Enhanced Booking Types
export interface BookingDetail {
  id: string;
  referenceNumber: string;
  firebaseId: string;
  customer: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  bookingType: "hourly" | "one-way" | "return";
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "declined" | "no_show";
  pickupDate: string;
  pickupTime: string;
  locations: {
    pickup: {
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    dropoff: {
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    additionalStops: Array<{
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    }>;
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
  hours?: number;
  returnType?: string;
  returnDate?: string;
  returnTime?: string;
  passengers: {
    count: number;
    checkedLuggage?: number;
    handLuggage?: number;
    mediumLuggage?: number;
    babySeat?: number;
    childSeat?: number;
    boosterSeat?: number;
    wheelchair?: number;
  };
  specialRequests?: string;
  additionalStops: Array<{
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  waitingTime: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  timeline?: Array<{
    status: string;
    timestamp: string;
    updatedBy?: string;
  }>;
}

// Enhanced Analytics Types
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

// Enhanced Booking Management
export interface BookingParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  vehicleType?: string;
  bookingType?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface BookingPagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export interface BookingsResponse {
  bookings: BookingDetail[];
  pagination: BookingPagination;
  referenceNumberGuide: {
    display: string;
    apiOperations: string;
    warning: string;
  };
}

// Separated Bookings Response
export interface SeparatedBookingsResponse {
  events: {
    bookings: BookingDetail[];
    total: number;
    currentPage: number;
    pages: number;
    limit: number;
  };
  taxi: {
    bookings: BookingDetail[];
    total: number;
    currentPage: number;
    pages: number;
    limit: number;
  };
  combined: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  referenceNumberGuide: {
    display: string;
    apiOperations: string;
    warning: string;
  };
  bookingTypeDefinitions: {
    events: string;
    taxi: string;
    hourly: string;
    oneWay: string;
    return: string;
  };
}

// Booking Statistics
export interface BookingStatistics {
  total: number;
  byType: {
    hourly: {
      count: number;
      revenue: number;
      avgHours: number;
      totalHours: number;
    };
    "one-way": {
      count: number;
      revenue: number;
      avgDistance: number;
      totalDistance: number;
    };
    return: {
      count: number;
      revenue: number;
      avgDistance: number;
      totalDistance: number;
      returnDiscounts: number;
    };
  };
  byStatus: {
    pending: number;
    confirmed: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    declined: number;
    no_show: number;
  };
  byVehicle: {
    [key: string]: {
      count: number;
      revenue: number;
    };
  };
  topRoutes: Array<{
    route: string;
    count: number;
  }>;
  revenue: {
    total: number;
    hourly: number;
    "one-way": number;
    return: number;
  };
  referenceNumberGuide: {
    display: string;
    apiOperations: string;
    warning: string;
  };
  bookingTypeDefinitions: {
    hourly: string;
    "one-way": string;
    return: string;
  };
}

// Calendar Event
export interface CalendarEvent {
  id: string;
  referenceNumber: string;
  firebaseId: string;
  title: string;
  start: string;
  end: string;
  status: string;
  bookingType: string;
  customer: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  vehicleId: string;
  hours?: number;
  returnType?: string;
  returnDate?: string;
  returnTime?: string;
  distance_miles: number;
  duration_minutes: number;
  price: {
    amount: number;
    currency: string;
  };
  additionalStops: Array<{
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  specialRequests?: string;
}

// Vehicle Types
export interface VehicleType {
  id: string;
  name: string;
  capacity: number;
  class: string;
  minimumFare: number;
  additionalStopFee: number;
  waitingTimePerMinute: number;
  additionalWaitingPerHour: number;
  pricing: {
    [key: string]: number;
  };
}

// System Settings
export interface SystemSettings {
  pricing: {
    congestionCharge: number;
    dartfordCrossing: number;
    airportFees: {
      [key: string]: number;
    };
  };
  serviceAreas: {
    maxDistance: number;
    excludedAreas: string[];
    includedIslands: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    bookingConfirmations: boolean;
    statusUpdates: boolean;
  };
  businessHours: {
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
  updatedAt: string;
  updatedBy: string;
}

// System Logs
export interface SystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata: Record<string, string | number | boolean>;
}
