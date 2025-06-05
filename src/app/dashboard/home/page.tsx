"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookingsAPI, analyticsAPI, usersAPI } from "@/lib/api";
import { BookingDetail } from "@/types/api";
import Link from "next/link";
import {
  FaCarSide,
  FaCalendarCheck,
  FaUserAlt,
  FaChartLine,
  FaDollarSign,
  FaArrowRight,
} from "react-icons/fa";

export default function DashboardHomePage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    todayBookings: 0,
    revenue: {
      total: 0,
      trend: 0,
    },
  });
  const [recentBookings, setRecentBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      function getLastMonth(): string {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return formatDate(date);
      }

      function formatDate(date: Date): string {
        return date.toISOString().split("T")[0];
      }

      try {
        // Fetch summary stats
        const [bookingsResponse, usersResponse, analyticsResponse] =
          await Promise.all([
            bookingsAPI.getAll({ limit: 5, page: 1 }),
            usersAPI.getAll({ limit: 10, page: 1 }),
            analyticsAPI.getRevenueAnalytics({
              startDate: getLastMonth(),
              endDate: formatDate(new Date()),
              interval: "day",
            }),
          ]);

        // Process bookings data if available
        if (bookingsResponse.success && bookingsResponse.data?.bookings) {
          const pendingCount = bookingsResponse.data.bookings.filter(
            (booking: BookingDetail) => booking.status === "pending"
          ).length;

          const todayCount = bookingsResponse.data.bookings.filter(
            (booking: BookingDetail) => {
              const bookingDate = new Date(booking.createdAt);
              const today = new Date();
              return (
                bookingDate.getDate() === today.getDate() &&
                bookingDate.getMonth() === today.getMonth() &&
                bookingDate.getFullYear() === today.getFullYear()
              );
            }
          ).length;

          setRecentBookings(bookingsResponse.data.bookings.slice(0, 5));

          setStats((prev) => ({
            ...prev,
            totalBookings: bookingsResponse.data?.pagination?.total || 0,
            pendingBookings: pendingCount,
            todayBookings: todayCount,
          }));
        }

        // Process users data if available
        if (usersResponse.success && usersResponse.data?.pagination) {
          setStats((prev) => ({
            ...prev,
            totalUsers: usersResponse.data?.pagination?.total || 0,
          }));
        }

        // Process analytics data if available
        if (analyticsResponse.success && analyticsResponse.data) {
          setStats((prev) => ({
            ...prev,
            revenue: {
              total: analyticsResponse.data?.total || 0,
              trend: 0,
            },
          }));
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Xequtive Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Total Bookings
            </CardTitle>
            <FaCalendarCheck className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.todayBookings} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Pending Bookings
            </CardTitle>
            <FaCarSide className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingBookings}</div>
            <p className="text-sm text-gray-500 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Total Revenue
            </CardTitle>
            <FaDollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.revenue.total.toLocaleString()}
            </div>
            <div
              className={`text-sm mt-1 ${
                stats.revenue.trend > 0
                  ? "text-green-500"
                  : stats.revenue.trend < 0
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {stats.revenue.trend > 0 ? "+" : ""}
              {stats.revenue.trend}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Total Users
            </CardTitle>
            <FaUserAlt className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-sm text-gray-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Bookings</CardTitle>
                <Link
                  href="/dashboard/bookings"
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  View all <FaArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm text-gray-500">
                        <th className="pb-2 text-left font-medium">ID</th>
                        <th className="pb-2 text-left font-medium">Customer</th>
                        <th className="pb-2 text-left font-medium">Status</th>
                        <th className="pb-2 text-left font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 text-sm">
                            {booking.id.substring(0, 8)}
                          </td>
                          <td className="py-3 text-sm">
                            {booking.user?.fullName || "Unknown"}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent bookings found
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/dashboard/bookings/new"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div className="mr-3 bg-indigo-100 p-2 rounded-md">
                  <FaCalendarCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">New Booking</h3>
                  <p className="text-xs text-gray-500">Create a booking</p>
                </div>
              </Link>

              <Link
                href="/dashboard/analytics"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div className="mr-3 bg-indigo-100 p-2 rounded-md">
                  <FaChartLine className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Analytics</h3>
                  <p className="text-xs text-gray-500">
                    View detailed analytics
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div className="mr-3 bg-indigo-100 p-2 rounded-md">
                  <svg
                    className="h-5 w-5 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Settings</h3>
                  <p className="text-xs text-gray-500">Manage your settings</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "in-progress":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
