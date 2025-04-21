"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const vehicleOptions = [
  "Standard Vehicle (1–4 Passengers)",
  "Estate (5–6 Passengers / Extra Luggage)",
  "MPV (7–8 Passengers / Extra Luggage)",
  "Executive Saloon (Mercedes E-Class, 1–3 Passengers)",
  "Executive MPV (Mercedes V-Class, 8-Seater / Extra Luggage)",
  "VIP (Mercedes S-Class)",
  "Wheelchair Accessible Vehicle",
];

export default function BookingForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    pickUpDate: "",
    pickUpTime: "",
    fromAddress: "",
    toAddress: "",
    additionalStops: "",
    passengers: 1,
    checkedLuggage: 0,
    handLuggage: 0,
    preferredVehicle: vehicleOptions[0],
    email: "",
    phone: "",
    specialRequests: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "bookings"), {
        ...formData,
        createdAt: new Date(),
      });
      alert("Booking created successfully!");
      // Reset form
      setFormData({
        fullName: "",
        pickUpDate: "",
        pickUpTime: "",
        fromAddress: "",
        toAddress: "",
        additionalStops: "",
        passengers: 1,
        checkedLuggage: 0,
        handLuggage: 0,
        preferredVehicle: vehicleOptions[0],
        email: "",
        phone: "",
        specialRequests: "",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="pickUpDate"
            className="block text-sm font-medium text-gray-700"
          >
            Pick-Up Date
          </label>
          <input
            type="date"
            name="pickUpDate"
            id="pickUpDate"
            required
            value={formData.pickUpDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="pickUpTime"
            className="block text-sm font-medium text-gray-700"
          >
            Pick-Up Time
          </label>
          <input
            type="time"
            name="pickUpTime"
            id="pickUpTime"
            required
            value={formData.pickUpTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="fromAddress"
            className="block text-sm font-medium text-gray-700"
          >
            From Address
          </label>
          <input
            type="text"
            name="fromAddress"
            id="fromAddress"
            required
            value={formData.fromAddress}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="toAddress"
            className="block text-sm font-medium text-gray-700"
          >
            To Address
          </label>
          <input
            type="text"
            name="toAddress"
            id="toAddress"
            required
            value={formData.toAddress}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="additionalStops"
            className="block text-sm font-medium text-gray-700"
          >
            Additional Stops
          </label>
          <input
            type="text"
            name="additionalStops"
            id="additionalStops"
            value={formData.additionalStops}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="passengers"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Passengers
          </label>
          <input
            type="number"
            name="passengers"
            id="passengers"
            min="1"
            required
            value={formData.passengers}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="checkedLuggage"
            className="block text-sm font-medium text-gray-700"
          >
            Checked Luggage (Large Bags)
          </label>
          <input
            type="number"
            name="checkedLuggage"
            id="checkedLuggage"
            min="0"
            required
            value={formData.checkedLuggage}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="handLuggage"
            className="block text-sm font-medium text-gray-700"
          >
            Hand Luggage (Small Bags)
          </label>
          <input
            type="number"
            name="handLuggage"
            id="handLuggage"
            min="0"
            required
            value={formData.handLuggage}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="preferredVehicle"
            className="block text-sm font-medium text-gray-700"
          >
            Preferred Vehicle
          </label>
          <select
            name="preferredVehicle"
            id="preferredVehicle"
            required
            value={formData.preferredVehicle}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {vehicleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="specialRequests"
          className="block text-sm font-medium text-gray-700"
        >
          Special Requests
        </label>
        <textarea
          name="specialRequests"
          id="specialRequests"
          rows={3}
          value={formData.specialRequests}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Booking
        </button>
      </div>
    </form>
  );
}
