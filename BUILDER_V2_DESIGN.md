# Report Builder V2: Conversational + Visual Design

## Overview

Human-centered report builder combining:
- **Conversational entry** - Natural language questions
- **Visual canvas** - Direct manipulation of report structure
- **Live preview** - See what you're building in real-time

## User Flow

```
Ask Question → See Visual Structure → Refine → Export
```

### 1. Entry Point (QuestionEntry.tsx)

User selects from pre-configured questions or searches:

```
┌─────────────────────────────────────────┐
│ What would you like to know?           │
├─────────────────────────────────────────┤
│ 🔍 [Search or ask a question...]       │
│                                         │
│ 📋 Recommended                          │
│                                         │
│  🚗 Which vehicles traveled the most?  │
│  ⚠️  Where did speeding happen?        │
│  ⛽ Which vehicles used most fuel?     │
│  📍 Where is my fleet right now?       │
│                                         │
│  [+ Build custom report]                │
└─────────────────────────────────────────┘
```

### 2. Visual Builder (VisualCanvas + FieldPalette)

Split view showing report structure + available fields:

```
┌─────────────────────────────────────────────────────────┐
│ Visual Canvas (Left)          Field Palette (Right)     │
├─────────────────────────────────────────────────────────┤
│ Trip Report                   📋 Available Fields       │
│ ┌────────┐ ┌────────┐         ┌──────────────────┐    │
│ │Vehicle │ │Distance│         │ Essential ▼      │    │
│ │  Name  │ │  (km)  │         │  ✓ Vehicle Name  │    │
│ └────────┘ └────────┘         │  ✓ Distance      │    │
│ ┌────────┐ [+ Column]         │  ⊕ Driver        │    │
│ │Duration│                    │                  │    │
│ └────────┘                    │ Location ▼       │    │
│                               │  ⊕ Start Address │    │
│ ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡           │  ⊕ End Address   │    │
│ Sample Data:                  │                  │    │
│ ▪▪▪▪▪▪▪ ▪▪▪▪▪▪▪               │ Performance ▼    │    │
│ ▪▪▪▪▪▪  ▪▪▪▪▪▪▪               │  ⊕ Fuel Used     │    │
│ ▪▪▪▪▪   ▪▪▪▪▪▪▪               │  ⊕ Idle Time     │    │
│ + 1,247 more rows             └──────────────────┘    │
│                                                        │
│ ⏰ Today • Grouped by Vehicle • 📊 Bar Chart          │
└─────────────────────────────────────────────────────────┘
```

### 3. Refinement Controls

Bottom bar with quick actions:

```
┌─────────────────────────────────────────────────────────┐
│ [📅 Change Time] [🔍 Add Filter] [📊 Change Layout]    │
│ [▶️ Run Report]  [💾 Save]  [📤 Export]                │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

```
ConversationalBuilder (Orchestrator)
├── QuestionEntry (Phase 1)
│   ├── Search bar
│   ├── Question cards grid
│   └── Category filters
│
└── VisualBuilder (Phase 2)
    ├── VisualCanvas (Main area)
    │   ├── Column headers
    │   ├── Sample data preview
    │   ├── Drag/drop zones
    │   └── Chart preview
    │
    ├── FieldPalette (Right sidebar)
    │   ├── Search fields
    │   ├── Categorized field list
    │   └── Add/remove toggles
    │
    └── RefinementBar (Bottom)
        ├── Time range selector
        ├── Filter builder
        └── Layout switcher
```

## Key Features

### Conversational Entry
- **Pre-configured questions** - Common use cases ready to go
- **Natural language** - "Which vehicles..." not "SELECT Device..."
- **Search discovery** - Find reports by keywords/tags
- **Category browsing** - Fleet, Safety, Performance, Compliance

### Visual Canvas
- **WYSIWYG preview** - See exactly what you're building
- **Direct manipulation** - Click to configure, drag to reorder
- **Live feedback** - Estimated row count, sample structure
- **Chart preview** - Shows how visualization will look

### Field Palette
- **Organized by category** - Essential, Location, Performance, etc.
- **Visual selection state** - Clear checkmarks/plus icons
- **Quick add/remove** - Single click to toggle fields
- **Search & filter** - Find fields quickly

## Benefits Over V1

| Aspect | V1 (Current) | V2 (Conversational+Visual) |
|--------|--------------|---------------------------|
| Entry | Technical objects | Business questions |
| Field Selection | Hidden accordion | Always-visible palette |
| Preview | Empty state until execute | Live visual structure |
| Mental Model | Bottom-up (data→report) | Top-down (question→answer) |
| Learning Curve | Must understand objects | Discover by browsing |
| Confidence | "Did I pick right fields?" | "I see what I'm building" |

## Implementation Status

✅ Created:
- `question-templates.ts` - 12 pre-configured questions
- `QuestionEntry.tsx` - Conversational entry UI
- `VisualCanvas.tsx` - Visual report structure display
- `FieldPalette.tsx` - Categorized field browser

⏳ TODO:
- Integration orchestrator component
- Wire up state management
- Add refinement controls (time, filters, layout)
- Implement drag-and-drop field reordering
- Add natural language search (AI enhancement)

## Next Steps

1. Create `ConversationalBuilder.tsx` orchestrator
2. Update routing to use new builder
3. Test with real MyGeotab data
4. Add refinement controls
5. Polish transitions and animations
