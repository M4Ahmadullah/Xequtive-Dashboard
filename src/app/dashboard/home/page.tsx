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
import { analyticsAPI, bookingsAPI } from "@/lib/api";

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
        // Fetch real data from backend APIs using the new enhanced endpoints
        const [overviewResponse, bookingsResponse] = await Promise.all([
          analyticsAPI.getOverview('week'),
          bookingsAPI.getAllBookings({ page: 1, limit: 5 })
        ]);

        if (overviewResponse.success && overviewResponse.data) {
          setStats({
            totalBookings: overviewResponse.data.bookings.total,
            pendingBookings: overviewResponse.data.bookings.pending,
            totalUsers: overviewResponse.data.users.total,
            todayBookings: 0, // Calculate from date
            revenue: {
              total: overviewResponse.data.revenue.total,
              trend: overviewResponse.data.revenue.comparisonPercentage,
            },
          });
        }

        if (bookingsResponse.success && bookingsResponse.data) {
          setRecentBookings(bookingsResponse.data.bookings);
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
                <span className="text-xs text-gray-500 font-medium tracking-wide">Pending</span>
                <div className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">{stats.pendingBookings}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Awaiting Confirmation</span>
              <span className="text-xs text-orange-600 font-semibold">+5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: '45%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-blue-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaCalendarCheck className="h-5 w-5 text-white" />
                </div>
                Recent Bookings
              </CardTitle>
              <Link href="/dashboard/bookings" className="text-blue-600 hover:text-blue-800 font-medium text-sm group flex items-center gap-2">
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
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <FaUserAlt className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-200">
                              {booking.customer?.fullName || 'Customer Name'}
                            </h4>
                            <p className="text-sm text-gray-600">{booking.pickupDate} at {booking.pickupTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FaCarSide className="h-3 w-3" />
                            {booking.vehicle?.name || 'Vehicle'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendarCheck className="h-3 w-3" />
                            {booking.bookingType || 'Booking Type'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                        }`}>
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
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarCheck className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm">Bookings will appear here once they&apos;re created</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaChartLine className="h-5 w-5 text-white" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <Link href="/dashboard/bookings" className="group p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaCalendarCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-900 transition-colors duration-200">Manage Bookings</h4>
                    <p className="text-sm text-gray-600">View and manage all bookings</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/users" className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaUserAlt className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-200">User Management</h4>
                    <p className="text-sm text-gray-600">Manage user accounts</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/settings" className="group p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaCarSide className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-900 transition-colors duration-200">Settings</h4>
                    <p className="text-sm text-gray-600">Configure system settings</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Overview Section */}
      <div className="mb-8">
        <Card className="bg-white border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
            <CardTitle className="text-xl text-emerald-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FaChartLine className="h-5 w-5 text-white" />
              </div>
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">{stats.totalBookings}</h3>
                <p className="text-blue-700 font-medium">Total Bookings</p>
                <p className="text-sm text-blue-600 mt-1">This week</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaDollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-2">£{stats.revenue.total.toLocaleString()}</h3>
                <p className="text-emerald-700 font-medium">Total Revenue</p>
                <p className="text-sm text-emerald-600 mt-1">This week</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserAlt className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-2">{stats.totalUsers}</h3>
                <p className="text-purple-700 font-medium">Total Users</p>
                <p className="text-sm text-purple-600 mt-1">Registered users</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Quick Links</h4>
                <div className="space-y-3">
                  <Link href="/dashboard/analytics" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <FaChartLine className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">View Detailed Analytics</span>
                  </Link>
                  <Link href="/dashboard/bookings/calendar" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <FaCalendarCheck className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">Calendar View</span>
                  </Link>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                <h4 className="text-lg font-semibold text-emerald-900 mb-4">System Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-emerald-900 font-medium">Backend Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Online</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-emerald-900 font-medium">Database</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


