"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LocationPicker } from "./LocationPicker";

const bookingSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTime: z.string().min(1, "Pickup time is required"),
  passengerName: z.string().min(1, "Passenger name is required"),
  passengerPhone: z.string().min(1, "Phone number is required"),
  passengerEmail: z.string().email("Invalid email address"),
  numberOfPassengers: z.number().min(1, "At least 1 passenger is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export interface BookingFormProps {
  onClose?: () => void;
}

const vehicleOptions = [
  "Standard Vehicle (1-4 Passengers)",
  "Estate (5-6 Passengers / Extra Luggage)",
  "MPV (7-8 Passengers / Extra Luggage)",
  "Executive Saloon (Mercedes E-Class, 1-3 Passengers)",
  "Executive MPV (Mercedes V-Class, 8-Seater / Extra Luggage)",
  "VIP (Mercedes S-Class)",
  "Wheelchair Accessible Vehicle",
];

export default function BookingForm({ onClose }: BookingFormProps) {
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(
    null
  );
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(
    null
  );
  const [pickupAddress, setPickupAddress] = useState<string>("");
  const [dropoffAddress, setDropoffAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!pickupCoords || !dropoffCoords) {
      setError("Please select both pickup and dropoff locations on the map");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "bookings"), {
        ...data,
        pickupLocation: pickupAddress,
        dropoffLocation: dropoffAddress,
        pickupCoords: {
          lat: pickupCoords[0],
          lng: pickupCoords[1],
        },
        dropoffCoords: {
          lat: dropoffCoords[0],
          lng: dropoffCoords[1],
        },
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      reset();
      setPickupCoords(null);
      setDropoffCoords(null);
      setPickupAddress("");
      setDropoffAddress("");
      onClose?.();
    } catch (error) {
      console.error("Error creating booking:", error);
      setError("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-screen bg-gray-950 text-gray-100">
      <div className="flex-1 p-6 bg-gray-900/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                {...register("pickupLocation")}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                placeholder="Select on map"
              />
              {errors.pickupLocation && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.pickupLocation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Dropoff Location
              </label>
              <input
                type="text"
                {...register("dropoffLocation")}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                placeholder="Select on map"
              />
              {errors.dropoffLocation && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.dropoffLocation.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Pickup Date
                </label>
                <input
                  type="date"
                  {...register("pickupDate")}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.pickupDate && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.pickupDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Pickup Time
                </label>
                <input
                  type="time"
                  {...register("pickupTime")}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.pickupTime && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.pickupTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Passenger Name
                </label>
                <input
                  type="text"
                  {...register("passengerName")}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.passengerName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.passengerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Passenger Email
                </label>
                <input
                  type="email"
                  {...register("passengerEmail")}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.passengerEmail && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.passengerEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Passenger Phone
                </label>
                <input
                  type="tel"
                  {...register("passengerPhone")}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.passengerPhone && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.passengerPhone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Number of Passengers
                </label>
                <input
                  type="number"
                  min="1"
                  {...register("numberOfPassengers", { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.numberOfPassengers && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.numberOfPassengers.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Vehicle Type
              </label>
              <select
                {...register("vehicleType")}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="bg-gray-800">
                  Select a vehicle type
                </option>
                {vehicleOptions.map((option) => (
                  <option key={option} value={option} className="bg-gray-800">
                    {option}
                  </option>
                ))}
              </select>
              {errors.vehicleType && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.vehicleType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/30 text-red-200 rounded-md border border-red-800/50">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-200 bg-gray-800/50 rounded-md hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600/90 text-white rounded-md hover:bg-indigo-700/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Booking..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 p-6 bg-gray-900/50 backdrop-blur-sm space-y-4">
        <h3 className="text-lg font-medium text-gray-100">
          Select Locations on Map
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">
              Pickup Location
            </h4>
            <div className="h-[300px]">
              <LocationPicker
                onLocationSelect={(lat, lng, address) => {
                  setPickupCoords([lat, lng]);
                  setValue("pickupLocation", address);
                }}
                initialPosition={pickupCoords || undefined}
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">
              Dropoff Location
            </h4>
            <div className="h-[300px]">
              <LocationPicker
                onLocationSelect={(lat, lng, address) => {
                  setDropoffCoords([lat, lng]);
                  setValue("dropoffLocation", address);
                }}
                initialPosition={dropoffCoords || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
