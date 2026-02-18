# Zenith-Only UI Migration Plan

## Objective

Replace ALL custom UI components with Zenith (@geotab/zenith v3.5.0) components. Remove all Tailwind/custom CSS classes and use only Zenith's design system.

## Available Zenith Components

### Form Components
- `Button` - Primary, secondary, tertiary buttons
- `TextInput` - Text input fields
- `Textarea` - Multi-line text input
- `Select` - Dropdown select
- `Checkbox` - Checkboxes
- `Radio` / `RadioGroup` - Radio buttons
- `SearchInput` - Search field with icon
- `DateInput` - Date picker
- `DateRange` - Date range picker
- `TimePicker` - Time selection
- `ToggleButton` - Toggle/switch

### Layout Components
- `Card` - Container cards
- `PageLayout` - Page structure
- `PageSection` - Page sections
- `FormLayout` - Form container
- `FormGroup` - Form field groups
- `FormField` - Individual form fields
- `GridLayout` - Grid layouts
- `Divider` - Horizontal dividers

### Navigation
- `Tabs` - Tab navigation
- `TabBar` - Tab bar

### Feedback
- `Alert` - Alert messages
- `Banner` - Banner notifications
- `Toast` - Toast notifications
- `EmptyState` - Empty state placeholders

### Data Display
- `Table` - Data tables
- `DataGrid` - Advanced data grid

## Migration Mapping

### Current Components → Zenith Replacements

| Current Component | Custom UI | Zenith Replacement |
|-------------------|-----------|-------------------|
| **StandardTabs** | Custom tabs with motion | `Tabs` or `TabBar` |
| **AppHeader** | Custom header with search | `PageLayout` + `SearchInput` + `Button` |
| **BuilderPanel** | Custom panel with sections | `Card` + `FormLayout` + `FormGroup` |
| **ObjectSelector** | Custom cards with icons | `Card` + `Radio` / `RadioGroup` or `Select` |
| **FieldPicker** | Custom checkboxes | `Checkbox` in `FormGroup` |
| **TimeRangeSelector** | Custom date inputs | `DateRange` or `DateInput` |
| **LayoutSwitcher** | Custom toggle buttons | `ToggleButton` or `RadioGroup` |
| **BuilderPage** | Custom empty states | `EmptyState` + `Table` |
| **ReportPreviewEmpty** | Custom preview card | `EmptyState` + `Card` |

### Buttons
**Before:**
```tsx
<button className="px-4 py-2 bg-[#003a63] text-white rounded-lg hover:bg-[#002949]">
  Click Me
</button>
```

**After:**
```tsx
<Button variant="primary" size="medium">
  Click Me
</Button>
```

### Cards
**Before:**
```tsx
<div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
  Content
</div>
```

**After:**
```tsx
<Card>
  Content
</Card>
```

### Inputs
**Before:**
```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg"
/>
```

**After:**
```tsx
<TextInput
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Checkboxes
**Before:**
```tsx
<input
  type="checkbox"
  checked={isChecked}
  onChange={() => setChecked(!isChecked)}
  className="w-4 h-4 text-[#003a63]"
/>
```

**After:**
```tsx
<Checkbox
  checked={isChecked}
  onChange={(e) => setChecked(e.target.checked)}
  label="Label text"
/>
```

### Tabs
**Before:**
```tsx
<div className="flex border-b">
  <button className={isActive ? 'border-b-2 border-[#003a63]' : ''}>
    Tab 1
  </button>
