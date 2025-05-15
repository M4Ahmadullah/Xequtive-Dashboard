"use client";

import { useState, useEffect } from "react";
import { analyticsAPI, authAPI } from "@/lib/api";
import { AnalyticsOverview, User } from "@/types/api";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("week");
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.verifyToken();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch {
        console.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await analyticsAPI.getOverview(period);
        if (response.success && response.data) {
          setOverview(response.data);
        } else {
          setError(response.error?.message || "Failed to load analytics data");
        }
      } catch {
        setError("An error occurred while fetching analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  // Helper function to display percentage changes
  const renderIndicator = (change: number) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;

    return (
      <div
        className={`flex items-center ${
          isPositive
            ? "text-green-500"
            : isNeutral
            ? "text-gray-500"
            : "text-red-500"
        }`}
      >
        {!isNeutral && (
          <svg
            className={`w-4 h-4 mr-1`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isPositive ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        )}
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 w-full max-w-3xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-gray-600 mb-4">No data available</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email || "User"}</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Bookings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">{overview.totalBookings}</div>
              {renderIndicator(overview.totalBookingsChange)}
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">
                ${overview.totalRevenue.toLocaleString()}
              </div>
              {renderIndicator(overview.totalRevenueChange)}
            </div>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">{overview.totalUsers}</div>
              {renderIndicator(overview.totalUsersChange)}
            </div>
          </CardContent>
        </Card>

        {/* Most Booked Vehicle */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Most Booked Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">
                {overview.mostBookedVehicle.type}
              </div>
              <div className="text-sm text-gray-500">
                {overview.mostBookedVehicle.count} bookings
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                {overview.bookingDistribution.labels.length > 0 ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Status Distribution
                      </h3>
                      <div className="space-y-2">
                        {overview.bookingDistribution.labels.map(
                          (label, index) => (
                            <div key={label} className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor: getStatusColor(label),
                                }}
                              ></div>
                              <div className="flex-1 flex justify-between">
                                <span className="capitalize">{label}</span>
                                <span className="font-medium">
                                  {overview.bookingDistribution.data[index]}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">View Details</h3>
                      <Link
                        href="/dashboard/bookings"
                        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        View All Bookings
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No booking data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">
                  Revenue details available in the full analytics dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">
                  User analytics available in the full analytics dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {overview.vehicleDistribution.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {overview.vehicleDistribution.map((item) => (
                        <div key={item.type} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: getVehicleColor(item.type),
                            }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span>{item.type}</span>
                              <span>
                                {item.count} ({item.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Most Popular: {overview.mostBookedVehicle.type}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This vehicle type has been booked{" "}
                        {overview.mostBookedVehicle.count} times in the selected
                        period.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No vehicle data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to get colors for status
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#FFA500", // Orange
    confirmed: "#4CAF50", // Green
    "in-progress": "#2196F3", // Blue
    completed: "#4CAF50", // Green
    cancelled: "#F44336", // Red
  };

  return colors[status.toLowerCase()] || "#9E9E9E"; // Default gray
}

// Helper function to get colors for vehicle types
function getVehicleColor(type: string): string {
  const colors: Record<string, string> = {
    sedan: "#3F51B5", // Indigo
    suv: "#673AB7", // Deep Purple
    luxury: "#9C27B0", // Purple
    sports: "#E91E63", // Pink
    van: "#795548", // Brown
  };

  return colors[type.toLowerCase()] || "#607D8B"; // Default blue gray
}
