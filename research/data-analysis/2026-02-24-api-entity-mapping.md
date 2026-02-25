# API Entity Mapping for Dashboard Recipes

**Date:** 2026-02-24
**Type:** Technical Research
**Purpose:** Map MyGeotab API entities to each dashboard recipe module

## Data Sources

- Maintenance Overview implementation (GitLab: `apps/MyGeotab/src/pages/maintenance/overview/`)
- MyGeotab API documentation
- @geotab/myapi package entity definitions

---

## Recipe 1: Safety Scorecard

### Module 1: Collision Risk Overview (Overview Card)

**API Entity:** `CollisionRiskAnalytics` (Analytics model)
**Endpoint:** Analytics service (collision risk model)
**Fields needed:**
- `score`: number (0-100)
- `dateCalculated`: DateTime
- `device`: Device reference

**Aggregation:**
```typescript
useMyGetAggregation(
  CollisionRiskAnalytics,
  {
    aggregationParams: {
      groupBy: ["database"],
      aggregations: [{ op: "avg", field: "score" }]
    },
    search: {
      fromDate: dateRange.start,
      toDate: dateRange.end,
      groupFilterCondition
    }
  }
)
```

**Trend calculation:**
- Current period average score
- Previous period average score
- Percentage change (week-over-week)

---

### Module 2: Safety Alerts (Immediate Actions)

**Primary Entity:** `ExceptionEvent`
**Supporting Entities:**
- `Exception` - Rule definitions
- `Device` - Asset information
- `Driver` - Driver information

**Queries needed:**

**Critical Exceptions (last 7 days):**
```typescript
useMyGet(
  ExceptionEvent,
  {
    search: {
      fromDate: sevenDaysAgo,
      toDate: today,
      rule: { /* safety rule IDs */ },
      groupFilterCondition
    }
  }
)
```

**High-Risk Drivers:**
```typescript
useMyGetAggregation(
  ExceptionEvent,
  {
    aggregationParams: {
      groupBy: ["driver"],
      aggregations: [{ op: "count", field: "*" }]
    },
    search: {
      fromDate: thirtyDaysAgo,
      toDate: today,
      groupFilterCondition
    }
  }
)
```

**Safety Events by Asset:**
```typescript
useMyGetAggregation(
  ExceptionEvent,
  {
    aggregationParams: {
      groupBy: ["device"],
      aggregations: [{ op: "count", field: "*" }]
    },
    search: {
      fromDate: sevenDaysAgo,
      toDate: today,
      groupFilterCondition
    }
  }
)
```

---

### Module 3: Collision Risk Benchmark (Benchmark Bar)

