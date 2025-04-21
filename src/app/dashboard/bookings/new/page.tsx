"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, getDocs, GeoPoint } from "firebase/firestore";
import { db } from "@/lib/firebase";
import dynamic from "next/dynamic";
import { FaArrowLeft, FaClock } from "react-icons/fa";
import { toast, Toaster } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import LocationPicker dynamically to avoid SSR issues
const LocationPicker = dynamic(
  () => import("@/components/LocationPicker").then((mod) => mod.LocationPicker),
  { ssr: false }
);

interface FirebaseUser {
  id: string;
  fullName: string;
  email: string;
}

const vehicleTypes = [
  {
    value: "Executive MPV",
    label: "Executive MPV",
    description:
      "Luxury 6-7 seater vehicle perfect for group travel with extra luggage space. Mercedes V-Class or similar.",
  },
  {
    value: "Executive Saloon",
    label: "Executive Saloon",
    description:
      "Premium 4-door sedan ideal for business travel. Mercedes E-Class, BMW 5 Series or similar.",
  },
  {
    value: "Standard MPV",
    label: "Standard MPV",
    description:
      "Comfortable 6-7 seater vehicle suitable for families and groups. VW Sharan or similar.",
  },
  {
    value: "Standard Saloon",
    label: "Standard Saloon",
    description:
      "Reliable 4-door sedan for comfortable travel. VW Passat, Skoda Superb or similar.",
  },
  {
    value: "Luxury MPV",
    label: "Luxury MPV",
    description:
      "Top-tier 6-7 seater with premium features and maximum comfort. Mercedes V-Class AMG Line or similar.",
  },
  {
    value: "Luxury Saloon",
    label: "Luxury Saloon",
    description:
      "High-end sedan with superior comfort and amenities. Mercedes S-Class, BMW 7 Series or similar.",
  },
];

