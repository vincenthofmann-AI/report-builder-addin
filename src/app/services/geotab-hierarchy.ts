/**
 * Geotab API Object Hierarchy
 * Three-tier structure: Business Categories → Report Types → Data Objects
 * Based on GEOTAB_API_MODEL.md analysis
 */

import type { DataSourceDef } from "./geotab-mock";
import { dataSources } from "./geotab-mock";

export interface ObjectCategory {
  id: string;
  name: string;
  description: string;
  reportTypes: ReportType[];
}

export interface ReportType {
  id: string;
  name: string;
  description: string;
  dataSources: DataSourceDef[];
  aiInsights?: AIInsight[];
}

export interface AIInsight {
  id: string;
  name: string;
  description: string;
  type: "collision_risk" | "predictive_maintenance" | "route_optimization" | "driver_efficiency" | "fleet_utilization" | "ev_battery";
  relatedObjects: string[];
}

// AI Insights from Geotab Data Intelligence Platform
const aiInsights: AIInsight[] = [
  {
    id: "collision-risk",
    name: "Collision Risk Score",
    description: "Predict collision likelihood based on driving behavior patterns",
    type: "collision_risk",
    relatedObjects: ["behavior", "trips"],
  },
  {
    id: "predictive-maintenance",
    name: "Maintenance Prediction",
    description: "Forecast when vehicle components will require service",
    type: "predictive_maintenance",
    relatedObjects: ["faults", "maintenance"],
  },
  {
    id: "route-efficiency",
    name: "Route Optimization",
    description: "Identify fuel-saving route alternatives",
    type: "route_optimization",
    relatedObjects: ["trips", "fuel"],
  },
  {
    id: "driver-performance",
    name: "Driver Efficiency Score",
    description: "Benchmark driver performance against peer groups",
    type: "driver_efficiency",
    relatedObjects: ["behavior", "trips"],
  },
  {
    id: "fleet-utilization",
    name: "Fleet Utilization %",
    description: "Identify underutilized or overutilized vehicles",
    type: "fleet_utilization",
    relatedObjects: ["trips"],
  },
];

// Map data sources by ID for quick lookup
const dataSourceMap = new Map(dataSources.map(ds => [ds.id, ds]));

// Three-tier hierarchical structure
export const objectHierarchy: ObjectCategory[] = [
  {
    id: "fleet-operations",
    name: "Fleet Operations",
    description: "Core fleet management data and metrics",
    reportTypes: [
      {
        id: "vehicle-performance",
        name: "Vehicle Performance",
        description: "Trip analysis, utilization, and location history",
        dataSources: [
          dataSourceMap.get("trips")!,
        ],
        aiInsights: [
          aiInsights.find(i => i.id === "fleet-utilization")!,
          aiInsights.find(i => i.id === "route-efficiency")!,
        ],
      },
      {
        id: "driver-management",
        name: "Driver Management",
        description: "Driver behavior, safety scores, and compliance",
        dataSources: [
          dataSourceMap.get("behavior")!,
        ],
        aiInsights: [
          aiInsights.find(i => i.id === "collision-risk")!,
          aiInsights.find(i => i.id === "driver-performance")!,
        ],
      },
      {
        id: "fuel-energy",
        name: "Fuel & Energy",
        description: "Fuel consumption, costs, and efficiency tracking",
        dataSources: [
          dataSourceMap.get("fuel")!,
        ],
        aiInsights: [
          aiInsights.find(i => i.id === "route-efficiency")!,
        ],
      },
      {
        id: "compliance-safety",
        name: "Compliance & Safety",
        description: "Maintenance schedules, engine diagnostics, and fault tracking",
        dataSources: [
          dataSourceMap.get("maintenance")!,
          dataSourceMap.get("faults")!,
        ],
        aiInsights: [
          aiInsights.find(i => i.id === "predictive-maintenance")!,
        ],
      },
    ],
  },
];

/**
 * Get all data sources across all categories
 */
export function getAllDataSources(): DataSourceDef[] {
  const sources: DataSourceDef[] = [];
  objectHierarchy.forEach(category => {
    category.reportTypes.forEach(reportType => {
      sources.push(...reportType.dataSources);
    });
  });
  return sources;
}

/**
 * Find report type by data source ID
 */
export function getReportTypeForDataSource(dataSourceId: string): ReportType | null {
  for (const category of objectHierarchy) {
    for (const reportType of category.reportTypes) {
      if (reportType.dataSources.some(ds => ds.id === dataSourceId)) {
        return reportType;
      }
    }
  }
  return null;
}

/**
 * Get AI insights for a data source
 */
export function getAIInsightsForDataSource(dataSourceId: string): AIInsight[] {
  const reportType = getReportTypeForDataSource(dataSourceId);
  return reportType?.aiInsights || [];
}
