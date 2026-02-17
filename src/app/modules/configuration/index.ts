/**
 * Configuration Module (Pattern B: Collection)
 * ==============================================
 *
 * MYG Playbook Alignment: Pattern B (Inner Sidebar/Panel)
 * Used for managing deep libraries or large sets of resources.
 *
 * Behavior: A vertical list panel on the left side. Selecting an item
 * updates the content in the primary canvas.
 *
 * Best For: Management tasks where users browse a directory while
 * viewing specific details for the selected item.
 *
 * Components:
 * - SavedReportsList: Vertical panel with user's saved reports
 * - ReportOutline: Configuration controls for active report
 * - FilterBar: Live filter editor with record counts
 */

export { ReportOutline } from './ReportOutline';
export { FilterBar } from './FilterBar';
export { type FilterRule } from './FilterBar';
export { DataSourceSelector } from './DataSourceSelector';
export { CategorySelector } from './CategorySelector';
export { SavedReportsList } from './SavedReportsList';
