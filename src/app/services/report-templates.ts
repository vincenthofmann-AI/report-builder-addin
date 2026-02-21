/**
 * Pre-Configured Report Templates
 * =================================
 *
 * Insight-first report templates based on Geotab IA principles and actual usage data.
 * Each template provides opinionated defaults while allowing strategic refinement.
 *
 * Philosophy: "Users don't ask for records; they ask for insights."
 * Value Chain: Insight → Analytics → Report → Record
 *
 * Based on top 20 reports by actual usage (database count from MyGeotab data):
 * - Last 3 Months Idling Trend: 5,687 databases
 * - Fleet Savings Summary: 4,779 databases
 * - Excessive Personal Conveyance: 4,107 databases
 * - Telematics Device Issue Detection: 2,982 databases
 * - Driver Safety Scorecard: 1,842 databases
 * (and 15 more)
 */

import type { ChartType } from "../modules/canvas/ChartView";

/**
 * Date Range Configuration
 */
export interface DateRangeConfig {
  type: "previous" | "current" | "custom";
  value: number;
  unit: "days" | "weeks" | "months" | "years";
}

/**
 * Chart Configuration
 */
export interface ChartConfig {
  type: ChartType;
  groupBy?: string;
  aggregate?: "sum" | "avg" | "count" | "min" | "max";
  xAxis?: string;
  yAxis?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  colors?: Record<string, string>;
}

/**
 * Report Template Definition
 */
export interface ReportTemplateDef {
  id: string;
  name: string;
  category: InsightCategory;
  insightQuestion: string;
  description: string;
  dataSource: string; // Maps to DataSourceDef.id

  // Pre-configured defaults (locked from user editing)
  defaults: {
    dateRange: DateRangeConfig;
    refreshPeriod: "hourly" | "daily" | "weekly" | "monthly";
    runReportBy?: "driver" | "device" | "group";
    groupBy?: "none" | "daily" | "weekly" | "monthly";
    hideZeroDistance?: boolean;

    // Required exception rules (for risk-management data source)
    exceptionRules?: string[];

    // Pre-selected columns
    columns: string[];

    // Visualization
    chart?: ChartConfig;
  };

  // Fields user can refine (not locked)
  refinableFields: RefinableField[];

  // Usage metadata
  usageCount?: number; // Number of databases using this report
  tags?: string[];
}

/**
 * Insight Categories (replaces data-centric categories)
 */
export type InsightCategory =
  | "safety-compliance"      // "Are we safe and legal?"
  | "cost-savings"           // "Where can I save money?"
  | "fleet-health"           // "What needs attention?"
  | "sustainability"         // "What's my environmental impact?"
  | "fleet-overview";        // "What do I have?"

/**
 * Fields that users can refine in templates
 */
export type RefinableField =
  | "dateRange"
  | "groups"
  | "drivers"
  | "devices"
  | "fuelPrice"
  | "chartType";

/**
 * Insight Category Definitions
 */
export interface InsightCategoryDef {
  id: InsightCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionPrompt: string;
}

export const insightCategories: InsightCategoryDef[] = [
  {
    id: "safety-compliance",
    name: "Safety & Compliance",
    description: "Driver safety scores, HOS violations, and regulatory compliance",
    icon: "Shield",
    color: "#003a63", // Zenith navy
    questionPrompt: "Are we safe and legal?",
  },
  {
    id: "cost-savings",
    name: "Cost Savings & Efficiency",
    description: "Fuel costs, idle time, fleet utilization, and savings opportunities",
    icon: "DollarSign",
    color: "#78be20", // Zenith green
    questionPrompt: "Where can I save money?",
  },
  {
    id: "fleet-health",
    name: "Fleet Health & Maintenance",
    description: "Device diagnostics, faults, and maintenance requirements",
    icon: "Wrench",
    color: "#f4511e", // Zenith orange
    questionPrompt: "What needs attention?",
  },
  {
    id: "sustainability",
    name: "Sustainability",
    description: "CO2 emissions, fuel economy, and environmental impact",
    icon: "Leaf",
    color: "#2e7d32", // Green
    questionPrompt: "What's my environmental impact?",
  },
  {
    id: "fleet-overview",
    name: "Fleet Overview",
    description: "Asset inventory, utilization, and fleet composition",
    icon: "BarChart3",
    color: "#1976d2", // Blue
    questionPrompt: "What do I have?",
  },
];