</div>
```

**After:**
```tsx
<Tabs
  tabs={[
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### Empty States
**Before:**
```tsx
<div className="text-center py-8">
  <p className="text-[#94a3b8]">No data</p>
</div>
```

**After:**
```tsx
<EmptyState
  title="No data"
  description="Select fields to preview data"
  icon="FileX"
/>
```

## Component-by-Component Migration

### Phase 1: Core UI Components (P0)

#### 1. StandardTabs.tsx
- Replace custom tab implementation with `Tabs` or `TabBar`
- Remove all Tailwind classes
- Use Zenith's tab variant

#### 2. AppHeader.tsx
- Replace custom search input with `SearchInput`
- Replace buttons with `Button` component
- Use Zenith spacing/layout

#### 3. BuilderPanel.tsx
- Wrap in `Card`
- Use `FormLayout` for structure
- Use `FormGroup` for sections
- Replace custom buttons with `Button`

### Phase 2: Form Components (P0)

#### 4. ObjectSelector.tsx
- Replace custom card buttons with `RadioGroup` or `Card` + `Radio`
- Remove Tailwind classes
- Use Zenith icons if available

#### 5. FieldPicker.tsx
- Replace custom checkboxes with `Checkbox`
- Use `FormGroup` for organization
- Remove all custom styling

#### 6. TimeRangeSelector.tsx
- Replace custom date inputs with `DateRange` or `DateInput`
- Use Zenith's built-in presets if available
- Remove custom button grid

#### 7. LayoutSwitcher.tsx
- Replace custom toggle with `ToggleButton` or `RadioGroup`
- Use Zenith button variants

### Phase 3: Display Components (P1)

#### 8. BuilderPage.tsx
- Replace custom empty state with `EmptyState`
- Use `Table` component for data display
- Remove all Tailwind classes

#### 9. ReportPreviewEmpty.tsx
- Rebuild with `EmptyState` + `Card`
- Use Zenith typography
- Remove custom icons (use Zenith icons)

### Phase 4: Configuration Components (P1)

#### 10. ReportOutline.tsx
#### 11. FilterBar.tsx
#### 12. DataSourceSelector.tsx
#### 13. CategorySelector.tsx
#### 14. SavedReportsList.tsx

Replace all custom UI with Zenith equivalents

### Phase 5: Home & Canvas Modules (P1)

#### 15. AppHome.tsx
#### 16. InsightCategorySelector.tsx
#### 17. InsightSelector.tsx
#### 18. ChartView.tsx
#### 19. ReportPreview.tsx
#### 20. ReportTable.tsx
#### 21. ReportActions.tsx

## CSS Removal Strategy

1. **Remove Tailwind classes** - All `className` with Tailwind utilities
2. **Remove custom colors** - Use `ZenithColors` from zenith-adapter
3. **Remove custom spacing** - Use Zenith component props
4. **Remove custom borders** - Use Zenith Card/Divider
5. **Remove custom shadows** - Use Zenith component styles

## Testing Checklist

- [ ] All buttons use Zenith Button component
- [ ] All inputs use Zenith form components
- [ ] All cards use Zenith Card component
- [ ] All tabs use Zenith Tabs/TabBar
- [ ] No Tailwind classes remain
- [ ] No custom `className` with style utilities
- [ ] Only Zenith components and theme tokens used
- [ ] Visual consistency maintained
- [ ] All interactions work (click, type, select)
- [ ] Responsive behavior preserved

## Benefits

1. **Consistency** - Unified design language across all MyGeotab apps
2. **Accessibility** - Zenith components have built-in a11y
3. **Maintainability** - No custom CSS to maintain
4. **Performance** - Optimized Zenith components
5. **Future-proof** - Automatic updates with Zenith versions

## Execution Order

1. Update `zenith-adapter.ts` with all component exports ✅
2. Migrate Phase 1 components (tabs, header, panel)
3. Migrate Phase 2 components (all form inputs)
4. Migrate Phase 3 components (display/tables)
5. Migrate Phase 4 components (configuration)
6. Migrate Phase 5 components (home/canvas)
7. Remove all Tailwind config and unused CSS
8. Test thoroughly
9. Document Zenith patterns for future development

## Estimated Effort

- Phase 1 (Core): 2 hours
- Phase 2 (Forms): 2 hours
- Phase 3 (Display): 1 hour
- Phase 4 (Configuration): 2 hours
- Phase 5 (Home/Canvas): 2 hours
- Testing & Polish: 1 hour

**Total: ~10 hours**
