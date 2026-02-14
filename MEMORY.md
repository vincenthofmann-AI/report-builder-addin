# Project Memory: MyGeotab Report Builder Add-In

## Project Overview

**Goal**: Create a MyGeotab Add-In that allows users to build custom reports using a workflow-based interface
**Status**: Initial Setup
**Working Name**: Report Builder Add-In
**Start Date**: 2026-02-13

## Conversation History

### 2026-02-13: Initial Project Definition

**Context**: User requested to create a report builder add-in using the Zenith project structure

**Key Requirements Gathered**:
1. **Report Workflow**: "Use data from our sources and allow a user to choose a source, filter it then pick the pattern that suits their reporting needs"
2. **UX Reference**: Look at Mobbin for good UX workflow patterns (conventional pattern approach)
3. **Architecture**: Standalone MyGeotab Add-In (not integrated with Zenith AI VSCode extension)
4. **Export Formats**: All formats selected
   - PDF Export
   - CSV/Excel Export
   - Email Reports
   - Dashboard View Only

**User's Vision**:
The user wants a conventional report builder workflow following industry-standard UX patterns:
1. Select data source
2. Apply filters
3. Choose report pattern/template
4. Preview and export

**Technical Context Established**:
- MyGeotab Add-Ins are HTML/JavaScript pages embedded in MyGeotab
- Configuration via JSON file with lifecycle methods (initialize, focus, blur)
- Access to MyGeotab API for data retrieval
- Must be hosted on HTTPS server with TLS 1.2+
- WCAG 2.2 Level AA accessibility compliance required

**Zenith Context**:
- Zenith is Geotab's design system with pre-built components
- Zenith AI is a VSCode extension that uses LLMs to generate Zenith component code
- The Report Builder should use Zenith components for consistency with MyGeotab UI
- Available Zenith components include: Accordion, DataGrid, DatePicker, forms, etc.

## Key Insights

### UX Philosophy
Following mental models from UserManual.md:
- **Red Carpet**: Users should create their first report within 90 seconds
- **Great Lakes**: "Simply Powerful" - opinionated defaults with customization
- **Journeys**: Build for user workflow, not API structure

### Workflow Pattern
Standard report builder pattern:
```
1. Data Source Selection
   ↓
2. Filter Configuration
   ↓
3. Pattern/Template Selection
   ↓
4. Preview & Export
```

This follows established patterns from tools like Looker, Tableau, and Power BI.

## Design Decisions

### Architecture Choice: Standalone Add-In
**Decision**: Build as standalone MyGeotab page, not integrated with Zenith AI extension

**Reasoning**:
- Simpler deployment model (no VSCode dependency)
- Accessible to all MyGeotab users
- Can leverage Zenith components directly
- Could add AI enhancement later if needed

**Alternative Considered**: AI-powered report generation using GenAI Gateway
- Deferred for future phase
- Would require more complex prompt engineering
- Current manual workflow is more predictable and controllable

### Component Strategy: Use Zenith Components
**Decision**: Build UI using Zenith design system components

**Reasoning**:
- Consistency with MyGeotab platform
- Pre-built accessibility compliance
- Faster development (no custom component creation)
- Familiar UX for MyGeotab users

**Key Components Identified**:
- Accordion for report sections
- DataGrid for data preview
- DatePicker for date range filters
- Forms for filter configuration
- Buttons for export actions

### Export Strategy: Multi-Format Support
**Decision**: Support all export formats from day one

**Implementation Approach**:
- PDF: Use browser print API or PDF generation library
- CSV/Excel: Generate from data grid
- Email: MyGeotab API for sending, with attachment support
- Dashboard: Default interactive view

## Technical Decisions

### Data Source Model
**Decision**: Use MyGeotab API entity types as data sources

**Available Sources** (initial set):
- Devices (vehicles)
- Trips
- Alerts/Exceptions
- Fuel Transactions
- Status Data
- Drivers
- Groups

**Expansion Path**: Allow custom API calls for power users

### Filter Engine Design
**Decision**: Dynamic filter generation based on selected data source

**Pattern**:
1. User selects data source (e.g., "Devices")
2. System presents relevant filters (Groups, Device Type, Status)
3. Filters update data preview in real-time
4. Common filters always available: Date Range, Organization Groups

### Report Pattern Library
**Decision**: Start with 3-5 pre-built patterns, expand over time

