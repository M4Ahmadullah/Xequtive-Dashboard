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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadTimeframe, setDownloadTimeframe] = useState<string>("today");
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = useCallback(
    async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.bookings) {
            setBookings(data.data.bookings);
          }
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
    []
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/bookings?timeframe=${downloadTimeframe}&status=${activeTab !== "all" ? activeTab : ""}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.bookings) {
          // Import xlsx dynamically to avoid SSR issues
          const XLSX = await import('xlsx');
          
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(
            data.data.bookings.map((booking: BookingDetail) => ({
              'Booking ID': booking.id,
              'Customer Name': booking.customer?.fullName || 'N/A',
              'Customer Email': booking.customer?.email || 'N/A',
              'Customer Phone': booking.customer?.phone || 'N/A',
              'Status': booking.status,
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
            { wch: 15 }, // Booking ID
            { wch: 20 }, // Customer Name
            { wch: 25 }, // Customer Email
            { wch: 15 }, // Customer Phone
            { wch: 12 }, // Status
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
        }
      } else {
        setError('Failed to download bookings data');
      }
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
        booking.locations?.dropoff?.address?.toLowerCase().includes(query)
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

      {/* Enhanced Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search bookings by customer, vehicle, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-500"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div className="w-5 h-5 bg-gray-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              activeTab === "all"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
            }`}
          >
            All ({bookings.length})
          </Button>
          <Button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              activeTab === "pending"
                ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
            }`}
          >
            Pending ({bookings.filter(b => b.status === "pending").length})
          </Button>
          <Button
            onClick={() => setActiveTab("confirmed")}
            className={`px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              activeTab === "confirmed"
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
            }`}
          >
            Confirmed ({bookings.filter(b => b.status === "confirmed").length})
          </Button>
          <Button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
            }`}
          >
            Completed ({bookings.filter(b => b.status === "completed").length})
          </Button>
        </div>
      </div>

      {/* Enhanced Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="group bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 hover:border-purple-500/50 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-4 relative">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors duration-300 mb-2">
                    {booking.customer?.fullName || 'Unknown Customer'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{booking.pickupDate} • {booking.pickupTime}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 relative">
              <div className="space-y-4 mb-6">
                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-purple-400 mb-2 font-semibold uppercase tracking-wide">Journey</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">From:</span>
                      <span className="text-white">{booking.locations?.pickup?.address || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium">To:</span>
                      <span className="text-white">{booking.locations?.dropoff?.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-blue-400 mb-1 font-semibold uppercase tracking-wide">Vehicle</p>
                    <p className="text-white font-medium">{booking.vehicle?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-emerald-400 mb-1 font-semibold uppercase tracking-wide">Price</p>
                    <p className="text-white font-bold text-lg">£{booking.vehicle?.price?.amount?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-orange-400 mb-1 font-semibold uppercase tracking-wide">Distance</p>
                    <p className="text-white font-medium">{booking.journey?.distance_miles || 'N/A'} miles</p>
                  </div>
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-purple-400 mb-1 font-semibold uppercase tracking-wide">Duration</p>
                    <p className="text-white font-medium">{booking.journey?.duration_minutes || 'N/A'} min</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => openBookingModal(booking)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                >
                  View Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">No bookings found</h3>
          <p className="text-gray-400 text-lg">
            {searchQuery ? `No bookings match "${searchQuery}"` : `No ${activeTab === "all" ? "" : activeTab} bookings available`}
          </p>
        </div>
      )}

      {/* Enhanced Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-[95vw] h-[95vh] bg-gray-900 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <h2 className="text-2xl font-bold text-white">Booking Details</h2>
              <button
                onClick={closeBookingModal}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                ✕
              </button>
            </div>
            
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
                      <p className="text-white font-medium">{selectedBooking.customer?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{selectedBooking.customer?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                      <p className="text-white font-medium">{selectedBooking.customer?.phone || 'N/A'}</p>
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
                      <p className="text-white font-medium">{selectedBooking.vehicle?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Vehicle ID</label>
                      <p className="text-white font-medium">{selectedBooking.vehicle?.id || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Price</label>
                      <p className="text-white font-medium">
                        £{selectedBooking.vehicle?.price?.amount?.toLocaleString() || '0'} {selectedBooking.vehicle?.price?.currency || 'GBP'}
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
                      <label className="text-sm text-gray-400">Pickup Date & Time</label>
                      <p className="text-white font-medium">{selectedBooking.pickupDate} at {selectedBooking.pickupTime}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Distance</label>
                      <p className="text-white font-medium">{selectedBooking.journey?.distance_miles || 'N/A'} miles</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Duration</label>
                      <p className="text-white font-medium">{selectedBooking.journey?.duration_minutes || 'N/A'} minutes</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Locations */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-orange-300">Locations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Pickup Location</label>
                      <p className="text-white font-medium">{selectedBooking.locations?.pickup?.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Dropoff Location</label>
                      <p className="text-white font-medium">{selectedBooking.locations?.dropoff?.address || 'N/A'}</p>
                    </div>
                    {selectedBooking.locations?.additionalStops && selectedBooking.locations.additionalStops.length > 0 && (
                      <div>
                        <label className="text-sm text-gray-400">Additional Stops</label>
                        <div className="space-y-1">
                          {selectedBooking.locations.additionalStops.map((stop, index) => (
                            <p key={index} className="text-white text-sm">{stop.address}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Passengers */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-pink-300">Passenger Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Total Passengers</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.count || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Checked Luggage</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.checkedLuggage || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Hand Luggage</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.handLuggage || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Medium Luggage</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.mediumLuggage || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Baby Seat</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.babySeat || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Child Seat</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.childSeat || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Booster Seat</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.boosterSeat || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Wheelchair</label>
                        <p className="text-white font-medium">{selectedBooking.passengers?.wheelchair || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-cyan-300">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Special Requests</label>
                      <p className="text-white font-medium">{selectedBooking.specialRequests || 'None'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Created At</label>
                      <p className="text-white font-medium">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Last Updated</label>
                      <p className="text-white font-medium">{new Date(selectedBooking.updatedAt).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
