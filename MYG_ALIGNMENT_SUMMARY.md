# MYG Playbook Alignment Summary

## Current State → Target State

### ✅ Completed

1. **Module Rename** (Aligned with MYG patterns):
   - `workspace/` → `home/` (App Home landing state)
   - `builder/` → `configuration/` (Pattern B: Collection)
   - `view/` → `canvas/` (Report display)

2. **New Components Created**:
   - `AppHome.tsx` - Landing state answering "Where am I?", "What needs attention?", "Where next?"
   - `AppHeader.tsx` - Search, filters, Create button (MYG App Header zone)
   - `SavedReportsList.tsx` - Pattern B sidebar (vertical report library)

### 🔄 In Progress

**ReportBuilder Restructure** - Implementing full Pattern B layout:

```
┌─────────────────────────────────────────────────────────────┐
│ OS Shell (MyGeotab - not our concern)                      │
│  ├── Launcher (Left Nav)                                   │
│  └── Global Header                                         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ APP HEADER (Our app)                                        │
│  ├── Search bar                                             │
│  ├── Global filters                                         │
│  └── "Create Report" button                                 │
└─────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────┐
│ Pattern B    │ APP CANVAS                                   │
│ Collection   │                                              │
│ Sidebar      │ ┌──────────────────────────────────────────┐ │
│              │ │ Standard Tabs (if >1 view):              │ │
│ ┌──────────┐ │ │  [Templates] [My Reports] [Browse]      │ │
│ │ Report 1 │ │ └──────────────────────────────────────────┘ │
│ │ Report 2 │ │                                              │
│ │ Report 3 │ │ Current View:                               │
│ │ Report 4 │ │ - AppHome (default)                         │
│ │ Report 5 │ │ - ReportPreview (selected report)           │
│ └──────────┘ │ - ReportTable + ChartView (custom)          │
└──────────────┴──────────────────────────────────────────────┘
```

### 🎯 Required Changes

**1. Visual Treatment (Report State)**:
- Change from "Work State" (high-contrast, action-oriented)
- To "Report State" (subdued, data-dense)
- Subdued color palette (less bright greens/blues)
- More table density
- Complex filter headers

**2. Navigation Pattern**:
- Use Standard Tabs (Pattern A) for 2-6 primary views
- Current tabs:
  - **Home** - App Home landing
  - **My Reports** - Saved reports (shows Pattern B sidebar)
  - **Templates** - Browse pre-configured templates

**3. Layout Structure**:
```typescript
<AppHeader onCreateNew={...} />
<div className="flex">
  {activeTab === 'myReports' && (
    <SavedReportsList
      selectedReportId={selectedReportId}
      onSelectReport={onSelectReport}
    />
  )}
  <div className="flex-1">
    {activeTab === 'home' && <AppHome />}
    {activeTab === 'myReports' && <ReportCanvas />}
    {activeTab === 'templates' && <TemplateGallery />}
  </div>
</div>
```

## MYG Playbook Compliance Checklist

| Requirement | Status | Implementation |
|------------|--------|----------------|
| App Home landing state | ✅ | `AppHome.tsx` answers 3 questions |
| App Header (search/filters/create) | ✅ | `AppHeader.tsx` with persistent controls |
| Pattern B (Collection sidebar) | ✅ | `SavedReportsList.tsx` vertical panel |
| Standard Tabs navigation | 🔄 | Need to add tab UI |
| Report State visual treatment | ⬜ | Need to apply subdued colors |
| Single-Click Mandate | ✅ | Direct access to reports |
| Contextual Integrity | ✅ | Clear OS vs App separation |
| Spatial Persistence | ✅ | Header/sidebar stay fixed |

## Next Steps

1. Add Standard Tabs UI to ReportBuilder
2. Apply Report State color palette (subdued)
3. Wire AppHome quick actions to create new reports
4. Test Pattern B sidebar interaction
5. Build and deploy

**Estimated time**: 45 minutes

Would you like me to proceed with the full implementation?
