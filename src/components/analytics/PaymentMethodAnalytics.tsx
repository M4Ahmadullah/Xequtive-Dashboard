"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodAnalytics } from "@/types/api";
import { analyticsAPI } from "@/lib/api";
import { FaCreditCard, FaMoneyBillWave, FaChartPie, FaDollarSign } from "react-icons/fa";

interface PaymentMethodAnalyticsProps {
  startDate?: string;
  endDate?: string;
}

export default function PaymentMethodAnalyticsComponent({ startDate, endDate }: PaymentMethodAnalyticsProps) {
  const [data, setData] = useState<PaymentMethodAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await analyticsAPI.getPaymentMethodAnalytics(startDate, endDate);
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError('Failed to fetch payment method analytics');
        }
      } catch (error) {
        console.error('Error fetching payment method analytics:', error);
        setError('Failed to fetch payment method analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-gray-800 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaChartPie className="h-8 w-8 text-red-500" />
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
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FaChartPie className="h-4 w-4 text-blue-400" />
              </div>
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-100 mb-2">
              {data.total.toLocaleString()}
            </div>
            <div className="text-sm text-blue-300">
              {data.percentages.withPaymentMethods}% with payment methods
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="h-4 w-4 text-green-400" />
              </div>
              Cash on Arrival
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-100 mb-2">
              {data.byMethod.cashOnArrival}
            </div>
            <div className="text-sm text-green-300">
              {data.percentages.byMethod.cashOnArrival}% of bookings
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FaCreditCard className="h-4 w-4 text-purple-400" />
              </div>
              Card on Arrival
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-100 mb-2">
              {data.byMethod.cardOnArrival}
            </div>
            <div className="text-sm text-purple-300">
              {data.percentages.byMethod.cardOnArrival}% of bookings
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-300 text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <FaDollarSign className="h-4 w-4 text-orange-400" />
              </div>
              Both Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-100 mb-2">
              {data.byMethod.both}
            </div>
            <div className="text-sm text-orange-300">
              {data.percentages.byMethod.both}% of bookings
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Payment Method */}
      <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-700/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-emerald-300 text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <FaDollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            Revenue by Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-800/20 p-4 rounded-xl border border-emerald-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-300 mb-1">
                  {formatCurrency(data.revenue.cashOnArrival)}
                </div>
                <p className="text-emerald-400 text-sm">Cash on Arrival</p>
              </div>
            </div>
            <div className="bg-emerald-800/20 p-4 rounded-xl border border-emerald-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-300 mb-1">
                  {formatCurrency(data.revenue.cardOnArrival)}
                </div>
                <p className="text-emerald-400 text-sm">Card on Arrival</p>
              </div>
            </div>
            <div className="bg-emerald-800/20 p-4 rounded-xl border border-emerald-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-300 mb-1">
                  {formatCurrency(data.revenue.both)}
                </div>
                <p className="text-emerald-400 text-sm">Both Methods</p>
              </div>
            </div>
            <div className="bg-emerald-800/20 p-4 rounded-xl border border-emerald-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-300 mb-1">
                  {formatCurrency(data.revenue.none)}
                </div>
                <p className="text-emerald-400 text-sm">Not Specified</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Distribution by Booking Type */}
      <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 border border-indigo-700/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-indigo-300 text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <FaChartPie className="h-5 w-5 text-indigo-400" />
            </div>
            Payment Method Distribution by Booking Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(data.byBookingType).map(([bookingType, stats]) => (
              <div key={bookingType} className="bg-indigo-800/20 p-4 rounded-xl border border-indigo-700/50">
                <h4 className="text-indigo-300 font-semibold mb-3 capitalize">
                  {bookingType.replace('-', ' ')} Bookings
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-200 mb-1">{stats.cash}</div>
                    <p className="text-indigo-400 text-xs">Cash</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-200 mb-1">{stats.card}</div>
                    <p className="text-indigo-400 text-xs">Card</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-200 mb-1">{stats.both}</div>
                    <p className="text-indigo-400 text-xs">Both</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-200 mb-1">{stats.none}</div>
                    <p className="text-indigo-400 text-xs">None</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Definitions */}
      <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/10 border border-gray-700/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-300 text-lg font-semibold">Payment Method Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.paymentMethodDefinitions).map(([key, definition]) => (
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
