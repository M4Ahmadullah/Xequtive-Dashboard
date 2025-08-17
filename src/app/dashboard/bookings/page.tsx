"use client";

import { useState, useEffect, useCallback } from "react";
import { BookingDetail } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarIcon, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadTimeframe, setDownloadTimeframe] = useState<string>("today");
  const [isDownloading, setIsDownloading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch real data from backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings?page=${pagination.currentPage}&limit=${pagination.limit}&status=${activeTab !== "all" ? activeTab : ""}&search=${searchQuery}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBookings(data.data.bookings || []);
            if (data.data.pagination) {
              setPagination(prev => ({
                ...prev,
                total: data.data.pagination.total || 0,
                pages: data.data.pagination.pages || 0,
              }));
            }
            setError(null);
          } else {
            setError(data.error?.message || "Failed to load bookings");
          }
        } else {
          setError("Failed to load bookings");
        }
        setError(null);
      } catch {
        setError("An error occurred while fetching bookings");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, searchQuery, pagination.limit, pagination.currentPage]
  );

  useEffect(() => {
    fetchBookings();
  }, [searchQuery, activeTab, pagination.currentPage, fetchBookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const openBookingModal = (booking: BookingDetail) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  // Function to download bookings as Excel
  const downloadBookingsAsExcel = async () => {
    setIsDownloading(true);
    try {
      // Calculate date range based on timeframe
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (downloadTimeframe) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case "yesterday":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
          break;
        case "lastWeek":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "lastMonth":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case "last3Months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          endDate = now;
          break;
        case "lastYear":
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = now;
      }

      // Fetch all bookings for the selected timeframe
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&limit=10000&status=${activeTab !== "all" ? activeTab : ""}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch bookings for download');
      }

      const data = await response.json();
      const bookings = data.success ? data.data.bookings : [];

      // Generate Excel file
      await generateExcelFile(bookings, startDate, endDate);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download bookings. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to generate Excel file
  const generateExcelFile = async (bookings: BookingDetail[], startDate: Date, endDate: Date) => {
    // Import xlsx library dynamically
    const XLSX = await import('xlsx');
    
    // Prepare data for Excel
    const excelData = bookings.map(booking => ({
      'Booking ID': booking.id,
      'Status': booking.status,
      'Customer Name': booking.customer?.fullName || 'N/A',
      'Customer Email': booking.customer?.email || 'N/A',
      'Customer Phone': booking.customer?.phone || 'N/A',
      'Pickup Date': booking.pickupDate,
      'Pickup Time': booking.pickupTime,
      'Pickup Location': booking.locations?.pickup?.address || 'N/A',
      'Dropoff Location': booking.locations?.dropoff?.address || 'N/A',
      'Vehicle Type': booking.vehicle.name,
      'Vehicle ID': booking.vehicle.id,
      'Price Amount': booking.vehicle.price.amount,
      'Price Currency': booking.vehicle.price.currency,
      'Passengers Count': booking.passengers?.count || 0,
      'Checked Luggage': booking.passengers?.checkedLuggage || 0,
      'Hand Luggage': booking.passengers?.handLuggage || 0,
      'Distance (Miles)': booking.journey?.distance_miles || 0,
      'Duration (Minutes)': booking.journey?.duration_minutes || 0,
      'Special Requests': booking.specialRequests || 'N/A',
      'Created At': new Date(booking.createdAt).toLocaleString(),
      'Updated At': new Date(booking.updatedAt).toLocaleString(),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Booking ID
      { wch: 12 }, // Status
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Customer Email
      { wch: 15 }, // Customer Phone
      { wch: 12 }, // Pickup Date
      { wch: 10 }, // Pickup Time
      { wch: 30 }, // Pickup Location
      { wch: 30 }, // Dropoff Location
      { wch: 15 }, // Vehicle Type
      { wch: 12 }, // Vehicle ID
      { wch: 12 }, // Price Amount
      { wch: 10 }, // Price Currency
      { wch: 15 }, // Passengers Count
      { wch: 15 }, // Checked Luggage
      { wch: 15 }, // Hand Luggage
      { wch: 15 }, // Distance
      { wch: 15 }, // Duration
      { wch: 25 }, // Special Requests
      { wch: 20 }, // Created At
      { wch: 20 }, // Updated At
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    // Generate filename with timeframe
    const timeframeLabel = downloadTimeframe === 'today' ? 'Today' :
                          downloadTimeframe === 'yesterday' ? 'Yesterday' :
                          downloadTimeframe === 'lastWeek' ? 'LastWeek' :
                          downloadTimeframe === 'lastMonth' ? 'LastMonth' :
                          downloadTimeframe === 'last3Months' ? 'Last3Months' :
                          downloadTimeframe === 'lastYear' ? 'LastYear' : 'Custom';
    
    const filename = `Xequtive_Bookings_${timeframeLabel}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
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

      {/* Download Section */}
      <div className="mb-6 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Export Bookings Data</h3>
            <p className="text-gray-300 text-sm">
              Download comprehensive booking data as an Excel spreadsheet for analysis and reporting
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={downloadTimeframe} onValueChange={setDownloadTimeframe}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="today" className="text-white hover:bg-gray-700">Today</SelectItem>
                <SelectItem value="yesterday" className="text-white hover:bg-gray-700">Yesterday</SelectItem>
                <SelectItem value="lastWeek" className="text-white hover:bg-gray-700">Last Week</SelectItem>
                <SelectItem value="lastMonth" className="text-white hover:bg-gray-700">Last Month</SelectItem>
                <SelectItem value="last3Months" className="text-white hover:bg-gray-700">Last 3 Months</SelectItem>
                <SelectItem value="lastYear" className="text-white hover:bg-gray-700">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={downloadBookingsAsExcel}
              disabled={isDownloading}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Excel
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Customer details & contact information</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Journey details & pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Vehicle & passenger information</span>
          </div>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 hover:border-purple-500/50 hover:shadow-xl transition-all duration-300 group"
                >
                  <CardHeader className="bg-gradient-to-r from-gray-950/90 to-gray-900/70 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white font-semibold group-hover:text-purple-300 transition-colors">
                          #{booking.id.slice(-6)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {booking.pickupTime || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="space-y-3">
                      <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                        <h3 className="text-xs text-purple-400 mb-1 font-semibold uppercase tracking-wide">Customer</h3>
                        <p className="font-medium text-white text-sm truncate">
                          {booking.customer?.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {booking.customer?.email || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                        <h3 className="text-xs text-blue-400 mb-1 font-semibold uppercase tracking-wide">Vehicle</h3>
                        <p className="font-medium text-white text-sm truncate">
                          {booking.vehicle.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          £{booking.vehicle.price.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => openBookingModal(booking)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all duration-300 transform hover:scale-105 font-medium text-sm"
                      >
                        View Details
                      </button>
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

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-[95vw] h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-b border-purple-700/50 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Booking #{selectedBooking.id}
                  </h2>
                  <p className="text-purple-300 mt-1">
                    {new Date(selectedBooking.createdAt).toLocaleDateString()} at {selectedBooking.pickupTime}
                  </p>
                </div>
                <button
                  onClick={closeBookingModal}
                  className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-purple-300">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Full Name</label>
                      <p className="text-white font-medium">{selectedBooking.customer?.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{selectedBooking.customer?.email || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                      <p className="text-white font-medium">{selectedBooking.customer?.phone || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-blue-300">Vehicle Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Vehicle Type</label>
                      <p className="text-white font-medium">{selectedBooking.vehicle.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Vehicle ID</label>
                      <p className="text-white font-medium">{selectedBooking.vehicle.id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Price</label>
                      <p className="text-white font-medium">
                        £{selectedBooking.vehicle.price.amount.toLocaleString()} {selectedBooking.vehicle.price.currency}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Journey Details */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-emerald-300">Journey Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Pickup Date</label>
                      <p className="text-white font-medium">{selectedBooking.pickupDate}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Pickup Time</label>
                      <p className="text-white font-medium">{selectedBooking.pickupTime}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Distance</label>
                      <p className="text-white font-medium">{selectedBooking.journey?.distance_miles || "N/A"} miles</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Duration</label>
                      <p className="text-white font-medium">{selectedBooking.journey?.duration_minutes || "N/A"} minutes</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Locations */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-amber-300">Locations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Pickup Location</label>
                      <p className="text-white font-medium">{selectedBooking.locations?.pickup?.address || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Dropoff Location</label>
                      <p className="text-white font-medium">{selectedBooking.locations?.dropoff?.address || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Passengers */}
                <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-cyan-300">Passenger & Luggage Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Passengers</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.count || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Checked Luggage</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.checkedLuggage || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Hand Luggage</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.handLuggage || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Baby Seat</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.babySeat || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-orange-300">Special Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white">{selectedBooking.specialRequests}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
