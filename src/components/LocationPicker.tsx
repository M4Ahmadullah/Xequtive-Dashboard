"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

// Dynamically import the map component with no SSR
const ClientSideLeaflet = dynamic(
  () => import("./ClientSideLeaflet").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    ),
  }
);

export interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialPosition?: LatLngExpression;
}

export function LocationPicker({
  onLocationSelect,
  initialPosition = [51.505, -0.09],
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Force a remount when the component mounts
    setKey((prev) => prev + 1);
    return () => {
      setMounted(false);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" key={key}>
      <ClientSideLeaflet
        onLocationSelect={onLocationSelect}
        initialPosition={initialPosition}
      />
    </div>
  );
}
