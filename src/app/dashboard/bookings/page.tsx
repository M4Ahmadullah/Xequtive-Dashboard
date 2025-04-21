"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaCar,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { toast } from "sonner";
import { BookingDetailsModal } from "@/components/BookingDetailsModal";
import { Booking } from "@/types/booking";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(bookingsQuery);
      const fetchedBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];
      setBookings(fetchedBookings);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      toast.success("Booking deleted successfully");
      fetchBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
      toast.error("Failed to delete booking");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchString = searchTerm.toLowerCase();
    return (
      booking.userDetails.fullName.toLowerCase().includes(searchString) ||
      booking.userDetails.email.toLowerCase().includes(searchString) ||
      booking.journey.pickup.address.toLowerCase().includes(searchString) ||
      booking.journey.dropoff.address.toLowerCase().includes(searchString) ||
      booking.status.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-full mx-auto px-0.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => router.push("/dashboard/bookings/new")}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add New Booking
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-900/50 border border-red-800 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-900/50 rounded-lg border border-gray-800/50">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 bg-gray-900/70">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 bg-gray-900/70">
                    Journey
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 bg-gray-900/70 min-w-[180px]">
                    Date & Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 bg-gray-900/70 min-w-[180px]">
                    Vehicle
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 bg-gray-900/70 w-[80px]">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 bg-gray-900/70 w-[70px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="hover:bg-gray-800/30 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="font-medium text-white text-sm hover:text-purple-400 transition-colors text-left"
                        >
                          {booking.userDetails.fullName}
                        </button>
                        <span className="text-xs text-gray-300">
                          {booking.userDetails.email}
                        </span>
                        <span className="text-xs text-gray-300">
                          {booking.userDetails.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-green-500 mt-0.5 flex-shrink-0 w-3 h-3" />
                          <span className="text-xs text-gray-300 truncate max-w-[200px]">
                            {booking.journey.pickup.address}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0 w-3 h-3" />
                          <span className="text-xs text-gray-300 truncate max-w-[200px]">
                            {booking.journey.dropoff.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <FaClock className="text-blue-500 w-3 h-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-sm">
                            {format(
                              new Date(booking.journey.date),
                              "MMM d, yyyy"
                            )}
                          </span>
                          <span className="text-xs text-gray-300">
                            {booking.journey.time}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <FaCar className="text-purple-500 w-3 h-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-sm">
                            {booking.vehicle.type}
                          </span>
                          <div className="flex items-center text-xs text-gray-300">
                            <FaUser className="w-2.5 h-2.5 mr-1.5" />
                            <span>{booking.passengers.count} passengers</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          booking.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : booking.status === "confirmed"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : booking.status === "completed"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/bookings/${booking.id}`)
                          }
                          className="p-1 text-blue-500 hover:text-blue-400 transition-colors"
                          title="Edit booking"
                        >
                          <FaEdit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="p-1 text-red-500 hover:text-red-400 transition-colors"
                          title="Delete booking"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No bookings found</p>
              </div>
            )}
          </div>
        )}

        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </div>
    </div>
  );
}
