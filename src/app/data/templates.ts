/**
 * Report Templates - Pre-configured insights from PRD
 * Based on "Top 20 Reports by Usage" and PRD specifications
 */

export interface ReportTemplate {
  id: string;
  categoryId: string;
  name: string;
  question: string; // Insight question (e.g., "Which drivers need coaching?")
  description: string;
  usageCount: number; // Fleets using this template
  tags: string[];

  // Pre-configured settings
  dataSource: string; // Entity type (Device, Trip, Driver, etc.)
  columns: string[]; // Column keys
  defaultDateRange: "last_7_days" | "last_30_days" | "this_month" | "last_3_months" | "custom";
  defaultFilters?: Filter[];
  aggregations?: Aggregation[];
  chartType: "table" | "bar" | "line" | "pie";
  chartConfig?: ChartConfig;
}

export interface InsightCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templateCount: number;
}

interface Filter {
  field: string;
  operator: "equals" | "contains" | "greaterThan" | "lessThan";
  value: string | number;
}

interface Aggregation {
  field: string;
  function: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";
  label: string;
}

interface ChartConfig {
  xAxis: string;
  yAxis: string[];
  groupBy?: string;
}

// ============================================================================
// Insight Categories (from PRD)
// ============================================================================

export const INSIGHT_CATEGORIES: InsightCategory[] = [
  {
    id: "safety",
    name: "Safety & Compliance",
    description: "Driver behavior, violations, and compliance reporting",
    icon: "🛡️",
    templateCount: 11,
  },
  {
    id: "cost",
    name: "Cost Savings & Efficiency",
    description: "Fuel costs, idling, and operational efficiency",
    icon: "💰",
    templateCount: 5,
  },
  {
    id: "health",
    name: "Fleet Health & Maintenance",
    description: "Device issues, fault codes, and maintenance schedules",
    icon: "🔧",
    templateCount: 4,
  },
  {
    id: "sustainability",
    name: "Sustainability",
    description: "Emissions, fuel efficiency, and environmental impact",
    icon: "🌱",
    templateCount: 4,
  },
  {
    id: "overview",
    name: "Fleet Overview",
    description: "Utilization, inventory, and trip summaries",
    icon: "📊",
    templateCount: 3,
  },
];

// ============================================================================
// Report Templates (Top 27 from PRD)
// ============================================================================

