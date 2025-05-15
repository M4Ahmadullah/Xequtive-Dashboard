"use client";

import { useState, useEffect } from "react";
import { bookingsAPI } from "@/lib/api";
import { BookingDetail, BookingParams } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

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

  const fetchBookings = async (params?: BookingParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingsAPI.getAll({
        page: pagination.currentPage,
        limit: pagination.limit,
        status: activeTab !== "all" ? activeTab : undefined,
        search: searchQuery || undefined,
        ...params,
      });

      if (response.success && response.data) {
        setBookings(response.data.bookings);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || "Failed to load bookings");
      }
    } catch (err) {
      setError("An error occurred while fetching bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, pagination.currentPage]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 w-full max-w-3xl">
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
          onClick={() => fetchBookings()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage and view all bookings</p>
        </div>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
        <TabsList className="bg-gray-100">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Booking #{booking.id.slice(-6)}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
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
                        <h3 className="text-sm text-gray-500 mb-1">Customer</h3>
                        <p className="font-medium">
                          {booking.user?.fullName || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.user?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-500 mb-1">Vehicle</h3>
                        <p className="font-medium">{booking.vehicle.model}</p>
                        <p className="text-sm text-gray-500">
                          {booking.vehicle.type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-500 mb-1">Price</h3>
                        <p className="font-medium">
                          ${booking.price.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.paymentStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Link
                        href={`/dashboard/bookings/${booking.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-md ${
                        page === pagination.currentPage
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-600 mb-4">No bookings found</p>
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
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "in-progress":
      return "bg-indigo-100 text-indigo-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
