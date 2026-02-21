# Query Builder Architecture - Critical Analysis

## Current Problems

### 1. **Confusing Terminology**
**Current:** "Rows", "Columns", "Values"
- This is pivot table language, not report builder language
- Users don't understand what "Rows" means in a tabular report
- "Values" implies aggregation but works on any numeric field

**Should be:** "Fields", "Filters", "Group By", "Metrics"

### 2. **Broken Logic Flow**
```tsx
// CURRENT BROKEN FLOW:
1. Select data source → Auto-runs query
2. Drag field to "Rows" → What does this do?
3. Drag field to "Columns" → Doesn't show in table?
4. Drag field to "Values" → Only shows if you also have "Rows"?
5. No clear preview vs final output
```

**Should be:**
```
1. Select data source
2. Select fields to display
3. Apply filters (Time, Categorical, Numeric)
4. Choose grouping (optional)
5. Add metrics/aggregations (optional)
6. Pick visualization type
7. Run query → See results
```

### 3. **Filter Architecture is Wrong**
**Current:** Generic field filters with operators
```tsx
interface FieldFilter {
  field: Field;
  operator: "equals" | "contains" | "greater" | "less";
  value: string;
}
```

**Should be:** Type-specific filters organized by category
```tsx
// Time Filters
{
  type: "time",
  column: "start",
  range: "last_7_days" | "this_month" | "custom",
  customRange: { start: Date, end: Date }
}

// Categorical Filters (Group, Location, etc.)
{
  type: "categorical",
  column: "device" | "driver" | "location",
  operator: "in" | "not_in",
  values: ["Truck 101", "Van 202"]
}

// Numeric Filters
{
  type: "numeric",
  column: "distance",
  operator: "between" | "greater" | "less",
  value: { min: 100, max: 500 }
}
```

### 4. **No Clear Data Preview**
Currently shows ALL data immediately. Should show:
- Sample rows (first 10) for preview
- Full results after "Run Query"
- Row count clearly displayed

### 5. **Grouping/Aggregation Logic Broken**
```tsx
// Current: Confusing drop zones
Rows (Grouping) ← What is this?
Columns         ← Never shows up in output
Values (Metrics) ← Only works with Rows?
```

**Should be:**
```tsx
// Clear query structure
{
  fields: ["device", "driver", "distance", "start"],  // Columns to show
  filters: [...],                                      // WHERE clauses
  groupBy: ["device"],                                 // GROUP BY
  metrics: [                                           // Aggregations
    { field: "distance", aggregation: "SUM", label: "Total Distance" },
    { field: "trip_id", aggregation: "COUNT", label: "Trip Count" }
  ],
  orderBy: [{ field: "distance", direction: "DESC" }]
}
```

---

## Proposed New Architecture

### Panel 1: Data Source & Fields
```
┌─────────────────────────┐
│ 📊 Data Source          │
│ ▼ Trip History          │
│                         │
│ ✓ Available Fields      │
│ ☑ device                │
│ ☑ driver                │
│ ☑ start                 │
│ ☑ distance              │
│ ☑ duration              │
│                         │
│ [Select All] [Clear]    │
└─────────────────────────┘
```

### Panel 2: Query Configuration
```
┌─────────────────────────┐
│ ⏰ Time                 │
│ Column:  [start      ▼] │
│ Range:   [Last 7 Days▼] │
│                         │
│ 🔍 Filters              │
│ + Add Filter            │
│ device = "Truck 101" [×]│
│ distance > 100       [×]│
│                         │
│ 📊 Group By             │
│ □ Enable Grouping       │
│ Fields: [device      ▼] │
│                         │
│ 📈 Metrics              │
│ □ Enable Aggregations   │
│ + Add Metric            │
│                         │
│ 📉 Chart Type           │
│ ○ Table                 │
│ ○ Bar Chart             │
│ ○ Line Chart            │
└─────────────────────────┘
```

### Panel 3: Results
```
┌─────────────────────────┐
│ Results (50 rows)       │
│ ⚡ Run Query    250ms   │
│                         │
│ [Table with data]       │
│                         │
│ ⬇ Download CSV          │
└─────────────────────────┘
```

