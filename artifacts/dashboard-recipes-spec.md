# Dashboard Recipes Specification

**Version:** 1.0
**Date:** 2026-02-24
**Status:** Draft

## Overview

Dashboard recipes are pre-configured dashboard templates that combine proven UI modules with specific data sources to create purpose-built overviews. Users select a recipe, customize module selection if desired, and save as a new MyGeotab page.

## User Flow

```
1. Create New Dashboard
   ↓
2. Pick Recipe (Safety / Maintenance / Compliance / Custom)
   ↓
3. Select Modules (pre-selected based on recipe, user can add/remove)
   ↓
4. Choose Layout (single column / two column / grid)
   ↓
5. Preview Dashboard
   ↓
6. Save as MyGeotab Page
```

## Module Library

### Core Modules (Reusable across recipes)

**1. Overview Card**
- **Component:** `overview.tsx` (from react-library)
- **Props:** title, description, icon, label (percentage + arrow + type)
- **Data:** Single metric with trend
- **Use cases:** Summary metrics, KPIs, counts

**2. Immediate Actions Card**
- **Component:** Copy from `maintenanceOverviewImmediateActions.tsx`
- **Layout:** Alert list with counts and navigation
- **Data:** Items requiring attention (overdue, severe, critical)
- **Use cases:** Safety alerts, compliance violations, maintenance overdue

**3. Metric Chart**
- **Component:** Copy from `maintenanceOverviewMetricChart.tsx`
- **Features:** Metric switcher dropdown, line/bar chart, date range
- **Data:** Time-series data for selected metric
- **Use cases:** Trend analysis, historical comparison

**4. Performance Rankings**
- **Component:** Copy from `AssetsPerformanceView.tsx` / `GroupsPerformanceView.tsx`
- **Layout:** Ranked list (top/bottom N)
- **Data:** Assets or groups by selected metric
- **Use cases:** Top violators, best performers, highest risk

**5. Benchmark Bar**
- **Component:** From `collisionRisk/collisionRiskBenchmarkBar.tsx`
- **Layout:** Progress bar with benchmark comparison
- **Data:** Score vs industry average or target
- **Use cases:** Safety scores, efficiency ratings

**6. Map View**
- **Component:** TBD (from `map` page)
- **Features:** Asset locations, real-time updates
- **Data:** Device positions, trips
- **Use cases:** Fleet operations, asset tracking

---

## Recipe Definitions

### Recipe 1: Safety Scorecard

**Target Users:** 29,800+ (riskManagement) + 23,534+ (collisionRisk) = 53K+ users
**Use Case:** Monitor and improve fleet safety performance

#### Default Modules

1. **Collision Risk Overview** (Overview Card)
   - Title: "Average Collision Risk Score"
   - Description: "Fleet-wide collision risk based on AI model"
   - Metric: Collision risk score (0-100)
   - Trend: Week-over-week change
   - API: Collision risk analytics

2. **Safety Alerts** (Immediate Actions)
   - Critical exceptions (harsh braking, speeding, etc.)
   - High-risk drivers
   - Vehicles with recent safety events
   - API: Exception events, risk management

3. **Collision Risk Benchmark** (Benchmark Bar)
   - Your fleet score vs industry benchmark
   - Color-coded (green/yellow/red)
   - API: Collision risk model + benchmark data

4. **Safety Metrics Trend** (Metric Chart)
   - Switchable metrics: Exceptions, Harsh events, Risk score, Collisions
   - Date range: Last 7/30/90 days
   - API: Exception aggregations

5. **Highest Risk Drivers** (Performance Rankings)
   - Top 10 drivers by risk score
   - Link to driver details
   - API: Driver risk scores

#### Data Sources Required

- Collision risk analytics API
- Exception events
- Driver risk scores
- Safety benchmarks
- Harsh event data

---

### Recipe 2: Maintenance Overview

**Target Users:** 20,919+ (schedules) + 20,078+ (requests) + 27,960+ (faults) = 69K+ users
**Use Case:** Track maintenance operations, predict breakdowns, manage work orders

#### Default Modules

✅ **Already Implemented** - Use existing Maintenance Overview pattern

1. **Immediate Actions** (Immediate Actions)
   - Overdue work orders
   - Severe work requests
   - Assets >14 days downtime
   - API: Work orders, work requests

2. **Maintenance Metrics** (Metric Chart)
   - Switchable: Work orders completed, Breakdown rate, Downtime hours
   - API: Work order aggregations

3. **Highest Risk of Breakdown** (Performance Rankings)
   - Top 10 assets by breakdown prediction
   - Risk score + last maintenance date
   - API: Predictive maintenance model

4. **Performance Insights** (Performance Rankings - 2 views)
   - Assets view: Individual asset performance
   - Groups view: Group-level aggregations
   - Metrics: Breakdowns, Downtime, Work orders
   - API: Maintenance aggregations

#### Data Sources Required

✅ Maintenance work orders
✅ Work requests
✅ Breakdown predictions
✅ Fault data
✅ Downtime calculations

---

### Recipe 3: Compliance Dashboard

**Target Users:** 85,925+ (hosLogs) + 24,997+ (availability) + 22,800+ (violations) = 134K+ users
**Use Case:** Monitor HOS compliance, manage violations, track driver availability

#### Default Modules

1. **Compliance Status** (Overview Card)
   - Title: "Active Violations"
   - Description: "Drivers with current HOS violations"
   - Metric: Count of violations
   - Trend: Change from last week

2. **Critical Violations** (Immediate Actions)
   - Active violations requiring attention
   - Drivers approaching limits
   - Missing logs
   - API: HOS logs, violations

3. **Driver Availability** (Overview Card)
   - Title: "Available Drivers"
   - Description: "Drivers with sufficient hours"
   - Metric: Count of available drivers
   - Percentage of fleet

