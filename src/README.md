# Overview-Builder Source Files

This directory contains reference implementation files copied from the MyGeotab Development repository for the Overview-Builder project.

## Source Files

### Maintenance Overview Pattern
**Origin:** `apps/MyGeotab/src/pages/maintenance/overview/`

Files copied:
- `pages/maintenance/overview/maintenanceOverview.tsx` - Main page component
- `pages/maintenance/overview/maintenanceOverview.less` - Page styles
- `pages/maintenance/overview/components/maintenanceOverviewImmediateActions.tsx` - Immediate action items section
- `pages/maintenance/overview/components/maintenanceOverviewMetricChart.tsx` - Metric chart with switcher
- `pages/maintenance/overview/components/maintenanceOverviewPerformance.tsx` - Performance insights section
- `pages/maintenance/overview/components/AssetsPerformanceView.tsx` - Assets performance view
- `pages/maintenance/overview/components/GroupsPerformanceView.tsx` - Groups performance view

### React Library Overview Component
**Origin:** `libs/javascript/react-library/overview/`

Files copied:
- `shared/react-library/overview/overview.tsx` - Reusable overview card component
- `shared/react-library/overview/overview.less` - Overview card styles

## Key Patterns to Study

### 1. Overview Card Component
The `overview.tsx` component provides a reusable pattern for displaying:
- Icon (optional)
- Title
- Description
- Label with percentage and arrow indicators (up/down)
- Type indicators (positive/negative/neutral)

### 2. Maintenance Overview Architecture
The maintenance overview demonstrates:
- **Layout structure:** Header with filters → Content sections
- **Filter integration:** Groups filter + Date range selector
- **Section composition:** Immediate actions + Metric chart + Performance insights
- **Permission handling:** Granular access control for different sections
- **Data fetching:** Custom hooks for aggregations and API calls
- **Error boundaries:** Isolated error handling per section

### 3. Performance Views
Two view modes:
- **Assets view:** Performance metrics by individual asset
- **Groups view:** Aggregated performance by groups

### 4. Components Used from Zenith
- `Layout`, `Header`, `FiltersBar` - Page structure
- `Bookmark` - Bookmarking functionality
- `Card` - Content containers
- `ErrorBoundary` - Error handling
- `DateRangeSelector` - Date filtering
- `LazyContent` - Loading states

## Next Steps for Adaptation

1. **Simplify for MVP:**
   - Remove maintenance-specific logic
   - Keep core layout and filter patterns
   - Adapt for generic dashboard building

2. **Add Conversational Flow:**
   - Add chat interface for dashboard configuration
   - Implement recipe selection (safety scorecard, maintenance, etc.)
   - Create insight picker from AI capabilities

3. **Make it Configurable:**
   - Allow users to select which metrics to display
   - Enable custom chart types
   - Support multiple sections/cards

4. **Integration Points:**
   - Connect to Geotab AI insights API
   - Support multiple data sources
   - Enable export/sharing of dashboards

## Development Notes

**Original Authors:**
- Juan Garcia Bartolome (original implementation)
- Ignacio Baca Moreno-Torres (TypeScript improvements)
- Miguel López Cobo, Andrés Tineo Chito, Alejandro Puerta Medina (contributors)

**Dependencies to Review:**
- `@geotab/zenith` - Design system
- `@geotab/myapi` - API client
- React hooks for data fetching
- Permission/clearance system

## File Inventory

All files in this directory are **read-only reference copies** from the GitLab Development repository. Any modifications for Overview-Builder should be made to new files, not these originals.
