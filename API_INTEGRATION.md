# MyGeotab API Integration

## Current Status: ✅ READY

The Report Builder add-in already has **complete MyGeotab API integration** built in. It works in two modes:

### 1. Live Mode (Running in MyGeotab)

When loaded as a MyGeotab add-in, the app receives the real `api` object and automatically switches to live data.

**Flow:**
```
MyGeotab Platform
  ↓ calls initialize(api, state, callback)
addin-lifecycle.ts
  ↓ dispatches GEOTAB_INIT_EVENT
GeotabProvider
  ↓ captures api object
  ↓ sets isLive = true
React Components
  ↓ use useGeotab() hook
  ↓ access live api via callApi()
MyGeotab Data
```

### 2. Demo Mode (Running Standalone)

When running locally (`npm run dev`), the app uses mock data after a 1.5s timeout.

**Architecture Files:**

| File | Purpose |
|------|---------|
| `addin-lifecycle.ts` | Registers `window.geotab.addin.reportBuilder` lifecycle hooks |
| `geotab-context.tsx` | React Context providing `api`, `session`, `isLive`, `isReady` |
| `geotab-mock.ts` | Mock data generator + live API bridge functions |

## How It Works

### Lifecycle Registration

```typescript
// addin-lifecycle.ts registers this on window:
window.geotab.addin.reportBuilder = () => ({
  initialize(api, state, callback) {
    window.__geotabAddinApi = api;
    window.dispatchEvent(new CustomEvent(GEOTAB_INIT_EVENT, { detail: { api, state }}));
    callback(); // Tell MyGeotab we're ready
  },
  focus(api, state) { /* refresh API reference */ },
  blur() { /* cleanup */ }
});
```

### React Context Hook

```typescript
const { api, isLive, session, isReady } = useGeotab();

if (isLive && api) {
  // Use real MyGeotab API
  api.call("Get", { typeName: "Device" }, setDevices, console.error);
} else {
  // Use mock data for development
}
```

### Promise-Based API Wrapper

```typescript
import { callApi } from "../services/geotab-mock";

// Automatically uses live API when available, falls back to mock
const devices = await callApi<Device[]>("Get", { typeName: "Device" });
```

## Data Sources Currently Supported

The mock data includes 5 data sources that **map directly to MyGeotab API entities**:

| Data Source | MyGeotab Entity | API Call |
|-------------|-----------------|----------|
| Trip History | `Trip` | `api.call("Get", { typeName: "Trip" })` |
| Fuel Transactions | `FuelTransaction` | `api.call("Get", { typeName: "FuelTransaction" })` |
| Driver Behavior | `ExceptionEvent` + aggregation | Custom logic needed |
| Maintenance | `WorkOrder` or custom | May need custom implementation |
| Engine Faults | `FaultData` | `api.call("Get", { typeName: "FaultData" })` |

## What's Already Working

✅ **Add-in lifecycle** - `initialize`, `focus`, `blur` all registered
✅ **API object capture** - Real MyGeotab API stored in context
✅ **Session info** - Database, username, server available
✅ **Mock fallback** - Works standalone for development
✅ **Promise wrapper** - `callApi()` provides async/await interface

## What Needs Verification

The code has the infrastructure, but **the data fetching in components still uses mock data directly**:

### Current Implementation (Mock Only)

```typescript
// ReportBuilder.tsx line 78-81
const rawData = useMemo(() => {
  if (!selectedSource) return [];
  return fetchData(selectedSource.id);  // ← Always returns mock data
}, [selectedSource]);
```

### Recommended Update (Live + Mock)

```typescript
const rawData = useMemo(() => {
  if (!selectedSource) return [];

  if (isLive && api) {
    // Map data source ID to MyGeotab entity type
    const typeMap = {
      'trips': 'Trip',
      'fuel': 'FuelTransaction',
      'faults': 'FaultData',
      // TODO: Add custom logic for 'behavior' and 'maintenance'
    };

    const typeName = typeMap[selectedSource.id];
    if (typeName) {
      api.call("Get", { typeName }, (result) => {
        // Update state with live data
      }, console.error);
    }
  }

  // Fallback to mock for development
  return fetchData(selectedSource.id);
}, [selectedSource, isLive, api]);
```

## Testing Checklist

**In MyGeotab (Live Mode):**
- [ ] Add-in loads without errors
- [ ] `isLive` is `true` in console
- [ ] Session info displays correct database/user
- [ ] Trip data loads from real MyGeotab database
- [ ] Fuel data loads from real MyGeotab database
- [ ] Fault data loads from real MyGeotab database
- [ ] Filters work on live data
- [ ] Charts render with live data
- [ ] Export functions work with live data

**In Development (Demo Mode):**
- [ ] `isReady` becomes `true` after 1.5s timeout
- [ ] Mock data displays correctly
- [ ] All features work with mock data
- [ ] No console errors

## MyGeotab API Reference

**Common Methods:**
```javascript
// Get entities
api.call("Get", {
  typeName: "Device",
  search: { fromDate: "2026-01-01" }
}, successCallback, errorCallback);

// Multi-call for efficiency
api.multiCall([
  ["Get", { typeName: "Device" }],
  ["Get", { typeName: "Trip" }]
], successCallback, errorCallback);

// Get session info
api.getSession((session) => {
  console.log(session.database, session.userName);
});
```

**Available Entity Types:**
- `Device` - Vehicles
- `Trip` - Trip records
- `FuelTransaction` - Fuel purchases
- `FaultData` - Diagnostic trouble codes
- `ExceptionEvent` - Driving events (speeding, harsh braking, etc.)
- `StatusData` - Real-time device status
- `LogRecord` - GPS breadcrumbs
- `Driver` - Driver records
- `Group` - Organization groups
- `Zone` - Geofence zones
- `WorkOrder` - Maintenance work orders (if enabled)

## Next Steps

1. **Verify in MyGeotab** - Test that the add-in receives the `api` object correctly
2. **Update data fetching** - Modify `ReportBuilder.tsx` to use live API when `isLive === true`
3. **Map data sources** - Ensure all 5 data sources have corresponding MyGeotab entity mappings
4. **Add error handling** - Show user-friendly errors if API calls fail
5. **Performance** - Add caching/pagination for large datasets

## References

- **MyGeotab Add-In SDK**: https://developers.geotab.com/myGeotab/addIns/developingAddIns/
- **API Reference**: https://developers.geotab.com/myGeotab/apiReference/
- **Code Examples**: https://github.com/Geotab/sdk-addin-samples
