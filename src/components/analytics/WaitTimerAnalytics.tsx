"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaitTimerAnalytics } from "@/types/api";
import { analyticsAPI } from "@/lib/api";

export default function WaitTimerAnalyticsComponent() {
  const [data, setData] = useState<WaitTimerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWaitTimerAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const response = await analyticsAPI.getWaitTimerAnalytics();
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError('Failed to fetch wait timer analytics');
        }
      } catch (error) {
        console.error('Error fetching wait timer analytics:', error);
        setError('Failed to load wait timer analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchWaitTimerAnalytics();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            Wait Timer Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            Wait Timer Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-400">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          Wait Timer Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
            <label className="text-sm text-gray-400 mb-2 block">Total Return Bookings</label>
            <p className="text-white font-bold text-2xl">{data.totalReturnBookings}</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
            <label className="text-sm text-gray-400 mb-2 block">Wait & Return</label>
            <p className="text-white font-bold text-2xl">{data.waitAndReturnBookings}</p>
            <p className="text-purple-400 text-sm">{data.percentages.waitAndReturn}%</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
            <label className="text-sm text-gray-400 mb-2 block">Later Date</label>
            <p className="text-white font-bold text-2xl">{data.laterDateBookings}</p>
            <p className="text-blue-400 text-sm">{data.percentages.laterDate}%</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
            <label className="text-sm text-gray-400 mb-2 block">Avg Wait Duration</label>
            <p className="text-white font-bold text-2xl">{data.averageWaitDuration}h</p>
          </div>
        </div>

        {/* Wait Duration Distribution */}
        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
          <h3 className="text-white font-semibold mb-4">Wait Duration Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(data.waitDurationDistribution).map(([range, count]) => (
              <div key={range} className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-400 font-bold text-lg">{range}</span>
                </div>
                <p className="text-white font-semibold">{count}</p>
                <p className="text-gray-400 text-sm">bookings</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wait Timer Usage */}
        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
          <h3 className="text-white font-semibold mb-4">Wait Timer Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-400 font-bold text-lg">✓</span>
              </div>
              <p className="text-white font-semibold text-xl">{data.withWaitDuration}</p>
              <p className="text-gray-400 text-sm">With Timer</p>
              <p className="text-green-400 text-xs">{data.percentages.withTimer}%</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-400 font-bold text-lg">?</span>
              </div>
              <p className="text-white font-semibold text-xl">{data.withoutWaitDuration}</p>
              <p className="text-gray-400 text-sm">Without Timer</p>
              <p className="text-orange-400 text-xs">{data.percentages.withoutTimer}%</p>
            </div>
          </div>
        </div>

        {/* Wait Duration Stats */}
        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
          <h3 className="text-white font-semibold mb-4">Wait Duration Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Wait Duration</span>
              <span className="text-purple-400 font-semibold">{data.averageWaitDuration} hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Wait Duration</span>
              <span className="text-purple-400 font-semibold">{data.totalWaitDuration} hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Wait & Return Bookings</span>
              <span className="text-purple-400 font-semibold">{data.waitAndReturnBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Later Date Bookings</span>
              <span className="text-blue-400 font-semibold">{data.laterDateBookings}</span>
            </div>
          </div>
        </div>

        {/* Booking Type Breakdown */}
        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
          <h3 className="text-white font-semibold mb-4">Wait Timer Usage by Booking Type</h3>
          <div className="space-y-4">
            <div className="border-b border-gray-600/50 pb-3">
              <h4 className="text-gray-300 font-medium mb-2">Wait & Return Bookings</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-green-400 font-semibold">{data.byBookingType.waitAndReturn.withTimer}</p>
                  <p className="text-gray-500 text-xs">With Timer</p>
                </div>
                <div className="text-center">
                  <p className="text-orange-400 font-semibold">{data.byBookingType.waitAndReturn.withoutTimer}</p>
                  <p className="text-gray-500 text-xs">Without Timer</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-400 font-semibold">{data.byBookingType.waitAndReturn.averageDuration}h</p>
                  <p className="text-gray-500 text-xs">Avg Duration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}