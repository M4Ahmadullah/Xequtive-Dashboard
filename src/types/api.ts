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

// Enhanced Booking Types - Complete Backend Data Structure
export interface BookingDetail {
  // =====================================================
  // 1. CORE BOOKING INFORMATION
  // =====================================================
  id: string;
  firebaseId: string;
  referenceNumber: string;
  userId: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "declined" | "no_show";
  bookingType: "one-way" | "hourly" | "return";
  pickupDate: string;
  pickupTime: string;
  createdAt: string;
  updatedAt: string;
  waitingTime?: number;
  
  // =====================================================
  // 2. CUSTOMER INFORMATION
  // =====================================================
  customer: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  
  // =====================================================
  // 3. LOCATION INFORMATION WITH GOOGLE MAPS LINKS
  // =====================================================
  locations: {
    pickup: {
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      googleMapsLink?: string;
    };
    dropoff: {
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      googleMapsLink?: string;
    };
    additionalStops: Array<{
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      googleMapsLink?: string;
    }>;
  };
  
  // =====================================================
  // 4. JOURNEY DETAILS
  // =====================================================
  journey: {
    distance_miles: number;
    duration_minutes: number;
  };
  
  // =====================================================
  // 5. VEHICLE & PRICING INFORMATION
  // =====================================================
  vehicle: {
    id: string;
    name: string;
    price: {
      amount: number;
      currency: string;
    };
  };
  price?: {
    amount: number;
    currency: string;
  };
  
  // =====================================================
  // 6. PASSENGER & LUGGAGE DETAILS
  // =====================================================
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
  
  // =====================================================
  // 7. SPECIAL REQUIREMENTS
  // =====================================================
  specialRequests?: string;
  
  // =====================================================
  // 8. ADDITIONAL STOPS (LEGACY FORMAT)
  // =====================================================
  additionalStops: Array<{
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  
  // =====================================================
  // 9. PAYMENT METHODS
  // =====================================================
  paymentMethods?: {
    cashOnArrival: boolean;
    cardOnArrival: boolean;
  };
  
  // =====================================================
  // 10. RETURN BOOKING INFORMATION
  // =====================================================
  returnType?: "wait-and-return" | "later-date";
  returnDate?: string;
  returnTime?: string;
  waitDuration?: number;
  returnDiscount?: number;
  
  // =====================================================
  // 11. SERVICE DURATION (HOURLY BOOKINGS)
  // =====================================================
  hours?: number;
  
  // =====================================================
  // 12. TRAVEL INFORMATION
  // =====================================================
  travelInformation?: {
    type?: string;
    details?: {
      flightNumber?: string;
      airline?: string;
      terminal?: string;
    };
  };
  
  // =====================================================
  // 13. BOOKING TIMELINE (STATUS HISTORY)
  // =====================================================
  timeline?: Array<{
    status: string;
    timestamp: string;
    updatedBy?: string;
    description?: string;
  }>;
  
  // =====================================================
  // 14. SYSTEM METADATA
  // =====================================================
  metadata?: {
    documentId?: string;
    referenceNumber?: string;
    bookingType?: string;
    hasCoordinates?: boolean;
    hasDropoff?: boolean;
    hasPaymentMethod?: boolean;
    isReturnBooking?: boolean;
    isHourlyBooking?: boolean;
    waitAndReturn?: boolean;
  };
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
  // NEW FILTER PARAMETERS
  returnType?: string;          // Filter by return type (wait-and-return, later-date)
  paymentMethod?: string;       // Filter by payment method (cashOnArrival, cardOnArrival)
  waitDuration?: string;        // Filter by wait duration range (e.g., "3-6", "7-12")
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
  // NEW FIELDS - Complete Backend Data
  hours?: number;                    // For hourly bookings
  returnType?: "wait-and-return" | "later-date"; // For return bookings
  returnDate?: string;               // For later-date returns
  returnTime?: string;               // For later-date returns
  waitDuration?: number;             // For wait-and-return bookings
  paymentMethods?: {                 // Payment method preferences
    cashOnArrival: boolean;
    cardOnArrival: boolean;
  };
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
  // Additional fields from complete backend structure
  locations?: {
    pickup?: {
      address?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      googleMapsLink?: string;
    };
    dropoff?: {
      address?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      googleMapsLink?: string;
    };
  };
  passengers?: {
    count?: number;
    checkedLuggage?: number;
    handLuggage?: number;
    mediumLuggage?: number;
    babySeat?: number;
    childSeat?: number;
    boosterSeat?: number;
    wheelchair?: number;
  };
  travelInformation?: {
    type?: string;
    details?: {
      flightNumber?: string;
      airline?: string;
      terminal?: string;
    };
  };
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

// NEW ANALYTICS TYPES

// Payment Method Analytics
export interface PaymentMethodAnalytics {
  total: number;
  withPaymentMethods: number;
  withoutPaymentMethods: number;
  byMethod: {
    cashOnArrival: number;
    cardOnArrival: number;
    both: number;
  };
  byBookingType: {
    hourly: { cash: number; card: number; both: number; none: number };
    "one-way": { cash: number; card: number; both: number; none: number };
    return: { cash: number; card: number; both: number; none: number };
  };
  revenue: {
    cashOnArrival: number;
    cardOnArrival: number;
    both: number;
    none: number;
  };
  percentages: {
    withPaymentMethods: number;
    withoutPaymentMethods: number;
    byMethod: {
      cashOnArrival: number;
      cardOnArrival: number;
      both: number;
    };
  };
  paymentMethodDefinitions: {
    cashOnArrival: string;
    cardOnArrival: string;
    both: string;
    none: string;
  };
}

// Wait Timer Analytics
export interface WaitTimerAnalytics {
  totalReturnBookings: number;
  waitAndReturnBookings: number;
  laterDateBookings: number;
  withWaitDuration: number;
  withoutWaitDuration: number;
  waitDurationDistribution: {
    "0-2": number;
    "3-4": number;
    "5-6": number;
    "7-8": number;
    "9-10": number;
    "11-12": number;
  };
  averageWaitDuration: number;
  totalWaitDuration: number;
  byBookingType: {
    waitAndReturn: {
      withTimer: number;
      withoutTimer: number;
      averageDuration: number;
    };
  };
  percentages: {
    waitAndReturn: number;
    laterDate: number;
    withTimer: number;
    withoutTimer: number;
  };
  waitTimerDefinitions: {
    waitAndReturn: string;
    laterDate: string;
    withTimer: string;
    withoutTimer: string;
  };
}

// Filter Options
export interface FilterOptions {
  bookingTypes: string[];
  returnTypes: string[];
  paymentMethods: string[];
  waitDurationRanges: string[];
  vehicleTypes: string[];
  statuses: string[];
  filterDefinitions: {
    bookingTypes: Record<string, string>;
    returnTypes: Record<string, string>;
    paymentMethods: Record<string, string>;
    waitDurationRanges: Record<string, string>;
  };
}

// Contact Message Types
export interface ContactMessage {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  agreeToTerms: boolean;
  status: "new" | "in_progress" | "resolved";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ContactMessagesResponse {
  messages: ContactMessage[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ContactMessageUpdateRequest {
  status: "new" | "in_progress" | "resolved";
  notes?: string;
}
