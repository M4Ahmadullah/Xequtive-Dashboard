"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingsAPI } from "@/lib/api";
import { BookingDetail, BookingParams } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = useCallback(
    async (params?: BookingParams) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams: BookingParams = {
          ...params,
          page: params?.page || pagination.currentPage,
          limit: pagination.limit,
          status:
            params?.status || (activeTab !== "all" ? activeTab : undefined),
          search: params?.search || searchQuery,
        };

        const response = await bookingsAPI.getAll(queryParams);

        if (response.success && response.data) {
          setBookings(response.data.bookings || []);
          const pagination = response.data.pagination;
          if (pagination) {
            setPagination((prev) => ({
              ...prev,
              total: pagination.total || 0,
              pages: pagination.pages || 0,
            }));
          }
        } else {
          setError(response.error?.message || "Failed to load bookings");
        }
      } catch {
        setError("An error occurred while fetching bookings");
      } finally {
        setLoading(false);
      }
    },
    [pagination.currentPage, pagination.limit, activeTab, searchQuery]
  );

  useEffect(() => {
    fetchBookings();
  }, [searchQuery, activeTab, pagination.currentPage, fetchBookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings({ page: 1 });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 w-full max-w-3xl text-red-300">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
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
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchBookings()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Bookings</h1>
          <p className="text-gray-400">
            View and manage your bookings. This dashboard allows you to track
            all bookings, filter by status, and search for specific bookings.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/bookings/calendar"
            className="inline-flex items-center px-4 py-2 border border-gray-800 rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900/50 hover:bg-purple-600/20 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-950 transition-colors"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings..."
            className="flex-1 px-4 py-2 border border-gray-800 rounded-xl bg-gray-900/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="bg-gray-900/60 text-gray-400 p-1 rounded-lg">
          <TabsTrigger
            value="all"
            className="hover:text-purple-400 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 rounded-lg transition-colors"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="hover:text-purple-400 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 rounded-lg transition-colors"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="confirmed"
            className="hover:text-purple-400 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 rounded-lg transition-colors"
          >
            Confirmed
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="hover:text-purple-400 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 rounded-lg transition-colors"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="hover:text-purple-400 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 rounded-lg transition-colors"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="hover:text-purple-400 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 rounded-lg transition-colors"
          >
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-gray-800 rounded-full border-t-purple-600 animate-spin"></div>
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="overflow-hidden bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm text-white hover:border-gray-700/70 transition-all shadow-md"
                >
                  <CardHeader className="bg-gray-950/70 pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white font-medium">
                          Booking #{booking.id.slice(-6)}
                        </CardTitle>
                        <p className="text-sm text-gray-400">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm text-gray-400 mb-1">Customer</h3>
                        <p className="font-medium text-white">
                          {booking.user?.fullName || "N/A"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {booking.user?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-400 mb-1">Vehicle</h3>
                        <p className="font-medium text-white">
                          {booking.vehicle.model}
                        </p>
                        <p className="text-sm text-gray-400">
                          {booking.vehicle.type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-400 mb-1">Price</h3>
                        <p className="font-medium text-white">
                          ${booking.price.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          {booking.paymentStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Link
                        href={`/dashboard/bookings/${booking.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        page === pagination.currentPage
                          ? "bg-purple-600 text-white"
                          : "bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-900/30 rounded-xl border border-gray-800/50">
              <p className="text-lg text-gray-400 mb-4">No bookings found</p>
              <button
                onClick={() => fetchBookings()}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
    case "confirmed":
      return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    case "in-progress":
      return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
    case "completed":
      return "bg-green-500/20 text-green-300 border border-green-500/30";
    case "cancelled":
      return "bg-red-500/20 text-red-300 border border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
  }
}