4. **Violation Trend** (Metric Chart)
   - Switchable: Violations, Available hours, Log completeness
   - Date range: Last 7/30 days
   - API: HOS aggregations

5. **Top Violators** (Performance Rankings)
   - Drivers with most violations
   - Violation types
   - Link to driver HOS logs
   - API: HOS violation history

6. **IFTA Summary** (Overview Card)
   - Total miles by jurisdiction
   - Current quarter summary
   - API: IFTA miles

#### Data Sources Required

- HOS logs API
- Violations data
- Driver availability calculations
- IFTA miles by jurisdiction
- Log completeness tracking

---

### Recipe 4: Fleet Operations (Phase 2)

**Target Users:** 838,595+ (map) + 396,538+ (trips) = 1.2M+ users
**Use Case:** Real-time fleet visibility, trip analysis, asset utilization

#### Default Modules

1. **Fleet Map** (Map View)
   - Real-time asset locations
   - Trip breadcrumbs
   - Geozones
   - API: Device locations, trips

2. **Fleet Summary** (Overview Cards × 3)
   - Active assets
   - Assets in motion
   - Idle assets
   - API: Device status

3. **Trip Metrics** (Metric Chart)
   - Total miles, Hours driven, Stops
   - API: Trip aggregations

4. **Route Completion** (Performance Rankings)
   - Routes completed vs planned
   - On-time percentage
   - API: Route tracking

5. **Asset Utilization** (Performance Rankings)
   - Most/least utilized assets
   - Hours used, Miles driven
   - API: Device usage

---

### Recipe 5: Fuel & Sustainability (Phase 2)

**Target Users:** 17,242+ (fuelUsage) + 13,586+ (fuelEvents) + 4,452+ (evCharging) = 35K+ users
**Use Case:** Track fuel costs, monitor EV adoption, improve efficiency

#### Default Modules

1. **Fuel Efficiency** (Overview Card)
   - Fleet-wide MPG/L per 100km
   - Cost per mile
   - Trend: Month-over-month
   - API: Fuel transactions

2. **EV Insights** (Overview Cards × 2)
   - EV adoption rate
   - Charging sessions
   - API: EV charging, EVSA

3. **Fuel Cost Trend** (Metric Chart)
   - Switchable: Total cost, Cost per mile, Efficiency
   - API: Fuel transactions

4. **Sustainability Metrics** (Overview Card)
   - CO2 emissions
   - EV miles vs ICE miles
   - API: Sustainability calculations

5. **Top Fuel Consumers** (Performance Rankings)
   - Least efficient assets
   - Highest cost vehicles
   - API: Fuel aggregations

6. **EV Suitability** (Benchmark Bar)
   - Fleet EV readiness score
   - API: EVSA (AI-powered)

---

## Layout Patterns

### Single Column (Mobile/Narrow)
```
[Header + Filters]
[Module 1]
[Module 2]
[Module 3]
...
```

### Two Column (Desktop)
```
[Header + Filters]
[Module 1] | [Module 2]
[Module 3] | [Module 4]
[Module 5 (full width)]
```

### Grid (Wide Desktop)
```
[Header + Filters]
[Module 1] | [Module 2] | [Module 3]
[Module 4] | [Module 5] | [Module 6]
[Module 7 (full width)]
```

---

## Technical Implementation

### Recipe Configuration Schema

```typescript
interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'maintenance' | 'compliance' | 'operations' | 'fuel';
  icon: React.ReactElement;
  defaultModules: RecipeModule[];
  availableModules: RecipeModule[];
  requiredPermissions: SecurityIdentifier[];
}

interface RecipeModule {
  id: string;
  type: 'overview-card' | 'immediate-actions' | 'metric-chart' | 'performance-rankings' | 'benchmark-bar' | 'map';
  component: React.ComponentType;
  title: string;
  description: string;
  dataSource: DataSourceConfig;
  defaultPosition: { row: number; column: number; width: number };
  configurable: boolean;
}

interface DataSourceConfig {
  apiEntity: string;
  aggregationType?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  filters?: FilterConfig[];
  dateRangeEnabled: boolean;
  groupFilterEnabled: boolean;
}
```

### Save as MyGeotab Page

When user clicks "Save Dashboard":

1. Generate unique page identifier
2. Serialize module configuration to JSON
3. Save configuration to user preferences or database
4. Register new page in MyGeotab menu system
5. Redirect to new dashboard page
6. Page loads and renders modules from configuration

---

## MVP Scope (Phase 1)

### Recipes to Build
1. ✅ Safety Scorecard
2. ✅ Maintenance Overview (reference implementation exists)
3. ✅ Compliance Dashboard

### Modules to Implement
1. ✅ Overview Card (already in react-library)
2. Immediate Actions (copy from Maintenance)
3. Metric Chart (copy from Maintenance)
4. Performance Rankings (copy from Maintenance)
5. Benchmark Bar (copy from Collision Risk)

### Infrastructure
- Recipe picker UI
- Module selector UI
- Layout configurator
- Preview renderer
- Save/load configuration service
- MyGeotab add-in framework

---

## Success Criteria

- **User can create a dashboard in < 5 minutes** using conversational flow
- **3 recipes available** at launch (Safety, Maintenance, Compliance)
- **Dashboards save as native MyGeotab pages** with proper permissions
- **Modules are reusable** across different recipes
- **Layouts are responsive** (mobile, tablet, desktop)

---

## Future Enhancements

- Custom recipe creation (user-defined module combinations)
- Recipe sharing across organization
- AI-powered recipe recommendations based on usage
- Export to PDF/PowerPoint
- Scheduled email reports
- Real-time dashboard updates
- Mobile app integration
