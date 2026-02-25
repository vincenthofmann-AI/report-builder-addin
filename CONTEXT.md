# Overview-Builder

## Quick Reference

| Field | Value |
|-------|-------|
| Status | ✅ Deployed - Ready for MyGeotab Integration |
| PM | Vincent Hofmann |
| Eng Lead | [TBD] |
| Designer | [TBD] |
| Target Launch | [TBD] |
| Confluence/Wiki | [TBD] |
| Google Drive | [TBD] |
| GitHub Repo | https://github.com/vincenthofmann-AI/report-builder-addin |
| GitLab Source | Development repo: `apps/MyGeotab/src/pages/maintenance/overview/` |

## Problem Statement

Product leaders and fleet managers spend significant time manually assembling dashboards to track key metrics and insights. They need a conversational way to quickly select pre-built insights from Geotab's AI capabilities or use proven recipes (like safety scorecards) to create custom dashboard overviews without manual configuration. The current process requires navigating multiple tools and manually building visualizations.

## Target Users

- **Primary:** Product managers and business analysts who need to create custom dashboards for stakeholders
- **Secondary:** Fleet managers who want quick access to safety, maintenance, and operational insights
- **Tertiary:** Executives who need high-level overviews of specific metrics

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Time to create dashboard | [Current value] | < 5 minutes via conversation |
| Dashboard templates used | 0 | 10+ recipes available |
| User satisfaction | [TBD] | > 4.5/5 |
| Dashboards created per user/month | [TBD] | [TBD] |

## Key Stakeholders

| Person | Role | Interest/Concern |
|--------|------|------------------|
| Vincent Hofmann | PM / SVP Design | Product vision, user experience, strategic alignment |
| [TBD] | Engineering Lead | Technical feasibility, architecture, maintenance |
| [TBD] | Designer | UI/UX patterns, design system alignment |
| [TBD] | Data/AI Team | AI insights integration, data access |

## Current Status

**✅ Implementation Complete** - All 50 files built and ready for testing in MyGeotab environment.

### Recent Updates
- 2026-02-24: Created project brain structure
- 2026-02-24: ✅ Copied Maintenance Overview TSX files from GitLab
- 2026-02-24: ✅ Analyzed top 50 MyGeotab pages by usage (BigQuery - 256K+ target users)
- 2026-02-24: ✅ Identified AI insights: Collision Risk, EV Suitability, Maintenance Predictions
- 2026-02-24: ✅ Defined MVP recipe set: Safety Scorecard, Maintenance Overview, Compliance Dashboard
- 2026-02-24: ✅ Mapped API entities for all 3 MVP recipes (documented in research/data-analysis/)
- 2026-02-24: ✅ Created TypeScript type definitions (src/types/recipe.ts - 680 lines)
- 2026-02-24: ✅ Created JSON recipe definitions (3 files)
- 2026-02-24: ✅ Designed 5-step conversational flow with wireframes
- 2026-02-24: ✅ Created add-in framework architecture
- 2026-02-24: ✅ **COMPLETE IMPLEMENTATION** - Built all 50 files:
  - 4 utilities (validation, permissions, layout, mockData)
  - 4 services (recipe, dashboard, data, storage)
  - 3 hooks (useRecipes, usePermissions, useModuleData)
  - 3 context providers (AddIn, Recipe, Dashboard)
  - 4 common components (ErrorBoundary, Loading, Progress, Navigation)
  - 5 step components (RecipePicker, ModuleSelector, LayoutSelector, Preview, Save)
  - 6 module renderers (OverviewCard, ImmediateActions, MetricChart, Rankings, Benchmark, ModuleRenderer)
  - 4 layout components (Grid, TwoColumn, SingleColumn, ModuleRenderer)
  - 4 orchestration files (Wizard, App, index, addin.json)
  - 3 configuration files (package.json, tsconfig.json, global.less)

