"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyticsAPI } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<{
    mostBooked: string;
    distribution: {
      name: string;
      percentage: number;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    async function fetchVehicleData() {
      setLoading(true);
      setError(null);

      try {
        const response = await analyticsAPI.getOverview(period);

        if (response.success && response.data) {
          setVehicles(response.data.vehicles);
        } else {
          setError(response.error?.message || "Failed to load vehicle data");
        }
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        setError("An error occurred while fetching vehicle data");
      } finally {
        setLoading(false);
      }
    }

    fetchVehicleData();
  }, [period]);

  // Function to get color for vehicle types
  function getVehicleColor(type: string): string {
    const colors: Record<string, string> = {
      "Standard Saloon": "#6366F1", // Indigo
      VIP: "#A855F7", // Purple
      Executive: "#8B5CF6", // Purple/Violet
      SUV: "#3B82F6", // Blue
      Premium: "#EC4899", // Pink
      Minibus: "#9333EA", // Purple/Violet
    };

    return colors[type] || "#6B7280"; // Default gray
  }

  // Return custom gradient styling for vehicle card
  function getVehicleGradient(type: string): string {
    const baseColor = getVehicleColor(type);
    return `linear-gradient(135deg, ${baseColor}20 0%, transparent 100%)`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
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
        <Button
          onClick={() => window.location.reload()}
          variant="default"
          className="bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!vehicles) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-lg text-gray-400 mb-4">No vehicle data available</p>
        <Button
          onClick={() => window.location.reload()}
          variant="default"
          className="bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicles</h1>
          <p className="text-gray-400">Manage and monitor your vehicle fleet</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="fleet"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Fleet
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-700 shadow-md md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">
                  Vehicle Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {vehicles.distribution && vehicles.distribution.length > 0 ? (
                    <div className="space-y-6">
                      {vehicles.distribution.map((item) => (
                        <div key={item.name} className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{
                              backgroundColor: getVehicleColor(item.name),
                            }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-gray-200">
                                {item.name}
                              </span>
                              <span className="text-gray-300">
                                {item.percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: getVehicleColor(item.name),
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">
                        No vehicle distribution data available
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700 shadow-md">
              <CardHeader>
                <CardTitle className="text-white">
                  Most Booked Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex flex-col items-center justify-center text-center gap-4 py-8 rounded-lg"
                  style={{
                    background: getVehicleGradient(vehicles.mostBooked),
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                    style={{
                      backgroundColor: getVehicleColor(vehicles.mostBooked),
                    }}
                  >
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {vehicles.mostBooked}
                    </h3>
                    <p className="text-gray-400 mt-1">
                      Most popular vehicle type
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Fleet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-white">
                <p className="text-gray-500">
                  Fleet management features coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-white">
                <p className="text-gray-500">
                  Maintenance scheduling features coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