export const REPORT_TEMPLATES: ReportTemplate[] = [
  // ========== Safety & Compliance (11) ==========
  {
    id: "driver-safety-scorecard",
    categoryId: "safety",
    name: "Driver Safety Scorecard",
    question: "Which drivers need coaching?",
    description: "Comprehensive driver safety scores with harsh events, speeding, and violations",
    usageCount: 1842,
    tags: ["safety", "driver", "coaching", "scorecard"],
    dataSource: "behavior",
    columns: ["driver", "device", "harshBraking", "speeding", "safetyScore"],
    defaultDateRange: "last_30_days",
    chartType: "pie",
    chartConfig: {
      xAxis: "driver",
      yAxis: ["safetyScore"],
    },
  },
  {
    id: "speeding-violations",
    categoryId: "safety",
    name: "Speeding Violations",
    question: "Who is exceeding speed limits?",
    description: "Speeding events by driver and location with severity breakdown",
    usageCount: 2938,
    tags: ["safety", "speeding", "violations"],
    dataSource: "behavior",
    columns: ["driver", "device", "date", "speeding"],
    defaultDateRange: "last_30_days",
    chartType: "bar",
    chartConfig: {
      xAxis: "driver",
      yAxis: ["speeding"],
    },
  },
  {
    id: "hos-violations-cost",
    categoryId: "safety",
    name: "Severe HOS Violations Cost",
    question: "What are our HOS compliance risks?",
    description: "Hours of service violations with estimated compliance costs",
    usageCount: 2167,
    tags: ["compliance", "hos", "violations", "cost"],
    dataSource: "behavior",
    columns: ["driver", "device", "date", "seatbeltViolations"],
    defaultDateRange: "last_30_days",
    chartType: "table",
  },
  {
    id: "seatbelt-violations",
    categoryId: "safety",
    name: "Seatbelt Violations",
    question: "Are drivers wearing seatbelts?",
    description: "Seatbelt usage violations by driver and vehicle",
    usageCount: 1500,
    tags: ["safety", "seatbelt", "violations"],
    dataSource: "behavior",
    columns: ["driver", "device", "date", "seatbeltViolations"],
    defaultDateRange: "last_7_days",
    chartType: "bar",
    chartConfig: {
      xAxis: "driver",
      yAxis: ["seatbeltViolations"],
    },
  },
  {
    id: "harsh-braking",
    categoryId: "safety",
    name: "Harsh Braking Events",
    question: "Which drivers brake too hard?",
    description: "Harsh braking incidents indicating unsafe driving habits",
    usageCount: 1800,
    tags: ["safety", "braking", "harsh events"],
    dataSource: "behavior",
    columns: ["driver", "device", "date", "harshBraking"],
    defaultDateRange: "last_30_days",
    chartType: "bar",
    chartConfig: {
      xAxis: "driver",
      yAxis: ["harshBraking"],
    },
  },
  {
    id: "harsh-acceleration",
    categoryId: "safety",
    name: "Aggressive Driving",
    question: "Who is driving aggressively?",
    description: "Harsh acceleration events and aggressive driving patterns",
    usageCount: 1650,
    tags: ["safety", "acceleration", "aggressive"],
    dataSource: "behavior",
    columns: ["driver", "device", "date", "harshAcceleration"],
    defaultDateRange: "last_30_days",
    chartType: "line",
    chartConfig: {
      xAxis: "date",
      yAxis: ["harshAcceleration"],
      groupBy: "driver",
    },
  },
  {
    id: "driver-coaching",
    categoryId: "safety",
    name: "Driver Coaching Opportunities",
    question: "Which drivers need immediate coaching?",
    description: "Prioritized list of drivers based on safety score and violation frequency",
    usageCount: 1400,
    tags: ["safety", "coaching", "driver development"],
    dataSource: "behavior",
    columns: ["driver", "device", "safetyScore", "harshBraking", "speeding"],
    defaultDateRange: "last_7_days",
    chartType: "table",
  },
  {
    id: "following-distance",
    categoryId: "safety",
    name: "Unsafe Following Distance",
    question: "Are drivers tailgating?",
    description: "Following distance violations indicating potential collision risk",
    usageCount: 1200,
    tags: ["safety", "following distance", "tailgating"],
    dataSource: "behavior",
    columns: ["driver", "device", "date", "speeding"],
    defaultDateRange: "last_30_days",
    chartType: "bar",
  },
  {
    id: "personal-conveyance",
    categoryId: "safety",
    name: "Excessive Personal Conveyance",
    question: "Is personal use within limits?",
    description: "Personal use of fleet vehicles beyond acceptable thresholds",
    usageCount: 1100,
    tags: ["compliance", "personal use"],
    dataSource: "trips",
    columns: ["driver", "device", "start", "stop", "distance"],
    defaultDateRange: "last_30_days",
    chartType: "table",
  },
  {
    id: "distracted-driving",
    categoryId: "safety",
    name: "Distracted Driving",
    question: "Are drivers using phones while driving?",
    description: "Mobile device usage events while vehicle in motion",
    usageCount: 1300,
    tags: ["safety", "distraction", "mobile"],
    dataSource: "behavior",
    columns: ["driver", "device", "date", "speeding"],
    defaultDateRange: "last_7_days",
    chartType: "table",
  },
  {
    id: "collision-events",
    categoryId: "safety",
    name: "Collision Events",
    question: "Where are collision risks highest?",
    description: "Collision detection events with severity and location analysis",
    usageCount: 1600,
    tags: ["safety", "collision", "accidents"],
    dataSource: "behavior",
    columns: ["driver", "device", "date", "harshBraking", "harshAcceleration"],
    defaultDateRange: "last_30_days",
    chartType: "table",
  },

  // ========== Cost Savings & Efficiency (5) ==========
  {
    id: "fleet-savings-summary",
    categoryId: "cost",
    name: "Fleet Savings Summary",
    question: "How much am I saving?",
    description: "Total cost savings from efficiency improvements and behavior coaching",
    usageCount: 4779,
    tags: ["cost", "savings", "efficiency", "summary"],
    dataSource: "fuel",
    columns: ["device", "driver", "volume", "cost"],
    defaultDateRange: "last_30_days",
    aggregations: [
      { field: "cost", function: "SUM", label: "Total Cost" },
      { field: "volume", function: "SUM", label: "Total Volume" },
    ],
    chartType: "bar",
    chartConfig: {
      xAxis: "device",
      yAxis: ["Total Cost"],
    },
  },
  {
    id: "idling-trend",
    categoryId: "cost",
    name: "Last 3 Months Idling Trend",
    question: "Where am I wasting fuel on idling?",
    description: "Idling time trends with cost impact and driver breakdown",
    usageCount: 5687, // MOST USED TEMPLATE
    tags: ["cost", "idling", "fuel waste", "trend"],
    dataSource: "trips",
    columns: ["device", "driver", "start", "idlingDuration"],
    defaultDateRange: "last_3_months",
    chartType: "line",
    chartConfig: {
      xAxis: "start",
      yAxis: ["idlingDuration"],
      groupBy: "device",
    },
  },
  {
    id: "fuel-cost-analysis",
    categoryId: "cost",
    name: "Fuel Cost Analysis",
    question: "What are my fuel costs by vehicle?",
    description: "Fuel purchase costs with efficiency trends and anomaly detection",
    usageCount: 3200,
    tags: ["cost", "fuel", "analysis"],
    dataSource: "fuel",
    columns: ["device", "driver", "dateTime", "volume", "cost", "location"],
    defaultDateRange: "last_30_days",
    chartType: "table",
  },
  {
    id: "mileage-trend",
    categoryId: "cost",
    name: "Mileage Trend",
    question: "How much are my vehicles driving?",
    description: "Distance traveled over time with utilization patterns",
    usageCount: 2800,
    tags: ["cost", "mileage", "utilization"],
    dataSource: "trips",
    columns: ["device", "driver", "start", "distance"],
    defaultDateRange: "last_30_days",
    chartType: "line",
    chartConfig: {
      xAxis: "start",
      yAxis: ["distance"],
      groupBy: "device",
    },
  },
  {
    id: "route-efficiency",
    categoryId: "cost",
    name: "Route Efficiency",
    question: "Are drivers taking optimal routes?",
    description: "Route deviation and efficiency analysis with cost impact",
    usageCount: 2400,
    tags: ["cost", "route", "efficiency"],
    dataSource: "trips",
    columns: ["device", "driver", "start", "stop", "distance", "drivingDuration"],
    defaultDateRange: "last_7_days",
    chartType: "table",
  },

  // ========== Fleet Health & Maintenance (4) ==========
  {
    id: "device-issues",
    categoryId: "health",
    name: "Telematics Device Issues",
    question: "Are my devices functioning properly?",
    description: "Device connectivity, health status, and diagnostic alerts",
    usageCount: 2100,
    tags: ["health", "device", "connectivity"],
    dataSource: "faults",
    columns: ["device", "dateTime", "code", "description", "severity", "status"],
    defaultDateRange: "last_7_days",
    chartType: "table",
  },
  {
    id: "engine-faults",
    categoryId: "health",
    name: "Engine Fault Codes",
    question: "What engine problems need attention?",
    description: "Active fault codes with severity, source, and recommended actions",
    usageCount: 3000,
    tags: ["health", "engine", "faults", "diagnostics"],
    dataSource: "faults",
    columns: ["device", "dateTime", "code", "description", "severity", "source", "status"],
    defaultDateRange: "last_30_days",
    chartType: "table",
  },
  {
    id: "maintenance-schedule",
    categoryId: "health",
    name: "Maintenance Schedule",
    question: "What maintenance is coming up?",
    description: "Upcoming and overdue maintenance with cost estimates",
    usageCount: 2500,
    tags: ["health", "maintenance", "schedule"],
    dataSource: "maintenance",
    columns: ["device", "dateTime", "type", "description", "cost", "provider", "status"],
    defaultDateRange: "last_30_days",
    chartType: "table",
  },
  {
    id: "vehicle-health-scorecard",
    categoryId: "health",
    name: "Vehicle Health Scorecard",
    question: "Which vehicles need attention?",
    description: "Comprehensive health scores based on faults, maintenance, and usage",
    usageCount: 1900,
    tags: ["health", "scorecard", "vehicle condition"],
    dataSource: "faults",
    columns: ["device", "dateTime", "code", "severity", "status"],
    defaultDateRange: "last_30_days",
    aggregations: [
      { field: "code", function: "COUNT", label: "Total Faults" },
    ],
    chartType: "bar",
    chartConfig: {
      xAxis: "device",
      yAxis: ["Total Faults"],
    },
  },

  // ========== Sustainability (4) ==========
  {
    id: "carbon-emissions",
    categoryId: "sustainability",
    name: "Carbon Emissions",
    question: "What is my fleet's carbon footprint?",
    description: "CO2 emissions by vehicle with reduction opportunities",
    usageCount: 1700,
    tags: ["sustainability", "emissions", "carbon"],
    dataSource: "fuel",
    columns: ["device", "driver", "dateTime", "volume"],
    defaultDateRange: "last_30_days",
    aggregations: [
      { field: "volume", function: "SUM", label: "Total Fuel Used" },
    ],
    chartType: "bar",
    chartConfig: {
      xAxis: "device",
      yAxis: ["Total Fuel Used"],
    },
  },
  {
    id: "fuel-efficiency-trend",
    categoryId: "sustainability",
    name: "Fuel Efficiency Trend",
    question: "Is fuel efficiency improving?",
    description: "Fuel economy trends with driver and vehicle comparisons",
    usageCount: 2200,
    tags: ["sustainability", "fuel", "efficiency"],
    dataSource: "fuel",
    columns: ["device", "driver", "dateTime", "volume", "odometer"],
    defaultDateRange: "last_3_months",
    chartType: "line",
  },
  {
    id: "ev-charging",
    categoryId: "sustainability",
    name: "EV Charging Patterns",
    question: "When and where are EVs charging?",
    description: "Electric vehicle charging sessions with cost and duration analysis",
    usageCount: 1400,
    tags: ["sustainability", "ev", "charging"],
    dataSource: "fuel",
    columns: ["device", "dateTime", "volume", "cost", "location"],
    defaultDateRange: "last_30_days",
    chartType: "table",
  },
  {
    id: "idle-reduction",
    categoryId: "sustainability",
    name: "Idle Reduction Impact",
    question: "How much fuel am I saving from reduced idling?",
    description: "Idling time reduction with environmental and cost benefits",
    usageCount: 1800,
    tags: ["sustainability", "idling", "reduction"],
    dataSource: "trips",
    columns: ["device", "driver", "start", "idlingDuration"],
    defaultDateRange: "last_30_days",
    chartType: "line",
    chartConfig: {
      xAxis: "start",
      yAxis: ["idlingDuration"],
    },
  },

  // ========== Fleet Overview (3) ==========
  {
    id: "fleet-utilization",
    categoryId: "overview",
    name: "Fleet Utilization",
    question: "How well am I using my vehicles?",
    description: "Vehicle usage patterns with idle time and optimization opportunities",
    usageCount: 2600,
    tags: ["overview", "utilization", "efficiency"],
    dataSource: "trips",
    columns: ["device", "driver", "start", "stop", "distance", "drivingDuration"],
    defaultDateRange: "last_30_days",
    chartType: "table",
  },
  {
    id: "vehicle-inventory",
    categoryId: "overview",
    name: "Vehicle Inventory",
    question: "What vehicles do I have?",
    description: "Complete fleet inventory with device types and status",
    usageCount: 1500,
    tags: ["overview", "inventory", "fleet"],
    dataSource: "trips",
    columns: ["device"],
    defaultDateRange: "last_7_days",
    chartType: "table",
  },
  {
    id: "trip-summary",
    categoryId: "overview",
    name: "Trip Summary",
    question: "What is my fleet activity?",
    description: "High-level trip statistics with distance, duration, and driver breakdown",
    usageCount: 2000,
    tags: ["overview", "trips", "summary"],
    dataSource: "trips",
    columns: ["device", "driver", "start", "stop", "distance", "drivingDuration", "maxSpeed"],
    defaultDateRange: "last_7_days",
    chartType: "table",
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getTemplatesByCategory(categoryId: string): ReportTemplate[] {
  return REPORT_TEMPLATES.filter((t) => t.categoryId === categoryId).sort(
    (a, b) => b.usageCount - a.usageCount
  );
}

export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find((t) => t.id === id);
}

export function searchTemplates(query: string): ReportTemplate[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return REPORT_TEMPLATES;

  return REPORT_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.question.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  ).sort((a, b) => b.usageCount - a.usageCount);
}

export function getCategoryById(id: string): InsightCategory | undefined {
  return INSIGHT_CATEGORIES.find((c) => c.id === id);
}
