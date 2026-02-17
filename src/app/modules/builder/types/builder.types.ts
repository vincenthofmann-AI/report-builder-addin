/**
 * Builder Module Types
 * =====================
 *
 * Type definitions for the Report Builder composable module.
 * Supports MyGeotab API objects: Devices, Events/Exceptions, Trips/Activities
 */

/**
 * MyGeotab object categories
 */
export type ObjectCategory = 'devices' | 'events' | 'trips';

/**
 * MyGeotab object types available for reporting
 */
export type MyGeotabObjectType =
  // Devices
  | 'Device'
  | 'DeviceStatusInfo'
  // Events & Exceptions
  | 'ExceptionEvent'
  | 'Rule'
  | 'FaultData'
  | 'DutyStatusLog'
  | 'DutyStatusViolation'
  // Trips & Activities
  | 'Trip'
  | 'LogRecord'
  | 'DriverChange'
  | 'ChargeEvent'
  | 'FillUp'
  // Diagnostics
  | 'StatusData'
  | 'FuelUsed';

/**
 * Object definition with metadata
 */
export interface ObjectDefinition {
  type: MyGeotabObjectType;
  category: ObjectCategory;
  label: string;
  description: string;
  icon: string; // lucide-react icon name
}

/**
 * Field definition for an object
 */
export interface FieldDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  description?: string;
  required?: boolean;
}

/**
 * Time range configuration
 */
export interface TimeRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
}

/**
 * Layout view options
 */
export type LayoutView = 'table' | 'chart';

/**
 * Chart type options
 */
export type ChartType = 'bar' | 'line' | 'pie' | 'area';

/**
 * Report builder state
 */
export interface ReportBuilderState {
  // Object selection
  selectedObject: MyGeotabObjectType | null;

  // Field selection
  selectedFields: string[];

  // Time range
  timeRange: TimeRange;

  // Layout preferences
  layoutView: LayoutView;
  chartType?: ChartType;

  // Query results
  data: any[] | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Report configuration that can be saved
 */
export interface ReportConfig {
  id?: string;
  name: string;
  objectType: MyGeotabObjectType;
  fields: string[];
  timeRange: TimeRange;
  layoutView: LayoutView;
  chartType?: ChartType;
  createdAt?: Date;
  updatedAt?: Date;
}