**API Entity:** `CollisionRiskAnalytics` + Benchmark data
**Fields needed:**
- `fleetScore`: number (your fleet's average)
- `industryBenchmark`: number (industry average)
- `percentile`: number (fleet percentile ranking)

**Query:**
```typescript
const fleetScore = useMyGetAggregation(
  CollisionRiskAnalytics,
  {
    aggregationParams: {
      aggregations: [{ op: "avg", field: "score" }]
    },
    search: {
      fromDate: ninetyDaysAgo,
      toDate: today,
      groupFilterCondition
    }
  }
)

// Benchmark data may come from separate service or hardcoded
const industryBenchmark = 65; // Example static value
```

---

### Module 4: Safety Metrics Trend (Metric Chart)

**Switchable metrics - different entities:**

**Metric 1: Exception Count**
- Entity: `ExceptionEvent`
- Aggregation: COUNT(*)
- Group by: StatusDate

**Metric 2: Harsh Events**
- Entity: `ExceptionEvent`
- Filter: rule.name IN ('Harsh Braking', 'Harsh Acceleration', 'Harsh Cornering')
- Aggregation: COUNT(*)

**Metric 3: Collision Risk Score**
- Entity: `CollisionRiskAnalytics`
- Aggregation: AVG(score)
- Group by: dateCalculated

**Metric 4: Collision Count**
- Entity: `Collision` or `ExceptionEvent` (collision-related)
- Aggregation: COUNT(*)

**Query pattern:**
```typescript
useMyGetAggregation(
  selectedEntity, // Changes based on metric switcher
  {
    aggregationParams: {
      groupBy: ["statusDate"],
      aggregations: [selectedAggregation]
    },
    search: {
      fromDate: dateRange.start,
      toDate: dateRange.end,
      ...selectedFilters,
      groupFilterCondition
    }
  }
)
```

---

### Module 5: Highest Risk Drivers (Performance Rankings)

**API Entity:** `Driver` + `CollisionRiskAnalytics` or `ExceptionEvent`
**Query:**
```typescript
useMyGetAggregation(
  ExceptionEvent,
  {
    aggregationParams: {
      groupBy: ["driver"],
      aggregations: [
        { op: "count", field: "*", alias: "exceptionCount" },
        { op: "sum", field: "severity", alias: "totalSeverity" }
      ]
    },
    search: {
      fromDate: ninetyDaysAgo,
      toDate: today,
      groupFilterCondition
    },
    sort: { sortBy: "totalSeverity", sortDirection: "desc" },
    resultsLimit: 10
  }
)
```

**Fields to display:**
- Driver name
- Exception count
- Risk score (calculated from severity)
- Link to driver details page

---

## Recipe 2: Maintenance Overview

**Status:** ✅ Entities already documented in reference implementation

### Entities Used (from source code analysis)

**Primary Entities:**
- `MaintenanceWorkOrderEntity` - Work orders
- `MaintenanceWorkRequestEntity` - Work requests
- `MaintenanceWorkOrderJobEntity` - Job details
- `FaultDataEntity` - Fault codes
- `VehicleDowntimeEntity` - Downtime tracking

**Module Breakdown:**

**Immediate Actions:**
```typescript
// Severe work requests
useMyCountOf(
  MaintenanceWorkRequestEntity,
  {
    deviceSearch: { /* filters */ },
    isReviewed: false,
    isSnoozed: true, // Workaround: inverted logic
    severities: SEVERE // ['Critical', 'High']
  }
)

// Severe faults (last 7 days)
useMyGet(
  FaultDataEntity,
  {
    search: {
      fromDate: sevenDaysAgo,
      toDate: today,
      excludeDismissed: true,
      severityCodes: severeFaultSeverities,
      enrichDataFromAuthorizedVendors: true,
      onlyLast: true,
      diagnosticSearch: {
        sourceSearch: {
          ids: faultSourceByDiagnosticSource.vehicle
        }
      },
      groupFilterCondition
    }
  }
)

// Vehicles with downtime > 14 days
useMyGetAggregation(
  VehicleDowntimeEntity,
  {
    aggregationParams: {
      groupBy: ["device"],
      aggregations: [{ op: "sum", field: "downtimeSeconds" }]
    },
    search: {
      fromDate: fifteenDaysAgo,
      toDate: today,
      groupFilterCondition
    }
  }
)
```

**Metric Chart:**
```typescript
useMyGetAggregation(
  MaintenanceWorkOrderEntity, // Or MaintenanceWorkRequestEntity
  {
    aggregationParams: {
      groupBy: ["completedDate"], // Or statusDate
      aggregations: [{ op: "count", field: "*" }]
    },
    search: {
      fromDate: dateRange.start,
      toDate: dateRange.end,
      groupFilterCondition
    }
  }
)
```

**Performance Rankings:**
```typescript
// Assets - Highest Risk of Breakdown
useMyGetAggregation(
  VehicleDowntimeEntity, // Or prediction model entity
  {
    aggregationParams: {
      groupBy: ["device"],
      aggregations: [
        { op: "count", field: "*", alias: "breakdownCount" },
        { op: "sum", field: "downtimeSeconds", alias: "totalDowntime" }
      ]
    },
    search: {
      fromDate: ninetyDaysAgo,
      toDate: today,
      groupFilterCondition
    },
    sort: { sortBy: "breakdownCount", sortDirection: "desc" },
    resultsLimit: 10
  }
)

// Groups - Performance aggregation
useMyGetAggregation(
  MaintenanceWorkOrderEntity,
  {
    aggregationParams: {
      groupBy: ["group"],
      aggregations: [
        { op: "count", field: "*", alias: "workOrderCount" },
        { op: "sum", field: "totalCosts", alias: "totalCost" }
      ]
    },
    search: {
      fromDate: ninetyDaysAgo,
      toDate: today,
      statuses: MAINTENANCE_CLOSED
    }
  }
)
```

---

## Recipe 3: Compliance Dashboard

### Module 1: Compliance Status (Overview Card)

**API Entity:** `HoSViolation` or `DutyStatusViolation`
**Fields needed:**
- `violationType`: string
- `driver`: Driver reference
- `dateTime`: DateTime
- `isActive`: boolean

**Query:**
```typescript
useMyCountOf(
  DutyStatusViolation,
  {
    search: {
      fromDate: today,
      toDate: today,
      isActive: true,
      groupFilterCondition
    }
  }
)
```

---

### Module 2: Critical Violations (Immediate Actions)

**API Entity:** `DutyStatusViolation` + `DutyStatusLog`
**Queries:**

**Active Violations:**
```typescript
useMyGet(
  DutyStatusViolation,
  {
    search: {
      isActive: true,
      severity: 'Critical',
      groupFilterCondition
    },
    resultsLimit: 100
  }
)
```

**Drivers Approaching Limits:**
```typescript
useMyGet(
  DutyStatusAvailability,
  {
    search: {
      date: today,
      hoursRemaining: { max: 2 }, // Less than 2 hours remaining
      groupFilterCondition
    }
  }
)
```

**Missing Logs:**
```typescript
useMyGet(
  DutyStatusLog,
  {
    search: {
      fromDate: sevenDaysAgo,
      toDate: today,
      hasCertified: false,
      groupFilterCondition
    }
  }
)
```

---

### Module 3: Driver Availability (Overview Card)

**API Entity:** `DutyStatusAvailability`
**Fields needed:**
- `driver`: Driver reference
- `date`: Date
- `availableHours`: number
- `drivingHoursRemaining`: number

**Query:**
```typescript
useMyCountOf(
  DutyStatusAvailability,
  {
    search: {
      date: today,
      drivingHoursRemaining: { min: 4 }, // At least 4 hours available
      groupFilterCondition
    }
  }
)
```

**Calculation:**
```typescript
const availableDrivers = count;
const totalDrivers = totalActiveDriverCount;
const availabilityPercentage = (availableDrivers / totalDrivers) * 100;
```

---

### Module 4: Violation Trend (Metric Chart)

**Switchable metrics:**

**Metric 1: Violation Count**
- Entity: `DutyStatusViolation`
- Aggregation: COUNT(*)
- Group by: date

**Metric 2: Available Hours**
- Entity: `DutyStatusAvailability`
- Aggregation: AVG(drivingHoursRemaining)
- Group by: date

**Metric 3: Log Completeness**
- Entity: `DutyStatusLog`
- Aggregation: COUNT(hasCertified = true) / COUNT(*)
- Group by: date

**Query pattern:**
```typescript
useMyGetAggregation(
  DutyStatusViolation,
  {
    aggregationParams: {
      groupBy: ["date"],
      aggregations: [{ op: "count", field: "*" }]
    },
    search: {
      fromDate: dateRange.start,
      toDate: dateRange.end,
      groupFilterCondition
    }
  }
)
```

---

### Module 5: Top Violators (Performance Rankings)

**API Entity:** `DutyStatusViolation` + `Driver`
**Query:**
```typescript
useMyGetAggregation(
  DutyStatusViolation,
  {
    aggregationParams: {
      groupBy: ["driver"],
      aggregations: [
        { op: "count", field: "*", alias: "violationCount" },
        { op: "count", field: "severity", alias: "criticalCount", where: "severity = 'Critical'" }
      ]
    },
    search: {
      fromDate: thirtyDaysAgo,
      toDate: today,
      groupFilterCondition
    },
    sort: { sortBy: "violationCount", sortDirection: "desc" },
    resultsLimit: 10
  }
)
```

**Fields to display:**
- Driver name
- Total violations
- Critical violations
- Violation types
- Link to driver HOS logs

---

### Module 6: IFTA Summary (Overview Card)

**API Entity:** `IftaDetail` or `IftaMilesSummary`
**Fields needed:**
- `jurisdiction`: string (state/province code)
- `miles`: number
- `fuelConsumed`: number
- `quarter`: string

**Query:**
```typescript
useMyGetAggregation(
  IftaDetail,
  {
    aggregationParams: {
      groupBy: ["jurisdiction"],
      aggregations: [
        { op: "sum", field: "totalMiles", alias: "totalMiles" },
        { op: "sum", field: "fuelConsumed", alias: "totalFuel" }
      ]
    },
    search: {
      fromDate: quarterStart,
      toDate: quarterEnd,
      groupFilterCondition
    }
  }
)
```

---

## Common Patterns Across Recipes

### Date Range Filtering
All modules support date range selection:
```typescript
const [dateRange, setDateRange] = useState<IDateRangeInfo>();

// Use in search:
search: {
  fromDate: dateRange?.start || defaultStart,
  toDate: dateRange?.end || defaultEnd
}
```

### Group Filtering
All modules support groups filter:
```typescript
const { groups, groupFilterCondition } = useGroupsFilter();

// Use in search:
search: {
  groupFilterCondition // Automatically filters by selected groups
}
```

### Aggregation Pattern
```typescript
useMyGetAggregation(
  Entity,
  {
    aggregationParams: {
      groupBy: ["field1", "field2"],
      aggregations: [
        { op: "sum" | "avg" | "count" | "max" | "min", field: "fieldName" }
      ]
    },
    search: { /* filters */ }
  }
)
```

### Count Pattern
```typescript
useMyCountOf(
  Entity,
  {
    search: { /* filters */ }
  }
)
```

### Get Pattern
```typescript
useMyGet(
  Entity,
  {
    search: { /* filters */ },
    sort: { sortBy: "field", sortDirection: "asc" | "desc" },
    resultsLimit: number
  }
)
```

---

## Permission Requirements

Each recipe and module requires specific security clearances:

### Safety Scorecard
- `ViewCollisionRisk` - Collision risk data
- `ViewExceptions` - Exception events
- `ViewDrivers` - Driver information

### Maintenance Overview
- `ViewMaintenanceWorkOrders` - Work order data
- `ViewMaintenanceWorkRequests` - Work request data
- `ViewFaults` - Fault data
- `ViewMaintenanceOverview` - New permission for overview page

### Compliance Dashboard
- `ViewHoSLogs` - HOS log access
- `ViewDutyStatusViolations` - Violation data
- `ViewIftaMiles` - IFTA reporting data

**Permission check pattern:**
```typescript
const { hasAccessTo } = usePageContext();
const canView = hasAccessTo(SecurityIdentifier.ViewMaintenanceWorkOrders);

// Conditional data fetching:
const data = useMyGet(Entity, config, { enabled: canView });
```

---

## API Rate Limiting & Performance

**Best practices for dashboard recipes:**

1. **Use aggregations** instead of fetching all records:
   ```typescript
   // Good - single aggregation query
   useMyGetAggregation(Entity, { aggregationParams: { ... } })

   // Bad - fetch all then aggregate in JS
   useMyGet(Entity, { resultsLimit: 10000 })
   ```

2. **Limit result sets:**
   ```typescript
   resultsLimit: 100 // For lists/rankings
   ```

3. **Use propertySelector** to fetch only needed fields:
   ```typescript
   propertySelector: {
     fields: ["id", "name", "score"],
     isIncluded: true
   }
   ```

4. **Cache queries** with React Query:
   ```typescript
   // Automatic with useMyApi hooks
   staleTime: 5 * 60 * 1000 // 5 minutes
   ```

5. **Parallel loading** with ErrorBoundary per section:
   ```typescript
   <ErrorBoundary key="section1">
     <Module1 />
   </ErrorBoundary>
   <ErrorBoundary key="section2">
     <Module2 />
   </ErrorBoundary>
   ```

---

## Next Steps

1. ✅ Document API entities for each recipe
2. Validate entity availability in @geotab/myapi package
3. Create TypeScript interfaces for recipe data models
4. Build data fetching hooks for each module
5. Implement error handling and loading states
6. Add permission-based conditional rendering

---

## References

- GitLab: `apps/MyGeotab/src/pages/maintenance/overview/`
- Package: `@geotab/myapi/dist/entities`
- Hooks: `src/shared/api/useMyApi.ts`
- Clearances: `src/pages/maintenance/maintenanceClearances.ts`
