import { Booking } from "@/types/booking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import {
  FaUser,
  FaCar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaUsers,
  FaInfoCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";

interface BookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: Booking["status"]) => {
  switch (status) {
    case "confirmed":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "cancelled":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

const getGoogleMapsLink = (address: string) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
};

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
}: BookingDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] h-[90vh] max-w-[1400px] bg-gray-900 text-gray-100 border-gray-800">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-semibold">
                Booking Details
              </DialogTitle>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <span>Booking ID: </span>
              <span className="font-mono">{booking.id}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-purple-500" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaIdCard className="text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {booking.userDetails.fullName}
                    </div>
                    <div className="text-sm text-gray-400">Full Name</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {booking.userDetails.email}
                    </div>
                    <div className="text-sm text-gray-400">Email Address</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {booking.userDetails.phone}
                    </div>
                    <div className="text-sm text-gray-400">Phone Number</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-purple-500" />
                Journey Details
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    Pickup Location
                  </div>
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-green-500 mt-1" />
                    <div className="flex-1">
                      <span>{booking.journey.pickup.address}</span>
                      <a
                        href={getGoogleMapsLink(booking.journey.pickup.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 mt-1"
                      >
                        <FaExternalLinkAlt className="w-3 h-3" />
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    Dropoff Location
                  </div>
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-red-500 mt-1" />
                    <div className="flex-1">
                      <span>{booking.journey.dropoff.address}</span>
                      <a
                        href={getGoogleMapsLink(
                          booking.journey.dropoff.address
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 mt-1"
                      >
                        <FaExternalLinkAlt className="w-3 h-3" />
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Date and Time */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-purple-500" />
                Schedule
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Date</div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>{formatDate(booking.journey.date)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Time</div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gray-400" />
                    <span>{booking.journey.time}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle and Passengers */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCar className="text-purple-500" />
                Vehicle Details
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Vehicle Type</div>
                  <div className="flex items-center gap-2">
                    <FaCar className="text-gray-400" />
                    <span className="capitalize">{booking.vehicle.type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Passengers</div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-gray-400" />
                    <span>{booking.passengers.count} passengers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-purple-500" />
                  Special Requests
                </h3>
                <p className="text-gray-300">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
