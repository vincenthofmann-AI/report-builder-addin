# Data Visualization Module

## Overview

The **data-viz** module applies intelligent **progressive disclosure** to the Report Builder by analyzing selected fields and determining:
1. **What visualizations are possible** (table only vs table + charts)
2. **Which chart types are appropriate** (bar, line, pie, area)
3. **What the best recommendation is** (scored 0-100)

This prevents users from selecting invalid chart configurations and guides them toward effective visualizations.

## Core Concept: Progressive Disclosure

**Progressive Disclosure** means showing users only the options that are valid for their current selection:

- **No numeric fields selected** → Chart option **disabled**, user sees warning
- **Numeric fields selected** → Chart option **enabled**, recommended chart type **auto-selected**
- **Time fields + measurements** → **Line/Area charts** scored higher
- **Categories + measurements** → **Bar charts** scored higher
- **Single dimension + single measure** → **Pie chart** becomes viable

## Architecture

```
src/app/modules/data-viz/
├── analyzers/
│   ├── fieldAnalyzer.ts           # Classify fields as measure/dimension/temporal
│   └── visualizationCapability.ts # Determine what charts are possible
├── recommenders/
│   └── chartRecommender.ts        # Score and recommend chart types
├── types/
│   └── visualization.types.ts     # TypeScript definitions
└── index.ts                        # Public API
```

## Field Classification

Fields are automatically classified into **roles** based on their type and name:

### Field Roles

| Role | Description | Examples |
|------|-------------|----------|
| **measure** | Numeric measurements | `speed`, `distance`, `temperature`, `volume`, `cost` |
| **dimension** | Categorical values | `name`, `type`, `status`, `state`, `category` |
| **temporal** | Time/date fields | `date`, `time`, `dateTime`, `start`, `end`, `duration` |
| **identifier** | IDs and keys | `id`, `deviceId`, `key`, `guid`, `uuid` |
| **metadata** | Other descriptive fields | Objects, complex types |

### Classification Logic

The analyzer uses **pattern matching** on field names and types:

```typescript
// Measurements (numeric values)
/^(speed|distance|temperature|volume|cost|energy|power|duration|count|total|average)$/i

// Temporal fields
/^(date|time|.*Date|.*Time|timestamp|dateTime|start|end|.*At|duration)$/i

// Dimensions (categorical)
/^(name|type|status|state|category|group|.*Type|.*Status|.*State)$/i
```

**Type-based fallback:**
- `number` → **measure**
- `date` → **temporal**
- `string` → **dimension**
- `object` → **metadata**

## Chart Recommendation Engine

### Scoring System (0-100)

Each chart type gets a **confidence score** based on the selected fields:

#### Bar Chart
- **Base score:** 60
- **+20** if categorical dimensions present
- **+10** if single measure (clear comparison)
- **-15** if temporal data exists (line chart better)

**Best for:** Comparing values across categories

#### Line Chart
- **Base score:** 50
- **+35** if temporal fields present (strong boost)
- **+10** if multiple measures (can show multiple lines)
- **-20** if no temporal data

**Best for:** Showing trends over time

#### Pie Chart
- **Base score:** 40 (lower preference)
- **+15** if exactly 1 dimension + 1 measure
- **-25** if temporal data (bad for time-series)
- **-20** if multiple measures

**Best for:** Parts of a whole (limited use)

#### Area Chart
- **Base score:** 45
- **+25** if temporal data present
- **+15** if multiple measures (stacked areas)
- **-25** if no temporal data

**Best for:** Cumulative trends over time

### Example Recommendations

**Scenario 1: Trip data with distance, speed, start time**
```
Fields: distance (measure), speed (measure), start (temporal)

Recommendations:
1. Line Chart (85 score) - "Best for showing trends over time"
2. Area Chart (70 score) - "Best for cumulative trends"
3. Bar Chart (55 score) - "Best for comparing values"
```

**Scenario 2: Device data with name, type**
```
Fields: name (dimension), type (dimension)

Recommendations:
None - No measurements available
Chart option: Disabled
```

**Scenario 3: Exception events with count, device type**
```
Fields: count (measure), deviceType (dimension)

Recommendations:
1. Bar Chart (80 score) - "Best for comparing values across categories"
2. Line Chart (30 score) - "Good for patterns"
3. Pie Chart (55 score) - "Best for parts of a whole"
```

## Integration with Builder

### 1. `useReportBuilder` Hook

The hook automatically analyzes fields on every change:

```typescript
const visualizationCapability = useMemo(() => {
  const selectedFieldDefs = objectFields.filter(f =>
    selectedFields.includes(f.name)
  );
  return analyzeVisualizationCapability(selectedFieldDefs);
}, [selectedObject, selectedFields]);
```

**Progressive disclosure logic:**
```typescript
// If chart view active but no measurements → force table view
if (layoutView === 'chart' && !capability.canShowChart) {
  newLayoutView = 'table';
  newChartType = undefined;
}

// If measurements available → auto-select recommended chart
if (capability.canShowChart && capability.recommendedChartType) {
  newChartType = capability.recommendedChartType;
}
```

### 2. `LayoutSwitcher` Component

**Disabled state when no measurements:**
```tsx
<button
  onClick={() => canShowChart && onLayoutChange('chart')}
  disabled={!canShowChart}
  className={!canShowChart ? 'cursor-not-allowed' : ''}
>
  Chart
</button>

{!canShowChart && (
  <div className="warning">
    Charts require numeric measurements.
    Select fields like speed, distance, or temperature.
  </div>
)}
```