**Initial Patterns**:
1. **Fleet Summary Dashboard** - Overview metrics and charts
2. **Compliance Report** - Safety and regulatory tracking
3. **Operational Efficiency** - Fuel, idle time, utilization
4. **Data Table** - Simple filtered table export
5. **Custom Builder** (Phase 2) - User-defined layout

## References

### Documentation
- MyGeotab Add-In SDK: https://developers.geotab.com/myGeotab/addIns/developingAddIns/
- Zenith AI Project: `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/Zenith/zenith-ai/`
- Zenith Component Guide: `zenith-ai/src/prompts/zenithGuide.ts` (359KB)

### Related Projects
- Zenith AI VSCode Extension (dmitryradyno@geotab.com)
- MyGeotab SDK samples: https://github.com/Geotab/sdk-addin-samples

## Open Questions

1. **Hosting Strategy**: Where will we host the Add-In files?
   - Options: Geotab CDN, internal server, cloud storage
   - Need HTTPS with TLS 1.2+

2. **Authentication**: How to handle API key management?
   - Inherited from MyGeotab session (preferred)
   - Separate API key configuration

3. **Report Storage**: Should users be able to save report configurations?
   - Use MyGeotab Storage API
   - Store as JSON in user preferences

4. **Scheduling**: For email reports, how to handle scheduling?
   - Phase 2 feature
   - May require backend service for cron-like execution

5. **Zenith Component Access**: How to import Zenith components in Add-In?
   - Need to confirm Zenith is available in MyGeotab runtime
   - May need to bundle components or use CDN

### 2026-02-14: Figma Code Bundle Integration

**Context**: User provided Figma-generated code bundle for the Interactive Report Builder

**Technical Stack Discovered**:
- Built with **React 18.3.1** using **Vite 6.3.5**
- UI Components: Material-UI (MUI) v7, Radix UI primitives, shadcn/ui patterns
- Styling: Tailwind CSS 4.1.12 with Emotion for styled components
- Charts: Recharts 2.15.2
- Additional features: React DnD (drag-and-drop), React Hook Form, date-fns

**Build Output** (`dist/` folder):
- `index.html` - Entry point
- `assets/index-DTvlltDH.js` - Bundled JavaScript (889KB)
- `assets/index-JnMdGtXW.css` - Bundled CSS (100KB)
- `configuration.json` - MyGeotab add-in manifest

**Key Decision: Replace Zenith with Figma-Generated UI**
- Original plan: Build with Zenith components
- **New approach**: Use Figma-generated React code bundle
- **Reasoning**:
  - Figma design already complete with full UI workflow
  - Modern React stack with comprehensive component library
  - Faster time to deployment
  - Can still integrate with MyGeotab API

**Deployment Strategy Chosen: Git-Based Hosting**
- User requested using Git as "server"
- **Solution**: GitHub Pages for free HTTPS hosting
- Advantages:
  - Free SSL certificate (required by MyGeotab)
  - Automatic deployments on push
  - Correct CORS headers for MyGeotab iframe
  - Version control built-in

**Integration Requirements**:
1. Update `configuration.json` paths to work with MyGeotab
2. Integrate MyGeotab API (`window.geotab.api`) into React app
3. Test data source selection and filtering with real MyGeotab data
4. Verify export functionality works within MyGeotab iframe context

## Next Steps

1. ✅ Move Figma code bundle to SecondBrain project structure
2. Update `dist/configuration.json` with final MyGeotab settings
3. Initialize git repository and push to GitHub
4. Enable GitHub Pages deployment
5. Integrate MyGeotab API into React components (check `src/` for existing API calls)
6. Test in MyGeotab development environment
7. Register add-in in MyGeotab admin panel

### 2026-02-14: Progressive Disclosure & Zenith Design System Integration

**Context**: User requested progressive disclosure with category-based organization and Zenith design system integration

**Requirements**:
1. Implement progressive disclosure: Category → Data Source → Columns/Filters
2. Reorganize data sources into 5 categories: Activity, Events, Assets, Devices, Drivers
3. Ensure Zenith design system usage
4. Use real API data (already implemented)
5. Enable common architectural pattern for future expansion

**Implementation Completed**:

