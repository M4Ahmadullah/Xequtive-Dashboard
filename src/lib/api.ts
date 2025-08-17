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
  TrafficAnalytics,
  User,
  SystemSettings,
  VehicleType,
  SystemLog,
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

// Helper function to extract data from backend response
const extractData = <T>(response: { data?: { data?: T } | T }): T => {
  // Backend returns data in response.data.data structure
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data as T;
  }
  return response.data as T;
};

// Auth API Calls
export const authAPI = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> => {
    try {
      // Use the new backend hardcoded login endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/auth/hardcoded-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: {
              message: "Invalid email or password",
              code: "INVALID_CREDENTIALS",
            },
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Store user info in localStorage for UI purposes only
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            uid: data.data.user.uid,
            email: data.data.user.email,
            displayName: data.data.user.displayName,
            role: data.data.user.role,
          })
        );
        
        return {
          success: true,
          data: data.data.user,
        };
      } else {
        return {
          success: false,
          error: {
            message: data.error?.message || "Login failed",
            code: data.error?.code || "LOGIN_FAILED",
          },
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: {
          message: "Network error. Please try again.",
          code: "NETWORK_ERROR",
        },
      };
    }
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      // Call backend logout endpoint to clear cookies
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear local storage
      localStorage.removeItem("userInfo");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage even if backend call fails
      localStorage.removeItem("userInfo");
      return { success: true };
    }
  },

  checkAdminStatus: async (): Promise<ApiResponse<User>> => {
    try {
      // Check with backend using cookies
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/auth/check-admin`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear local storage if backend says not authenticated
          localStorage.removeItem("userInfo");
          return {
            success: false,
            error: {
              message: "Authentication required",
              code: "AUTHENTICATION_REQUIRED",
            },
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Update localStorage with latest data from backend
        localStorage.setItem("userInfo", JSON.stringify(data.data));
        return { success: true, data: data.data };
      } else {
        localStorage.removeItem("userInfo");
        return {
          success: false,
          error: {
            message: data.error?.message || "Authentication check failed",
            code: data.error?.code || "AUTH_CHECK_FAILED",
          },
        };
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("userInfo");
      return {
        success: false,
        error: {
          message: "Network error during authentication check",
          code: "NETWORK_ERROR",
        },
      };
    }
  },

  createAdmin: async (): Promise<ApiResponse<User>> => {
    // Admin creation is disabled for hardcoded users
    return {
      success: false,
      error: {
        message: "Admin creation is disabled. Only pre-authorized users can access the dashboard.",
        code: "ADMIN_CREATION_DISABLED",
      },
    };
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
      const data = extractData(response);
      return { success: true, data };
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
      const data = extractData<{ events: BookingCalendarEvent[] }>(response);
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return handleApiError(error);
    }
  },

  getById: async (id: string): Promise<ApiResponse<BookingDetail>> => {
    try {
      const response = await api.get(`/api/dashboard/bookings/${id}`);
      const data = extractData<BookingDetail>(response);
      return { success: true, data };
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
      const responseData = extractData<{ id: string; message: string; updatedFields: string[] }>(response);
      return { success: true, data: responseData };
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (
    id: string
  ): Promise<ApiResponse<{ message: string; id: string }>> => {
    try {
      const response = await api.delete(`/api/dashboard/bookings/${id}`);
      const data = extractData<{ message: string; id: string }>(response);
      return { success: true, data };
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
      const data = extractData(response);
      return { success: true, data };
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
      const data = extractData(response);
      return { success: true, data };
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
      const responseData = extractData<{ uid: string; message: string; updatedFields: string[] }>(response);
      return { success: true, data: responseData };
    } catch (error) {
      return handleApiError(error);
    }
  },

  disable: async (
    uid: string
  ): Promise<ApiResponse<{ message: string; uid: string }>> => {
    try {
      const response = await api.post(`/api/dashboard/users/${uid}/disable`);
      const data = extractData<{ message: string; uid: string }>(response);
      return { success: true, data };
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
      const data = extractData<AnalyticsOverview>(response);
      return { success: true, data };
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
      const data = extractData<RevenueAnalytics>(response);
      return { success: true, data };
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
      const data = extractData<BookingAnalytics>(response);
      return { success: true, data };
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
      const data = extractData<UserAnalytics>(response);
      return { success: true, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getTrafficAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    interval?: "day" | "week" | "month";
  }): Promise<ApiResponse<TrafficAnalytics>> => {
    try {
      const response = await api.get("/api/dashboard/analytics/traffic", {
        params,
      });
      const data = extractData<TrafficAnalytics>(response);
      return { success: true, data };
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
      const data = extractData<SystemSettings>(response);
      return { success: true, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateSettings: async (
    data: Partial<SystemSettings>
  ): Promise<ApiResponse<{ message: string; updatedFields: string[] }>> => {
    try {
      const response = await api.put("/api/dashboard/settings", data);
      const responseData = extractData<{ message: string; updatedFields: string[] }>(response);
      return { success: true, data: responseData };
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
      logs: SystemLog[];
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
      const data = extractData(response);
      return { success: true, data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Vehicle API Calls
export const vehiclesAPI = {
  getVehicleTypes: async (): Promise<ApiResponse<VehicleType[]>> => {
    try {
      const response = await api.get("/api/dashboard/vehicles/types");
      const data = extractData<VehicleType[]>(response);
      return { success: true, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getVehiclePricing: async (vehicleTypeId: string): Promise<ApiResponse<VehicleType>> => {
    try {
      const response = await api.get(`/api/dashboard/vehicles/${vehicleTypeId}/pricing`);
      const data = extractData<VehicleType>(response);
      return { success: true, data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
