# Zenith Component API Reference

## Key Learnings from Source Code

### Button
```typescript
import { Button, ButtonType } from '@geotab/zenith';

// Correct usage:
<Button type={ButtonType.Primary} onClick={handleClick}>
  <Plus /> Create Report
</Button>

// Props:
// - type: ButtonType.Primary | Secondary | Tertiary | Destructive | etc.
// - children: React.ReactNode (includes text AND icons)
// - onClick, disabled, className, etc.
// - NO variant, size, or separate icon props
```

### Tabs
```typescript
import { Tabs } from '@geotab/zenith';

// Correct usage:
<Tabs
  tabs={[
    { id: 'home', label: 'Home' },
    { id: 'reports', label: 'My Reports' }
  ]}
  activeTabId={activeTab}
  onTabChange={setActiveTab}
/>

// Props:
// - tabs: Array<{ id: string, label: string }>
// - activeTabId: string (NOT activeTab)
// - onTabChange: (id: string) => void
```

### Alert
Alert is a modal/feedback component managed by FeedbackContext.
For inline alerts, use Banner instead:

```typescript
import { Banner } from '@geotab/zenith';

<Banner type="warning">
  Large query: This will load 10,000 records
</Banner>
```

### Table
Table is very complex (DataGrid-like) with selection, sorting, etc.
For simple tables, use HTML table with Zenith classes:

```html
<table className="zen-table">
  <thead><tr><th>Column</th></tr></thead>
  <tbody><tr><td>Data</td></tr></tbody>
</table>
```

### Card
```typescript
import { Card } from '@geotab/zenith';

<Card>
  Content goes here
</Card>
```

### SearchInput
```typescript
import { SearchInput } from '@geotab/zenith';

<SearchInput
  placeholder="Search..."
  onChange={(e) => handleSearch(e.target.value)}
/>
```

## Migration Strategy

1. **Buttons**: Use Button with ButtonType, include icons as children
2. **Tabs**: Use correct interface with activeTabId
3. **Inline Alerts**: Use Banner component
4. **Simple Tables**: Use HTML table with zen-table class
5. **Cards**: Use Card component (simple wrapper)
6. **Form Elements**: Use Checkbox, TextInput, etc. with native onChange
7. **Accordion**: Use Accordion for collapsible sections with activeIds array
8. **Search**: Use SearchInput with onChange that receives value (not event)

## Components Migrated

✅ StandardTabs - Using Zenith Tabs
✅ AppHeader - Using Zenith SearchInput + Button
✅ BuilderPanel - Using Zenith Accordion + Banner + Button
✅ ObjectSelector - Using Zenith Tabs + inline styles for cards
✅ FieldPicker - Using Zenith Checkbox + Divider
✅ TimeRangeSelector - Using Zenith Button + Divider
✅ LayoutSwitcher - Using Zenith Button + Banner
⚠️  BuilderPage - Needs className → style conversion
⚠️  ReportPreviewEmpty - Needs className → style conversion
