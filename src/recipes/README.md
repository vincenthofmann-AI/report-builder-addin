# Dashboard Recipes

This directory contains pre-configured dashboard recipe definitions in JSON format. Each recipe combines specific modules with data sources to create purpose-built overview dashboards.

## Available Recipes (MVP)

### 1. Safety Scorecard (`safety-scorecard.json`)
**Target Users:** 53,334+ (riskManagement + collisionRisk users)
**Category:** Safety
**Use Case:** Monitor and improve fleet safety performance

**Default Modules:**
- Collision Risk Overview (Overview Card)
- Safety Alerts (Immediate Actions)
- Collision Risk Benchmark (Benchmark Bar)
- Safety Metrics Trend (Metric Chart)
- Highest Risk Drivers (Performance Rankings)

**Available Modules:**
- Exception Types Breakdown (Overview Card)
- Safest Drivers (Performance Rankings)

**Required Permissions:**
- ViewCollisionRisk
- ViewExceptions
- ViewDrivers

---

### 2. Maintenance Overview (`maintenance-overview.json`)
**Target Users:** 68,977+ (schedules + requests + faults users)
**Category:** Maintenance
**Use Case:** Track maintenance operations, predict breakdowns, manage work orders

**Default Modules:**
- Immediate Actions (Immediate Actions)
- Maintenance Metrics (Metric Chart)
- Highest Risk of Breakdown (Performance Rankings)
- Performance Insights (Performance Rankings)

**Available Modules:**
- Total Work Orders (Overview Card)
- Average Downtime (Overview Card)
- Fault Breakdown (Overview Card)

**Required Permissions:**
- ViewMaintenanceWorkOrders
- ViewMaintenanceWorkRequests
- ViewFaults
- ViewMaintenanceOverview

---

### 3. Compliance Dashboard (`compliance-dashboard.json`)
**Target Users:** 133,722+ (hosLogs + availability + violations users)
**Category:** Compliance
**Use Case:** Monitor HOS compliance, manage violations, track driver availability

**Default Modules:**
- Compliance Status (Overview Card)
- Driver Availability (Overview Card)
- IFTA Summary (Overview Card)
- Critical Violations (Immediate Actions)
- Violation Trend (Metric Chart)
- Top Violators (Performance Rankings)

**Available Modules:**
- Most Compliant Drivers (Performance Rankings)
- Violation Types Breakdown (Overview Card)
- Miles by Jurisdiction (Performance Rankings)

**Required Permissions:**
- ViewHoSLogs
- ViewDutyStatusViolations
- ViewIftaMiles

---

## Recipe Structure

Each recipe JSON file follows the `RecipeDefinition` interface from `src/types/recipe.ts`:

```typescript
{
  id: string;                    // Unique recipe identifier
  name: string;                  // Display name
  description: string;           // Recipe description
  category: RecipeCategory;      // safety | maintenance | compliance | operations | fuel
  icon: string;                  // Zenith icon name
  estimatedUsers: number;        // Target user count from BigQuery
  tags: string[];               // Search/filter tags
  requiredPermissions: string[]; // SecurityIdentifier permissions
  defaultModules: ModuleConfig[]; // Pre-selected modules
  availableModules: ModuleConfig[]; // Optional modules user can add
}
```

### Module Configuration

Each module includes:

```typescript
{
  id: string;                    // Unique module identifier
  type: ModuleType;              // overview-card | immediate-actions | metric-chart | performance-rankings | benchmark-bar
  title: string;                 // Display title
  description: string;           // Module description
  icon: string;                  // Zenith icon name
  dataSource: DataSourceConfig;  // API entity and query config
  defaultPosition: {             // Grid layout position
    row: number;
    column: number;
    width: number;               // Grid columns (1-12)
  };
  configurable: boolean;         // Can user configure this module
  required: boolean;             // Cannot be removed from recipe
  options: {                     // Module-specific options
    trendConfig?: {...};         // For overview cards
    availableMetrics?: [...];    // For metric charts
    rankingLimit?: number;       // For performance rankings
    navigationConfig?: [...];    // For immediate actions
  }
}
```

### Data Source Configuration

Each module's data source specifies:

```typescript
{
  apiEntity: string;             // MyGeotab API entity name
  aggregationParams?: {          // For aggregated queries
    groupBy: string[];
    aggregations: AggregationConfig[];
  };
  filters?: FilterConfig[];      // Static filters
  dateRangeEnabled: boolean;     // Apply date range filter
  groupFilterEnabled: boolean;   // Apply groups filter
  sort?: {                       // Sort configuration
    sortBy: string;
    sortDirection: "asc" | "desc";
  };
  resultsLimit?: number;         // Max results
  propertySelector?: {           // Field selection
    fields: string[];
    isIncluded: boolean;
  };
}
```

---

## Usage

### Loading Recipes

```typescript
import safetyScorecard from './recipes/safety-scorecard.json';
import maintenanceOverview from './recipes/maintenance-overview.json';
import complianceDashboard from './recipes/compliance-dashboard.json';

const recipes: RecipeDefinition[] = [
  safetyScorecard,
  maintenanceOverview,
  complianceDashboard
];
```

### Filtering by Category

```typescript
const safetyRecipes = recipes.filter(r => r.category === 'safety');
const maintenanceRecipes = recipes.filter(r => r.category === 'maintenance');
```

### Checking Permissions

```typescript
import { usePageContext } from '@geotab/mygeotab';

const { hasAccessTo } = usePageContext();
const availableRecipes = recipes.filter(recipe =>
  recipe.requiredPermissions.every(perm => hasAccessTo(perm))
);
```

### Creating Dashboard from Recipe

```typescript
function createDashboardFromRecipe(recipe: RecipeDefinition, name: string): DashboardConfig {
  return {
    id: generateId(),
    name,
    recipeId: recipe.id,
    layout: 'grid',
    modules: recipe.defaultModules,
    dateRange: {
      defaultPeriod: '30d',
      allowCustom: true
    },
    groupsFilter: {
      enabled: true
    },
    refreshInterval: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: getCurrentUserId(),
    isShared: false
  };
}
```

---

## Next Steps

1. ✅ Create all 3 MVP recipe JSON files
2. ⏳ Design conversational flow wireframes
3. ⏳ Build recipe picker UI component
4. ⏳ Build module selector UI component
5. ⏳ Build dashboard renderer
6. ⏳ Implement save/load functionality

---

## References

- Type definitions: `src/types/recipe.ts`
- API entity mapping: `research/data-analysis/2026-02-24-api-entity-mapping.md`
- Dashboard spec: `artifacts/dashboard-recipes-spec.md`
- Maintenance overview reference: `src/pages/maintenance/overview/maintenanceOverview.tsx`
