"use client";

import { useState, useEffect } from "react";
import { bookingsAPI } from "@/lib/api";
import { CalendarEvent as APICalendarEvent } from "@/types/api";
import {
  Calendar,
  dayjsLocalizer,
  EventProps,
  ToolbarProps,
} from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Configure dayjs localizer for react-big-calendar
const localizer = dayjsLocalizer(dayjs);

// Define the calendar event type for react-big-calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  customer: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  resource: APICalendarEvent;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeView, setActiveView] = useState("month");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateBookings, setSelectedDateBookings] = useState<APICalendarEvent[]>([]);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<APICalendarEvent | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Function to refetch calendar events
  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const response = await bookingsAPI.getCalendarEvents(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (response.success && response.data?.events) {
        // Convert API events to calendar events
        const calendarEvents: CalendarEvent[] = response.data.events.map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          status: event.status,
          customer: event.customer.fullName,
          pickupLocation: event.pickupLocation,
          dropoffLocation: event.dropoffLocation,
          vehicleType: event.vehicleType,
          resource: event
        }));
        setEvents(calendarEvents);
      } else {
        setError('Failed to fetch calendar events');
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setError('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  // Handle date click to show bookings for that date
  const handleDateClick = (slotInfo: { start: Date }) => {
    const clickedDate = slotInfo.start;
    setSelectedDate(clickedDate);
    
    // Filter events for the clicked date
    const dateEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === clickedDate.toDateString();
    });
    
    setSelectedDateBookings(dateEvents.map(e => e.resource));
    setIsDateModalOpen(true);
  };

  // Handle booking click to show detailed modal
  const handleBookingClick = (event: CalendarEvent) => {
    setSelectedBooking(event.resource);
    setIsBookingModalOpen(true);
  };

  // Close modals
  const closeDateModal = () => {
    setIsDateModalOpen(false);
    setSelectedDate(null);
    setSelectedDateBookings([]);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBooking(null);
  };

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-alert-triangle"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Calendar</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchCalendarEvents} variant="default" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Custom event component with status color
  const EventComponent = ({ event }: EventProps<CalendarEvent>) => (
    <div className={`rbc-event-content ${getStatusClass(event.status)}`}>
      {event.title}
    </div>
  );

  // Custom toolbar that integrates with our UI components
  const CustomToolbar = ({
    label,
    onNavigate,
    onView,
  }: ToolbarProps<CalendarEvent>) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
      <div>
        <h2 className="text-xl font-semibold">{label}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <Button variant="outline" onClick={() => onNavigate("PREV")}>
          <span className="sr-only">Previous</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Button>
        <Button variant="outline" onClick={() => onNavigate("NEXT")}>
          <span className="sr-only">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Button>
        <Button
          variant={activeView === "month" ? "default" : "outline"}
          onClick={() => {
            onView("month");
            setActiveView("month");
          }}
        >
          Month
        </Button>
        <Button
          variant={activeView === "week" ? "default" : "outline"}
          onClick={() => {
            onView("week");
            setActiveView("week");
          }}
        >
          Week
        </Button>
        <Button
          variant={activeView === "day" ? "default" : "outline"}
          onClick={() => {
            onView("day");
            setActiveView("day");
          }}
        >
          Day
        </Button>
        <Button
          variant={activeView === "agenda" ? "default" : "outline"}
          onClick={() => {
            onView("agenda");
            setActiveView("agenda");
          }}
        >
          Agenda
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Booking Calendar</h1>
          <p className="text-gray-400">
            View and manage bookings through an interactive calendar. This
            dashboard allows you to visualize bookings across different time
            periods, filter by status, and monitor booking schedules.
          </p>
        </div>
      </div>

      <Card className="mb-6 bg-gray-800 border-gray-700 shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-300">
                Date Range
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="date"
                  value={dateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: new Date(e.target.value) })}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={dateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: new Date(e.target.value) })}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-300">
                Filter by Status
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeStatus === "all" ? "default" : "outline"}
                  onClick={() => setActiveStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={activeStatus === "pending" ? "default" : "outline"}
                  onClick={() => setActiveStatus("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={activeStatus === "confirmed" ? "default" : "outline"}
                  onClick={() => setActiveStatus("confirmed")}
                >
                  Confirmed
                </Button>
                <Button
                  variant={activeStatus === "in-progress" ? "default" : "outline"}
                  onClick={() => setActiveStatus("in-progress")}
                >
                  In Progress
                </Button>
                <Button
                  variant={activeStatus === "completed" ? "default" : "outline"}
                  onClick={() => setActiveStatus("completed")}
                >
                  Completed
                </Button>
                <Button
                  variant={activeStatus === "cancelled" ? "default" : "outline"}
                  onClick={() => setActiveStatus("cancelled")}
                >
                  Cancelled
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 shadow-md">
        <CardContent className="p-0 sm:p-6">
          <div className="h-[600px] sm:h-[700px] w-full">
            <style jsx global>{`
              .rbc-calendar {
                height: 100%;
                width: 100%;
                font-family: ui-sans-serif, system-ui, -apple-system,
                  BlinkMacSystemFont;
                color: #e5e7eb;
              }
              .rbc-month-view {
                border-radius: 0.5rem;
                border: 1px solid #374151;
                overflow: hidden;
              }
              .rbc-header {
                padding: 0.75rem 0;
                font-weight: 500;
                font-size: 0.875rem;
                background-color: #1f2937;
                border-bottom: 1px solid #374151;
              }
              .rbc-day-bg {
                background-color: #111827;
              }
              .rbc-off-range-bg {
                background-color: #0f172a;
              }
              .rbc-day-bg.rbc-today {
                background-color: #1e293b;
              }
              .rbc-event {
                border-radius: 0.25rem;
                padding: 0.25rem;
                font-size: 0.75rem;
                border: none;
                background-color: transparent;
              }
              .status-pending {
                background-color: rgba(245, 158, 11, 0.2);
                color: #fcd34d;
                border-left: 3px solid #f59e0b;
              }
              .status-confirmed {
                background-color: rgba(14, 165, 233, 0.2);
                color: #7dd3fc;
                border-left: 3px solid #0ea5e9;
              }
              .status-in-progress {
                background-color: rgba(99, 102, 241, 0.2);
                color: #a5b4fc;
                border-left: 3px solid #6366f1;
              }
              .status-completed {
                background-color: rgba(34, 197, 94, 0.2);
                color: #86efac;
                border-left: 3px solid #22c55e;
              }
              .status-cancelled {
                background-color: rgba(239, 68, 68, 0.2);
                color: #fca5a5;
                border-left: 3px solid #ef4444;
              }
              .rbc-time-content {
                border-top: 1px solid #374151;
              }
              .rbc-time-header-content {
                border-left: 1px solid #374151;
              }
              .rbc-time-view {
                border-radius: 0.5rem;
                border: 1px solid #374151;
                overflow: hidden;
              }
              .rbc-agenda-view {
                border-radius: 0.5rem;
                border: 1px solid #374151;
                overflow: hidden;
              }
              .rbc-timeslot-group {
                border-bottom: 1px solid #1f2937;
              }
              .rbc-time-slot {
                border-top: 1px solid #1f2937;
              }
              .rbc-day-slot .rbc-time-slot {
                border-top: 1px solid #1f2937;
              }
              .rbc-current-time-indicator {
                background-color: #8b5cf6;
              }
              .rbc-button-link {
                color: #e5e7eb;
              }
              .rbc-show-more {
                color: #8b5cf6;
                background-color: transparent;
              }
              .rbc-toolbar button {
                color: #e5e7eb;
                border: 1px solid #374151;
              }
              .rbc-toolbar button:hover {
                background-color: #1f2937;
              }
              .rbc-toolbar button.rbc-active {
                background-color: #8b5cf6;
                color: white;
              }
              .rbc-agenda-date-cell,
              .rbc-agenda-time-cell,
              .rbc-agenda-event-cell {
                border-bottom: 1px solid #374151;
              }

              @media (max-width: 640px) {
                .rbc-toolbar {
                  flex-direction: column;
                  align-items: flex-start;
                }
                .rbc-toolbar-label {
                  margin: 0.5rem 0;
                }
                .rbc-btn-group {
                  margin-bottom: 0.5rem;
                }
              }
            `}</style>

            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              components={{
                event: EventComponent,
                toolbar: CustomToolbar,
              }}
              popup
              popupOffset={{ x: 0, y: 10 }}
              onSelectEvent={(event: CalendarEvent) => {
                handleBookingClick(event);
              }}
              onSelectSlot={({ start }) => handleDateClick({ start })}
              selectable
              eventPropGetter={(event: CalendarEvent) => ({
                className: `status-${event.status.toLowerCase().replace(" ", "-")}`,
              })}
              onDrillDown={(date: Date) => {
                handleDateClick({ start: date });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="p-3 bg-yellow-800/20 border-l-4 border-yellow-500 rounded-md text-yellow-300">
          <p className="text-xs font-semibold">Pending</p>
          <p className="text-xs opacity-80">
            Booking confirmed but pending review
          </p>
        </div>
        <div className="p-3 bg-blue-800/20 border-l-4 border-blue-500 rounded-md text-blue-300">
          <p className="text-xs font-semibold">Confirmed</p>
          <p className="text-xs opacity-80">
            Booking has been reviewed and confirmed
          </p>
        </div>
        <div className="p-3 bg-indigo-800/20 border-l-4 border-indigo-500 rounded-md text-indigo-300">
          <p className="text-xs font-semibold">In Progress</p>
          <p className="text-xs opacity-80">Ride is currently in progress</p>
        </div>
        <div className="p-3 bg-green-800/20 border-l-4 border-green-500 rounded-md text-green-300">
          <p className="text-xs font-semibold">Completed</p>
          <p className="text-xs opacity-80">
            Ride has been completed successfully
          </p>
        </div>
        <div className="p-3 bg-red-800/20 border-l-4 border-red-500 rounded-md text-red-300">
          <p className="text-xs font-semibold">Cancelled</p>
          <p className="text-xs opacity-80">Booking has been cancelled</p>
        </div>
      </div>

      {/* Date Bookings Modal */}
      {isDateModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-[95vw] h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-b border-purple-700/50 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Bookings for {selectedDate.toLocaleDateString()}
                  </h2>
                  <p className="text-purple-300 mt-1">
                    {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <button
                  onClick={closeDateModal}
                  className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedDateBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectedDateBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-white text-sm">
                              #{booking.id.slice(-6)}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                booking.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Customer</p>
                            <p className="text-white font-medium text-sm">{booking.customer?.fullName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Vehicle</p>
                            <p className="text-white font-medium text-sm">{booking.vehicleType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Pickup</p>
                            <p className="text-white font-medium text-sm truncate">{booking.pickupLocation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Dropoff</p>
                            <p className="text-white font-medium text-sm truncate">{booking.dropoffLocation}</p>
                          </div>
                          
                {/* NEW: Payment Methods */}
                {booking.paymentMethods && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Payment</p>
                    <div className="flex gap-1 flex-wrap">
                      {booking.paymentMethods.cashOnArrival && (
                        <span className="px-1 py-0.5 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                          Cash
                        </span>
                      )}
                      {booking.paymentMethods.cardOnArrival && (
                        <span className="px-1 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                          Card
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Travel Information */}
                {booking.travelInformation && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Travel</p>
                    <p className="text-white font-medium text-xs">
                      {booking.travelInformation.type === 'flight' && booking.travelInformation.details?.flightNumber && (
                        `${booking.travelInformation.details.airline} ${booking.travelInformation.details.flightNumber}`
                      )}
                      {booking.travelInformation.type === 'train' && 'Train Journey'}
                      {booking.travelInformation.type === 'other' && 'Other Travel'}
                    </p>
                  </div>
                )}

                {/* Additional Stops */}
                {booking.additionalStops && booking.additionalStops.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Stops</p>
                    <p className="text-white font-medium text-xs">
                      {booking.additionalStops.length} additional stop{booking.additionalStops.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                          {/* NEW: Wait Duration for Return Bookings */}
                          {booking.bookingType === 'return' && booking.returnType === 'wait-and-return' && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Wait Duration</p>
                              <p className="text-white font-medium text-sm">
                                {booking.waitDuration ? `${booking.waitDuration}h` : 'Up to 12h'}
                              </p>
                            </div>
                          )}

                          {/* NEW: Hours for Hourly Bookings */}
                          {booking.bookingType === 'hourly' && booking.hours && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Duration</p>
                              <p className="text-white font-medium text-sm">{booking.hours}h</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-calendar-x"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <path d="M16.5 2H7.5A2.5 2 0 0 0 5 4.5v1A2.5 2 0 0 0 7.5 8h1A2.5 2 0 0 0 11 5.5V5A2.5 2 0 0 0 8.5 2H6" />
                      <path d="M18 14v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V14" />
                      <path d="M9 7h6" />
                      <path d="M9 11h6" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg font-medium">No bookings for this date</p>
                  <p className="text-gray-500 text-sm">Select another date to view bookings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {isBookingModalOpen && selectedBooking && (
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
                    {new Date(selectedBooking.start).toLocaleDateString()} at {new Date(selectedBooking.start).toLocaleTimeString()}
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
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBooking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    selectedBooking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    selectedBooking.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}
                >
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-purple-300 font-semibold mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-400">Customer Name</label>
                        <p className="text-white font-medium">{selectedBooking.customer?.fullName || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-blue-300 font-semibold mb-3">Vehicle Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-400">Vehicle Type</label>
                        <p className="text-white font-medium">{selectedBooking.vehicleType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* NEW: Payment Methods Information */}
                {selectedBooking.paymentMethods && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-green-300 font-semibold mb-3">Payment Methods</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-400">Payment Preferences</label>
                          <div className="flex gap-2 flex-wrap mt-1">
                            {selectedBooking.paymentMethods.cashOnArrival && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                                Cash on Arrival
                              </span>
                            )}
                            {selectedBooking.paymentMethods.cardOnArrival && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                                Card on Arrival
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Travel Information */}
                {selectedBooking.travelInformation && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-yellow-300 font-semibold mb-3">Travel Information</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-400">Travel Type</label>
                          <p className="text-white font-semibold capitalize">{selectedBooking.travelInformation.type || 'N/A'}</p>
                        </div>
                        {selectedBooking.travelInformation.details && (
                          <div>
                            <label className="text-sm text-gray-400">Travel Details</label>
                            <div className="space-y-1 mt-1">
                              {selectedBooking.travelInformation.details.flightNumber && (
                                <p className="text-white font-semibold text-sm">
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
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Stops */}
                {selectedBooking.additionalStops && selectedBooking.additionalStops.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-orange-300 font-semibold mb-3">Additional Stops</h3>
                      <div className="space-y-3">
                        {selectedBooking.additionalStops.map((stop: { address: string; coordinates?: { lat: number; lng: number } }, index: number) => (
                          <div key={index} className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                            <div className="flex items-center gap-2 mb-2">
                              <label className="text-sm text-gray-400">Stop {index + 1}</label>
                            </div>
                            <p className="text-white font-semibold text-sm">{stop.address}</p>
                            {stop.coordinates && (
                              <p className="text-gray-400 text-xs mt-1">
                                Lat: {stop.coordinates.lat}, Lng: {stop.coordinates.lng}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* NEW: Return Information for Return Bookings */}
                {selectedBooking.bookingType === 'return' && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-orange-300 font-semibold mb-3">Return Information</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-400">Return Type</label>
                          <p className="text-white font-medium capitalize">
                            {selectedBooking.returnType?.replace('-', ' ') || 'N/A'}
                          </p>
                        </div>
                        {selectedBooking.returnType === 'wait-and-return' && (
                          <div>
                            <label className="text-sm text-gray-400">Wait Duration</label>
                            <p className="text-white font-medium">
                              {selectedBooking.waitDuration ? `${selectedBooking.waitDuration} hours` : 'Up to 12 hours'}
                            </p>
                          </div>
                        )}
                        {selectedBooking.returnType === 'later-date' && selectedBooking.returnDate && (
                          <div>
                            <label className="text-sm text-gray-400">Return Date & Time</label>
                            <p className="text-white font-medium">
                              {selectedBooking.returnDate} {selectedBooking.returnTime && `at ${selectedBooking.returnTime}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* NEW: Duration Information for Hourly Bookings */}
                {selectedBooking.bookingType === 'hourly' && selectedBooking.hours && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-cyan-300 font-semibold mb-3">Service Duration</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-400">Duration</label>
                          <p className="text-white font-medium">{selectedBooking.hours} hours</p>
                          <p className="text-cyan-300 text-xs">Continuous service - driver stays with you</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Journey Details */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-emerald-300 font-semibold mb-3">Journey Details</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-400">Pickup Time</label>
                        <p className="text-white font-medium">
                          {new Date(selectedBooking.start).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Dropoff Time</label>
                        <p className="text-white font-medium">
                          {new Date(selectedBooking.end).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Locations */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-amber-300 font-semibold mb-3">Locations</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-400">Pickup Location</label>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium flex-1">{selectedBooking.pickupLocation}</p>
                          {selectedBooking.locations?.pickup?.googleMapsLink && (
                            <a
                              href={selectedBooking.locations.pickup.googleMapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors duration-200"
                            >
                              🗺️ Maps
                            </a>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Dropoff Location</label>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium flex-1">{selectedBooking.dropoffLocation}</p>
                          {selectedBooking.locations?.dropoff?.googleMapsLink && (
                            <a
                              href={selectedBooking.locations.dropoff.googleMapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors duration-200"
                            >
                              🗺️ Maps
                            </a>
                          )}
                        </div>
                      </div>
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

// Helper function to get status class name
function getStatusClass(status: string): string {
  return `status-${status.toLowerCase().replace(" ", "-")}`;
}
