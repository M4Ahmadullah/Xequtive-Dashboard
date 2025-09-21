"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodAnalytics } from "@/types/api";
import { analyticsAPI } from "@/lib/api";

export default function PaymentMethodAnalyticsComponent() {
  const [data, setData] = useState<PaymentMethodAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaymentMethodAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const response = await analyticsAPI.getPaymentMethodAnalytics();
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError('Failed to fetch payment method analytics');
        }
      } catch (error) {
        console.error('Error fetching payment method analytics:', error);
        setError('Failed to load payment method analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentMethodAnalytics();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
              </svg>
            </div>
            Payment Method Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
              </svg>
            </div>
            Payment Method Analytics
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
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
          Payment Method Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
            <label className="text-sm text-gray-400 mb-2 block">Total Bookings</label>
            <p className="text-white font-bold text-2xl">{data.total}</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
            <label className="text-sm text-gray-400 mb-2 block">With Payment Methods</label>
            <p className="text-white font-bold text-2xl">{data.withPaymentMethods}</p>
            <p className="text-green-400 text-sm">{data.percentages.withPaymentMethods}%</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
            <label className="text-sm text-gray-400 mb-2 block">Without Payment Methods</label>
            <p className="text-white font-bold text-2xl">{data.withoutPaymentMethods}</p>
            <p className="text-red-400 text-sm">{data.percentages.withoutPaymentMethods}%</p>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
          <h3 className="text-white font-semibold mb-4">Payment Method Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-400 font-bold text-lg">£</span>
              </div>
              <p className="text-white font-semibold">{data.byMethod.cashOnArrival}</p>
              <p className="text-gray-400 text-sm">Cash on Arrival</p>
              <p className="text-green-400 text-xs">{data.percentages.byMethod.cashOnArrival}%</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-400 font-bold text-lg">💳</span>
              </div>
              <p className="text-white font-semibold">{data.byMethod.cardOnArrival}</p>
              <p className="text-gray-400 text-sm">Card on Arrival</p>
              <p className="text-blue-400 text-xs">{data.percentages.byMethod.cardOnArrival}%</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-400 font-bold text-lg">💰</span>
              </div>
              <p className="text-white font-semibold">{data.byMethod.both}</p>
              <p className="text-gray-400 text-sm">Both Methods</p>
              <p className="text-purple-400 text-xs">{data.percentages.byMethod.both}%</p>
            </div>
          </div>
        </div>

        {/* Revenue by Payment Method */}
        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
          <h3 className="text-white font-semibold mb-4">Revenue by Payment Method</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cash on Arrival</span>
              <span className="text-green-400 font-semibold">£{data.revenue.cashOnArrival.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Card on Arrival</span>
              <span className="text-blue-400 font-semibold">£{data.revenue.cardOnArrival.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Both Methods</span>
              <span className="text-purple-400 font-semibold">£{data.revenue.both.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Not Specified</span>
              <span className="text-gray-400 font-semibold">£{data.revenue.none.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Booking Type Breakdown */}
        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
          <h3 className="text-white font-semibold mb-4">Payment Methods by Booking Type</h3>
          <div className="space-y-4">
            {Object.entries(data.byBookingType).map(([type, stats]) => (
              <div key={type} className="border-b border-gray-600/50 pb-3 last:border-b-0">
                <h4 className="text-gray-300 font-medium capitalize mb-2">{type.replace('-', ' ')}</h4>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-green-400 font-semibold">{stats.cash}</p>
                    <p className="text-gray-500 text-xs">Cash</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-400 font-semibold">{stats.card}</p>
                    <p className="text-gray-500 text-xs">Card</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-400 font-semibold">{stats.both}</p>
                    <p className="text-gray-500 text-xs">Both</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 font-semibold">{stats.none}</p>
                    <p className="text-gray-500 text-xs">None</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}