# Live MyGeotab API Integration - Implementation Complete ✅

## Summary

The Report Builder add-in now **automatically fetches live data from MyGeotab** when running as an add-in, while maintaining mock data support for standalone development.

## What Was Implemented

### 1. DataFetcher Service (`data-fetcher.ts`)

Created a unified data fetching service that:

**Automatic Mode Switching:**
```typescript
const fetcher = useDataFetcher();
const trips = await fetcher.fetchDataSource('trips');
// ↑ Uses live API if isLive===true, otherwise mock data
```

**Entity Type Mapping:**
| Data Source | MyGeotab Entity | Status |
|-------------|-----------------|--------|
| Trip History | `Trip` | ✅ Fully implemented |
| Fuel Transactions | `FuelTransaction` | ✅ Fully implemented |
| Engine Faults | `FaultData` | ✅ Fully implemented |
| Driver Behavior | `ExceptionEvent` (aggregated) | ✅ Custom logic |
| Maintenance | `WorkOrder` | ✅ With fallback |

**Data Transformers:**
- `transformTrip()` - Converts MyGeotab Trip to UI format
- `transformFuelTransaction()` - Handles fuel purchase data
- `transformFault()` - Determines severity (Low/Medium/High/Critical) and status (Active/Resolved/Pending)
- `fetchDriverBehavior()` - Aggregates ExceptionEvent data by driver/date
- `fetchMaintenance()` - Maps WorkOrder entities (falls back gracefully if unavailable)

### 2. Updated ReportBuilder Component

**Before:**
```typescript
const rawData = useMemo(() => {
  if (!selectedSource) return [];
  return fetchData(selectedSource.id);  // Always mock
}, [selectedSource]);
```

**After:**
```typescript
const dataFetcher = useDataFetcher();

useEffect(() => {
  dataFetcher
    .fetchDataSource(selectedSource.id)
    .then(setRawData)
    .catch((error) => {
      toast.error(`Failed to load ${selectedSource.name} data`);
      setRawData([]); // Graceful fallback
    });
}, [selectedSource, dataFetcher]);
```

**Benefits:**
- Async data loading with proper loading states
- Error handling with user-friendly toast notifications
- Automatic fallback to mock data on API errors
- Works in both live and demo modes

### 3. Error Handling Strategy

**Three Layers of Fallback:**

1. **Primary:** Fetch from live MyGeotab API
2. **Secondary:** If API call fails, log error and return mock data
3. **Tertiary:** If entity type unavailable (e.g., WorkOrder), return empty array

**User Experience:**
- Loading spinner while fetching
- Toast notification on errors
- Graceful degradation (shows empty data instead of crashing)

## How It Works

### Live Mode (Running in MyGeotab)

```
User selects "Trip History"
  ↓
DataFetcher.fetchDataSource('trips')
  ↓
Checks: isLive === true && api !== null
  ↓
api.call("Get", { typeName: "Trip" })
  ↓
transformTrip() converts to UI format
  ↓
Data displayed in table/chart
```

### Demo Mode (Running Standalone)

```
User selects "Trip History"
  ↓
DataFetcher.fetchDataSource('trips')
  ↓
Checks: isLive === false
  ↓
fetchMockData('trips') returns generated data
  ↓
Data displayed in table/chart
```

## Testing the Integration

### In MyGeotab

1. **Load the add-in** - Paste JSON configuration into Custom Registrations
2. **Open DevTools** - Press F12, check Console tab
3. **Verify initialization:**
   ```javascript
   // Should see in console:
   { isLive: true, session: { database: "your_db", userName: "..." }}
   ```
4. **Select a data source** - Choose "Trip History"
5. **Check network tab** - Should see MyGeotab API calls
6. **Verify data** - Table should show real trips from your database

### Expected Behavior

**Trip History:**
- Shows actual trips from your fleet
- Device names match your vehicle names
- Driver names from your database
- Real dates, distances, speeds

