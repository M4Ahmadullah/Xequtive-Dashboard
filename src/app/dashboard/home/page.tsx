"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      try {
        // Fetch real data from backend APIs
        const [bookingsResponse, usersResponse, analyticsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings?limit=5&page=1`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/users?limit=10&page=1`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics/overview?period=week`, {
            credentials: 'include'
          })
        ]);

        // Process bookings data
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          if (bookingsData.success && bookingsData.data?.bookings) {
            const pendingCount = bookingsData.data.bookings.filter(
              (booking: BookingDetail) => booking.status === "pending"
            ).length;

            const todayCount = bookingsData.data.bookings.filter(
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

            setRecentBookings(bookingsData.data.bookings.slice(0, 5));

            setStats((prev) => ({
              ...prev,
              totalBookings: bookingsData.data?.pagination?.total || 0,
              pendingBookings: pendingCount,
              todayBookings: todayCount,
            }));
          }
        }

        // Process users data
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          if (usersData.success && usersData.data?.pagination) {
            setStats((prev) => ({
              ...prev,
              totalUsers: usersData.data?.pagination?.total || 0,
            }));
          }
        }

        // Process analytics data
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          if (analyticsData.success && analyticsData.data) {
            setStats((prev) => ({
              ...prev,
              revenue: {
                total: analyticsData.data.revenue?.total || 0,
                trend: analyticsData.data.revenue?.comparisonPercentage || 0,
              },
            }));
          }
        }
        setError(null);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data");
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
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-xl text-purple-100">Here&apos;s what&apos;s happening with your Xequtive service today</p>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaCalendarCheck className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium">This Week</span>
                <div className="text-lg font-bold text-gray-900">{stats.totalBookings}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Bookings</span>
              <span className="text-xs text-gray-400">0%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FaDollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium">This Week</span>
                <div className="text-lg font-bold text-gray-900">£{stats.revenue.total.toLocaleString()}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="text-xs text-gray-400">0%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaUserAlt className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium">This Week</span>
                <div className="text-lg font-bold text-gray-900">{stats.totalUsers}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="text-xs text-gray-400">0%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <FaCarSide className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium">Most Booked</span>
                <div className="text-lg font-bold text-gray-900">Standard Saloon</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vehicle Type</span>
              <span className="text-xs text-amber-600 font-medium">Most popular</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-amber-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Booking Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.pendingBookings}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Confirmed</span>
              </div>
              <span className="text-lg font-bold text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <span className="text-lg font-bold text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Cancelled</span>
              </div>
              <span className="text-lg font-bold text-gray-900">0</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/dashboard/bookings"
              className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <FaCalendarCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View All Bookings</h3>
                <p className="text-sm text-gray-600">Manage and track all bookings</p>
              </div>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <FaChartLine className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics Dashboard</h3>
                <p className="text-sm text-gray-600">View detailed insights</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-lg font-bold text-amber-600">{stats.pendingBookings}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(stats.pendingBookings / stats.totalBookings) * 100}%` }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="text-lg font-bold text-blue-600">0</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-lg font-bold text-emerald-600">0</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cancelled</span>
                <span className="text-lg font-bold text-red-600">0</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-purple-900">Recent Bookings</CardTitle>
                <Link
                  href="/dashboard/bookings"
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center font-medium"
                >
                  View all <FaArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentBookings.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentBookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        index === 0 ? 'rounded-t-lg' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-purple-700">
                              #{booking.id.substring(0, 6)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.customer?.fullName || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            £{booking.vehicle.price.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCalendarCheck className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No recent bookings</p>
                  <p className="text-gray-400 text-sm">Bookings will appear here once they&apos;re created</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
              <CardTitle className="text-purple-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Link
                href="/dashboard/bookings"
                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="mr-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl">
                  <FaCalendarCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">View Bookings</h3>
                  <p className="text-xs text-gray-600">Manage all bookings</p>
                </div>
              </Link>

              <Link
                href="/dashboard/analytics"
                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="mr-4 bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
                  <FaChartLine className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
                  <p className="text-xs text-gray-600">View detailed insights</p>
                </div>
              </Link>

              <Link
                href="/dashboard/users"
                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="mr-4 bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 rounded-xl">
                  <FaUserAlt className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Users</h3>
                  <p className="text-xs text-gray-600">Manage user accounts</p>
                </div>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="mr-4 bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl">
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                  <h3 className="text-sm font-semibold text-gray-900">Settings</h3>
                  <p className="text-xs text-gray-600">Configure system</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


