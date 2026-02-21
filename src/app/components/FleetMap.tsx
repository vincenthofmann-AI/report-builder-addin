/**
 * Fleet Map Component
 * ====================
 *
 * Interactive fleet tracking and simulation map.
 * Integrates with mapping API (Leaflet/Mapbox) for vehicle visualization.
 *
 * Features:
 * - Real-time vehicle tracking
 * - Playback controls for historical routes
 * - Fleet filters and search
 * - Vehicle status indicators
 * - Map controls (zoom, pan, layers)
 *
 * Based on Fleet Simulator Prototype V3 design patterns.
 */

import { useState, useCallback } from "react";
import {
  Search,
  Navigation,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Filter,
  Layers,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Truck,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { SearchInput, Checkbox, Tooltip, TooltipTrigger, TooltipContent } from "../services/zenith-adapter";
import { motion, AnimatePresence } from "motion/react";
import { LeafletMap } from "./LeafletMap";

type VehicleStatus = "active" | "idle" | "offline" | "alert";

interface Vehicle {
  id: string;
  name: string;
  driver: string;
  status: VehicleStatus;
  location: { lat: number; lng: number };
  speed: number; // km/h
  lastUpdate: Date;
}

// Mock vehicle data
const mockVehicles: Vehicle[] = [
  {
    id: "v1",
    name: "Fleet 001",
    driver: "John Smith",
    status: "active",
    location: { lat: 43.6532, lng: -79.3832 },
    speed: 65,
    lastUpdate: new Date(),
  },
  {
    id: "v2",
    name: "Fleet 002",
    driver: "Sarah Johnson",
    status: "idle",
    location: { lat: 43.6426, lng: -79.3871 },
    speed: 0,
    lastUpdate: new Date(),
  },
  {
    id: "v3",
    name: "Fleet 003",
    driver: "Mike Chen",
    status: "active",
    location: { lat: 43.6629, lng: -79.3957 },
    speed: 48,
    lastUpdate: new Date(),
  },
  {
    id: "v4",
    name: "Fleet 004",
    driver: "Emma Davis",
    status: "alert",
    location: { lat: 43.6481, lng: -79.4042 },
    speed: 85,
    lastUpdate: new Date(),
  },
  {
    id: "v5",
    name: "Fleet 005",
    driver: "Tom Wilson",
    status: "offline",
    location: { lat: 43.6555, lng: -79.3752 },
    speed: 0,
    lastUpdate: new Date(Date.now() - 3600000),
  },
];

const statusConfig: Record<
  VehicleStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  active: {
    label: "Active",
    color: "bg-[#78be20]",
    icon: CheckCircle2,
  },
  idle: {
    label: "Idle",
    color: "bg-amber-400",
    icon: Activity,
  },
  offline: {
    label: "Offline",
    color: "bg-[#94a3b8]",
    icon: AlertCircle,
  },
  alert: {
    label: "Alert",
    color: "bg-red-500",
    icon: AlertCircle,
  },
};