/**
 * =============================================================================
 * TOP 5 PRE-CONFIGURED REPORT TEMPLATES
 * =============================================================================
 */

/**
 * Template #1: Last 3 Months Idling Trend
 * Rank: #1 by usage (5,687 databases)
 * Category: Cost Savings & Efficiency
 * Insight: "Where am I wasting fuel on idling?"
 */
export const idlingTrendTemplate: ReportTemplateDef = {
  id: "idling-trend",
  name: "Last 3 Months Idling Trend",
  category: "cost-savings",
  insightQuestion: "Where am I wasting fuel on idling?",
  description: "Shows vehicles with highest idle time and associated fuel costs over the last 3 months",
  dataSource: "trips",

  defaults: {
    dateRange: { type: "previous", value: 90, unit: "days" },
    refreshPeriod: "daily",
    runReportBy: "device",
    groupBy: "monthly",
    hideZeroDistance: true,

    columns: [
      "device",
      "idlingDuration",
      "drivingDuration",
      "distance",
      "start",
      "stop",
    ],

    chart: {
      type: "line",
      groupBy: "start", // Group by month
      aggregate: "sum",
      yAxis: "idlingDuration",
      sortBy: "start",
      sortOrder: "asc",
    },
  },

  refinableFields: ["dateRange", "groups", "devices"],
  usageCount: 5687,
  tags: ["idling", "fuel", "cost", "trend"],
};

/**
 * Template #2: Fleet Savings Summary
 * Rank: #2 by usage (4,779 databases)
 * Category: Cost Savings & Efficiency
 * Insight: "How much am I saving with telematics?"
 */
export const fleetSavingsTemplate: ReportTemplateDef = {
  id: "fleet-savings",
  name: "Fleet Savings Summary",
  category: "cost-savings",
  insightQuestion: "How much am I saving with telematics?",
  description: "Calculates estimated savings from reduced idling, speeding, and fuel consumption",
  dataSource: "trips",

  defaults: {
    dateRange: { type: "current", value: 1, unit: "months" },
    refreshPeriod: "monthly",
    runReportBy: "device",
    groupBy: "none",
    hideZeroDistance: true,

    columns: [
      "device",
      "distance",
      "idlingDuration",
      "drivingDuration",
      "maxSpeed",
      "averageSpeed",
    ],

    chart: {
      type: "bar",
      xAxis: "device",
      yAxis: "idlingDuration",
      sortBy: "idlingDuration",
      sortOrder: "desc",
      limit: 10, // Top 10 vehicles by idle time
      colors: {
        "High idle": "#f44336",
        "Medium idle": "#ff9800",
        "Low idle": "#78be20",
      },
    },
  },

  refinableFields: ["dateRange", "groups", "fuelPrice"],
  usageCount: 4779,
  tags: ["savings", "cost", "roi", "efficiency"],
};

/**
 * Template #3: Driver Safety Scorecard
 * Rank: #9 by usage (1,842 databases)
 * Category: Safety & Compliance
 * Insight: "Which drivers need coaching?"
 */
export const driverSafetyTemplate: ReportTemplateDef = {
  id: "driver-safety-scorecard",
  name: "Driver Safety Scorecard",
  category: "safety-compliance",
  insightQuestion: "Which drivers need coaching?",
  description: "Identifies risky drivers using harsh acceleration, harsh braking, cornering, speeding, and seatbelt violations",
  dataSource: "behavior",

  defaults: {
    dateRange: { type: "previous", value: 30, unit: "days" },
    refreshPeriod: "daily",
    runReportBy: "driver",
    groupBy: "none",
    hideZeroDistance: true,

    // Required exception rules (in specific order)
    exceptionRules: [
      "hard-acceleration",
      "harsh-braking",
      "harsh-cornering",
      "seatbelt",
      "speeding",
      "excessive-speeding", // Custom rule: speed > 75mph
    ],

    columns: [
      "driver",
      "safetyScore",
      "harshBraking",
      "harshAcceleration",
      "speeding",
      "seatbeltViolations",
    ],

    chart: {
      type: "pie",
      groupBy: "safetyScore", // Group into risk categories
      aggregate: "count",
      colors: {
        "Low risk": "#78be20",
        "Mild risk": "#ffc107",
        "Medium risk": "#ff9800",
        "High risk": "#f44336",
      },
    },
  },

  refinableFields: ["dateRange", "groups", "drivers"],
  usageCount: 1842,
  tags: ["safety", "driver", "coaching", "risk"],
};

