// Mock Geotab API service simulating the MyGeotab SDK
// In a real Geotab Add-In, the `api` object is injected by the platform
//
// ZENITH INTEGRATION NOTE:
// When @geotab/zenith is installed, replace the mock api with:
//   import { createGeotabClient } from '@geotab/zenith';
//   const client = createGeotabClient({ database: 'your_db', server: 'my.geotab.com' });
// Then use client.call() instead of geotabApi.call() below.

import {
  createGeotabClient,
  registerAddIn,
  type ZenithApiConfig,
  ZENITH_IS_STUB,
} from "./zenith-adapter";
import type { GeotabApi } from "./geotab-context";

export interface GeotabDevice {
  id: string;
  name: string;
  serialNumber: string;
  vehicleIdentificationNumber: string;
  licensePlate: string;
  deviceType: string;
  groups: string[];
}

export interface GeotabTrip {
  id: string;
  device: string;
  driver: string;
  start: string;
  stop: string;
  distance: number;
  drivingDuration: number;
  idlingDuration: number;
  maxSpeed: number;
  averageSpeed: number;
  stopDuration: number;
}

export interface GeotabFuelTransaction {
  id: string;
  device: string;
  driver: string;
  dateTime: string;
  volume: number;
  cost: number;
  odometer: number;
  location: string;
}

export interface GeotabDriverBehavior {
  id: string;
  device: string;
  driver: string;
  date: string;
  harshBraking: number;
  harshAcceleration: number;
  speeding: number;
  seatbeltViolations: number;
  safetyScore: number;
}

export interface GeotabFault {
  id: string;
  device: string;
  dateTime: string;
  code: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  source: string;
  status: "Active" | "Resolved" | "Pending";
}

export interface GeotabMaintenanceRecord {
  id: string;
  device: string;
  dateTime: string;
  type: string;
  description: string;
  cost: number;
  odometer: number;
  provider: string;
  status: "Scheduled" | "Completed" | "Overdue";
}

// Data Source definitions
export interface DataSourceDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: ColumnDef[];
}

export interface ColumnDef {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "enum";
  filterable: boolean;
  sortable: boolean;
  aggregatable: boolean;
  enumValues?: string[];
}

const devices: GeotabDevice[] = [
  { id: "d1", name: "Truck 101", serialNumber: "G9-ABC-1234", vehicleIdentificationNumber: "1HGBH41JXMN109186", licensePlate: "ABC 1234", deviceType: "GO9", groups: ["Heavy Duty"] },
  { id: "d2", name: "Van 202", serialNumber: "G9-DEF-5678", vehicleIdentificationNumber: "2HGBH41JXMN209286", licensePlate: "DEF 5678", deviceType: "GO9", groups: ["Light Duty"] },
  { id: "d3", name: "Truck 303", serialNumber: "G9-GHI-9012", vehicleIdentificationNumber: "3HGBH41JXMN309386", licensePlate: "GHI 9012", deviceType: "GO9", groups: ["Heavy Duty"] },
  { id: "d4", name: "Sedan 404", serialNumber: "G9-JKL-3456", vehicleIdentificationNumber: "4HGBH41JXMN409486", licensePlate: "JKL 3456", deviceType: "GO9", groups: ["Sales Fleet"] },
  { id: "d5", name: "Van 505", serialNumber: "G9-MNO-7890", vehicleIdentificationNumber: "5HGBH41JXMN509586", licensePlate: "MNO 7890", deviceType: "GO9", groups: ["Light Duty"] },
  { id: "d6", name: "Truck 606", serialNumber: "G9-PQR-1122", vehicleIdentificationNumber: "6HGBH41JXMN609686", licensePlate: "PQR 1122", deviceType: "GO9+", groups: ["Heavy Duty"] },
  { id: "d7", name: "SUV 707", serialNumber: "G9-STU-3344", vehicleIdentificationNumber: "7HGBH41JXMN709786", licensePlate: "STU 3344", deviceType: "GO9", groups: ["Sales Fleet"] },
  { id: "d8", name: "Van 808", serialNumber: "G9-VWX-5566", vehicleIdentificationNumber: "8HGBH41JXMN809886", licensePlate: "VWX 5566", deviceType: "GO9+", groups: ["Light Duty"] },
];

