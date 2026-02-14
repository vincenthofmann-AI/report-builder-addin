/**
 * Data Fetcher Service
 * ====================
 *
 * Unified data fetching that automatically switches between:
 * - Live MyGeotab API (when running as add-in)
 * - Mock data (when running standalone)
 *
 * Usage:
 * ```typescript
 * const fetcher = useDataFetcher();
 * const trips = await fetcher.fetchDataSource('trips');
 * ```
 */

import type { GeotabApi } from "./geotab-context";
import {
  fetchData as fetchMockData,
  type GeotabTrip,
  type GeotabFuelTransaction,
  type GeotabFault,
  type GeotabDriverBehavior,
  type GeotabMaintenanceRecord,
} from "./geotab-mock";
import { getAllDataSources } from "./categories";

// Map data source IDs to MyGeotab entity type names
const DATA_SOURCE_TO_ENTITY_TYPE: Record<string, string> = {
  trips: "Trip",
  fuel: "FuelTransaction",
  faults: "FaultData",
  // behavior and maintenance need custom logic
};

/**
 * Transform MyGeotab FaultData entity to our UI format
 */
function transformFault(fault: any, deviceName: string): GeotabFault {
  // Determine severity from fault data
  const determineSeverity = (fault: any): "Low" | "Medium" | "High" | "Critical" => {
    if (fault.malfunction || fault.malfunctionLamp) return "Critical";
    if (fault.classMILOn || fault.classProtectLampOn) return "High";
    if (fault.classAmberWarningLampOn) return "Medium";
    return "Low";
  };

  // Determine status
  const determineStatus = (fault: any): "Active" | "Resolved" | "Pending" => {
    if (fault.dismissUser) return "Resolved";
    if (fault.dateTime) {
      const faultAge = Date.now() - new Date(fault.dateTime).getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (faultAge < oneDayInMs) return "Active";
    }
    return "Pending";
  };

  return {
    id: fault.id || "",
    device: deviceName || fault.device?.name || fault.device?.id || "Unknown Device",
    dateTime: fault.dateTime || new Date().toISOString(),
    code: fault.diagnosticCode || fault.code || "UNKNOWN",
    description: fault.failureMode?.name || fault.diagnostic?.name || "Unknown Fault",
    severity: determineSeverity(fault),
    source: fault.diagnostic?.source?.name || fault.controller?.name || "Engine",
    status: determineStatus(fault),
  };
}

/**
 * Fetches data from live MyGeotab API with proper error handling
 */
async function fetchLiveData<T>(
  api: GeotabApi,
  entityType: string,
  search: Record<string, any> = {}
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    api.call<T[]>(
      "Get",
      {
        typeName: entityType,
        search,
      },
      (results) => resolve(results || []),
      (error) => {
        console.error(`Failed to fetch ${entityType}:`, error);
        reject(error);
      }
    );
  });
}

/**
 * Main data fetcher class
 */
export class DataFetcher {
  private deviceCache: Map<string, string> = new Map();
  private driverCache: Map<string, string> = new Map();
  private cacheInitialized = false;

  constructor(
    private api: GeotabApi | null,
    private isLive: boolean
  ) {}

  /**
   * Initialize device and driver caches
   */
  private async initializeCaches(): Promise<void> {
    if (this.cacheInitialized || !this.api) return;

    try {
      // Fetch all devices and drivers in parallel
      const [devices, drivers] = await Promise.all([
        fetchLiveData<any>(this.api, "Device", {}),
        fetchLiveData<any>(this.api, "User", {}),
      ]);

      // Build device cache (ID -> Name)
      devices.forEach((device: any) => {
        if (device.id && device.name) {
          this.deviceCache.set(device.id, device.name);
        }
      });

      // Build driver cache (ID -> Name)
      drivers.forEach((driver: any) => {
        if (driver.id && driver.name) {
          this.driverCache.set(driver.id, driver.name);
        }
      });

      this.cacheInitialized = true;
      console.log(`Cached ${this.deviceCache.size} devices and ${this.driverCache.size} drivers`);
    } catch (error) {
      console.error("Failed to initialize device/driver caches:", error);
      // Don't set cacheInitialized to true, so we can retry
    }
  }

  /**
   * Get device name from cache, falling back to ID
   */
  private getDeviceName(device: any): string {
    if (!device) return "Unknown Device";

    // If device is already a string (just ID)
    if (typeof device === "string") {
      return this.deviceCache.get(device) || device;
    }

    // If device is an object with id
    if (device.id) {
      return this.deviceCache.get(device.id) || device.name || device.id;
    }

    return "Unknown Device";
  }

  /**
   * Get driver name from cache, falling back to ID
   */
  private getDriverName(driver: any): string {
    if (!driver) return "Unknown Driver";

    // If driver is already a string (just ID)
    if (typeof driver === "string") {
      return this.driverCache.get(driver) || driver;
    }

    // If driver is an object with id
    if (driver.id) {
      return this.driverCache.get(driver.id) || driver.name || driver.firstName || driver.id;
    }

    return "Unknown Driver";
  }

