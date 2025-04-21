"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import type { LatLngExpression, LeafletMouseEvent } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

export interface ClientSideLeafletProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialPosition: LatLngExpression;
}

function SearchControl({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}) {
  const map = useMap();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) {
      setSuggestions([]);
      return;
    }

    // Check if input might be coordinates
    const coordsRegex =
      /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    if (coordsRegex.test(query)) {
      const [lat, lng] = query.split(",").map(Number);
      if (lat && lng) {
        map.setView([lat, lng], 15);
        onLocationSelect(lat, lng, `${lat}, ${lng}`);
        setSuggestions([]);
        return;
      }
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "Xequtive-Dashboard/1.0",
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    map.setView([lat, lng], 15);
    onLocationSelect(lat, lng, item.display_name);
    setSearch(item.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="leaflet-top leaflet-left p-4 w-full md:w-96">
      <div className="relative">
        <div className="flex items-center bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search location or enter coordinates"
            className="w-full px-4 py-2 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none"
          />
          {loading ? (
            <span className="animate-spin mr-3 text-gray-400">
              <FaSearch className="w-4 h-4" />
            </span>
          ) : (
            <FaSearch className="w-4 h-4 mr-3 text-gray-400" />
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(item)}
                className="w-full px-4 py-2 text-left text-gray-100 hover:bg-gray-800/50 flex items-center gap-2"
              >
                <FaMapMarkerAlt className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LocationMarker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}) {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<LatLngExpression | null>(null);
  const map = useMap();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentPos: LatLngExpression = [latitude, longitude];
          setCurrentLocation(currentPos);
          map.setView(currentPos, 15);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    map.on("click", async (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      try {
        // Using Nominatim (OpenStreetMap's free geocoding service)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "Xequtive-Dashboard/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const address = data.display_name || "Unknown location";
        onLocationSelect(lat, lng, address);
      } catch (error) {
        console.error("Error fetching address:", error);
        onLocationSelect(lat, lng, "Unknown location");
      }
    });

    return () => {
      map.off("click");
    };
  }, [map, onLocationSelect]);

  return (
    <>
      {currentLocation && (
        <Marker
          position={currentLocation}
          icon={L.divIcon({
            html: '<div class="current-location-marker"></div>',
            className: "current-location-marker-container",
          })}
        />
      )}
      {position && <Marker position={position} />}
    </>
  );
}

const ClientSideLeaflet = ({
  onLocationSelect,
  initialPosition,
}: ClientSideLeafletProps) => {
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
    // Force a remount of the map component
    setMapKey((prev) => prev + 1);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .current-location-marker {
          width: 16px;
          height: 16px;
          background-color: #4f46e5;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #4f46e5;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
          }
        }
        .current-location-marker-container {
          background: none;
          border: none;
        }
        .leaflet-tile-pane {
          filter: brightness(0.6) invert(1) contrast(2) hue-rotate(180deg)
            saturate(0.7) brightness(0.8);
        }
        .leaflet-container {
          background: #1a1b1e;
          width: 100%;
          height: 100%;
        }
        .leaflet-control-attribution {
          background: rgba(26, 27, 30, 0.8) !important;
          color: #666 !important;
          backdrop-filter: blur(4px);
        }
        .leaflet-control-attribution a {
          color: #888 !important;
        }
      `}</style>
      <div className="w-full h-full relative" key={mapKey}>
        <MapContainer
          center={initialPosition}
          zoom={13}
          className="w-full h-full rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-tiles"
          />
          <SearchControl onLocationSelect={onLocationSelect} />
          <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>
    </>
  );
};

export default ClientSideLeaflet;
