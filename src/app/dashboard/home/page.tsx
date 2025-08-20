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
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/users`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics`, {
            credentials: 'include'
          })
        ]);

        if (bookingsResponse.ok && usersResponse.ok && analyticsResponse.ok) {
          const [bookingsData, usersData, analyticsData] = await Promise.all([
            bookingsResponse.json(),
            usersResponse.json(),
            analyticsResponse.json()
          ]);

          setStats({
            totalBookings: bookingsData.data?.bookings?.length || 0,
            pendingBookings: bookingsData.data?.bookings?.filter((b: BookingDetail) => b.status === 'pending')?.length || 0,
            totalUsers: usersData.data?.users?.length || 0,
            todayBookings: 0, // Calculate from date
            revenue: {
              total: analyticsData.data?.revenue?.total || 0,
              trend: analyticsData.data?.revenue?.trend || 0,
            },
          });

          setRecentBookings(bookingsData.data?.bookings?.slice(0, 5) || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaChartLine className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Enhanced Welcome Header */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border border-purple-700/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 animate-pulse"></div>
          <div className="relative p-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent mb-3">
              Welcome back, Xequtive Cars Admin! 👋
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Here&apos;s what&apos;s happening with your business today. Monitor your bookings, revenue, and customer activity at a glance.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="group bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:rotate-3">
                <FaCalendarCheck className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium tracking-wide">This Week</span>
                <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{stats.totalBookings}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Total Bookings</span>
              <span className="text-xs text-blue-600 font-semibold">+12%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:-rotate-3">
                <FaDollarSign className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium tracking-wide">Revenue</span>
                <div className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">£{stats.revenue.total.toLocaleString()}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Total Revenue</span>
              <span className="text-xs text-emerald-600 font-semibold">+8%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:rotate-3">
                <FaUserAlt className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium tracking-wide">Total Users</span>
                <div className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">{stats.totalUsers}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Active Users</span>
              <span className="text-xs text-purple-600 font-semibold">+15%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:-rotate-3">
                <FaCarSide className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-medium tracking-wide">Most Popular</span>
                <div className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">Standard Saloon</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Vehicle Type</span>
              <span className="text-xs text-orange-600 font-semibold">Top Choice</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: '90%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-500 transform hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FaCalendarCheck className="h-4 w-4 text-blue-400" />
              </div>
              Booking Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Pending</span>
                <span className="text-sm font-semibold text-yellow-400">{stats.pendingBookings}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(stats.pendingBookings / Math.max(stats.totalBookings, 1)) * 100}%` }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Confirmed</span>
                <span className="text-sm font-semibold text-green-400">0</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Completed</span>
                <span className="text-sm font-semibold text-blue-400">0</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Cancelled</span>
                <span className="text-sm font-semibold text-red-400">0</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 backdrop-blur-sm hover:border-purple-600/50 transition-all duration-500 transform hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FaChartLine className="h-4 w-4 text-purple-400" />
              </div>
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-100 mb-2">£{stats.revenue.total.toLocaleString()}</div>
              <p className="text-sm text-purple-300">Total Revenue</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Average per Booking</span>
                <span className="text-sm font-semibold text-purple-400">£{(stats.revenue.total / Math.max(stats.totalBookings, 1)).toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '70%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-700/30 backdrop-blur-sm hover:border-emerald-600/50 transition-all duration-500 transform hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-emerald-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <FaUserAlt className="h-4 w-4 text-emerald-400" />
              </div>
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-100 mb-2">{stats.totalUsers}</div>
              <p className="text-sm text-emerald-300">Total Users</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Active Users</span>
                <span className="text-sm font-semibold text-emerald-400">{Math.round(stats.totalUsers * 0.85)}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaCalendarCheck className="h-5 w-5 text-white" />
                </div>
                Recent Bookings
              </CardTitle>
              <Link href="/dashboard/bookings" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 flex items-center gap-1 group">
                View All
                <FaArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-200">
                          {booking.customer?.fullName || 'Unknown Customer'}
                        </h4>
                        <p className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors duration-200">
                          {booking.pickupDate} • {booking.pickupTime}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.locations?.pickup?.address} → {booking.locations?.dropoff?.address}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800 group-hover:bg-green-200' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800 group-hover:bg-blue-200' :
                            'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                          }`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-200">
                          £{booking.vehicle?.price?.amount?.toLocaleString() || '0'}
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

        {/* Enhanced Quick Actions */}
        <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaChartLine className="h-5 w-5 text-white" />
              </div>
              Quick Actions
              </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <Link href="/dashboard/bookings" className="group p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FaCalendarCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-900 transition-colors duration-200">Manage Bookings</h4>
                      <p className="text-sm text-gray-600">View and manage all bookings</p>
                    </div>
                  </div>
                  <FaArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>

              <Link href="/dashboard/users" className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FaUserAlt className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-200">User Management</h4>
                      <p className="text-sm text-gray-600">Manage user accounts</p>
                    </div>
                  </div>
                  <FaArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>

              <Link href="/dashboard/analytics" className="group p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FaChartLine className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors duration-200">Analytics</h4>
                      <p className="text-sm text-gray-600">View detailed analytics</p>
                    </div>
                  </div>
                  <FaArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>

              <Link href="/dashboard/settings" className="group p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FaCarSide className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-orange-900 transition-colors duration-200">Settings</h4>
                      <p className="text-sm text-gray-600">Configure system settings</p>
                    </div>
                  </div>
                  <FaArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