1. **Created Category Structure** (`src/app/services/categories.ts`)
   - 5 top-level categories align with MyGeotab domain model:
     - **Activity**: Trip History (existing)
     - **Events**: Driver Behavior, Engine Faults, Fuel Transactions, Maintenance (existing)
     - **Assets**: Vehicles, Groups, Zones (placeholder for future)
     - **Devices**: Status, Health, Diagnostics (placeholder for future)
     - **Drivers**: Profiles, Assignments, HOS (placeholder for future)
   - Helper functions: `getCategoryById`, `getAllDataSources`, `getDataSourceById`, `getCategoryForDataSource`

2. **Built Progressive Disclosure UI**:
   - **CategorySelector** (`src/app/components/CategorySelector.tsx`)
     - Large card grid for 5 categories
     - Visual indicators: icons, colors (Zenith color tokens), counts
     - "Coming soon" state for empty categories (Assets, Devices, Drivers)
     - Animation with framer-motion
   - **DataSourceSelector** (`src/app/components/DataSourceSelector.tsx`)
     - Radio-style list of data sources within selected category
     - "Back to categories" navigation
     - Column/filter metadata display
     - Success confirmation message

3. **Updated ReportBuilder** (`src/app/components/ReportBuilder.tsx`)
   - Added `selectedCategory` state
   - Replaced flat EmptyState with progressive disclosure:
     - Step 1: Show `CategorySelector` when no category selected
     - Step 2: Show `DataSourceSelector` when category selected but no source
     - Step 3: Existing workflow (columns, filters, visualization)

4. **Updated Data Fetcher** (`src/app/services/data-fetcher.ts`)
   - Changed `getDataSources()` to use `getAllDataSources()` from categories
   - Maintains backward compatibility with existing API integration

5. **Zenith Design System Status**:
   - Already using Zenith theme tokens via `zenith-adapter.ts`:
     - `ZenithColors` (navy, green, blue, neutrals, semantic colors)
     - `ZenithSpacing`, `ZenithTypography`, `ZenithBorderRadius`, `ZenithShadows`
   - Components styled with Zenith color palette
   - Ready for `@geotab/zenith` package when available (private npm registry)
   - Currently using Radix UI primitives + Tailwind styled with Zenith tokens

6. **Documentation**:
   - Created `docs/PROGRESSIVE_DISCLOSURE_DESIGN.md`:
     - Complete architecture design
     - Category definitions with MyGeotab entity mappings
     - UX flow diagrams
     - Component migration map (shadcn/ui → Zenith)
     - Implementation phases (1-4)
     - Component usage examples

**Technical Decisions**:

1. **Hybrid Zenith Approach**: Use Zenith theme tokens + Radix UI primitives until `@geotab/zenith` package is accessible
   - Reason: `@geotab/zenith` is private package requiring org-scoped npm registry
   - Benefit: Quick implementation with Zenith visual consistency
   - Migration path: Swap Radix components for Zenith when package available

2. **Category First, Entity Later**: Implement category UI with existing 5 data sources (all in Activity/Events)
   - Reason: Assets, Devices, Drivers categories require new MyGeotab entity integrations
   - Benefit: Users see progressive disclosure UX immediately
   - Expansion: Add new entities incrementally (Stop, Device, Driver, etc.)

3. **Non-Breaking Changes**: Progressive disclosure adds UI layer without modifying data structures
   - All existing data fetching, filtering, API integration unchanged
   - Categories wrap existing `DataSourceDef[]` structure
   - ReportOutline still uses flat `dataSources` list

**Files Created**:
- `src/app/services/categories.ts` - Category structure and helpers
- `src/app/components/CategorySelector.tsx` - Category card grid
- `src/app/components/DataSourceSelector.tsx` - Data source radio list
- `docs/PROGRESSIVE_DISCLOSURE_DESIGN.md` - Architecture documentation

**Files Modified**:
- `src/app/components/ReportBuilder.tsx` - Integrated progressive disclosure
- `src/app/services/data-fetcher.ts` - Use categories structure

**Build Status**: ✅ Success (vite build completes with no errors)

**Next Actions**:
1. Test progressive disclosure flow in dev mode (`npm run dev`)
2. Add Assets category data sources (Device, Group, Zone entities)
3. Add Devices category data sources (StatusData, DeviceStatusInfo)
4. Add Drivers category data sources (Driver, DriverChange)
5. Migrate shadcn/ui components to Zenith (when package available)
6. Deploy to GitHub Pages for MyGeotab testing
