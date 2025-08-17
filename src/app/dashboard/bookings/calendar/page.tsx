"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingsAPI } from "@/lib/api";
import { BookingCalendarEvent } from "@/types/api";
import {
  Calendar,
  dayjsLocalizer,
  View,
  EventProps,
  ToolbarProps,
} from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Configure dayjs localizer for react-big-calendar
const localizer = dayjsLocalizer(dayjs);

// Define the calendar event type
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
  resource: BookingCalendarEvent;
}

// Simple date range picker component
interface DatePickerWithRangeProps {
  className?: string;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

function DatePickerWithRange({
  className,
  dateRange,
  onDateRangeChange,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarUI
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function BookingCalendarPage() {
  const [events, setEvents] = useState<BookingCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>("month");
  const [activeStatus, setActiveStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateBookings, setSelectedDateBookings] = useState<BookingCalendarEvent[]>([]);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingCalendarEvent | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchCalendarEvents = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    setError(null);

    try {
      // Format dates for API
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");
      const status = activeStatus !== "all" ? activeStatus : undefined;

      const response = await bookingsAPI.getCalendarEvents(
        startDate,
        endDate,
        status
      );

      if (response.success && response.data) {
        setEvents(response.data.events);
      } else {
        setError(response.error?.message || "Failed to load calendar events");
      }
    } catch (err) {
      setError("An error occurred while fetching calendar events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, activeStatus]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [dateRange, fetchCalendarEvents]);

  // Handle date click to show bookings for that date
  const handleDateClick = (date: Date) => {
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);
    
    const bookingsForDate = events.filter(event => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === clickedDate.getTime();
    });
    
    setSelectedDate(clickedDate);
    setSelectedDateBookings(bookingsForDate);
    setIsDateModalOpen(true);
  };

  // Handle booking click to show detailed modal
  const handleBookingClick = (booking: BookingCalendarEvent) => {
    setSelectedBooking(booking);
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

  // Convert BookingCalendarEvent to react-big-calendar Event format
  const calendarEvents: CalendarEvent[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    status: event.status,
    customer: event.customer,
    pickupLocation: event.pickupLocation,
    dropoffLocation: event.dropoffLocation,
    vehicleType: event.vehicleType,
    resource: event,
  }));

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
              <DatePickerWithRange
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-300">
                Filter by Status
              </h3>
              <Tabs
                value={activeStatus}
                onValueChange={setActiveStatus}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 sm:grid-cols-6 bg-gray-800 border border-gray-700">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value="confirmed"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Confirmed
                  </TabsTrigger>
                  <TabsTrigger
                    value="in-progress"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Completed
                  </TabsTrigger>
                  <TabsTrigger
                    value="cancelled"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Cancelled
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 shadow-md">
        <CardContent className="p-0 sm:p-6">
          {loading && events.length === 0 ? (
            <div className="flex items-center justify-center h-[600px]">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8">
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
              <Button onClick={fetchCalendarEvents} variant="default">
                Retry
              </Button>
            </div>
          ) : (
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
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                views={["month", "week", "day", "agenda"]}
                defaultView={activeView}
                components={{
                  event: EventComponent,
                  toolbar: CustomToolbar,
                }}
                popup
                popupOffset={{ x: 0, y: 10 }}
                onSelectEvent={(event: CalendarEvent) => {
                  handleBookingClick(event.resource);
                }}
                onSelectSlot={({ start }) => handleDateClick(start)}
                selectable
                eventPropGetter={(event: CalendarEvent) => ({
                  className: `status-${event.status.toLowerCase()}`,
                })}
                onDrillDown={(date: Date) => {
                  handleDateClick(date);
                }}
              />
            </div>
          )}
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
                      onClick={() => handleBookingClick(booking)}
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
                            <p className="text-white font-medium text-sm">{booking.customer}</p>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
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
                        <p className="text-white font-medium">{selectedBooking.customer}</p>
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
                        <p className="text-white font-medium">{selectedBooking.pickupLocation}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Dropoff Location</label>
                        <p className="text-white font-medium">{selectedBooking.dropoffLocation}</p>
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