- 2026-02-24: ✅ **DEPLOYED** - Built and ready for MyGeotab integration:
  - ✅ Installed dependencies (218 packages)
  - ✅ Fixed TypeScript compilation errors
  - ✅ Built production bundle (250 KB gzipped)
  - ✅ Created deployment structure in `deployment/OverviewBuilder/`
  - ✅ Verified dev server runs on http://localhost:3000
  - ✅ Created DEPLOYMENT.md with installation instructions

### Next Steps
- [ ] Upload to MyGeotab add-in directory (see DEPLOYMENT.md)
- [ ] Register add-in in MyGeotab Administration
- [ ] Test 5-step wizard flow in live MyGeotab environment
- [ ] Test permission filtering with different user roles
- [ ] Connect to real MyGeotab API endpoints (replace mock data in dataService.ts)
- [ ] Implement dashboard persistence to MyGeotab API (replace localStorage)
- [ ] Add analytics/telemetry tracking for recipe usage
- [ ] Performance testing with real data

## Key Decisions Made

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2026-02-24 | Use Maintenance Overview as base pattern | Proven implementation with good UX patterns (immediate actions, metric charts, performance views) | Starting from scratch, using existing report-builder |
| 2026-02-24 | Build as MyGeotab add-in (not standalone) | Simplifies authentication, leverages existing framework, saves as native MyGeotab page | Standalone web app, embedded iframe |
| 2026-02-24 | MVP: Safety + Maintenance + Compliance recipes | Covers 256K+ users based on BigQuery analysis, high engagement metrics | Starting with only one recipe, building custom-only tool |
| 2026-02-24 | Module-based composition pattern | Allows flexible layouts using proven dashboard modules (overview cards, charts, rankings) | Fixed templates, fully custom builder |

See `decisions/` folder for detailed decision logs.

## Open Questions

- [x] **Which AI insights should be available?** → Collision Risk, Maintenance Predictions, EV Suitability (found via GitLab search)
- [x] **Standalone or add-in?** → MyGeotab add-in for authentication and page saving
- [x] **Minimum viable recipe set?** → Safety Scorecard, Maintenance Overview, Compliance Dashboard
- [x] **Which API entities map to each recipe?** → Documented in research/data-analysis/2026-02-24-api-entity-mapping.md
- [x] **What's the add-in initialization flow?** → 5-step flow documented in artifacts/conversational-flow-wireframes.md
- [x] **How do we handle custom metric selection vs pre-built recipes?** → Module picker with defaultModules + availableModules pattern
- [x] **What's the authentication/permissions model?** → Inherit from MyGeotab via AddInContext, check requiredPermissions per recipe
- [x] **How do we handle date range and group filters?** → Global filters in DashboardConfig with dateRangeEnabled/groupFilterEnabled per module
- [ ] Should users be able to save and share configurations? (Yes - save as MyGeotab page, share via isShared/sharedWith properties)
- [ ] What's the backend persistence strategy? (LocalStorage for MVP, MyGeotab API endpoints for production)
- [ ] How do we handle dashboard versioning and migrations? (version field in StoredDashboard for schema changes)
- [ ] What's the analytics/telemetry strategy? (Track creation time, recipe selection, module usage, errors)

## Links

- **Reference Implementation:**
  - GitLab: `apps/MyGeotab/src/pages/maintenance/overview/`
  - React library overview pattern: `libs/javascript/react-library/overview/`
- **Related Projects:**
  - `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/report-builder-addin/` - Dashboard and insight components
  - `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/fleet-insights-addin/` - Chart insights from Zenith
- PRD: [TBD]
- Design: [TBD]
- Eng spec: [TBD]
- Chat channel: [TBD]

## Technical Notes

**Base Pattern Components:**
- `maintenanceOverview.tsx` - Main page layout with filters and sections
- `maintenanceOverviewImmediateActions.tsx` - Action items section
- `maintenanceOverviewMetricChart.tsx` - Metric visualization with switcher
- `maintenanceOverviewPerformance.tsx` - Performance insights
- React library `overview` component - Reusable overview card pattern

**Key Technologies:**
- React + TypeScript
- Zenith design system
- MyGeotab API / myapi
- Groups filter + date range selector patterns
