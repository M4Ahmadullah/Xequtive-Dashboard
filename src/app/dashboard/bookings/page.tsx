"use client";

import { useState, useEffect, useCallback } from "react";
import { BookingDetail } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, FileSpreadsheet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bookingsAPI, filterOptionsAPI } from "@/lib/api";
import { FilterOptions } from "@/types/api";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadTimeframe, setDownloadTimeframe] = useState("lastMonth");
  const [isDownloading, setIsDownloading] = useState(false);
  
  // NEW FILTER STATES
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [selectedBookingType, setSelectedBookingType] = useState<string>("all");
  const [selectedReturnType, setSelectedReturnType] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [selectedWaitDuration, setSelectedWaitDuration] = useState<string>("all");

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await filterOptionsAPI.getFilterOptions();
      if (response.success && response.data) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  const fetchBookings = useCallback(
    async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        
        // Apply filters
        if (selectedBookingType !== "all") params.bookingType = selectedBookingType;
        if (selectedReturnType !== "all") params.returnType = selectedReturnType;
        if (selectedPaymentMethod !== "all") params.paymentMethod = selectedPaymentMethod;
        if (selectedWaitDuration !== "all") params.waitDuration = selectedWaitDuration;
        if (activeTab !== "all") params.status = activeTab;
        if (searchQuery) params.search = searchQuery;

        const response = await bookingsAPI.getAllBookings(params);

        if (response.success && response.data?.bookings) {
          setBookings(response.data.bookings);
        } else {
          setError('Failed to fetch bookings');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    },
    [selectedBookingType, selectedReturnType, selectedPaymentMethod, selectedWaitDuration, activeTab, searchQuery]
  );

  useEffect(() => {
    fetchFilterOptions();
    fetchBookings();
  }, [fetchFilterOptions, fetchBookings]);

  const openBookingModal = (booking: BookingDetail) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const downloadBookingsAsExcel = async () => {
    setIsDownloading(true);
    try {
      // Import xlsx dynamically to avoid SSR issues
      const XLSX = await import('xlsx');
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(
        bookings.map((booking: BookingDetail) => ({
          'Reference Number': booking.referenceNumber,
          'Customer Name': booking.customer?.fullName || 'N/A',
          'Customer Email': booking.customer?.email || 'N/A',
          'Customer Phone': booking.customer?.phoneNumber || 'N/A',
          'Status': booking.status,
          'Booking Type': booking.bookingType || 'N/A',
          'Pickup Date': booking.pickupDate,
          'Pickup Time': booking.pickupTime,
          'Pickup Location': booking.locations?.pickup?.address || 'N/A',
          'Dropoff Location': booking.locations?.dropoff?.address || 'N/A',
          'Vehicle Type': booking.vehicle?.name || 'N/A',
          'Price': `£${booking.vehicle?.price?.amount?.toLocaleString() || '0'}`,
          'Currency': booking.vehicle?.price?.currency || 'GBP',
          'Distance (miles)': booking.journey?.distance_miles || 'N/A',
          'Duration (minutes)': booking.journey?.duration_minutes || 'N/A',
          'Passengers': booking.passengers?.count || 'N/A',
          'Special Requests': booking.specialRequests || 'N/A',
          'Created At': new Date(booking.createdAt).toLocaleString(),
          'Updated At': new Date(booking.updatedAt).toLocaleString(),
        }))
      );

      // Set column widths
      const columnWidths = [
        { wch: 15 }, // Reference Number
        { wch: 20 }, // Customer Name
        { wch: 25 }, // Customer Email
        { wch: 15 }, // Customer Phone
        { wch: 12 }, // Status
        { wch: 15 }, // Booking Type
        { wch: 15 }, // Pickup Date
        { wch: 12 }, // Pickup Time
        { wch: 30 }, // Pickup Location
        { wch: 30 }, // Dropoff Location
        { wch: 20 }, // Vehicle Type
        { wch: 12 }, // Price
        { wch: 10 }, // Currency
        { wch: 15 }, // Distance
        { wch: 15 }, // Duration
        { wch: 12 }, // Passengers
        { wch: 25 }, // Special Requests
        { wch: 20 }, // Created At
        { wch: 20 }, // Updated At
      ];

      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
      
      const fileName = `bookings_${downloadTimeframe}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error downloading bookings:', error);
      setError('Failed to download bookings data');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab !== "all" && booking.status !== activeTab) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.customer?.fullName?.toLowerCase().includes(query) ||
        booking.customer?.email?.toLowerCase().includes(query) ||
        booking.vehicle?.name?.toLowerCase().includes(query) ||
        booking.locations?.pickup?.address?.toLowerCase().includes(query) ||
        booking.locations?.dropoff?.address?.toLowerCase().includes(query) ||
        booking.referenceNumber?.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
            <CalendarIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Bookings</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border border-blue-700/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 animate-pulse"></div>
          <div className="relative p-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
              Bookings Management 📋
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Manage and track all your customer bookings. View details, update statuses, and export data for analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Excel Download Section */}
      <div className="mb-8 p-8 bg-gradient-to-r from-emerald-900/20 via-blue-900/20 to-emerald-900/20 border border-emerald-700/30 rounded-3xl backdrop-blur-sm hover:border-emerald-600/50 transition-all duration-500 transform hover:scale-[1.01]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-white" />
              </div>
              Export Bookings Data
            </h3>
            <p className="text-gray-300 text-base leading-relaxed">
              Download comprehensive booking data as an Excel spreadsheet for analysis and reporting. 
              Select your preferred timeframe and get detailed insights into your business performance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={downloadTimeframe} onValueChange={setDownloadTimeframe}>
              <SelectTrigger className="w-48 bg-gray-800/50 border-gray-600 text-white hover:border-emerald-500 transition-colors duration-300">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="today" className="hover:bg-gray-700 focus:bg-gray-700">Today</SelectItem>
                <SelectItem value="yesterday" className="hover:bg-gray-700 focus:bg-gray-700">Yesterday</SelectItem>
                <SelectItem value="lastWeek" className="hover:bg-gray-700 focus:bg-gray-700">Last Week</SelectItem>
                <SelectItem value="lastMonth" className="hover:bg-gray-700 focus:bg-gray-700">Last Month</SelectItem>
                <SelectItem value="lastQuarter" className="hover:bg-gray-700 focus:bg-gray-700">Last Quarter</SelectItem>
                <SelectItem value="lastYear" className="hover:bg-gray-700 focus:bg-gray-700">Last Year</SelectItem>
                <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={downloadBookingsAsExcel}
              disabled={isDownloading}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Generating Excel...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5 mr-3" />
                  Download Excel
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Download will include: Customer details, journey information, pricing, status, and timestamps</span>
          </div>
        </div>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="mb-8">
        <div className="flex flex-col gap-6">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search bookings by customer, vehicle, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              All ({bookings.length})
            </Button>
            <Button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "pending"
                  ? "bg-yellow-600 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </Button>
            <Button
              onClick={() => setActiveTab("confirmed")}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "confirmed"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </Button>
            <Button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "completed"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              Completed ({bookings.filter(b => b.status === 'completed').length})
            </Button>
          </div>

          {/* NEW: Advanced Filters */}
          {filterOptions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Booking Type Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Booking Type</label>
                <Select value={selectedBookingType} onValueChange={setSelectedBookingType}>
                  <SelectTrigger className="w-full bg-gray-800/50 border-gray-600 text-white hover:border-blue-500 transition-colors duration-300">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700">All Types</SelectItem>
                    {filterOptions.bookingTypes.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-gray-700 focus:bg-gray-700">
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Return Type Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Return Type</label>
                <Select value={selectedReturnType} onValueChange={setSelectedReturnType}>
                  <SelectTrigger className="w-full bg-gray-800/50 border-gray-600 text-white hover:border-blue-500 transition-colors duration-300">
                    <SelectValue placeholder="All Return Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700">All Return Types</SelectItem>
                    {filterOptions.returnTypes.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-gray-700 focus:bg-gray-700">
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Payment Method</label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger className="w-full bg-gray-800/50 border-gray-600 text-white hover:border-blue-500 transition-colors duration-300">
                    <SelectValue placeholder="All Payment Methods" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700">All Payment Methods</SelectItem>
                    {filterOptions.paymentMethods.map((method) => (
                      <SelectItem key={method} value={method} className="hover:bg-gray-700 focus:bg-gray-700">
                        {method.charAt(0).toUpperCase() + method.slice(1).replace(/([A-Z])/g, ' $1')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wait Duration Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Wait Duration</label>
                <Select value={selectedWaitDuration} onValueChange={setSelectedWaitDuration}>
                  <SelectTrigger className="w-full bg-gray-800/50 border-gray-600 text-white hover:border-blue-500 transition-colors duration-300">
                    <SelectValue placeholder="All Wait Durations" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700">All Wait Durations</SelectItem>
                    {filterOptions.waitDurationRanges.map((range) => (
                      <SelectItem key={range} value={range} className="hover:bg-gray-700 focus:bg-gray-700">
                        {range} hours
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Booking Cards - Compact Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="group bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-1 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-800/30 border-b border-blue-700/50 relative pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-white group-hover:text-blue-300 transition-colors duration-300">
                  {booking.referenceNumber || 'N/A'}
                </CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                {booking.bookingType || 'N/A'} • {booking.pickupDate} at {booking.pickupTime}
              </p>
            </CardHeader>

            {/* Compact Content - All in One Container */}
            <CardContent className="p-4 relative">
              <div className="space-y-3">
                {/* Customer Info */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-3 w-3 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{booking.customer?.fullName || 'N/A'}</p>
                    <p className="text-gray-400 text-xs truncate">{booking.customer?.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Journey Info with Google Maps */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center mt-0.5">
                    <CalendarIcon className="h-3 w-3 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-white text-xs truncate">
                        <span className="text-gray-400">From:</span> {booking.locations?.pickup?.address || 'N/A'}
                      </p>
                      {booking.locations?.pickup?.googleMapsLink && (
                        <a
                          href={booking.locations.pickup.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs"
                          title="Open in Google Maps"
                        >
                          🗺️
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-white text-xs truncate">
                        <span className="text-gray-400">To:</span> {booking.locations?.dropoff?.address || 'N/A'}
                      </p>
                      {booking.locations?.dropoff?.googleMapsLink && (
                        <a
                          href={booking.locations.dropoff.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs"
                          title="Open in Google Maps"
                        >
                          🗺️
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle & Price */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{booking.vehicle?.name || 'N/A'}</p>
                    <p className="text-emerald-300 text-sm font-bold">
                      £{booking.vehicle?.price?.amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>

                {/* Payment Methods - Compact */}
                {booking.paymentMethods && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-3 w-3 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs mb-1">Payment</p>
                      <div className="flex gap-1 flex-wrap">
                        {booking.paymentMethods.cashOnArrival && (
                          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                            Cash
                          </span>
                        )}
                        {booking.paymentMethods.cardOnArrival && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                            Card
                          </span>
                        )}
                        {!booking.paymentMethods.cashOnArrival && !booking.paymentMethods.cardOnArrival && (
                          <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded border border-gray-500/30">
                            Not Specified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Wait Duration for Return Bookings - Compact */}
                {booking.bookingType === 'return' && booking.returnType === 'wait-and-return' && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-3 w-3 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs">Wait Duration</p>
                      <p className="text-white text-sm font-semibold">
                        {booking.waitDuration ? `${booking.waitDuration}h` : 'Up to 12h'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Return Date for Later-Date Returns - Compact */}
                {booking.bookingType === 'return' && booking.returnType === 'later-date' && booking.returnDate && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-3 w-3 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs">Return Date</p>
                      <p className="text-white text-sm font-semibold">
                        {booking.returnDate} {booking.returnTime && `at ${booking.returnTime}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hours for Hourly Bookings - Compact */}
                {booking.bookingType === 'hourly' && booking.hours && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-3 w-3 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs">Duration</p>
                      <p className="text-white text-sm font-semibold">{booking.hours}h</p>
                    </div>
                  </div>
                )}

                {/* Travel Information */}
                {booking.travelInformation && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-3 w-3 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs">Travel Info</p>
                      <p className="text-white text-sm font-semibold">
                        {booking.travelInformation.type === 'flight' && booking.travelInformation.details?.flightNumber && (
                          `${booking.travelInformation.details.airline} ${booking.travelInformation.details.flightNumber}`
                        )}
                        {booking.travelInformation.type === 'train' && 'Train Journey'}
                        {booking.travelInformation.type === 'other' && 'Other Travel'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Stops */}
                {booking.locations?.additionalStops && booking.locations.additionalStops.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-3 w-3 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs">Additional Stops</p>
                      <p className="text-white text-sm font-semibold">
                        {booking.locations.additionalStops.length} stop{booking.locations.additionalStops.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Info - Distance, Duration, Passengers */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700/50">
                  <span>{booking.journey?.distance_miles || '0'} miles</span>
                  <span>{booking.journey?.duration_minutes || '0'} min</span>
                  <span>{booking.passengers?.count || '0'} pax</span>
                </div>
              </div>

              {/* View Details Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => openBookingModal(booking)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 font-medium text-sm shadow-lg hover:shadow-xl"
                >
                  View Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Enhanced Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-3xl w-[95vw] h-[95vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-blue-700/50 p-6 rounded-t-3xl backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Booking Details - {selectedBooking.referenceNumber}
                  </h2>
                  <p className="text-gray-300">
                    {selectedBooking.bookingType} • {selectedBooking.pickupDate} at {selectedBooking.pickupTime}
                  </p>
                </div>
                <button
                  onClick={closeBookingModal}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Customer Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Full Name</label>
                      <p className="text-white font-semibold">{selectedBooking.customer?.fullName || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Email</label>
                      <p className="text-white font-semibold">{selectedBooking.customer?.email || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Phone</label>
                      <p className="text-white font-semibold">{selectedBooking.customer?.phoneNumber || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Journey Details */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      Journey Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Pickup Location</label>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold flex-1">{selectedBooking.locations?.pickup?.address || 'N/A'}</p>
                        {selectedBooking.locations?.pickup?.googleMapsLink && (
                          <a
                            href={selectedBooking.locations.pickup.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors duration-200"
                          >
                            🗺️ Open Maps
                          </a>
                        )}
                      </div>
                      {selectedBooking.locations?.pickup?.coordinates && (
                        <p className="text-gray-400 text-xs mt-1">
                          Lat: {selectedBooking.locations.pickup.coordinates.lat}, Lng: {selectedBooking.locations.pickup.coordinates.lng}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Dropoff Location</label>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold flex-1">{selectedBooking.locations?.dropoff?.address || 'N/A'}</p>
                        {selectedBooking.locations?.dropoff?.googleMapsLink && (
                          <a
                            href={selectedBooking.locations.dropoff.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors duration-200"
                          >
                            🗺️ Open Maps
                          </a>
                        )}
                      </div>
                      {selectedBooking.locations?.dropoff?.coordinates && (
                        <p className="text-gray-400 text-xs mt-1">
                          Lat: {selectedBooking.locations.dropoff.coordinates.lat}, Lng: {selectedBooking.locations.dropoff.coordinates.lng}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Distance & Duration</label>
                      <p className="text-white font-semibold">
                        {selectedBooking.journey?.distance_miles || '0'} miles • {selectedBooking.journey?.duration_minutes || '0'} minutes
                      </p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Pickup Date & Time</label>
                      <p className="text-white font-semibold">
                        {selectedBooking.pickupDate} at {selectedBooking.pickupTime}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle & Pricing */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      Vehicle & Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Vehicle Type</label>
                      <p className="text-white font-semibold">{selectedBooking.vehicle?.name || 'N/A'}</p>
                      <p className="text-gray-400 text-xs mt-1">ID: {selectedBooking.vehicle?.id || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Price</label>
                      <p className="text-emerald-300 text-2xl font-bold">
                        £{selectedBooking.vehicle?.price?.amount?.toLocaleString() || '0'}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Currency: {selectedBooking.vehicle?.price?.currency || 'GBP'}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Passengers</label>
                      <p className="text-white font-semibold">{selectedBooking.passengers?.count || '0'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      Payment Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Payment Preferences</label>
                      {selectedBooking.paymentMethods ? (
                        <div className="flex gap-2 flex-wrap">
                          {selectedBooking.paymentMethods.cashOnArrival && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30">
                              Cash on Arrival
                            </span>
                          )}
                          {selectedBooking.paymentMethods.cardOnArrival && (
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30">
                              Card on Arrival
                            </span>
                          )}
                          {!selectedBooking.paymentMethods.cashOnArrival && !selectedBooking.paymentMethods.cardOnArrival && (
                            <span className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-full border border-gray-500/30">
                              Not Specified
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No payment method information available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Return Information for Return Bookings */}
                {selectedBooking.bookingType === 'return' && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-white" />
                        </div>
                        Return Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                        <label className="text-sm text-gray-400 mb-2 block">Return Type</label>
                        <p className="text-white font-semibold capitalize">
                          {selectedBooking.returnType?.replace('-', ' ') || 'N/A'}
                        </p>
                      </div>
                      {selectedBooking.returnType === 'wait-and-return' && (
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Wait Duration</label>
                          <p className="text-white font-semibold">
                            {selectedBooking.waitDuration ? `${selectedBooking.waitDuration} hours` : 'Up to 12 hours'}
                          </p>
                        </div>
                      )}
                      {selectedBooking.returnType === 'later-date' && selectedBooking.returnDate && (
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Return Date & Time</label>
                          <p className="text-white font-semibold">
                            {selectedBooking.returnDate} {selectedBooking.returnTime && `at ${selectedBooking.returnTime}`}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Duration Information for Hourly Bookings */}
                {selectedBooking.bookingType === 'hourly' && selectedBooking.hours && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-white" />
                        </div>
                        Service Duration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                        <label className="text-sm text-gray-400 mb-2 block">Duration</label>
                        <p className="text-white font-semibold">{selectedBooking.hours} hours</p>
                        <p className="text-cyan-300 text-sm">Continuous service - driver stays with you</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Luggage & Special Requirements */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      Luggage & Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Passenger Details</label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Count:</span>
                          <span className="text-white ml-2">{selectedBooking.passengers?.count || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Checked Luggage:</span>
                          <span className="text-white ml-2">{selectedBooking.passengers?.checkedLuggage || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Hand Luggage:</span>
                          <span className="text-white ml-2">{selectedBooking.passengers?.handLuggage || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Medium Luggage:</span>
                          <span className="text-white ml-2">{selectedBooking.passengers?.mediumLuggage || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Baby Seat:</span>
                          <span className="text-white ml-2">{selectedBooking.passengers?.babySeat || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Child Seat:</span>
                          <span className="text-white ml-2">{selectedBooking.passengers?.childSeat || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Booster Seat:</span>
                          <span className="text-white ml-2">{selectedBooking.passengers?.boosterSeat || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Wheelchair:</span>
                          <span className="text-white ml-2">{selectedBooking.passengers?.wheelchair || '0'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Special Requests</label>
                      <p className="text-white font-semibold">{selectedBooking.specialRequests || 'None'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Travel Information */}
                {selectedBooking.travelInformation && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-white" />
                        </div>
                        Travel Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                        <label className="text-sm text-gray-400 mb-2 block">Travel Type</label>
                        <p className="text-white font-semibold capitalize">{selectedBooking.travelInformation.type || 'N/A'}</p>
                      </div>
                      {selectedBooking.travelInformation.details && (
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Travel Details</label>
                          <div className="space-y-2">
                            {selectedBooking.travelInformation.details.flightNumber && (
                              <p className="text-white font-semibold">
                                Flight: {selectedBooking.travelInformation.details.airline} {selectedBooking.travelInformation.details.flightNumber}
                              </p>
                            )}
                            {selectedBooking.travelInformation.details.terminal && (
                              <p className="text-gray-300 text-sm">
                                Terminal: {selectedBooking.travelInformation.details.terminal}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Additional Stops */}
                {selectedBooking.locations?.additionalStops && selectedBooking.locations.additionalStops.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-white" />
                        </div>
                        Additional Stops
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedBooking.locations.additionalStops.map((stop, index) => (
                        <div key={index} className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm text-gray-400">Stop {index + 1}</label>
                            {stop.googleMapsLink && (
                              <a
                                href={stop.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors duration-200"
                              >
                                🗺️ Maps
                              </a>
                            )}
                          </div>
                          <p className="text-white font-semibold">{stop.address}</p>
                          {stop.coordinates && (
                            <p className="text-gray-400 text-xs mt-1">
                              Lat: {stop.coordinates.lat}, Lng: {stop.coordinates.lng}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Legacy Additional Stops */}
                {selectedBooking.additionalStops && selectedBooking.additionalStops.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-white" />
                        </div>
                        Additional Stops (Legacy)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedBooking.additionalStops.map((stop, index) => (
                        <div key={index} className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Stop {index + 1}</label>
                          <p className="text-white font-semibold">{stop.address}</p>
                          {stop.coordinates && (
                            <p className="text-gray-400 text-xs mt-1">
                              Lat: {stop.coordinates.lat}, Lng: {stop.coordinates.lng}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* System Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      System Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Booking ID</label>
                      <p className="text-white font-semibold text-xs font-mono">{selectedBooking.id}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Firebase ID</label>
                      <p className="text-white font-semibold text-xs font-mono">{selectedBooking.firebaseId}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">User ID</label>
                      <p className="text-white font-semibold text-xs font-mono">{selectedBooking.userId}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Waiting Time</label>
                      <p className="text-white font-semibold">{selectedBooking.waitingTime || '0'} minutes</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Created At</label>
                      <p className="text-white font-semibold">
                        {new Date(selectedBooking.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Last Updated</label>
                      <p className="text-white font-semibold">
                        {new Date(selectedBooking.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* System Metadata */}
                {selectedBooking.metadata && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-white" />
                        </div>
                        System Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Has Coordinates</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBooking.metadata.hasCoordinates 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {selectedBooking.metadata.hasCoordinates ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Has Dropoff</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBooking.metadata.hasDropoff 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {selectedBooking.metadata.hasDropoff ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Has Payment Method</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBooking.metadata.hasPaymentMethod 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {selectedBooking.metadata.hasPaymentMethod ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Is Return Booking</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBooking.metadata.isReturnBooking 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {selectedBooking.metadata.isReturnBooking ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Is Hourly Booking</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBooking.metadata.isHourlyBooking 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {selectedBooking.metadata.isHourlyBooking ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                          <label className="text-sm text-gray-400 mb-2 block">Wait and Return</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBooking.metadata.waitAndReturn 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {selectedBooking.metadata.waitAndReturn ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline Information */}
                {selectedBooking.timeline && selectedBooking.timeline.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2 xl:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-white" />
                        </div>
                        Booking Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {selectedBooking.timeline.map((event, index) => (
                          <div key={index} className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-white font-semibold capitalize">{event.status.replace('_', ' ')}</p>
                                <p className="text-gray-400 text-sm">
                                  {new Date(event.timestamp).toLocaleString()}
                                </p>
                                {event.updatedBy && (
                                  <p className="text-gray-500 text-xs mt-1">Updated by: {event.updatedBy}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
