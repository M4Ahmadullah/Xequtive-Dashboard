"use client";

import { useState, useEffect } from "react";
import { analyticsAPI } from "@/lib/api";
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
    const getUserInfo = () => {
      try {
        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          // Create a User object from the localStorage data
          const userData: User = {
            uid: userInfo.uid,
            email: userInfo.email,
            displayName: userInfo.displayName,
            role: userInfo.role as "admin" | "user",
          };
          setUser(userData);
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };

    getUserInfo();
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
            ? "text-gray-400"
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
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 w-full max-w-3xl text-red-300">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
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
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-lg text-gray-400 mb-4">No data available</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {user?.displayName || user?.email || "User"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        <Card className="bg-gray-800 border-gray-700 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold text-white">
                {overview?.bookings?.total || 0}
              </div>
              {renderIndicator(overview?.bookings?.comparisonPercentage || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-gray-800 border-gray-700 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold text-white">
                {overview?.revenue?.currency || "$"}
                {overview?.revenue?.total
                  ? overview.revenue.total.toLocaleString()
                  : "0"}
              </div>
              {renderIndicator(overview?.revenue?.comparisonPercentage || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="bg-gray-800 border-gray-700 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold text-white">
                {overview?.users?.total || 0}
              </div>
              {renderIndicator(overview?.users?.comparisonPercentage || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Most Booked Vehicle */}
        <Card className="bg-gray-800 border-gray-700 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">
              Most Booked Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold text-white">
                {overview?.vehicles?.mostBooked || "None"}
              </div>
              <div className="text-sm text-gray-400">Most popular</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Bookings
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="vehicles"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Vehicles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Booking Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-white">
                {overview?.bookings && (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-white">
                        Status Distribution
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: getStatusColor("pending"),
                            }}
                          ></div>
                          <div className="flex-1 flex justify-between">
                            <span className="capitalize">Pending</span>
                            <span className="font-medium">
                              {overview.bookings.pending || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: getStatusColor("confirmed"),
                            }}
                          ></div>
                          <div className="flex-1 flex justify-between">
                            <span className="capitalize">Confirmed</span>
                            <span className="font-medium">
                              {overview.bookings.confirmed || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: getStatusColor("completed"),
                            }}
                          ></div>
                          <div className="flex-1 flex justify-between">
                            <span className="capitalize">Completed</span>
                            <span className="font-medium">
                              {overview.bookings.completed || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: getStatusColor("cancelled"),
                            }}
                          ></div>
                          <div className="flex-1 flex justify-between">
                            <span className="capitalize">Cancelled</span>
                            <span className="font-medium">
                              {overview.bookings.cancelled || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-white">
                        View Details
                      </h3>
                      <Link
                        href="/dashboard/bookings"
                        className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        View All Bookings
                      </Link>
                    </div>
                  </div>
                )}
                {!overview?.bookings && (
                  <p className="text-gray-500">No booking data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-white">
                <p className="text-gray-500">
                  Revenue details available in the full analytics dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-white">
                <p className="text-gray-500">
                  User analytics available in the full analytics dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Vehicle Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {overview?.vehicles?.distribution &&
                overview.vehicles.distribution.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {overview.vehicles.distribution.map((item) => (
                        <div key={item.name} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: getVehicleColor(item.name),
                            }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span>{item.name}</span>
                              <span>{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-white">
                        Most Popular: {overview.vehicles.mostBooked || "None"}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        This vehicle type is the most booked in the selected
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
    pending: "#F59E0B", // Amber
    confirmed: "#0EA5E9", // Sky
    "in-progress": "#6366F1", // Indigo
    completed: "#22C55E", // Green
    cancelled: "#EF4444", // Red
  };

  return colors[status.toLowerCase()] || "#6B7280"; // Default gray
}

// Helper function to get colors for vehicle types
function getVehicleColor(type: string): string {
  const colors: Record<string, string> = {
    sedan: "#6366F1", // Indigo
    suv: "#8B5CF6", // Purple
    luxury: "#A855F7", // Purple/Violet
    sports: "#EC4899", // Pink
    van: "#9333EA", // Purple/Violet
  };

  return colors[type.toLowerCase()] || "#6B7280"; // Default gray
}
