import { useEffect, useRef } from "react";
import type { Map } from "mapbox-gl";
import type * as mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

interface GeocoderResult {
  place_name: string;
  center: [number, number];
}

interface GeocoderControlProps {
  map: Map;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  onResult?: (result: GeocoderResult) => void;
}

export default function GeocoderControl({
  map,
  position = "top-right",
  onResult,
}: GeocoderControlProps) {
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  useEffect(() => {
    if (!map) return;

    const geocoder = new MapboxGeocoder({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
      mapboxgl: map as unknown as typeof mapboxgl,
      marker: false,
    });

    if (onResult) {
      geocoder.on("result", (e) => {
        onResult({
          place_name: e.result.place_name,
          center: e.result.center as [number, number],
        });
      });
    }

    map.addControl(geocoder, position);
    geocoderRef.current = geocoder;

    return () => {
      if (geocoderRef.current) {
        map.removeControl(geocoderRef.current);
      }
    };
  }, [map, position, onResult]);

  return null;
}
