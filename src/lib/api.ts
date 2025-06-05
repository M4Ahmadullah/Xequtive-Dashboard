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
  withCredentials: true, // Include credentials for cookie-based auth
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
        // Remove user info from localStorage
        localStorage.removeItem("userInfo");
        window.location.href = "/auth/signin?session=expired";
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
      const response = await api.post("/api/dashboard/auth/login", {
        email,
        password,
      });

      // Get the actual data from the response
      const responseData = response.data;

      // Extract the actual auth data
      const authData = responseData.data || responseData;

      // Verify the user has admin role
      if (authData?.role === "admin") {
        // Store user info in localStorage for UI purposes only
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            uid: authData.uid,
            email: authData.email,
            displayName: authData.displayName,
            role: authData.role,
          })
        );
      }

      return {
        success: true,
        data: authData,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      await api.post("/api/dashboard/auth/logout");
      localStorage.removeItem("userInfo");
      return { success: true };
    } catch (error) {
      // Still clear localStorage even if API call fails
      localStorage.removeItem("userInfo");
      return handleApiError(error);
    }
  },

  checkAdminStatus: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get("/api/dashboard/auth/check-admin");
      return { success: true, data: response.data?.data || response.data };
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
      const response = await api.post("/api/dashboard/auth/signup", adminData);
      return { success: true, data: response.data?.data || response.data };
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
      const response = await api.get("/api/dashboard/bookings", { params });
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
      let url = `/api/dashboard/bookings/calendar?startDate=${startDate}&endDate=${endDate}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await api.get(url);
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return handleApiError(error);
    }
  },

  getById: async (id: string): Promise<ApiResponse<BookingDetail>> => {
    try {
      const response = await api.get(`/api/dashboard/bookings/${id}`);
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
      const response = await api.put(`/api/dashboard/bookings/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (
    id: string
  ): Promise<ApiResponse<{ message: string; id: string }>> => {
    try {
      const response = await api.delete(`/api/dashboard/bookings/${id}`);
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
      const response = await api.get("/api/dashboard/users", { params });
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
      const response = await api.get(`/api/dashboard/users/${uid}`);
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
      const response = await api.put(`/api/dashboard/users/${uid}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  disable: async (
    uid: string
  ): Promise<ApiResponse<{ message: string; uid: string }>> => {
    try {
      const response = await api.post(`/api/dashboard/users/${uid}/disable`);
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
      const response = await api.get(
        `/api/dashboard/analytics/overview?period=${period}`
      );
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
      const response = await api.get("/api/dashboard/analytics/revenue", {
        params,
      });
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
      const response = await api.get("/api/dashboard/analytics/bookings", {
        params,
      });
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
      const response = await api.get("/api/dashboard/analytics/users", {
        params,
      });
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
      const response = await api.get("/api/dashboard/analytics/traffic", {
        params,
      });
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
      const response = await api.get("/api/dashboard/settings");
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateSettings: async (
    data: Partial<SystemSettings>
  ): Promise<ApiResponse<{ message: string; updatedFields: string[] }>> => {
    try {
      const response = await api.put("/api/dashboard/settings", data);
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
      const response = await api.get("/api/dashboard/logs", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