  /**
   * Fetch data for a given data source ID
   */
  async fetchDataSource(sourceId: string): Promise<any[]> {
    // Use mock data if not in live mode
    if (!this.isLive || !this.api) {
      return fetchMockData(sourceId);
    }

    try {
      // Initialize caches on first fetch
      await this.initializeCaches();

      // Handle custom data sources
      if (sourceId === "behavior") {
        return await this.fetchDriverBehavior();
      }

      if (sourceId === "maintenance") {
        return await this.fetchMaintenance();
      }

      // Standard entity types
      const entityType = DATA_SOURCE_TO_ENTITY_TYPE[sourceId];
      if (!entityType) {
        console.warn(`Unknown data source: ${sourceId}, using mock data`);
        return fetchMockData(sourceId);
      }

      // Fetch from MyGeotab API
      const rawData = await fetchLiveData(this.api, entityType);

      // Transform to UI format with name resolution
      switch (sourceId) {
        case "trips":
          return rawData.map((trip: any) => ({
            id: trip.id || "",
            device: this.getDeviceName(trip.device),
            driver: this.getDriverName(trip.driver),
            start: trip.start || new Date().toISOString(),
            stop: trip.stop || new Date().toISOString(),
            distance: trip.distance || 0,
            drivingDuration: trip.drivingDuration || 0,
            idlingDuration: trip.idlingDuration || 0,
            maxSpeed: trip.speedMax || trip.maxSpeed || 0,
            averageSpeed: trip.averageSpeed || 0,
            stopDuration: trip.stopDuration || 0,
          }));
        case "fuel":
          return rawData.map((fuel: any) => ({
            id: fuel.id || "",
            device: this.getDeviceName(fuel.device),
            driver: this.getDriverName(fuel.driver),
            dateTime: fuel.dateTime || new Date().toISOString(),
            volume: fuel.productVolume || fuel.volume || 0,
            cost: fuel.cost || 0,
            odometer: fuel.odometer || 0,
            location: fuel.location || "Unknown Location",
          }));
        case "faults":
          return rawData.map((fault: any) => transformFault(fault, this.getDeviceName(fault.device)));
        default:
          return rawData;
      }
    } catch (error) {
      console.error(`Error fetching ${sourceId}, falling back to mock data:`, error);
      // Fallback to mock data on error
      return fetchMockData(sourceId);
    }
  }

  /**
   * Fetch driver behavior data (requires custom aggregation)
   * This combines ExceptionEvent data to build safety scores
   */
  private async fetchDriverBehavior(): Promise<GeotabDriverBehavior[]> {
    if (!this.api) return [];

    try {
      // Fetch exception events from last 30 days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);

      const exceptions = await fetchLiveData<any>(this.api, "ExceptionEvent", {
        fromDate: fromDate.toISOString(),
      });

      // Group by driver and date, aggregate events
      const behaviorMap = new Map<string, GeotabDriverBehavior>();

      exceptions.forEach((event: any) => {
        const driver = this.getDriverName(event.driver);
        const device = this.getDeviceName(event.device);
        const date = event.dateTime ? event.dateTime.split("T")[0] : new Date().toISOString().split("T")[0];
        const key = `${driver}-${date}`;

        if (!behaviorMap.has(key)) {
          behaviorMap.set(key, {
            id: key,
            device,
            driver,
            date,
            harshBraking: 0,
            harshAcceleration: 0,
            speeding: 0,
            seatbeltViolations: 0,
            safetyScore: 100,
          });
        }

        const behavior = behaviorMap.get(key)!;
        const rule = event.rule?.name?.toLowerCase() || "";

        if (rule.includes("harsh") && rule.includes("brak")) behavior.harshBraking++;
        else if (rule.includes("harsh") && rule.includes("accel")) behavior.harshAcceleration++;
        else if (rule.includes("speed")) behavior.speeding++;
        else if (rule.includes("seatbelt") || rule.includes("seat belt")) behavior.seatbeltViolations++;

        // Recalculate safety score (simple algorithm)
        const totalEvents = behavior.harshBraking + behavior.harshAcceleration + behavior.speeding + behavior.seatbeltViolations;
        behavior.safetyScore = Math.max(0, 100 - totalEvents * 5);
      });

      return Array.from(behaviorMap.values());
    } catch (error) {
      console.error("Failed to fetch driver behavior:", error);
      return [];
    }
  }

  /**
   * Fetch maintenance data (uses WorkOrder if available)
   */
  private async fetchMaintenance(): Promise<GeotabMaintenanceRecord[]> {
    if (!this.api) return [];

    try {
      // Try to fetch WorkOrder entities (may not be available in all databases)
      const workOrders = await fetchLiveData<any>(this.api, "WorkOrder", {});

      return workOrders.map((wo: any) => ({
        id: wo.id || "",
        device: this.getDeviceName(wo.device),
        dateTime: wo.createdDate || wo.dateTime || new Date().toISOString(),
        type: wo.type || "Maintenance",
        description: wo.comments || wo.description || "",
        cost: wo.cost || 0,
        odometer: wo.odometer || 0,
        provider: wo.vendor || wo.provider || "Fleet Maintenance",
        status: wo.status === "Closed" ? "Completed" : wo.status === "Open" ? "Scheduled" : "Pending",
      }));
    } catch (error) {
      // WorkOrder might not be available - return empty array
      console.warn("WorkOrder entity not available, returning empty maintenance data");
      return [];
    }
  }

  /**
   * Fetch devices (used for filters)
   */
  async fetchDevices(): Promise<any[]> {
    if (!this.isLive || !this.api) {
      const { getDevices } = await import("./geotab-mock");
      return getDevices();
    }

    try {
      return await fetchLiveData(this.api, "Device");
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    }
  }

  /**
   * Get available data sources
   */
  getDataSources() {
    return getAllDataSources();
  }
}

/**
 * Hook to create a data fetcher instance
 */
import { useMemo } from "react";
import { useGeotab } from "./geotab-context";

export function useDataFetcher() {
  const { api, isLive } = useGeotab();

  return useMemo(() => new DataFetcher(api, isLive), [api, isLive]);
}
