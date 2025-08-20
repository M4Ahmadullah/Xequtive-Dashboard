"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueAnalytics, TrafficAnalytics } from "@/types/api";
import { FaChartLine, FaUsers, FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
      setLoading(true);
      setError(null);

      try {
        const [revenueResponse, trafficResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics/revenue`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/analytics/traffic`, {
            credentials: 'include'
          })
        ]);

        if (revenueResponse.ok && trafficResponse.ok) {
          const [revenueData, trafficData] = await Promise.all([
            revenueResponse.json(),
            trafficResponse.json()
          ]);

          if (revenueData.success && revenueData.data) {
            setRevenueData(revenueData.data);
          }
          if (trafficData.success && trafficData.data) {
            setTrafficData(trafficData.data);
          }
        } else {
          setError('Failed to fetch analytics data');
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

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
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Analytics</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/40 via-blue-900/40 to-emerald-900/40 border border-emerald-700/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-emerald-600/10 animate-pulse"></div>
          <div className="relative p-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent mb-3">
              Analytics Dashboard 📊
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Comprehensive insights into your business performance. Monitor revenue trends, traffic patterns, and user engagement metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Revenue Analytics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <FaChartLine className="h-5 w-5 text-white" />
          </div>
          Revenue Analytics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-700/30 backdrop-blur-sm hover:border-emerald-600/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-300 text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                  <FaChartLine className="h-4 w-4 text-emerald-400" />
                </div>
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-100 mb-2">
                {revenueData?.total ? formatCurrency(revenueData.total) : '£0'}
              </div>
              <div className="flex items-center gap-2">
                <FaMinus className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-400">
                  No trend data available
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-300 text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <FaChartLine className="h-4 w-4 text-blue-400" />
                </div>
                Average Per Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-100 mb-2">
                {revenueData?.averagePerBooking ? formatCurrency(revenueData.averagePerBooking) : '£0'}
              </div>
              <div className="flex items-center gap-2">
                <FaMinus className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-400">
                  No trend data available
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 backdrop-blur-sm hover:border-purple-600/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-300 text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <FaChartLine className="h-4 w-4 text-purple-400" />
                </div>
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-100 mb-2">
                {revenueData?.total ? Math.round(revenueData.total / (revenueData.averagePerBooking || 1)) : "0"}
              </div>
              <p className="text-sm text-purple-300 mt-1">Calculated from revenue</p>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-700/30 backdrop-blur-sm hover:border-orange-600/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-300 text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                  <FaChartLine className="h-4 w-4 text-orange-400" />
                </div>
                Growth Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-100 mb-2">
                {revenueData?.total ? formatCurrency(revenueData.total) : '£0'}
              </div>
              <p className="text-sm text-orange-300 mt-1">Total revenue</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Traffic Analytics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <FaUsers className="h-5 w-5 text-white" />
          </div>
          Traffic Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Overview */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-300 text-lg font-semibold">Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-800/20 p-4 rounded-xl border border-blue-700/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300 mb-1">
                      {trafficData?.visitors?.total?.toLocaleString() || '0'}
                    </div>
                    <p className="text-blue-400 text-sm">Total Visitors</p>
                  </div>
                </div>
                <div className="bg-blue-800/20 p-4 rounded-xl border border-blue-700/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300 mb-1">
                      {trafficData?.visitors?.unique?.toLocaleString() || '0'}
                    </div>
                    <p className="text-blue-400 text-sm">Unique Visitors</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Page Views</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {trafficData?.pages?.length?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Bounce Rate</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {trafficData?.conversionRate ? `${(100 - trafficData.conversionRate).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${trafficData?.conversionRate ? (100 - trafficData.conversionRate) : 0}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Engagement */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-300 text-lg font-semibold">User Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-800/20 p-4 rounded-xl border border-purple-700/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-300 mb-1">
                      {trafficData?.visitors?.returning || 0}
                    </div>
                    <p className="text-purple-400 text-sm">Returning Visitors</p>
                  </div>
                </div>
                <div className="bg-purple-800/20 p-4 rounded-xl border border-purple-700/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-300 mb-1">
                      {trafficData?.devices?.length || 0}
                    </div>
                    <p className="text-purple-400 text-sm">Device Types</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Conversion Rate</span>
                  <span className="text-sm font-semibold text-purple-400">
                    {trafficData?.conversionRate ? `${trafficData.conversionRate.toFixed(2)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${trafficData?.conversionRate || 0}%` }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Return Rate</span>
                  <span className="text-sm font-semibold text-purple-400">
                    {trafficData?.visitors?.returning ? `${((trafficData.visitors.returning / (trafficData.visitors.total || 1)) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${trafficData?.visitors?.returning ? ((trafficData.visitors.returning / (trafficData.visitors.total || 1)) * 100) : 0}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Social Media Analytics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
            <FaUsers className="h-5 w-5 text-white" />
          </div>
          Social Media Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group bg-gradient-to-br from-pink-900/20 to-pink-800/10 border border-pink-700/30 backdrop-blur-sm hover:border-pink-600/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-pink-300 text-sm font-semibold">Facebook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-100 mb-2">0</div>
                <p className="text-pink-300 text-sm">Followers</p>
                <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-300 text-sm font-semibold">Twitter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-100 mb-2">0</div>
                <p className="text-blue-300 text-sm">Followers</p>
                <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 backdrop-blur-sm hover:border-purple-600/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-300 text-sm font-semibold">Instagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-100 mb-2">0</div>
                <p className="text-purple-300 text-sm">Followers</p>
                <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-700/30 backdrop-blur-sm hover:border-red-600/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-300 text-sm font-semibold">LinkedIn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-100 mb-2">0</div>
                <p className="text-red-300 text-sm">Followers</p>
                <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '0%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
            <span>Social media accounts not connected. Connect your accounts to see detailed analytics.</span>
          </div>
        </div>
      </div>

      {/* Enhanced Performance Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <FaChartLine className="h-5 w-5 text-white" />
          </div>
          Performance Metrics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-300 text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <FaUsers className="h-4 w-4 text-purple-400" />
                </div>
                Revenue Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-100 mb-2">
                {revenueData?.total ? formatCurrency(revenueData.total) : '£0'}
              </div>
              <div className="flex items-center gap-2">
                <FaMinus className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-400">
                  No growth data available
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-300 text-lg font-semibold">Customer Acquisition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-100 mb-2">
                  {trafficData?.conversionRate ? `${trafficData.conversionRate.toFixed(2)}%` : '0%'}
                </div>
                <p className="text-blue-300 text-sm">Conversion rate</p>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${trafficData?.conversionRate || 0}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-300 text-lg font-semibold">User Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-100 mb-2">
                  {trafficData?.visitors?.returning ? `${((trafficData.visitors.returning / (trafficData.visitors.total || 1)) * 100).toFixed(1)}%` : '0%'}
                </div>
                <p className="text-purple-300 text-sm">Return rate</p>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${trafficData?.visitors?.returning ? ((trafficData.visitors.returning / (trafficData.visitors.total || 1)) * 100) : 0}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
