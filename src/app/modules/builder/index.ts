/**
 * Builder Module
 * ===============
 *
 * Composable report builder module for creating custom MyGeotab reports.
 *
 * Usage:
 * ```tsx
 * import { useReportBuilder, BuilderPanel, BuilderPage } from './modules/builder';
 *
 * function MyComponent() {
 *   const builder = useReportBuilder();
 *
 *   return (
 *     <div className="flex h-screen">
 *       <BuilderPanel {...builder} />
 *       <BuilderPage {...builder.state} />
 *     </div>
 *   );
 * }
 * ```
 *
 * Key Features:
 * - Select MyGeotab object types (Device, Trip, Event, etc.)
 * - Choose specific fields to include in report
 * - Configure time ranges with presets
 * - Switch between table and chart views
 * - Fully composable - use anywhere in the app
 */

// Hook
export { useReportBuilder } from './hooks/useReportBuilder';

// Components
export { ObjectSelector } from './components/ObjectSelector';
export { FieldPicker } from './components/FieldPicker';
export { TimeRangeSelector } from './components/TimeRangeSelector';
export { LayoutSwitcher } from './components/LayoutSwitcher';
export { BuilderPanel } from './components/BuilderPanel';
export { BuilderPage } from './components/BuilderPage';

// Types
export type {
  ObjectCategory,
  MyGeotabObjectType,
  ObjectDefinition,
  FieldDefinition,
  TimeRange,
  LayoutView,
  ChartType,
  ReportBuilderState,
  ReportConfig,
} from './types/builder.types';

// Constants
export { MYGEOTAB_OBJECTS, OBJECT_FIELDS, TIME_RANGE_PRESETS } from './types/objects.constants';
