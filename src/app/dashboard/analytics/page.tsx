"use client";

import { useState, useEffect } from "react";
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

  const fetchAnalytics = async () => {
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
          setTrafficData(response.data);
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
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, dateRange, interval]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleDateChange = (type: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  const getValueWithTrend = (value: number, change: number) => {
    return (
      <div className="flex items-end space-x-2">
        <div className="text-3xl font-bold">{value}</div>
        <div
          className={`text-sm ${
            change > 0
              ? "text-green-500"
              : change < 0
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {change > 0 ? "+" : ""}
          {change}%
        </div>
      </div>
    );
  };

  if (loading && !revenueData && !bookingData && !userData && !trafficData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error && !revenueData && !bookingData && !userData && !trafficData) {
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
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed analytics and reporting</p>
        </div>

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="startDate" className="text-sm text-gray-600">
              Start:
            </label>
            <input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="endDate" className="text-sm text-gray-600">
              End:
            </label>
            <input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            value={interval}
            onChange={(e) =>
              setInterval(e.target.value as "day" | "week" | "month")
            }
            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
        <TabsList className="bg-gray-100">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : revenueData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 font-medium">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getValueWithTrend(revenueData.total, revenueData.change)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 font-medium">
                      Average Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${revenueData.average.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {revenueData.timeline.labels.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-col space-y-2">
                          {revenueData.timeline.labels.map((label, index) => (
                            <div key={label} className="flex items-center">
                              <div className="w-24 text-sm text-gray-500">
                                {label}
                              </div>
                              <div className="flex-1 h-8 bg-gray-100 rounded-md overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500"
                                  style={{
                                    width: `${
                                      (revenueData.timeline.data[index] /
                                        Math.max(
                                          ...revenueData.timeline.data
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-24 text-sm text-gray-700 text-right">
                                $
                                {revenueData.timeline.data[
                                  index
                                ].toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No revenue timeline data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Vehicle Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {revenueData.byVehicleType.labels.length > 0 ? (
                      <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            {revenueData.byVehicleType.labels.map(
                              (label, index) => (
                                <div key={label} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{label}</span>
                                    <span>
                                      $
                                      {revenueData.byVehicleType.data[
                                        index
                                      ].toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-indigo-600 h-2 rounded-full"
                                      style={{
                                        width: `${
                                          (revenueData.byVehicleType.data[
                                            index
                                          ] /
                                            Math.max(
                                              ...revenueData.byVehicleType.data
                                            )) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No vehicle revenue data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-600 mb-4">
                No revenue data available
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : bookingData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 font-medium">
                      Total Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getValueWithTrend(bookingData.total, bookingData.change)}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Bookings Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {bookingData.timeline.labels.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-col space-y-2">
                          {bookingData.timeline.labels.map((label, index) => (
                            <div key={label} className="flex items-center">
                              <div className="w-24 text-sm text-gray-500">
                                {label}
                              </div>
                              <div className="flex-1 h-8 bg-gray-100 rounded-md overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500"
                                  style={{
                                    width: `${
                                      (bookingData.timeline.data[index] /
                                        Math.max(
                                          ...bookingData.timeline.data
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-16 text-sm text-gray-700 text-right">
                                {bookingData.timeline.data[index]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No bookings timeline data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bookings by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      {bookingData.byStatus.labels.length > 0 ? (
                        <div className="w-full space-y-4">
                          {bookingData.byStatus.labels.map((label, index) => (
                            <div key={label} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium capitalize">
                                  {label}
                                </span>
                                <span>{bookingData.byStatus.data[index]}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getStatusColor(
                                    label
                                  )}`}
                                  style={{
                                    width: `${
                                      (bookingData.byStatus.data[index] /
                                        Math.max(
                                          ...bookingData.byStatus.data
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
                        <p className="text-gray-500">
                          No booking status data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bookings by Vehicle Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      {bookingData.byVehicleType.labels.length > 0 ? (
                        <div className="w-full space-y-4">
                          {bookingData.byVehicleType.labels.map(
                            (label, index) => (
                              <div key={label} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">{label}</span>
                                  <span>
                                    {bookingData.byVehicleType.data[index]}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        (bookingData.byVehicleType.data[index] /
                                          Math.max(
                                            ...bookingData.byVehicleType.data
                                          )) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
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
              <p className="text-lg text-gray-600 mb-4">
                No booking data available
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : userData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 font-medium">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getValueWithTrend(userData.total, userData.change)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 font-medium">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userData.active}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 font-medium">
                      Returning Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userData.returning}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {userData.timeline.labels.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-col space-y-2">
                          {userData.timeline.labels.map((label, index) => (
                            <div key={label} className="flex items-center">
                              <div className="w-24 text-sm text-gray-500">
                                {label}
                              </div>
                              <div className="flex-1 h-8 bg-gray-100 rounded-md overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500"
                                  style={{
                                    width: `${
                                      (userData.timeline.data[index] /
                                        Math.max(...userData.timeline.data)) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-16 text-sm text-gray-700 text-right">
                                {userData.timeline.data[index]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No user growth data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Users</CardTitle>
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
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.topUsers.map((user) => (
                          <tr
                            key={user.uid}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">{user.name}</td>
                            <td className="px-4 py-3">{user.bookings}</td>
                            <td className="px-4 py-3">
                              ${user.revenue.toLocaleString()}
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
              <p className="text-lg text-gray-600 mb-4">
                No user data available
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : trafficData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      {trafficData.sources && trafficData.sources.length > 0 ? (
                        <div className="w-full space-y-4">
                          {trafficData.sources.map(
                            (source: {
                              source: string;
                              count: number;
                              percentage: number;
                            }) => (
                              <div key={source.source} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">
                                    {source.source}
                                  </span>
                                  <span>
                                    {source.count} ({source.percentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${source.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No traffic source data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      {trafficData.devices && trafficData.devices.length > 0 ? (
                        <div className="w-full space-y-4">
                          {trafficData.devices.map(
                            (device: {
                              device: string;
                              count: number;
                              percentage: number;
                            }) => (
                              <div key={device.device} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">
                                    {device.device}
                                  </span>
                                  <span>
                                    {device.count} ({device.percentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${device.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No device data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {trafficData.timeline &&
                    trafficData.timeline.labels.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-col space-y-2">
                          {trafficData.timeline.labels.map(
                            (label: string, index: number) => (
                              <div key={label} className="flex items-center">
                                <div className="w-24 text-sm text-gray-500">
                                  {label}
                                </div>
                                <div className="flex-1 h-8 bg-gray-100 rounded-md overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500"
                                    style={{
                                      width: `${
                                        (trafficData.timeline.data[index] /
                                          Math.max(
                                            ...trafficData.timeline.data
                                          )) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-16 text-sm text-gray-700 text-right">
                                  {trafficData.timeline.data[index]}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No traffic timeline data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-600 mb-4">
                No traffic data available
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500";
    case "confirmed":
      return "bg-blue-500";
    case "in-progress":
      return "bg-indigo-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}
