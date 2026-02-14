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
  dataSources,
  fetchData as fetchMockData,
  type GeotabTrip,
  type GeotabFuelTransaction,
  type GeotabFault,
  type GeotabDriverBehavior,
  type GeotabMaintenanceRecord,
} from "./geotab-mock";

// Map data source IDs to MyGeotab entity type names
const DATA_SOURCE_TO_ENTITY_TYPE: Record<string, string> = {
  trips: "Trip",
  fuel: "FuelTransaction",
  faults: "FaultData",
  // behavior and maintenance need custom logic
};

/**
 * Transform MyGeotab Trip entity to our UI format
 */
function transformTrip(trip: any): GeotabTrip {
  return {
    id: trip.id || "",
    device: trip.device?.name || trip.device?.id || "Unknown Device",
    driver: trip.driver?.name || trip.driver?.id || "Unknown Driver",
    start: trip.start || new Date().toISOString(),
    stop: trip.stop || new Date().toISOString(),
    distance: trip.distance || 0,
    drivingDuration: trip.drivingDuration || 0,
    idlingDuration: trip.idlingDuration || 0,
    maxSpeed: trip.speedMax || trip.maxSpeed || 0,
    averageSpeed: trip.averageSpeed || 0,
    stopDuration: trip.stopDuration || 0,
  };
}

/**
 * Transform MyGeotab FuelTransaction entity to our UI format
 */
function transformFuelTransaction(fuel: any): GeotabFuelTransaction {
  return {
    id: fuel.id || "",
    device: fuel.device?.name || fuel.device?.id || "Unknown Device",
    driver: fuel.driver?.name || fuel.driver?.id || "Unknown Driver",
    dateTime: fuel.dateTime || new Date().toISOString(),
    volume: fuel.productVolume || fuel.volume || 0,
    cost: fuel.cost || 0,
    odometer: fuel.odometer || 0,
    location: fuel.location || "Unknown Location",
  };
}

/**
 * Transform MyGeotab FaultData entity to our UI format
 */
function transformFault(fault: any): GeotabFault {
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
    device: fault.device?.name || fault.device?.id || "Unknown Device",
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
 * Fetch driver behavior data (requires custom aggregation)
 * This combines ExceptionEvent data to build safety scores
 */
async function fetchDriverBehavior(api: GeotabApi): Promise<GeotabDriverBehavior[]> {
  try {
    // Fetch exception events from last 30 days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const exceptions = await fetchLiveData<any>(api, "ExceptionEvent", {
      fromDate: fromDate.toISOString(),
    });

    // Group by driver and date, aggregate events
    const behaviorMap = new Map<string, GeotabDriverBehavior>();

    exceptions.forEach((event: any) => {
      const driver = event.driver?.name || event.driver?.id || "Unknown";
      const device = event.device?.name || event.device?.id || "Unknown Device";
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
async function fetchMaintenance(api: GeotabApi): Promise<GeotabMaintenanceRecord[]> {
  try {
    // Try to fetch WorkOrder entities (may not be available in all databases)
    const workOrders = await fetchLiveData<any>(api, "WorkOrder", {});

    return workOrders.map((wo: any) => ({
      id: wo.id || "",
      device: wo.device?.name || wo.device?.id || "Unknown Device",
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
 * Main data fetcher class
 */
export class DataFetcher {
  constructor(
    private api: GeotabApi | null,
    private isLive: boolean
  ) {}

  /**
   * Fetch data for a given data source ID
   */
  async fetchDataSource(sourceId: string): Promise<any[]> {
    // Use mock data if not in live mode
    if (!this.isLive || !this.api) {
      return fetchMockData(sourceId);
    }

    try {
      // Handle custom data sources
      if (sourceId === "behavior") {
        return await fetchDriverBehavior(this.api);
      }

      if (sourceId === "maintenance") {
        return await fetchMaintenance(this.api);
      }

      // Standard entity types
      const entityType = DATA_SOURCE_TO_ENTITY_TYPE[sourceId];
      if (!entityType) {
        console.warn(`Unknown data source: ${sourceId}, using mock data`);
        return fetchMockData(sourceId);
      }

      // Fetch from MyGeotab API
      const rawData = await fetchLiveData(this.api, entityType);

      // Transform to UI format
      switch (sourceId) {
        case "trips":
          return rawData.map(transformTrip);
        case "fuel":
          return rawData.map(transformFuelTransaction);
        case "faults":
          return rawData.map(transformFault);
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
    return dataSources;
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