/**
 * Template #4: Top 5 Speeding Violations
 * Rank: #6 by usage (2,938 databases)
 * Category: Safety & Compliance
 * Insight: "Which drivers are speeding most?"
 */
export const speedingViolationsTemplate: ReportTemplateDef = {
  id: "speeding-violations",
  name: "Top 5 Speeding Violations",
  category: "safety-compliance",
  insightQuestion: "Which drivers are speeding most?",
  description: "Shows top drivers by speeding event count with speed thresholds",
  dataSource: "behavior",

  defaults: {
    dateRange: { type: "previous", value: 7, unit: "days" },
    refreshPeriod: "daily",
    runReportBy: "driver",
    groupBy: "none",
    hideZeroDistance: true,

    exceptionRules: [
      "speeding",
      "excessive-speeding",
    ],

    columns: [
      "driver",
      "device",
      "date",
      "speeding",
    ],

    chart: {
      type: "bar",
      xAxis: "driver",
      yAxis: "speeding",
      sortBy: "speeding",
      sortOrder: "desc",
      limit: 5, // Top 5 only
      colors: {
        "Speeding": "#f44336",
      },
    },
  },

  refinableFields: ["dateRange", "groups", "drivers"],
  usageCount: 2938,
  tags: ["safety", "speeding", "violations", "driver"],
};

/**
 * Template #5: Severe HOS Violations Cost
 * Rank: #8 by usage (2,167 databases)
 * Category: Safety & Compliance
 * Insight: "What are HOS violations costing me?"
 */
export const hosViolationsCostTemplate: ReportTemplateDef = {
  id: "hos-violations-cost",
  name: "Severe HOS Violations Cost",
  category: "safety-compliance",
  insightQuestion: "What are HOS violations costing me?",
  description: "Calculates estimated fines and costs from Hours of Service violations",
  dataSource: "behavior",

  defaults: {
    dateRange: { type: "previous", value: 30, unit: "days" },
    refreshPeriod: "weekly",
    runReportBy: "driver",
    groupBy: "none",
    hideZeroDistance: false,

    exceptionRules: [
      "hos-violation-duty-status",
      "hos-violation-driving-limit",
      "hos-violation-rest-break",
    ],

    columns: [
      "driver",
      "device",
      "date",
      "harshBraking", // Placeholder - HOS violations would be separate columns
      "harshAcceleration",
    ],

    chart: {
      type: "bar",
      xAxis: "driver",
      yAxis: "harshBraking", // Placeholder for violation count
      sortBy: "harshBraking",
      sortOrder: "desc",
      limit: 10,
      colors: {
        "Severe": "#f44336",
        "Moderate": "#ff9800",
        "Minor": "#ffc107",
      },
    },
  },

  refinableFields: ["dateRange", "groups", "drivers"],
  usageCount: 2167,
  tags: ["compliance", "hos", "violations", "fines"],
};

/**
 * =============================================================================
 * TEMPLATE REGISTRY
 * =============================================================================
 */

/**
 * All available report templates
 */
export const reportTemplates: ReportTemplateDef[] = [
  idlingTrendTemplate,
  fleetSavingsTemplate,
  driverSafetyTemplate,
  speedingViolationsTemplate,
  hosViolationsCostTemplate,
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: InsightCategory): ReportTemplateDef[] {
  return reportTemplates.filter((t) => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ReportTemplateDef | undefined {
  return reportTemplates.find((t) => t.id === id);
}

/**
 * Get category definition by ID
 */
export function getInsightCategoryById(id: InsightCategory): InsightCategoryDef | undefined {
  return insightCategories.find((c) => c.id === id);
}

/**
 * Get top N templates by usage count
 */
export function getTopTemplates(n: number = 5): ReportTemplateDef[] {
  return [...reportTemplates]
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, n);
}

/**
 * Get all templates
 */
export function getAllTemplates(): ReportTemplateDef[] {
  return reportTemplates;
}
