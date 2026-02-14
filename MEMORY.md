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