**Fuel Transactions:**
- Actual fuel purchases if FuelTransaction is tracked
- May be empty if fuel tracking not enabled

**Engine Faults:**
- Active/resolved fault codes from vehicles
- Severity based on malfunction lamp status
- Recent faults appear first

**Driver Behavior:**
- Aggregated safety scores
- Counts of harsh braking, acceleration, speeding
- Last 30 days of data

**Maintenance:**
- WorkOrder records if feature is enabled
- Empty if WorkOrder entity not available (graceful fallback)

## Debugging

### Check if Live Mode is Active

```javascript
// In browser console:
window.__geotabAddinApi
// Should return: {call: ƒ, multiCall: ƒ, getSession: ƒ, ...}
```

### Monitor API Calls

```javascript
// In ReportBuilder.tsx, the useEffect logs:
console.log("Fetching data for:", selectedSource.id);

// DataFetcher logs errors:
console.error("Failed to fetch trips:", error);
```

### Force Mock Mode

To test with mock data while in MyGeotab:
```typescript
// Temporarily set in data-fetcher.ts
if (!this.isLive || !this.api || true) { // ← Add || true
  return fetchMockData(sourceId);
}
```

## API Call Examples

### Get Trips (Last 30 Days)

```javascript
const fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 30);

api.call("Get", {
  typeName: "Trip",
  search: {
    fromDate: fromDate.toISOString()
  }
}, (trips) => {
  console.log(`Loaded ${trips.length} trips`);
}, console.error);
```

### Get Fault Data (Active Only)

```javascript
api.call("Get", {
  typeName: "FaultData",
  search: {
    dismissUser: null  // null = not dismissed (active)
  }
}, (faults) => {
  console.log(`Active faults: ${faults.length}`);
}, console.error);
```

### Multi-Call for Efficiency

```javascript
api.multiCall([
  ["Get", { typeName: "Device" }],
  ["Get", { typeName: "Trip" }],
  ["Get", { typeName: "FaultData" }]
], (results) => {
  const [devices, trips, faults] = results;
  console.log("All data loaded:", { devices, trips, faults });
}, console.error);
```

## Known Limitations

1. **Driver Behavior** - Custom aggregation logic may differ from MyGeotab's native safety scoring
2. **Maintenance** - WorkOrder entity may not be available in all databases (gracefully handles this)
3. **Data Volume** - No pagination yet; large datasets may be slow (TODO: add pagination)
4. **Date Filters** - Currently loads all data; should add date range filters for performance

## Next Steps

### Performance Optimization
- [ ] Add date range filters (default: last 30 days)
- [ ] Implement pagination for large datasets
- [ ] Cache API responses to reduce redundant calls
- [ ] Add loading progress indicators for multi-step fetches

### Enhanced Features
- [ ] Allow users to configure date ranges in UI
- [ ] Add "Refresh Data" button
- [ ] Show data freshness timestamp
- [ ] Support real-time data updates (StatusData)

### Data Source Expansion
- [ ] Add LogRecord (GPS breadcrumbs) data source
- [ ] Add Zone (geofence) crossing reports
- [ ] Add Custom Data (custom form fields)
- [ ] Add HOS (Hours of Service) if available

## Files Modified

| File | Changes |
|------|---------|
| `src/app/services/data-fetcher.ts` | **NEW** - Data fetching service with live/mock switching |
| `src/app/components/ReportBuilder.tsx` | Updated to use `useDataFetcher()` hook |
| `docs/assets/index-CQF4OI7N.js` | Rebuilt with new logic |

## Deployment

**Live URL:** https://vincenthofmann-ai.github.io/report-builder-addin/

**Status:** ✅ Deployed

The updated add-in is now live and will automatically use real MyGeotab data when loaded as an add-in!

## Support

If data isn't loading:
1. Check browser console for errors
2. Verify `isLive === true` in console
3. Check `api.call()` logs for API errors
4. Confirm entity types exist in your database (some features vary by subscription)