const drivers = ["John Smith", "Maria Garcia", "James Wilson", "Sarah Johnson", "Robert Brown", "Emily Davis", "Michael Lee", "Jennifer Taylor"];

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

function generateTrips(): GeotabTrip[] {
  const trips: GeotabTrip[] = [];
  for (let i = 0; i < 50; i++) {
    const deviceIdx = i % devices.length;
    const driverIdx = i % drivers.length;
    const distance = Math.round((Math.random() * 300 + 20) * 10) / 10;
    const avgSpeed = Math.round((Math.random() * 60 + 30) * 10) / 10;
    const maxSpeed = Math.round(avgSpeed + Math.random() * 40);
    const drivingDuration = Math.round(distance / avgSpeed * 60);
    const idlingDuration = Math.round(Math.random() * 30);
    trips.push({
      id: `trip-${i + 1}`,
      device: devices[deviceIdx]!.name,
      driver: drivers[driverIdx]!,
      start: randomDate(new Date("2026-01-01"), new Date("2026-02-14")),
      stop: randomDate(new Date("2026-01-01"), new Date("2026-02-14")),
      distance,
      drivingDuration,
      idlingDuration,
      maxSpeed,
      averageSpeed: avgSpeed,
      stopDuration: Math.round(Math.random() * 60),
    });
  }
  return trips.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

function generateFuelTransactions(): GeotabFuelTransaction[] {
  const locations = ["Shell - Main St", "Petro-Canada - Hwy 401", "Esso - Industrial Blvd", "Costco Gas - Commerce Dr", "Circle K - Airport Rd"];
  const transactions: GeotabFuelTransaction[] = [];
  for (let i = 0; i < 40; i++) {
    const deviceIdx = i % devices.length;
    transactions.push({
      id: `fuel-${i + 1}`,
      device: devices[deviceIdx]!.name,
      driver: drivers[i % drivers.length]!,
      dateTime: randomDate(new Date("2026-01-01"), new Date("2026-02-14")),
      volume: Math.round((Math.random() * 150 + 30) * 10) / 10,
      cost: Math.round((Math.random() * 250 + 40) * 100) / 100,
      odometer: Math.round(Math.random() * 100000 + 20000),
      location: locations[i % locations.length]!,
    });
  }
  return transactions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
}

function generateDriverBehavior(): GeotabDriverBehavior[] {
  const records: GeotabDriverBehavior[] = [];
  for (let i = 0; i < 40; i++) {
    records.push({
      id: `db-${i + 1}`,
      device: devices[i % devices.length]!.name,
      driver: drivers[i % drivers.length]!,
      date: randomDate(new Date("2026-01-01"), new Date("2026-02-14")),
      harshBraking: Math.floor(Math.random() * 8),
      harshAcceleration: Math.floor(Math.random() * 6),
      speeding: Math.floor(Math.random() * 10),
      seatbeltViolations: Math.floor(Math.random() * 3),
      safetyScore: Math.round((Math.random() * 30 + 70) * 10) / 10,
    });
  }
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateMaintenance(): GeotabMaintenanceRecord[] {
  const types = ["Oil Change", "Tire Rotation", "Brake Inspection", "Transmission Service", "Air Filter Replacement", "Battery Check", "Coolant Flush"];
  const providers = ["Fleet Service Center", "AutoPro Garage", "National Fleet Maintenance", "QuickLube Express"];
  const statuses: GeotabMaintenanceRecord["status"][] = ["Scheduled", "Completed", "Overdue"];
  const records: GeotabMaintenanceRecord[] = [];
  for (let i = 0; i < 35; i++) {
    records.push({
      id: `maint-${i + 1}`,
      device: devices[i % devices.length]!.name,
      dateTime: randomDate(new Date("2025-10-01"), new Date("2026-02-14")),
      type: types[i % types.length]!,
      description: `${types[i % types.length]} for ${devices[i % devices.length]!.name}`,
      cost: Math.round((Math.random() * 500 + 50) * 100) / 100,
      odometer: Math.round(Math.random() * 100000 + 20000),
      provider: providers[i % providers.length]!,
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
    });
  }
  return records.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
}

function generateFaults(): GeotabFault[] {
  const faultCodes = [
    { code: "P0301", description: "Cylinder 1 Misfire Detected", source: "Engine" },
    { code: "P0420", description: "Catalyst System Efficiency Below Threshold", source: "Emissions" },
    { code: "P0171", description: "System Too Lean (Bank 1)", source: "Fuel System" },
    { code: "P0442", description: "Evaporative Emission System Leak Detected (small)", source: "Emissions" },
    { code: "P0128", description: "Coolant Thermostat Below Operating Temperature", source: "Cooling" },
    { code: "U0100", description: "Lost Communication with ECM/PCM", source: "Communication" },
    { code: "P0562", description: "System Voltage Low", source: "Electrical" },
    { code: "P0700", description: "Transmission Control System Malfunction", source: "Transmission" },
  ];
  const severities: GeotabFault["severity"][] = ["Low", "Medium", "High", "Critical"];
  const statuses: GeotabFault["status"][] = ["Active", "Resolved", "Pending"];
  const faults: GeotabFault[] = [];
  for (let i = 0; i < 30; i++) {
    const fault = faultCodes[i % faultCodes.length]!;
    faults.push({
      id: `fault-${i + 1}`,
      device: devices[i % devices.length]!.name,
      dateTime: randomDate(new Date("2026-01-01"), new Date("2026-02-14")),
      code: fault.code,
      description: fault.description,
      severity: severities[Math.floor(Math.random() * severities.length)]!,
      source: fault.source,
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
    });
  }
  return faults.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
}

// Cached data
const tripData = generateTrips();
const fuelData = generateFuelTransactions();
const behaviorData = generateDriverBehavior();
const faultData = generateFaults();
const maintenanceData = generateMaintenance();

// ============================================================================
// Live API Bridge
// ============================================================================
// When running inside MyGeotab, the real api object is injected via lifecycle
// hooks. These helpers let components gradually switch from mock to live data.

let liveApi: GeotabApi | null = null;

/** Called by GeotabProvider when the MyGeotab lifecycle fires */
export function setLiveApi(api: GeotabApi) {
  liveApi = api;
}

/** Returns the live API if available, null otherwise */
export function getLiveApi(): GeotabApi | null {
  return liveApi;
}

/** true when a real MyGeotab API is connected */
export function isLiveMode(): boolean {
  return liveApi !== null;
}

/**
 * Promise-based wrapper for Geotab api.call().
 * Uses real API when running in MyGeotab, falls back to mock.
 *
 * @example
 * ```ts
 * const trips = await callApi<Trip[]>("Get", { typeName: "Trip" });
 * ```
 */
export async function callApi<T = unknown>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  if (liveApi) {
    return new Promise<T>((resolve, reject) => {
      liveApi!.call<T>(method, params, resolve, reject);
    });
  }
  // Fall back to mock
  const result = await geotabApi.call(method, params);
  return result as T;
}

/**
 * Promise-based wrapper for Geotab api.multiCall().
 */
export async function multiCallApi(
  calls: Array<[string, Record<string, unknown>?]>
): Promise<unknown[]> {
  if (liveApi) {
    return new Promise<unknown[]>((resolve, reject) => {
      liveApi!.multiCall(calls, resolve, reject);
    });
  }
  // Fall back to mock
  return calls.map(() => null);
}

export const dataSources: DataSourceDef[] = [
  {
    id: "trips",
    name: "Trip History",
    description: "Vehicle trip data including distance, duration, and speed metrics",
    icon: "MapPin",
    columns: [
      { key: "device", label: "Vehicle", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "driver", label: "Driver", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "start", label: "Start Time", type: "date", filterable: true, sortable: true, aggregatable: false },
      { key: "stop", label: "End Time", type: "date", filterable: true, sortable: true, aggregatable: false },
      { key: "distance", label: "Distance (km)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "drivingDuration", label: "Driving (min)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "idlingDuration", label: "Idling (min)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "maxSpeed", label: "Max Speed (km/h)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "averageSpeed", label: "Avg Speed (km/h)", type: "number", filterable: true, sortable: true, aggregatable: true },
    ],
  },
  {
    id: "fuel",
    name: "Fuel Transactions",
    description: "Fuel purchase records including volume, cost, and location",
    icon: "Fuel",
    columns: [
      { key: "device", label: "Vehicle", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "driver", label: "Driver", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "dateTime", label: "Date/Time", type: "date", filterable: true, sortable: true, aggregatable: false },
      { key: "volume", label: "Volume (L)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "cost", label: "Cost ($)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "odometer", label: "Odometer (km)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "location", label: "Location", type: "string", filterable: true, sortable: true, aggregatable: false },
    ],
  },
  {
    id: "behavior",
    name: "Driver Behavior",
    description: "Safety scores and driving event summaries per driver",
    icon: "Shield",
    columns: [
      { key: "device", label: "Vehicle", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "driver", label: "Driver", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "date", label: "Date", type: "date", filterable: true, sortable: true, aggregatable: false },
      { key: "harshBraking", label: "Harsh Braking", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "harshAcceleration", label: "Harsh Acceleration", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "speeding", label: "Speeding Events", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "seatbeltViolations", label: "Seatbelt Violations", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "safetyScore", label: "Safety Score", type: "number", filterable: true, sortable: true, aggregatable: true },
    ],
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Vehicle maintenance schedules and service records",
    icon: "Wrench",
    columns: [
      { key: "device", label: "Vehicle", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "dateTime", label: "Date/Time", type: "date", filterable: true, sortable: true, aggregatable: false },
      { key: "type", label: "Service Type", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "description", label: "Description", type: "string", filterable: false, sortable: false, aggregatable: false },
      { key: "cost", label: "Cost ($)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "odometer", label: "Odometer (km)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { key: "provider", label: "Provider", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "status", label: "Status", type: "enum", filterable: true, sortable: true, aggregatable: false, enumValues: ["Scheduled", "Completed", "Overdue"] },
    ],
  },
  {
    id: "faults",
    name: "Engine Faults",
    description: "Diagnostic trouble codes and fault event records",
    icon: "AlertTriangle",
    columns: [
      { key: "device", label: "Vehicle", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "dateTime", label: "Date/Time", type: "date", filterable: true, sortable: true, aggregatable: false },
      { key: "code", label: "Fault Code", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "description", label: "Description", type: "string", filterable: true, sortable: false, aggregatable: false },
      { key: "severity", label: "Severity", type: "enum", filterable: true, sortable: true, aggregatable: false, enumValues: ["Low", "Medium", "High", "Critical"] },
      { key: "source", label: "Source", type: "string", filterable: true, sortable: true, aggregatable: false },
      { key: "status", label: "Status", type: "enum", filterable: true, sortable: true, aggregatable: false, enumValues: ["Active", "Resolved", "Pending"] },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetchData(sourceId: string): Record<string, any>[] {
  switch (sourceId) {
    case "trips": return tripData;
    case "fuel": return fuelData;
    case "behavior": return behaviorData;
    case "maintenance": return maintenanceData;
    case "faults": return faultData;
    default: return [];
  }
}

export function getDevices(): GeotabDevice[] {
  return devices;
}

// Simulate Geotab API call pattern
export const geotabApi = {
  call: async (method: string, params?: Record<string, unknown>) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    switch (method) {
      case "Get":
        if (params?.typeName === "Device") return devices;
        if (params?.typeName === "Trip") return tripData;
        if (params?.typeName === "FuelTransaction") return fuelData;
        if (params?.typeName === "FaultData") return faultData;
        return [];
      default:
        return null;
    }
  },
  getSession: async () => ({
    database: "demo_fleet",
    userName: "admin@fleet.com",
    sessionId: "mock-session-id",
  }),
};

// ============================================================================
// Zenith Add-In Registration (stub — activates when real package is installed)
// ============================================================================

const zenithConfig: ZenithApiConfig = {
  database: "demo_fleet",
  server: "my.geotab.com",
  userName: "admin@fleet.com",
};

const zenithClient = createGeotabClient(zenithConfig);

registerAddIn({
  initialize: (_api, _state) => {
    // Add-in initialized — stub lifecycle active
  },
  focus: (_api, _state) => {
    // Add-in focused
  },
  blur: (_api, _state) => {
    // Add-in blurred
  },
});

export { zenithClient, ZENITH_IS_STUB };