export function FleetMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(
    new Set(mockVehicles.map((v) => v.id))
  );
  const [statusFilters, setStatusFilters] = useState<Set<VehicleStatus>>(
    new Set(["active", "idle", "offline", "alert"])
  );
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Filter vehicles based on search and status
  const filteredVehicles = mockVehicles.filter((vehicle) => {
    const matchesSearch =
      searchQuery === "" ||
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilters.has(vehicle.status);

    return matchesSearch && matchesStatus && selectedVehicles.has(vehicle.id);
  });

  const handleToggleVehicle = useCallback((vehicleId: string) => {
    setSelectedVehicles((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) {
        next.delete(vehicleId);
      } else {
        next.add(vehicleId);
      }
      return next;
    });
  }, []);

  const handleToggleStatus = useCallback((status: VehicleStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    setSelectedVehicles(new Set(mockVehicles.map((v) => v.id)));
  };

  const handleDeselectAll = () => {
    setSelectedVehicles(new Set());
  };

  return (
    <div className="flex h-full bg-[#f0f4f8]">
      {/* Left Panel - Fleet List */}
      <AnimatePresence>
        {showControls && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-[320px] bg-white border-r border-[#e2e8f0] flex flex-col flex-shrink-0"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-3">
                <h2
                  className="text-[16px] text-[#003a63]"
                  style={{ fontWeight: 600 }}
                >
                  Fleet Vehicles
                </h2>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleSelectAll}
                        className="px-2 py-1 text-[11px] text-[#003a63] hover:bg-[#f0f4f8] rounded transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        All
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Select all vehicles</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleDeselectAll}
                        className="px-2 py-1 text-[11px] text-[#64748b] hover:bg-[#f0f4f8] rounded transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        None
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Deselect all vehicles</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <SearchInput
                  value={searchQuery}
                  onChange={(value) => setSearchQuery(value)}
                  placeholder="Search vehicles or drivers..."
                  className="w-full pl-10"
                />
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(statusConfig) as VehicleStatus[]).map((status) => {
                  const config = statusConfig[status];
                  const isActive = statusFilters.has(status);
                  const Icon = config.icon;
                  const count = mockVehicles.filter(
                    (v) => v.status === status
                  ).length;

                  return (
                    <button
                      key={status}
                      onClick={() => handleToggleStatus(status)}
                      className={`
                        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all
                        ${
                          isActive
                            ? `${config.color} text-white shadow-sm`
                            : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                        }
                      `}
                      style={{ fontWeight: 500 }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {config.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vehicle List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Truck className="w-12 h-12 text-[#cbd5e1] mb-3" />
                  <p className="text-[14px] text-[#64748b]">
                    No vehicles match your filters
                  </p>
                  <p className="text-[12px] text-[#94a3b8] mt-1">
                    Try adjusting your search or status filters
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredVehicles.map((vehicle) => {
                    const config = statusConfig[vehicle.status];
                    const isSelected = selectedVehicles.has(vehicle.id);

                    return (
                      <motion.button
                        key={vehicle.id}
                        onClick={() => handleToggleVehicle(vehicle.id)}
                        className={`
                          w-full p-3 rounded-lg text-left transition-all flex items-start gap-3
                          ${
                            isSelected
                              ? "bg-[#003a63]/[0.06] border border-[#003a63]/20"
                              : "bg-white border border-[#e2e8f0] hover:border-[#003a63]/30"
                          }
                        `}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleVehicle(vehicle.id)}
                          className="mt-0.5"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className="text-[13px] text-[#1e293b] truncate"
                              style={{ fontWeight: 600 }}
                            >
                              {vehicle.name}
                            </p>
                            <div
                              className={`w-2 h-2 rounded-full ${config.color} flex-shrink-0`}
                            />
                          </div>
                          <p className="text-[12px] text-[#64748b] truncate">
                            {vehicle.driver}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#94a3b8]">
                            <span>{vehicle.speed} km/h</span>
                            <span>•</span>
                            <span>
                              {vehicle.lastUpdate.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel Footer - Stats */}
            <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <p className="text-[#94a3b8]">Visible</p>
                  <p
                    className="text-[#003a63] text-[14px]"
                    style={{ fontWeight: 600 }}
                  >
                    {filteredVehicles.length} / {mockVehicles.length}
                  </p>
                </div>
                <div>
                  <p className="text-[#94a3b8]">Active</p>
                  <p
                    className="text-[#78be20] text-[14px]"
                    style={{ fontWeight: 600 }}
                  >
                    {
                      mockVehicles.filter((v) => v.status === "active")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Map Toolbar */}
        <div className="h-12 bg-white border-b border-[#e2e8f0] flex items-center px-4 gap-3 flex-shrink-0">
          {/* Toggle Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowControls(!showControls)}
                className="p-1.5 rounded-md hover:bg-[#f0f4f8] transition-colors"
              >
                <Filter className="w-4 h-4 text-[#64748b]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {showControls ? "Hide" : "Show"} vehicle list
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-[#e2e8f0]" />

          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-[#f0f4f8] transition-colors">
                  <SkipBack className="w-4 h-4 text-[#64748b]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Rewind</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-1.5 rounded-md transition-all ${
                    isPlaying
                      ? "bg-[#78be20] text-white"
                      : "hover:bg-[#f0f4f8] text-[#64748b]"
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isPlaying ? "Pause" : "Play"} simulation
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-[#f0f4f8] transition-colors">
                  <SkipForward className="w-4 h-4 text-[#64748b]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Fast forward</TooltipContent>
            </Tooltip>

            {/* Speed Control */}
            <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-[#f0f4f8] rounded-md">
              <span className="text-[11px] text-[#64748b]">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="text-[11px] text-[#003a63] bg-transparent border-none outline-none"
                style={{ fontWeight: 600 }}
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
              </select>
            </div>
          </div>

          <div className="flex-1" />

          {/* Map Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-[#f0f4f8] transition-colors">
                <Layers className="w-4 h-4 text-[#64748b]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Map layers</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-[#f0f4f8] transition-colors">
                <Navigation className="w-4 h-4 text-[#64748b]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Center map</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-[#f0f4f8] transition-colors">
                <Maximize2 className="w-4 h-4 text-[#64748b]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Fullscreen</TooltipContent>
          </Tooltip>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-[#e5e7eb]">
          {/* Leaflet Map */}
          <LeafletMap vehicles={filteredVehicles} />

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1 bg-white rounded-lg shadow-lg border border-[#e2e8f0] overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-[#f0f4f8] transition-colors border-b border-[#e2e8f0]">
                  <ZoomIn className="w-4 h-4 text-[#64748b]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Zoom in</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-[#f0f4f8] transition-colors">
                  <ZoomOut className="w-4 h-4 text-[#64748b]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Zoom out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
