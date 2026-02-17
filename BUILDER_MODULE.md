# Report Builder Module

## Overview

The Builder module is a **composable**, **reusable** module that allows users to create custom reports by selecting MyGeotab API objects, choosing fields, setting time ranges, and switching between table and chart views.

## Architecture

```
src/app/modules/builder/
├── index.ts                    # Public exports
├── types/
│   ├── builder.types.ts        # TypeScript type definitions
│   └── objects.constants.ts    # MyGeotab object metadata
├── hooks/
│   └── useReportBuilder.ts     # Composable state management hook
└── components/
    ├── ObjectSelector.tsx      # Pick Device/Trip/Event
    ├── FieldPicker.tsx         # Multi-select field picker
    ├── TimeRangeSelector.tsx   # Date range with presets
    ├── LayoutSwitcher.tsx      # Table/Chart toggle
    ├── BuilderPanel.tsx        # Left panel composition
    └── BuilderPage.tsx         # Right page with preview
```

## Key Features

### 1. **MyGeotab Object Selection**
Supports 12 common object types organized by category:

**Devices:**
- Device (tracking devices)
- DeviceStatusInfo (current vehicle state)

**Events & Exceptions:**
- ExceptionEvent (rule violations)
- FaultData (engine fault codes)
- DutyStatusLog (Hours of Service)
- StatusData (real-time parameters)

**Trips & Activities:**
- Trip (vehicle trips)
- LogRecord (GPS positions)
- ChargeEvent (EV charging)
- FillUp (fuel replenishment)
- FuelUsed (fuel consumption)

### 2. **Dynamic Field Selection**
- Fields auto-populate based on selected object
- Type indicators (string, number, date, boolean, object)
- Required vs optional field grouping
- Checkbox multi-select

### 3. **Time Range Configuration**
Presets:
- Today
- Yesterday
- Last 7 Days
- Last 30 Days
- This Month
- Last Month
- Custom Range (datetime picker)

### 4. **Layout Switching**
- **Table View**: Data grid with sortable columns
- **Chart View**: Bar, Line, Pie, or Area charts (placeholder - needs chart library integration)

## Usage

### Basic Implementation

```tsx
import { useReportBuilder, BuilderPanel, BuilderPage } from './modules/builder';

function ReportBuilderView() {
  const builder = useReportBuilder();

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-[360px]">
        <BuilderPanel
          selectedObject={builder.selectedObject}
          onSelectObject={builder.selectObject}
          selectedFields={builder.selectedFields}
          onToggleField={builder.toggleField}
          timeRange={builder.timeRange}
          onTimeRangeChange={builder.setTimeRange}
          layoutView={builder.layoutView}
          chartType={builder.chartType}
          onLayoutChange={builder.setLayoutView}
          onChartTypeChange={builder.setChartType}
          canExecute={builder.canExecute}
          onExecute={builder.executeQuery}
          isLoading={builder.isLoading}
        />
      </div>

      {/* Right Page */}
      <div className="flex-1">
        <BuilderPage
          selectedObject={builder.selectedObject}
          selectedFields={builder.selectedFields}
          data={builder.data}
          isLoading={builder.isLoading}
          error={builder.error}
          layoutView={builder.layoutView}
          chartType={builder.chartType}
        />
      </div>
    </div>
  );
}
```

### Current Integration

The builder is integrated into the **Templates** tab of the main app:

```tsx
// src/app/components/ReportBuilderPatternB.tsx
const builder = useReportBuilder();

// ...in Templates tab render:
<BuilderPanel {...builder} />
<BuilderPage {...builder.state} />
```

## User Workflow

1. **Navigate to Templates tab** (click Templates in top navigation)
2. **Select a data source**:
   - Choose category (Devices/Events/Trips)
   - Pick specific object type (e.g., "Trip")
3. **Choose fields**:
   - Check required fields (auto-included)
   - Select optional fields for report
4. **Set time range**:
   - Use preset (e.g., "Last 7 Days")
   - Or set custom start/end dates
5. **Configure view**:
   - Toggle between Table and Chart
   - If chart, select chart type
6. **Generate report**:
   - Click "Generate Report" button
   - View results in right panel

## Data Flow

```
User Action → useReportBuilder Hook → Component Re-render
                    ↓
            State Management
                    ↓
        executeQuery() (MyGeotab API)
                    ↓
            BuilderPage Display
```

## State Management

The `useReportBuilder` hook manages:
- `selectedObject`: Current MyGeotab object type
- `selectedFields`: Array of field names
- `timeRange`: { start, end, preset }
- `layoutView`: 'table' | 'chart'
- `chartType`: 'bar' | 'line' | 'pie' | 'area'
- `data`: Query results (array of objects)
- `isLoading`: Loading state
- `error`: Error message

## MyGeotab API Integration (TODO)

The current implementation uses **mock data**. To connect to the real MyGeotab API:

1. **Install MyGeotab SDK**:
   ```bash
   npm install @geotab/api
   ```

2. **Update `useReportBuilder.ts` → `executeQuery()`**:
   ```typescript
   import { authenticate, call } from '@geotab/api';

   const executeQuery = async () => {
     // Authenticate
     const credentials = await authenticate(database, username, password);

     // Build API call
     const results = await call('Get', {
       typeName: state.selectedObject,
       search: {
         fromDate: state.timeRange.start,
         toDate: state.timeRange.end,
       },
       resultsLimit: 1000,
     }, credentials);

     setState(prev => ({ ...prev, data: results }));
   };
   ```

3. **Use Geotab Context**:
   ```typescript
   import { useGeotab } from '../../services/geotab-context';

   const { api } = useGeotab();
   const results = await api.call('Get', { ... });
   ```

## Extensibility

### Add New Object Types

Edit `src/app/modules/builder/types/objects.constants.ts`:

```typescript
export const MYGEOTAB_OBJECTS: ObjectDefinition[] = [
  // ...existing objects
  {
    type: 'CustomData',
    category: 'events',
    label: 'Custom Data',
    description: 'Custom telemetry data from devices',
    icon: 'Database',
  },
];

export const OBJECT_FIELDS: Record<string, FieldDefinition[]> = {
  CustomData: [
    { name: 'id', label: 'ID', type: 'string', required: true },
    { name: 'data', label: 'Data Value', type: 'string' },
    // ...
  ],
};
```

### Add Chart Library Integration

Replace placeholder in `BuilderPage.tsx` with actual chart:

```tsx
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

// In BuilderPage chart view:
<BarChart data={data}>
  <XAxis dataKey={selectedFields[0]} />
  <YAxis />
  <Bar dataKey={selectedFields[1]} fill="#003a63" />
</BarChart>
```

### Use Builder Elsewhere

The builder is **fully composable** - use it anywhere:

```tsx
// In a modal
<Modal>
  <div className="flex">
    <BuilderPanel {...builder} />
    <BuilderPage {...builder.state} />
  </div>
</Modal>

// In a wizard step
<WizardStep>
  <ObjectSelector {...builder} />
</WizardStep>
```

## Styling

Uses **MYG Report State** visual treatment:
- Subdued colors (blues, grays)
- Data-dense layouts
- Clean borders and spacing
- Consistent with Geotab design system

## Testing

Access the builder:
1. Run dev server: `npm run dev`
2. Open http://localhost:5175
3. Click **Templates** tab
4. Follow workflow above

## Next Steps

- [ ] Integrate real MyGeotab API
- [ ] Add chart library (recharts/visx)
- [ ] Add report saving/loading
- [ ] Add export (CSV/PDF)
- [ ] Add scheduling
- [ ] Add sharing