// Update the countries array to ensure unique codes
const countries = [
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1_us", flag: "🇺🇸" }, // Made unique
  { name: "Canada", code: "+1_ca", flag: "🇨🇦" }, // Made unique
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Ireland", code: "+353", flag: "🇮🇪" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Austria", code: "+43", flag: "🇦🇹" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Finland", code: "+358", flag: "🇫🇮" },
  { name: "Poland", code: "+48", flag: "🇵🇱" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Qatar", code: "+974", flag: "🇶🇦" },
  { name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
];

interface FormData {
  // User Information
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;

  // Pickup Details
  pickupLocation: string;
  pickupCoords: { lat: number; lng: number };
  pickupSelected: boolean;

  // Dropoff Details
  dropoffLocation: string;
  dropoffCoords: { lat: number; lng: number };
  dropoffSelected: boolean;

  // Journey Details
  date: string;
  time: string;
  additionalStops: string;

  // Passenger & Luggage
  passengers: number;
  checkedLuggage: number;
  handLuggage: number;

  // Vehicle & Special Requests
  vehicleType: string;
  specialRequests: string;

  // Booking Status
  status: "pending";
  createdAt: Date;
}

const initialFormData: FormData = {
  // User Information
  userId: "",
  fullName: "",
  email: "",
  phone: "",
  countryCode: "+44", // Default to UK

  // Pickup Details
  pickupLocation: "",
  pickupCoords: { lat: 51.5074, lng: -0.1278 },
  pickupSelected: false,

  // Dropoff Details
  dropoffLocation: "",
  dropoffCoords: { lat: 51.5074, lng: -0.1278 },
  dropoffSelected: false,

  // Journey Details
  date: "",
  time: "",
  additionalStops: "",

  // Passenger & Luggage
  passengers: 1,
  checkedLuggage: 0,
  handLuggage: 0,

  // Vehicle & Special Requests
  vehicleType: "",
  specialRequests: "",

  // Booking Status
  status: "pending",
  createdAt: new Date(),
};

export default function NewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            pickupLat: position.coords.latitude,
            pickupLng: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // Fetch users from Firebase
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FirebaseUser[];
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const validateForm = () => {
    if (!formData.userId) {
      toast.error("Please select a user");
      return false;
    }
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in all contact information");
      return false;
    }
    if (!formData.date || !formData.time) {
      toast.error("Please select pickup date and time");
      return false;
    }
    if (!formData.pickupLocation || !formData.pickupSelected) {
      toast.error("Please select a pickup location from the map");
      return false;
    }
    if (!formData.dropoffLocation || !formData.dropoffSelected) {
      toast.error("Please select a dropoff location from the map");
      return false;
    }
    if (!formData.vehicleType) {
      toast.error("Please select a vehicle type");
      return false;
    }
    if (formData.passengers < 1) {
      toast.error("Please specify at least 1 passenger");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create the booking data structure
      const bookingData = {
        // User Information
        userId: formData.userId,
        userDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.countryCode.split("_")[0] + " " + formData.phone,
        },

        // Journey Details
        journey: {
          pickup: {
            address: formData.pickupLocation,
            coordinates: formData.pickupCoords,
            geopoint: new GeoPoint(
              formData.pickupCoords.lat,
              formData.pickupCoords.lng
            ),
          },
          dropoff: {
            address: formData.dropoffLocation,
            coordinates: formData.dropoffCoords,
            geopoint: new GeoPoint(
              formData.dropoffCoords.lat,
              formData.dropoffCoords.lng
            ),
          },
          additionalStops: formData.additionalStops,
          date: formData.date,
          time: formData.time,
        },

        // Passenger Details
        passengers: {
          count: formData.passengers,
          luggage: {
            checked: formData.checkedLuggage,
            hand: formData.handLuggage,
          },
        },

        // Vehicle & Special Requests
        vehicle: {
          type: formData.vehicleType,
        },
        specialRequests: formData.specialRequests,

        // Booking Status
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "bookings"), bookingData);
      toast.success("Booking created successfully!");
      router.push("/dashboard/bookings");
    } catch (error) {
      console.error("Error adding booking:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add phone validation
  const validatePhoneNumber = (phone: string) => {
    // Basic international phone number format: +XX XXXXXXXXXX
    const phoneRegex = /^\+\d{1,4}\s\d{6,14}$/;
    return phoneRegex.test(phone);
  };

  // Get minimum date (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Toaster position="top-right" theme="dark" />
      <div className="max-w-[98%] mx-auto px-1 pt-0 pb-10">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Bookings
          </button>
          <h1 className="text-3xl font-bold text-gray-100">New Booking</h1>
        </div>

        <div className="space-y-3">
          {/* Booking Details Section - Full Width */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-800/50">
            <h2 className="text-2xl font-semibold mb-6 text-gray-100">
              Booking Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  User
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gray-800/50 text-gray-100 border-gray-700/50 hover:bg-gray-800/70 hover:text-gray-100"
                    >
                      {formData.userId
                        ? users.find((u) => u.id === formData.userId)?.email
                        : "Select user"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto bg-gray-800 border-gray-700">
                    {users.map((user) => (
                      <DropdownMenuItem
                        key={user.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            userId: user.id,
                            fullName: user.fullName || "",
                            email: user.email || "",
                          }));
                        }}
                        className="text-gray-100 hover:bg-gray-700 hover:text-gray-100 cursor-pointer"
                      >
                        {user.email}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 text-gray-100 border-gray-700/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 text-gray-100 border-gray-700/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Phone
                  </Label>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[140px] justify-start bg-gray-800/50 text-gray-100 border-gray-700/50 hover:bg-gray-800/70 hover:text-gray-100"
                        >
                          {
                            countries.find(
                              (c) => c.code === formData.countryCode
                            )?.flag
                          }{" "}
                          {
                            countries
                              .find((c) => c.code === formData.countryCode)
                              ?.code.split("_")[0]
                          }
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="max-h-[300px] overflow-y-auto bg-gray-800 border-gray-700">
                        {countries.map((country) => (
                          <DropdownMenuItem
                            key={country.code}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                countryCode: country.code,
                              }));
                            }}
                            className="text-gray-100 hover:bg-gray-700 hover:text-gray-100 cursor-pointer"
                          >
                            {country.flag} {country.name} (
                            {country.code.split("_")[0]})
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^\d]/g, "");
                        setFormData((prev) => ({
                          ...prev,
                          phone: cleaned,
                        }));
                      }}
                      placeholder="1234567890"
                      className="flex-1 bg-gray-800/50 text-gray-100 border-gray-700/50"
                      required
                    />
                  </div>
                  {formData.phone &&
                    !validatePhoneNumber(
                      formData.countryCode.split("_")[0] + " " + formData.phone
                    ) && (
                      <p className="text-sm text-red-400">
                        Please enter a valid phone number
                      </p>
                    )}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Pick-Up Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800/50 text-gray-100 border-gray-700/50 hover:bg-gray-800/70 hover:text-gray-100",
                          !formData.date && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date
                          ? format(new Date(formData.date), "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                      <Calendar
                        mode="single"
                        selected={
                          formData.date ? new Date(formData.date) : undefined
                        }
                        onSelect={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: date ? format(date, "yyyy-MM-dd") : "",
                          }))
                        }
                        disabled={(date) => date < today}
                        initialFocus
                        className="bg-gray-800 text-gray-100"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Pick-Up Time
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800/50 text-gray-100 border-gray-700/50 hover:bg-gray-800/70 hover:text-gray-100",
                          !formData.time && "text-gray-400"
                        )}
                      >
                        <FaClock className="mr-2 h-4 w-4" />
                        {formData.time
                          ? format(
                              new Date(`2000-01-01T${formData.time}`),
                              "h:mm a"
                            )
                          : "Select time"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 bg-gray-800 border-gray-700">
                      <div className="grid gap-2 h-[300px] overflow-y-auto pr-2">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const times = ["00", "30"].map((minute) => {
                            const timeString = `${hour
                              .toString()
                              .padStart(2, "0")}:${minute}`;
                            const displayTime = format(
                              new Date(`2000-01-01T${timeString}`),
                              "h:mm a"
                            );
                            return (
                              <Button
                                key={timeString}
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start text-left font-normal text-gray-100 hover:bg-gray-700/50 hover:text-white",
                                  formData.time === timeString
                                    ? "bg-gray-700 text-white"
                                    : ""
                                )}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    time: timeString,
                                  }));
                                }}
                              >
                                {displayTime}
                              </Button>
                            );
                          });
                          return times;
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Additional Stops */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  Additional Stops
                </Label>
                <textarea
                  value={formData.additionalStops}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalStops: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-md bg-gray-800/50 text-gray-100 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                  placeholder="Enter any additional stops..."
                />
              </div>

              {/* Passengers and Luggage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Number of Passengers
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.passengers}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        passengers: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-gray-800/50 text-gray-100 border-gray-700/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Checked Luggage (Large Bags)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.checkedLuggage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkedLuggage: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-gray-800/50 text-gray-100 border-gray-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Hand Luggage (Small Bags)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.handLuggage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        handLuggage: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-gray-800/50 text-gray-100 border-gray-700/50"
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  Preferred Vehicle
                </Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicleType: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full bg-gray-800/50 text-gray-100 border-gray-700/50 h-auto py-3">
                    <SelectValue>
                      {formData.vehicleType && (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {
                              vehicleTypes.find(
                                (v) => v.value === formData.vehicleType
                              )?.label
                            }
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {vehicleTypes.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-gray-100 focus:bg-gray-700 focus:text-gray-100"
                      >
                        <div className="flex flex-col py-2">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-sm text-gray-400 mt-1">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  Additional Needs / Special Requests
                </Label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specialRequests: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-md bg-gray-800/50 text-gray-100 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                  placeholder="e.g. child seat, booster seat, wheelchair assistance etc."
                />
              </div>

              {/* Maps Section - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-800/50">
                  <h2 className="text-xl font-semibold mb-2 text-gray-100">
                    Pickup Location
                  </h2>
                  <div className="h-[500px] rounded-lg overflow-hidden mb-2">
                    <LocationPicker
                      onLocationSelect={(
                        lat: number,
                        lng: number,
                        address: string
                      ) => {
                        setFormData((prev) => ({
                          ...prev,
                          pickupLocation: address,
                          pickupCoords: { lat, lng },
                          pickupSelected: true,
                        }));
                      }}
                      initialPosition={[
                        formData.pickupCoords.lat,
                        formData.pickupCoords.lng,
                      ]}
                    />
                  </div>
                  <Input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pickupLocation: e.target.value,
                      }))
                    }
                    placeholder="Enter pickup address"
                    className="w-full bg-gray-800/50 text-gray-100 border-gray-700/50"
                  />
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-800/50">
                  <h2 className="text-xl font-semibold mb-2 text-gray-100">
                    Dropoff Location
                  </h2>
                  <div className="h-[500px] rounded-lg overflow-hidden mb-2">
                    <LocationPicker
                      onLocationSelect={(
                        lat: number,
                        lng: number,
                        address: string
                      ) => {
                        setFormData((prev) => ({
                          ...prev,
                          dropoffLocation: address,
                          dropoffCoords: { lat, lng },
                          dropoffSelected: true,
                        }));
                      }}
                      initialPosition={[
                        formData.dropoffCoords.lat,
                        formData.dropoffCoords.lng,
                      ]}
                    />
                  </div>
                  <Input
                    type="text"
                    value={formData.dropoffLocation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dropoffLocation: e.target.value,
                      }))
                    }
                    placeholder="Enter dropoff address"
                    className="w-full bg-gray-800/50 text-gray-100 border-gray-700/50"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-10">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-20 py-2 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-4 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100 shadow-xl hover:shadow-purple-500/20 min-w-[350px]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Creating Your Booking...
                    </span>
                  ) : (
                    "Create New Booking"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
