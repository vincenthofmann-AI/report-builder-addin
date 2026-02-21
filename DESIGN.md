# Report Builder V5 - Design Specification

## Information Architecture

### Three-Panel Layout (NotebookLM + GA4 Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│  Fleet Reports                              [Live] [AI ✨]  │
├───────────┬──────────────────────┬──────────────────────────┤
│           │                      │                          │
│  SOURCES  │     QUERY BUILDER    │    OUTPUT PREVIEW       │
│  (Left)   │      (Center)        │       (Right)           │
│           │                      │                          │
│  Resource │  AI Chat Interface   │  Zenith Table           │
│  Selector │  +                   │  +                      │
│           │  Manual Fields       │  Visualizations         │
│           │                      │                          │
└───────────┴──────────────────────┴──────────────────────────┘
```

## User Flow

### 1. Source Selection (Geotab API Resources)
```
Start → Select Resource → Define Query → Preview Report
```

**Geotab API Resources (typeName):**
- 🚗 Device (vehicles, hardware)
- 🛣️  Trip (journeys, routes)
- 👤 User (drivers, admins)
- 📍 Zone (geofences, locations)
- ⚠️  Rule (alerts, notifications)
- ⚙️  Engine (diagnostics)
- ⛽ Fuel (consumption, refueling)
- 📊 Status Data (real-time telemetry)

### 2. Query Construction (Hybrid: AI + Manual)

**AI Mode (NotebookLM Pattern):**
- Natural language: "Show me all trips for Device ABC123 in the last 7 days"
- AI constructs Geotab API call
- Shows equivalent Get query
- Conversational refinement

**Manual Mode (Salesforce Pattern):**
- Search bar for fields
- Drag-and-drop field pills
- Filter builder
- Results limit slider (max 50,000)

### 3. Output Preview (GA4 Pattern)

**Zenith Table:**
- Pagination (50 rows/page)
- Sortable columns
- Export options
- Refresh data

## Technical Implementation

### Geotab API Call Structure
```javascript
{
  method: "Get",
  params: {
    typeName: "Trip",  // Selected resource
    credentials: { ... },
    search: {
      deviceSearch: { id: "b123" },
      fromDate: "2024-01-01T00:00:00.000Z"
    },
    resultsLimit: 1000
  }
}
```

### AI Query Construction
- User input → Parse intent → Generate API params
- Show generated query for transparency
- Allow manual editing of generated query
- Save query templates

### Data Flow
```
User Input → AI Parser → Geotab API → Transform → Zenith Table
             ↓
          [Show Query]
```

## UX Principles

1. **Source-Grounded** (NotebookLM): Start with API resource selection
2. **Conversational** (NotebookLM): AI chat for query building
3. **Transparent** (Salesforce): Show underlying API query
4. **Interactive** (GA4): Live preview as you build
5. **Flexible** (GA4): Switch between AI and manual modes

## Next Steps

1. Build three-panel layout with Zenith Card components
2. Create resource selector (left panel)
3. Build hybrid query interface (center panel)
4. Integrate Zenith Table output (right panel)
5. Add AI query parser (future: integrate with Geotab AI or OpenAI)
