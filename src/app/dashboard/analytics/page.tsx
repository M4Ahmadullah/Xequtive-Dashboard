"use client";

import { useState, useEffect, useCallback } from "react";
import { analyticsAPI } from "@/lib/api";
import {
  RevenueAnalytics,
  BookingAnalytics,
  UserAnalytics,
  TrafficAnalytics,
} from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [bookingData, setBookingData] = useState<BookingAnalytics | null>(null);
  const [userData, setUserData] = useState<UserAnalytics | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState("revenue");
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: formatDate(new Date()),
  });
  const [interval, setInterval] = useState<"day" | "week" | "month">("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return formatDate(date);
  }

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      interval,
    };

    try {
      // Fetch analytics based on active tab
      if (activeTab === "revenue" || activeTab === "all") {
        const response = await analyticsAPI.getRevenueAnalytics(params);
        if (response.success && response.data) {
          setRevenueData(response.data);
        } else {
          setError(
            response.error?.message || "Failed to load revenue analytics"
          );
        }
      }

      if (activeTab === "bookings" || activeTab === "all") {
        const response = await analyticsAPI.getBookingAnalytics(params);
        if (response.success && response.data) {
          setBookingData(response.data);
        } else {
          setError(
            response.error?.message || "Failed to load booking analytics"
          );
        }
      }

      if (activeTab === "users" || activeTab === "all") {
        const response = await analyticsAPI.getUserAnalytics(params);
        if (response.success && response.data) {
          setUserData(response.data);
        } else {
          setError(response.error?.message || "Failed to load user analytics");
        }
      }

      if (activeTab === "traffic" || activeTab === "all") {
        const response = await analyticsAPI.getTrafficAnalytics(params);
        if (response.success && response.data) {
          setTrafficData(response.data as unknown as TrafficAnalytics);
        } else {
          setError(
            response.error?.message || "Failed to load traffic analytics"
          );
        }
      }
    } catch (err) {
      setError("An error occurred while fetching analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange, interval]);

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, dateRange, interval, fetchAnalytics]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleDateChange = (type: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  if (loading && !revenueData && !bookingData && !userData && !trafficData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !revenueData && !bookingData && !userData && !trafficData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 w-full max-w-3xl">
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
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">
            Detailed analytics and reporting. This dashboard provides insights
            on revenue, bookings, users, and traffic data over custom time
            periods.
          </p>
        </div>

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="startDate" className="text-sm text-gray-300">
              Start:
            </label>
            <input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="px-2 py-1 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-gray-800 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="endDate" className="text-sm text-gray-300">
              End:
            </label>
            <input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="px-2 py-1 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-gray-800 text-white"
            />
          </div>

          <select
            value={interval}
            onChange={(e) =>
              setInterval(e.target.value as "day" | "week" | "month")
            }
            className="px-2 py-1 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-gray-800 text-white"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-8"
      >
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Bookings
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="traffic"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Traffic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : revenueData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400 font-medium">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {revenueData?.currency || "$"}
                      {revenueData?.total?.toLocaleString() || "0"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400 font-medium">
                      Average Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {revenueData?.currency || "$"}
                      {revenueData?.averagePerBooking?.toLocaleString() || "0"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {revenueData?.timeline &&
                    revenueData.timeline.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-col space-y-2">
                          {revenueData.timeline.map((item) => (
                            <div key={item.date} className="flex items-center">
                              <div className="w-24 text-sm text-gray-400">
                                {item.date}
                              </div>
                              <div className="flex-1 h-8 bg-gray-700 rounded-md overflow-hidden">
                                <div
                                  className="h-full bg-purple-600"
                                  style={{
                                    width: `${
                                      (item.amount /
                                        Math.max(
                                          ...revenueData.timeline.map(
                                            (i) => i.amount
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-24 text-sm text-gray-300 text-right">
                                {revenueData.currency || "$"}
                                {item.amount.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        No revenue timeline data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Revenue by Vehicle Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {revenueData?.byVehicleType &&
                    revenueData.byVehicleType.length > 0 ? (
                      <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            {revenueData.byVehicleType.map((item) => (
                              <div key={item.type} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-300">
                                    {item.type}
                                  </span>
                                  <span className="text-gray-300">
                                    {revenueData.currency || "$"}
                                    {item.amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full"
                                    style={{
                                      width: `${item.percentage}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        No vehicle revenue data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-400 mb-4">
                No revenue data available
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : bookingData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400 font-medium">
                      Total Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {bookingData?.total || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Bookings Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {bookingData?.timeline &&
                    bookingData.timeline.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-col space-y-2">
                          {bookingData.timeline.map((item) => (
                            <div key={item.date} className="flex items-center">
                              <div className="w-24 text-sm text-gray-400">
                                {item.date}
                              </div>
                              <div className="flex-1 h-8 bg-gray-700 rounded-md overflow-hidden">
                                <div
                                  className="h-full bg-purple-600"
                                  style={{
                                    width: `${
                                      (item.count /
                                        Math.max(
                                          ...bookingData.timeline.map(
                                            (i) => i.count
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-16 text-sm text-gray-300 text-right">
                                {item.count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        No bookings timeline data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Bookings by Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      {bookingData?.byWeekday &&
                      bookingData.byWeekday.length > 0 ? (
                        <div className="w-full space-y-4">
                          {bookingData.byWeekday.map((item) => (
                            <div key={item.day} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium capitalize text-gray-300">
                                  {item.day}
                                </span>
                                <span className="text-gray-300">
                                  {item.count}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-purple-600"
                                  style={{
                                    width: `${
                                      (item.count /
                                        Math.max(
                                          ...bookingData.byWeekday.map(
                                            (i) => i.count
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No booking data by day available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Bookings by Vehicle Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      {bookingData?.byVehicleType &&
                      bookingData.byVehicleType.length > 0 ? (
                        <div className="w-full space-y-4">
                          {bookingData.byVehicleType.map((item) => (
                            <div key={item.type} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-300">
                                  {item.type}
                                </span>
                                <span className="text-gray-300">
                                  {item.count}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (item.count /
                                        Math.max(
                                          ...bookingData.byVehicleType.map(
                                            (i) => i.count
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No vehicle booking data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-400 mb-4">
                No booking data available
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : userData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400 font-medium">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {userData?.total || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400 font-medium">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {userData?.active || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400 font-medium">
                      Returning Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {userData?.retention?.returning || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {userData?.timeline && userData.timeline.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-col space-y-2">
                          {userData.timeline.map((item) => (
                            <div key={item.date} className="flex items-center">
                              <div className="w-24 text-sm text-gray-400">
                                {item.date}
                              </div>
                              <div className="flex-1 h-8 bg-gray-700 rounded-md overflow-hidden">
                                <div
                                  className="h-full bg-purple-600"
                                  style={{
                                    width: `${
                                      (item.newUsers /
                                        Math.max(
                                          ...userData.timeline.map(
                                            (i) => i.newUsers
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-16 text-sm text-gray-300 text-right">
                                {item.newUsers}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        No user growth data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                            User
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                            Bookings
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                            Spent
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData?.topBookers?.map((user) => (
                          <tr
                            key={user.uid}
                            className="border-b hover:bg-gray-700"
                          >
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3">{user.bookings}</td>
                            <td className="px-4 py-3">
                              ${user.spent.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-400 mb-4">
                No user data available
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : trafficData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Traffic Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      {trafficData?.referrers &&
                      trafficData.referrers.length > 0 ? (
                        <div className="w-full space-y-4">
                          {trafficData.referrers.map((item) => (
                            <div key={item.source} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-300">
                                  {item.source}
                                </span>
                                <span className="text-gray-300">
                                  {item.visits}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (item.visits /
                                        Math.max(
                                          ...trafficData.referrers.map(
                                            (i) => i.visits
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No traffic source data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Device Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      {trafficData?.devices &&
                      trafficData.devices.length > 0 ? (
                        <div className="w-full space-y-4">
                          {trafficData.devices.map((device) => (
                            <div key={device.type} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-300">
                                  {device.type}
                                </span>
                                <span className="text-gray-300">
                                  {device.percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${device.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No device data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Traffic Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {trafficData?.timeline &&
                    trafficData.timeline.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-col space-y-2">
                          {trafficData.timeline.map((item) => (
                            <div key={item.date} className="flex items-center">
                              <div className="w-24 text-sm text-gray-400">
                                {item.date}
                              </div>
                              <div className="flex-1 h-8 bg-gray-700 rounded-md overflow-hidden">
                                <div
                                  className="h-full bg-purple-600"
                                  style={{
                                    width: `${
                                      (item.visitors /
                                        Math.max(
                                          ...trafficData.timeline.map(
                                            (i) => i.visitors
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-16 text-sm text-gray-300 text-right">
                                {item.visitors}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        No traffic timeline data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-400 mb-4">
                No traffic data available
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
