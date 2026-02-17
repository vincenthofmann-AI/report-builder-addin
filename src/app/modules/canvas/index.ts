/**
 * Canvas Module (Report Display)
 * ================================
 *
 * MYG Playbook Alignment: The Canvas is the "white space" granted to
 * the application to fulfill its specific mission.
 *
 * Visual Treatment: Report State (Analysis-Oriented)
 * - Subdued color palettes
 * - Data-dense grids
 * - Complex filtering headers
 * - Optimize for depth, not speed
 *
 * Components:
 * - ReportPreview: Template-based report with refinement panel
 * - ReportTable: Data grid with sorting, grouping, nested rows
 * - ChartView: Recharts integration (bar, line, pie)
 * - ReportActions: Save, Schedule, Export dialogs
 */

export { ReportPreview } from './ReportPreview';
export { ReportTable } from './ReportTable';
export { ChartView } from './ChartView';
export { type ChartType } from './ChartView';
export { ReportActions } from './ReportActions';
