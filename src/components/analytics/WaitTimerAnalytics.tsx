"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaitTimerAnalytics } from "@/types/api";
import { analyticsAPI } from "@/lib/api";
import { FaClock, FaCalendarAlt, FaChartBar, FaStopwatch } from "react-icons/fa";

interface WaitTimerAnalyticsProps {
  startDate?: string;
  endDate?: string;
}

export default function WaitTimerAnalyticsComponent({ startDate, endDate }: WaitTimerAnalyticsProps) {
  const [data, setData] = useState<WaitTimerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await analyticsAPI.getWaitTimerAnalytics(startDate, endDate);
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError('Failed to fetch wait timer analytics');
        }
      } catch (error) {
        console.error('Error fetching wait timer analytics:', error);
        setError('Failed to fetch wait timer analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaChartBar className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Error Loading Analytics</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FaChartBar className="h-4 w-4 text-purple-400" />
              </div>
              Total Return Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-100 mb-2">
              {data.totalReturnBookings.toLocaleString()}
            </div>
            <div className="text-sm text-purple-300">
              {data.percentages.waitAndReturn}% wait-and-return
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FaClock className="h-4 w-4 text-blue-400" />
              </div>
              Wait & Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-100 mb-2">
              {data.waitAndReturnBookings.toLocaleString()}
            </div>
            <div className="text-sm text-blue-300">
              {data.percentages.waitAndReturn}% of returns
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="h-4 w-4 text-green-400" />
              </div>
              Later Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-100 mb-2">
              {data.laterDateBookings.toLocaleString()}
            </div>
            <div className="text-sm text-green-300">
              {data.percentages.laterDate}% of returns
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <FaStopwatch className="h-4 w-4 text-orange-400" />
              </div>
              With Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-100 mb-2">
              {data.withWaitDuration.toLocaleString()}
            </div>
            <div className="text-sm text-orange-300">
              {data.percentages.withTimer}% specified duration
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wait Duration Distribution */}
      <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-700/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-300 text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center">
              <FaClock className="h-5 w-5 text-cyan-400" />
            </div>
            Wait Duration Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(data.waitDurationDistribution).map(([range, count]) => (
              <div key={range} className="bg-cyan-800/20 p-4 rounded-xl border border-cyan-700/50 text-center">
                <div className="text-2xl font-bold text-cyan-300 mb-1">{count}</div>
                <p className="text-cyan-400 text-sm">{range} hours</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Average Wait Duration */}
      <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 border border-indigo-700/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-indigo-300 text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <FaStopwatch className="h-5 w-5 text-indigo-400" />
            </div>
            Wait Duration Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-800/20 p-6 rounded-xl border border-indigo-700/50 text-center">
              <div className="text-3xl font-bold text-indigo-300 mb-2">
                {data.averageWaitDuration.toFixed(1)} hours
              </div>
              <p className="text-indigo-400 text-sm">Average Wait Duration</p>
            </div>
            <div className="bg-indigo-800/20 p-6 rounded-xl border border-indigo-700/50 text-center">
              <div className="text-3xl font-bold text-indigo-300 mb-2">
                {data.totalWaitDuration.toFixed(1)} hours
              </div>
              <p className="text-indigo-400 text-sm">Total Wait Time</p>
            </div>
            <div className="bg-indigo-800/20 p-6 rounded-xl border border-indigo-700/50 text-center">
              <div className="text-3xl font-bold text-indigo-300 mb-2">
                {data.byBookingType.waitAndReturn.averageDuration.toFixed(1)} hours
              </div>
              <p className="text-indigo-400 text-sm">Wait & Return Average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wait & Return Breakdown */}
      <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-700/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-emerald-300 text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <FaChartBar className="h-5 w-5 text-emerald-400" />
            </div>
            Wait & Return Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-800/20 p-6 rounded-xl border border-emerald-700/50">
              <h4 className="text-emerald-300 font-semibold mb-4">With Specified Timer</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">Bookings with timer</span>
                  <span className="text-emerald-300 font-semibold">{data.byBookingType.waitAndReturn.withTimer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">Average duration</span>
                  <span className="text-emerald-300 font-semibold">{data.byBookingType.waitAndReturn.averageDuration.toFixed(1)} hours</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(data.byBookingType.waitAndReturn.withTimer / data.waitAndReturnBookings) * 100}%` }}
                  ></div>
                </div>
                <p className="text-emerald-400 text-xs text-center">
                  {((data.byBookingType.waitAndReturn.withTimer / data.waitAndReturnBookings) * 100).toFixed(1)}% of wait & return bookings
                </p>
              </div>
            </div>

            <div className="bg-emerald-800/20 p-6 rounded-xl border border-emerald-700/50">
              <h4 className="text-emerald-300 font-semibold mb-4">Without Specified Timer</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">Bookings without timer</span>
                  <span className="text-emerald-300 font-semibold">{data.byBookingType.waitAndReturn.withoutTimer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">Default duration</span>
                  <span className="text-emerald-300 font-semibold">Up to 12 hours</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(data.byBookingType.waitAndReturn.withoutTimer / data.waitAndReturnBookings) * 100}%` }}
                  ></div>
                </div>
                <p className="text-emerald-400 text-xs text-center">
                  {((data.byBookingType.waitAndReturn.withoutTimer / data.waitAndReturnBookings) * 100).toFixed(1)}% of wait & return bookings
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wait Timer Definitions */}
      <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/10 border border-gray-700/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-300 text-lg font-semibold">Wait Timer Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.waitTimerDefinitions).map(([key, definition]) => (
              <div key={key} className="bg-gray-800/20 p-4 rounded-xl border border-gray-700/50">
                <h4 className="text-gray-300 font-semibold mb-2 capitalize">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </h4>
                <p className="text-gray-400 text-sm">{definition}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
