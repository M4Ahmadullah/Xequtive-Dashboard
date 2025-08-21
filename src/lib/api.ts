import {
  ApiResponse,
  AuthResponse,
  User,
  BookingDetail,
  BookingParams,
  SystemSettings,
  TrafficAnalytics,
  RevenueAnalytics,
  BookingAnalytics,
  UserAnalytics,
  AnalyticsOverview,
  SystemLog,
  BookingsResponse,
  SeparatedBookingsResponse,
  BookingStatistics,
  CalendarEvent,
} from "../types/api";

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
        
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Store user info in localStorage for UI purposes only
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            uid: data.data.user.uid,
            email: data.data.user.email,
            displayName: data.data.user.fullName, // Use fullName from backend
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
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: {
            message: "Network error. Please try again.",
            code: "NETWORK_ERROR",
          },
        };
      }
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Login failed",
          code: "LOGIN_FAILED",
        },
      };
    }
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        localStorage.removeItem("userInfo");
        return {
          success: true,
          data: { message: "Logged out successfully" },
        };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage even if API call fails
      localStorage.removeItem("userInfo");
      return {
        success: false,
        error: {
          message: "Logout failed",
          code: "LOGOUT_FAILED",
        },
      };
    }
  },

  checkAdminStatus: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/auth/check-admin`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Check admin status error:", error);
      return {
        success: false,
        error: {
          message: "Failed to check admin status",
          code: "CHECK_ADMIN_FAILED",
        },
      };
    }
  },

  createAdmin: async (): Promise<ApiResponse<User>> => {
    return {
      success: false,
      error: {
        message: "Admin creation is disabled",
        code: "ADMIN_CREATION_DISABLED",
      },
    };
  },
};

// Enhanced Bookings API
export const bookingsAPI = {
  // Get all bookings with enhanced filtering
  getAllBookings: async (params?: BookingParams): Promise<ApiResponse<BookingsResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.vehicleType) queryParams.append('vehicleType', params.vehicleType);
      if (params?.bookingType) queryParams.append('bookingType', params.bookingType);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.order) queryParams.append('order', params.order);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get all bookings error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch bookings",
          code: "FETCH_BOOKINGS_FAILED",
        },
      };
    }
  },

  // Get separated bookings (Events vs Taxi)
  getSeparatedBookings: async (params?: BookingParams): Promise<ApiResponse<SeparatedBookingsResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings/separated?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get separated bookings error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch separated bookings",
          code: "FETCH_SEPARATED_BOOKINGS_FAILED",
        },
      };
    }
  },

  // Get booking statistics
  getBookingStatistics: async (startDate?: string, endDate?: string): Promise<ApiResponse<BookingStatistics>> => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings/statistics?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get booking statistics error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch booking statistics",
          code: "FETCH_BOOKING_STATISTICS_FAILED",
        },
      };
    }
  },

  // Get calendar events
  getCalendarEvents: async (startDate: string, endDate: string, status?: string, bookingType?: string): Promise<ApiResponse<{ events: CalendarEvent[] }>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);
      if (status) queryParams.append('status', status);
      if (bookingType) queryParams.append('bookingType', bookingType);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings/calendar?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get calendar events error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch calendar events",
          code: "FETCH_CALENDAR_EVENTS_FAILED",
        },
      };
    }
  },

  // Get booking details
  getBookingDetails: async (id: string): Promise<ApiResponse<BookingDetail>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get booking details error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch booking details",
          code: "FETCH_BOOKING_DETAILS_FAILED",
        },
      };
    }
  },

  // Update booking
  updateBooking: async (id: string, updateData: Partial<BookingDetail>): Promise<ApiResponse<{ message: string; updatedFields: string[] }>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update booking error:", error);
      return {
        success: false,
        error: {
          message: "Failed to update booking",
          code: "UPDATE_BOOKING_FAILED",
        },
      };
    }
  },

  // Delete booking
  deleteBooking: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete booking error:", error);
      return {
        success: false,
        error: {
          message: "Failed to delete booking",
          code: "DELETE_BOOKING_FAILED",
        },
      };
    }
  },
};

// Enhanced Analytics API
export const analyticsAPI = {
  getOverview: async (period: string = 'week'): Promise<ApiResponse<AnalyticsOverview>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics/overview?period=${period}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get overview analytics error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch overview analytics",
          code: "FETCH_OVERVIEW_ANALYTICS_FAILED",
        },
      };
    }
  },

  getRevenue: async (startDate?: string, endDate?: string, interval?: string): Promise<ApiResponse<RevenueAnalytics>> => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (interval) queryParams.append('interval', interval);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics/revenue?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get revenue analytics error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch revenue analytics",
          code: "FETCH_REVENUE_ANALYTICS_FAILED",
        },
      };
    }
  },

  getBookings: async (startDate?: string, endDate?: string, interval?: string): Promise<ApiResponse<BookingAnalytics>> => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (interval) queryParams.append('interval', interval);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics/bookings?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get bookings analytics error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch bookings analytics",
          code: "FETCH_BOOKINGS_ANALYTICS_FAILED",
        },
      };
    }
  },

  getUsers: async (startDate?: string, endDate?: string, interval?: string): Promise<ApiResponse<UserAnalytics>> => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (interval) queryParams.append('interval', interval);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics/users?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get users analytics error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch users analytics",
          code: "FETCH_USERS_ANALYTICS_FAILED",
        },
      };
    }
  },

  getTraffic: async (startDate?: string, endDate?: string, interval?: string): Promise<ApiResponse<TrafficAnalytics>> => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (interval) queryParams.append('interval', interval);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics/traffic?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get traffic analytics error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch traffic analytics",
          code: "FETCH_TRAFFIC_ANALYTICS_FAILED",
        },
      };
    }
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async (params?: { role?: string; query?: string; page?: number; limit?: number }): Promise<ApiResponse<{ users: User[]; pagination: { total: number; pages: number; currentPage: number; limit: number } }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append('role', params.role);
      if (params?.query) queryParams.append('query', params.query);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/users?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get all users error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch users",
          code: "FETCH_USERS_FAILED",
        },
      };
    }
  },

  getUserDetails: async (uid: string): Promise<ApiResponse<{ user: User; recentBookings: Array<{ id: string; pickupDate: string; status: string; amount: number; vehicleType: string }> }>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/users/${uid}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get user details error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch user details",
          code: "FETCH_USER_DETAILS_FAILED",
        },
      };
    }
  },

  updateUser: async (uid: string, updateData: Partial<User>): Promise<ApiResponse<{ message: string; updatedFields: string[] }>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/users/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update user error:", error);
      return {
        success: false,
        error: {
          message: "Failed to update user",
          code: "UPDATE_USER_FAILED",
        },
      };
    }
  },

  disableUser: async (uid: string): Promise<ApiResponse<{ message: string; uid: string }>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/users/${uid}/disable`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Disable user error:", error);
      return {
        success: false,
        error: {
          message: "Failed to disable user",
          code: "DISABLE_USER_FAILED",
        },
      };
    }
  },
};

// System Settings API
export const settingsAPI = {
  getSettings: async (): Promise<ApiResponse<SystemSettings>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/settings`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get settings error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch settings",
          code: "FETCH_SETTINGS_FAILED",
        },
      };
    }
  },

  updateSettings: async (settings: Partial<SystemSettings>): Promise<ApiResponse<{ message: string; updatedFields: string[] }>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update settings error:", error);
      return {
        success: false,
        error: {
          message: "Failed to update settings",
          code: "UPDATE_SETTINGS_FAILED",
        },
      };
    }
  },
};

// System Logs API
export const logsAPI = {
  getLogs: async (params?: { level?: string; startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<ApiResponse<{ logs: SystemLog[]; pagination: { total: number; pages: number; currentPage: number; limit: number } }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.level) queryParams.append('level', params.level);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/logs?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get logs error:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch logs",
          code: "FETCH_LOGS_FAILED",
        },
      };
    }
  },
};
