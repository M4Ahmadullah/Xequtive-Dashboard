import axios, { AxiosError } from "axios";
import type {
  ApiResponse,
  AuthResponse,
  BookingDetail,
  BookingParams,
  BookingCalendarEvent,
  AnalyticsOverview,
  RevenueAnalytics,
  BookingAnalytics,
  UserAnalytics,
  User,
  SystemSettings,
} from "../types/api";

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include auth token in requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // If we're in the browser, redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken");
        window.location.href = "/auth/signin";
      }
    }
    return Promise.reject(error);
  }
);

// Handle API errors
const handleApiError = (error: unknown): ApiResponse<never> => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;
    return {
      success: false,
      error: {
        message: axiosError.response?.data?.message || "An error occurred",
        code: axiosError.response?.data?.code || axiosError.code,
      },
    };
  }

  return {
    success: false,
    error: {
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    },
  };
};

// Auth API Calls
export const authAPI = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data && response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("adminToken");
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createAdmin: async (adminData: {
    email: string;
    password: string;
    fullName: string;
    confirmPassword: string;
  }): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post("/auth/signup", adminData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  verifyToken: async (): Promise<
    ApiResponse<{ authenticated: boolean; user: User }>
  > => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await api.post("/auth/verify", { token });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Booking API Calls
export const bookingsAPI = {
  getAll: async (
    params?: BookingParams
  ): Promise<
    ApiResponse<{
      bookings: BookingDetail[];
      pagination: {
        total: number;
        pages: number;
        currentPage: number;
        limit: number;
      };
    }>
  > => {
    try {
      const response = await api.get("/bookings", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCalendarEvents: async (
    startDate: string,
    endDate: string,
    status?: string
  ): Promise<ApiResponse<{ events: BookingCalendarEvent[] }>> => {
    try {
      const response = await api.get("/bookings/calendar", {
        params: { startDate, endDate, status },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: string): Promise<ApiResponse<BookingDetail>> => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (
    id: string,
    data: Partial<BookingDetail>
  ): Promise<
    ApiResponse<{ id: string; message: string; updatedFields: string[] }>
  > => {
    try {
      const response = await api.put(`/bookings/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (
    id: string
  ): Promise<ApiResponse<{ message: string; id: string }>> => {
    try {
      const response = await api.delete(`/bookings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// User API Calls
export const usersAPI = {
  getAll: async (params?: {
    role?: string;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      users: User[];
      pagination: {
        total: number;
        pages: number;
        currentPage: number;
        limit: number;
      };
    }>
  > => {
    try {
      const response = await api.get("/users", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (
    uid: string
  ): Promise<
    ApiResponse<{
      user: User & { stats: { totalBookings: number; totalSpent: number } };
      recentBookings: BookingDetail[];
    }>
  > => {
    try {
      const response = await api.get(`/users/${uid}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (
    uid: string,
    data: Partial<User>
  ): Promise<
    ApiResponse<{ uid: string; message: string; updatedFields: string[] }>
  > => {
    try {
      const response = await api.put(`/users/${uid}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  disable: async (
    uid: string
  ): Promise<ApiResponse<{ message: string; uid: string }>> => {
    try {
      const response = await api.post(`/users/${uid}/disable`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Analytics API Calls
export const analyticsAPI = {
  getOverview: async (
    period: string = "week"
  ): Promise<ApiResponse<AnalyticsOverview>> => {
    try {
      const response = await api.get(`/analytics/overview?period=${period}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRevenueAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    interval?: "day" | "week" | "month";
  }): Promise<ApiResponse<RevenueAnalytics>> => {
    try {
      const response = await api.get("/analytics/revenue", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getBookingAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    interval?: "day" | "week" | "month";
  }): Promise<ApiResponse<BookingAnalytics>> => {
    try {
      const response = await api.get("/analytics/bookings", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getUserAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    interval?: "day" | "week" | "month";
  }): Promise<ApiResponse<UserAnalytics>> => {
    try {
      const response = await api.get("/analytics/users", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getTrafficAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    interval?: "day" | "week" | "month";
  }): Promise<
    ApiResponse<{
      total: number;
      change: number;
      sources: { source: string; count: number; percentage: number }[];
      timeline: { labels: string[]; data: number[] };
      devices: { device: string; count: number; percentage: number }[];
    }>
  > => {
    try {
      const response = await api.get("/analytics/traffic", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Settings API Calls
export const settingsAPI = {
  getSettings: async (): Promise<ApiResponse<SystemSettings>> => {
    try {
      const response = await api.get("/settings");
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateSettings: async (
    data: Partial<SystemSettings>
  ): Promise<ApiResponse<{ message: string; updatedFields: string[] }>> => {
    try {
      const response = await api.put("/settings", data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getLogs: async (params?: {
    level?: "info" | "warn" | "error";
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      logs: Array<{
        timestamp: string;
        level: "info" | "warn" | "error";
        message: string;
        source: string;
        details?: Record<string, unknown>;
      }>;
      pagination: {
        total: number;
        pages: number;
        currentPage: number;
        limit: number;
      };
    }>
  > => {
    try {
      const response = await api.get("/logs", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