**Chart type scoring display:**
```tsx
{chartTypes.map(type => {
  const recommendation = chartRecommendations.find(
    rec => rec.chartType === type.value
  );

  return (
    <button>
      {type.label}
      <span>{recommendation.score}</span>
    </button>
  );
})}
```

## API Reference

### `analyzeVisualizationCapability(fields)`

Main entry point for analyzing fields.

**Input:** `FieldDefinition[]`

**Output:** `VisualizationCapability`
```typescript
{
  canShowChart: boolean;
  canShowTable: boolean;  // Always true
  measures: AnalyzedField[];
  dimensions: AnalyzedField[];
  temporal: AnalyzedField[];
  recommendedChartType: ChartType | null;
  chartRecommendations: ChartRecommendation[];
}
```

### `analyzeField(field)`

Classify a single field into a role.

**Input:** `FieldDefinition`

**Output:** `AnalyzedField`
```typescript
{
  ...field,
  role: 'measure' | 'dimension' | 'temporal' | 'identifier' | 'metadata';
  isChartable: boolean;
  isMeasure: boolean;
  isDimension: boolean;
  isTemporal: boolean;
}
```

### `getChartRecommendations(fields)`

Get all chart recommendations sorted by score.

**Input:** `AnalyzedField[]`

**Output:** `ChartRecommendation[]`
```typescript
[
  {
    chartType: 'line',
    score: 85,
    reason: 'Best for showing trends over time',
    requirements: ['2 time field(s) for trend analysis']
  },
  ...
]
```

## Testing Scenarios

### Test 1: Progressive Disclosure (No Measurements)

1. Select **Device** object
2. Select only **name** and **deviceType** (both strings)
3. **Expected:** Chart button disabled, warning shown
4. Navigate to "Configure View" step
5. **Expected:** Only Table option available

### Test 2: Auto-Recommendation (Measurements Added)

1. Select **Trip** object
2. Select **id** and **start** (no measurements yet)
3. **Expected:** Chart disabled
4. Add **distance** field (measurement)
5. **Expected:** Chart enabled, "Bar Chart" auto-selected

### Test 3: Time-Series Recommendation

1. Select **Trip** object
2. Select **start** (temporal), **distance** (measure), **speed** (measure)
3. Navigate to "Configure View"
4. **Expected:** "Line Chart" recommended (highest score)
5. **Expected:** Score badges shown (e.g., Line: 85, Bar: 55)

### Test 4: Category Comparison

1. Select **ExceptionEvent** object
2. Select **rule** (dimension), **count** (measure)
3. **Expected:** "Bar Chart" recommended
4. Switch to Pie Chart
5. **Expected:** Explanation: "Best for showing parts of a whole"

## Extending the Module

### Add New Field Pattern

Edit `src/app/modules/data-viz/analyzers/fieldAnalyzer.ts`:

```typescript
const FIELD_PATTERNS = {
  // Add new measurement pattern
  measures: /^(speed|distance|...|YOUR_PATTERN)$/i,
};
```

### Add New Chart Type

1. **Add to builder types:**
```typescript
// src/app/modules/builder/types/builder.types.ts
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';
```

2. **Create recommender:**
```typescript
// src/app/modules/data-viz/recommenders/chartRecommender.ts
function recommendScatterChart(cardinality, fields) {
  // Scoring logic
  return {
    chartType: 'scatter',
    score: calculateScore(),
    reason: 'Best for correlation analysis',
    requirements: ['2+ numeric fields']
  };
}
```

3. **Add to LayoutSwitcher:**
```typescript
const chartTypes = [
  ...existing,
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
];
```

### Customize Scoring

Edit `chartRecommender.ts`:

```typescript
function recommendBarChart(cardinality, fields) {
  let score = 60; // Adjust base score

  // Add custom boosting logic
  if (fields.length > 10) {
    score += 10; // Boost for large datasets
  }

  return { chartType: 'bar', score, ... };
}
```

## Visual Feedback

### Disabled State
- Chart button grayed out
- Cursor: `not-allowed`
- Warning message with amber background
- Actionable guidance: "Select fields like speed, distance..."

### Enabled State
- Chart button active
- Recommended chart has green dot indicator
- Score badges on each chart type (0-100)
- Explanation text below selected chart

### Example Flow

```
User selects "Trip" object
  ↓
Selects "id", "device" (no measurements)
  ↓
Chart option DISABLED ❌
Warning: "Charts require numeric measurements"
  ↓
User adds "distance" field
  ↓
Chart option ENABLED ✅
Bar Chart auto-selected (score: 60)
  ↓
User adds "start" time field
  ↓
Line Chart auto-selected (score: 85)
Green dot on "Line Chart" 🟢
```

## Benefits

1. **Prevents errors** - Users can't create invalid charts
2. **Guides decisions** - Scoring helps choose appropriate visualizations
3. **Saves time** - Auto-recommendations reduce trial-and-error
4. **Educational** - Explanations teach visualization best practices
5. **Scalable** - Easy to add new chart types and patterns

## Next Steps

- [ ] Integrate with real MyGeotab API field metadata
- [ ] Add cardinality detection (warn if too many categories for pie chart)
- [ ] Add sample data preview before chart generation
- [ ] Support custom field patterns via configuration
- [ ] Add visualization templates (common report types)
