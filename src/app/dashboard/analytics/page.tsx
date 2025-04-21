"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FaCar, FaUsers, FaMoneyBillWave, FaChartLine } from "react-icons/fa";

interface AnalyticsData {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const bookingsRef = collection(db, "bookings");
      const querySnapshot = await getDocs(bookingsRef);

      const bookings = querySnapshot.docs.map((doc) => doc.data());
      const completed = bookings.filter(
        (booking) => booking.status === "completed"
      );
      const pending = bookings.filter(
        (booking) => booking.status === "pending"
      );

      setAnalytics({
        totalBookings: bookings.length,
        completedBookings: completed.length,
        pendingBookings: pending.length,
        totalRevenue: completed.reduce(
          (sum, booking) => sum + (booking.price || 0),
          0
        ),
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings Card */}
        <div className="rounded-xl border border-gray-800/50 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Total Bookings
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {analytics.totalBookings}
              </p>
            </div>
            <div className="rounded-full bg-purple-600/10 p-3">
              <FaCar className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Completed Bookings Card */}
        <div className="rounded-xl border border-gray-800/50 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Completed</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {analytics.completedBookings}
              </p>
            </div>
            <div className="rounded-full bg-green-600/10 p-3">
              <FaUsers className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Pending Bookings Card */}
        <div className="rounded-xl border border-gray-800/50 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Pending</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {analytics.pendingBookings}
              </p>
            </div>
            <div className="rounded-full bg-yellow-600/10 p-3">
              <FaChartLine className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="rounded-xl border border-gray-800/50 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-white">
                ${analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-600/10 p-3">
              <FaMoneyBillWave className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-800/50 bg-gray-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-medium text-white">Booking Trends</h2>
          <div className="mt-4 h-64">
            {/* Placeholder for chart */}
            <div className="flex h-full items-center justify-center text-gray-400">
              Chart coming soon
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800/50 bg-gray-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-medium text-white">Revenue Overview</h2>
          <div className="mt-4 h-64">
            {/* Placeholder for chart */}
            <div className="flex h-full items-center justify-center text-gray-400">
              Chart coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
