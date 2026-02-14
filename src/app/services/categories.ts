/**
 * Category-based Data Source Organization
 * ========================================
 *
 * Organizes MyGeotab data sources into logical categories for progressive disclosure.
 * Categories align with MyGeotab domain model and user mental models.
 */

import type { DataSourceDef } from "./geotab-mock";
import { ZenithColors } from "./zenith-adapter";

export interface CategoryDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  dataSources: DataSourceDef[];
}

/**
 * Activity Category - Operational Movement Data
 * Focuses on: trips, routes, stops, zone crossings
 */
const activityCategory: CategoryDef = {
  id: "activity",
  name: "Activity",
  description: "Vehicle movement and operational data - trips, routes, and stops",
  icon: "MapPin",
  color: ZenithColors.blue,
  dataSources: [
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
  ],
};

/**
 * Events Category - Time-Based Occurrences
 * Focuses on: exceptions, faults, fuel transactions, maintenance
 */
const eventsCategory: CategoryDef = {
  id: "events",
  name: "Events",
  description: "Time-based occurrences - faults, exceptions, fuel, and maintenance",
  icon: "AlertTriangle",
  color: ZenithColors.orange,
  dataSources: [
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
  ],
};

/**
 * Assets Category - Vehicle & Equipment Information
 * Focuses on: vehicles, groups, zones
 * Note: These are NEW data sources not yet implemented
 */
const assetsCategory: CategoryDef = {
  id: "assets",
  name: "Assets",
  description: "Vehicle and equipment inventory, groups, and zones",
  icon: "Truck",
  color: ZenithColors.navy,
  dataSources: [
    // TODO: Implement Device entity
    // {
    //   id: "vehicles",
    //   name: "Vehicle Inventory",
    //   description: "Complete vehicle/asset information and specifications",
    //   icon: "Truck",
    //   columns: [...]
    // },
    // TODO: Implement Group entity
    // TODO: Implement Zone entity
  ],
};

/**
 * Devices Category - Telematics & Diagnostics
 * Focuses on: device status, health, engine data
 * Note: These are NEW data sources not yet implemented
 */
const devicesCategory: CategoryDef = {
  id: "devices",
  name: "Devices",
  description: "Telematics health, diagnostics, and real-time status",
  icon: "Database",
  color: ZenithColors.teal,
  dataSources: [
    // TODO: Implement StatusData entity
    // TODO: Implement DeviceStatusInfo entity
    // TODO: Implement Diagnostic entity
  ],
};

/**
 * Drivers Category - People & Performance
 * Focuses on: driver profiles, assignments, HOS
 * Note: These are NEW data sources not yet implemented
 */
const driversCategory: CategoryDef = {
  id: "drivers",
  name: "Drivers",
  description: "Driver profiles, assignments, and performance data",
  icon: "Shield",
  color: ZenithColors.green,
  dataSources: [
    // TODO: Implement Driver entity
    // TODO: Implement DriverChange entity
    // TODO: Implement DutyStatusLog entity (if available)
  ],
};

/**
 * All categories in display order
 */
export const categories: CategoryDef[] = [
  activityCategory,
  eventsCategory,
  assetsCategory,
  devicesCategory,
  driversCategory,
];

/**
 * Get category by ID
 */
export function getCategoryById(id: string): CategoryDef | undefined {
  return categories.find((cat) => cat.id === id);
}

/**
 * Get all data sources across all categories (flat list)
 */
export function getAllDataSources(): DataSourceDef[] {
  return categories.flatMap((cat) => cat.dataSources);
}

/**
 * Get data source by ID from any category
 */
export function getDataSourceById(id: string): DataSourceDef | undefined {
  for (const category of categories) {
    const source = category.dataSources.find((ds) => ds.id === id);
    if (source) return source;
  }
  return undefined;
}

/**
 * Find which category contains a given data source
 */
export function getCategoryForDataSource(dataSourceId: string): CategoryDef | undefined {
  return categories.find((cat) =>
    cat.dataSources.some((ds) => ds.id === dataSourceId)
  );
}