---

## Geotab API Object Mapping

### Data Sources (from GEOTAB_API_MODEL.md)

**Trip History:**
```typescript
{
  name: "Trip History",
  apiObject: "Trip",
  fields: [
    { name: "device", type: "string", filterable: true, groupable: true },
    { name: "driver", type: "string", filterable: true, groupable: true },
    { name: "start", type: "datetime", filterable: true, groupable: false },
    { name: "stop", type: "datetime", filterable: true, groupable: false },
    { name: "distance", type: "number", filterable: true, aggregatable: true },
    { name: "duration", type: "number", filterable: true, aggregatable: true },
  ],
  defaultTimeColumn: "start",
  defaultFilters: { timeRange: "last_30_days" }
}
```

**Driver Behavior:**
```typescript
{
  name: "Driver Behavior",
  apiObject: "DutyStatusLog", // or custom driver behavior data
  fields: [
    { name: "driver", type: "string", filterable: true, groupable: true },
    { name: "date", type: "date", filterable: true, groupable: true },
    { name: "safetyScore", type: "number", filterable: true, aggregatable: true },
    { name: "harshBraking", type: "number", filterable: true, aggregatable: true },
    { name: "speeding", type: "number", filterable: true, aggregatable: true },
  ],
  defaultTimeColumn: "date"
}
```

### Filter Types by Field Type

**String Fields (device, driver, location):**
- equals, not equals
- in, not in (multi-select)
- contains, not contains
- starts with, ends with

**Number Fields (distance, duration, speed):**
- equals, not equals
- greater than, less than
- between
- top N, bottom N

**Date/DateTime Fields (start, stop, date):**
- is, is not
- before, after
- between
- relative (last 7 days, this month, last quarter)

---

## Implementation Plan

### Phase 1: Rebuild Query Builder Core (Today)

1. **New Component: ReportBuilderV8**
   - Clean slate, proven architecture
   - Superset-style sections (Time → Query → Customize)

2. **Clear Query Model**
   ```tsx
   interface ReportQuery {
     dataSource: string;
     fields: string[];              // SELECT
     timeFilter?: TimeFilter;       // WHERE time
     filters: Filter[];             // WHERE conditions
     groupBy?: string[];            // GROUP BY
     metrics?: Metric[];            // Aggregations
     orderBy?: OrderBy[];           // ORDER BY
     limit?: number;                // LIMIT
   }
   ```

3. **Type-Safe Filters**
   ```tsx
   type Filter =
     | TimeFilter
     | CategoricalFilter
     | NumericFilter
     | TextFilter;
   ```

4. **Checkbox Field Selection** (not drag-drop for now)
   - Simpler, clearer
   - Can add drag-drop later as enhancement

### Phase 2: Better UX (Next)

5. **Query Preview** - Show SQL-like representation
   ```
   SELECT device, driver, SUM(distance)
   FROM Trip
   WHERE start >= '2026-02-14'
     AND device IN ['Truck 101', 'Van 202']
   GROUP BY device, driver
   ORDER BY SUM(distance) DESC
   LIMIT 50
   ```

6. **Sample Data** - First 10 rows preview
7. **Smart Defaults** - Auto-select time column, default to last 30 days

### Phase 3: Advanced Features (Later)

8. **Metric Builder Modal**
9. **Saved Queries**
10. **Export CSV/Excel**

---

## Key Decisions

### ✅ DO:
- Use clear, industry-standard terminology
- Separate concerns: Fields → Filters → Grouping → Visualization
- Type-specific filter UI (date picker, multi-select, range slider)
- Show query preview
- Sample data before full run

### ❌ DON'T:
- Use confusing pivot table terminology (Rows/Columns/Values)
- Auto-execute on every change
- Mix configuration with results
- Require drag-and-drop for basic selection
- Show all data by default (performance issue with real API)

---

## References

- Superset Explore interface (SUPERSET_UX_LEARNINGS.md)
- Salesforce Report Builder (SALESFORCE_ANALYSIS.md)
- Geotab API Objects (GEOTAB_API_MODEL.md)
