/**
 * Leaflet Map Integration
 * =======================
 *
 * React wrapper for Leaflet map with vehicle markers.
 * Provides real-time vehicle tracking visualization.
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue with Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Configure default marker icons
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type VehicleStatus = "active" | "idle" | "offline" | "alert";

interface Vehicle {
  id: string;
  name: string;
  driver: string;
  status: VehicleStatus;
  location: { lat: number; lng: number };
  speed: number;
  lastUpdate: Date;
}

interface LeafletMapProps {
  vehicles: Vehicle[];
  center?: [number, number];
  zoom?: number;
}

const statusColors: Record<VehicleStatus, string> = {
  active: "#78be20", // Geotab lime green
  idle: "#f59e0b", // Amber
  offline: "#94a3b8", // Gray
  alert: "#ef4444", // Red
};

export function LeafletMap({
  vehicles,
  center = [43.6532, -79.3832], // Toronto default
  zoom = 13,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView(center, zoom);

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const currentMarkers = markersRef.current;

    // Track which vehicle IDs are in the new data
    const newVehicleIds = new Set(vehicles.map((v) => v.id));

    // Remove markers for vehicles that are no longer in the list
    currentMarkers.forEach((marker, id) => {
      if (!newVehicleIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers for current vehicles
    vehicles.forEach((vehicle) => {
      const existingMarker = currentMarkers.get(vehicle.id);
      const latLng: L.LatLngExpression = [
        vehicle.location.lat,
        vehicle.location.lng,
      ];

      if (existingMarker) {
        // Update existing marker position
        existingMarker.setLatLng(latLng);
      } else {
        // Create custom icon based on status
        const icon = L.divIcon({
          className: "custom-vehicle-marker",
          html: `
            <div style="
              background-color: ${statusColors[vehicle.status]};
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              position: relative;
            ">
              ${
                vehicle.status === "active"
                  ? `<div style="
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 6px;
                  height: 6px;
                  background: white;
                  border-radius: 50%;
                "></div>`
                  : ""
              }
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        // Create marker with popup
        const marker = L.marker(latLng, { icon })
          .addTo(map)
          .bindPopup(
            `
            <div style="font-family: system-ui, sans-serif; min-width: 200px;">
              <div style="font-size: 14px; font-weight: 600; color: #003a63; margin-bottom: 8px;">
                ${vehicle.name}
              </div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                <strong>Driver:</strong> ${vehicle.driver}
              </div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                <strong>Status:</strong>
                <span style="
                  display: inline-block;
                  background: ${statusColors[vehicle.status]};
                  color: white;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-weight: 500;
                  margin-left: 4px;
                ">
                  ${vehicle.status}
                </span>
              </div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                <strong>Speed:</strong> ${vehicle.speed} km/h
              </div>
              <div style="font-size: 11px; color: #94a3b8;">
                Last updated: ${vehicle.lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          `
          );

        currentMarkers.set(vehicle.id, marker);
      }
    });

    // Auto-fit bounds if we have vehicles
    if (vehicles.length > 0) {
      const bounds = L.latLngBounds(
        vehicles.map((v) => [v.location.lat, v.location.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [vehicles]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}
