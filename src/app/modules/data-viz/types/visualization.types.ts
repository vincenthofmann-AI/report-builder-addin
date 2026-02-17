/**
 * Data Visualization Types
 * =========================
 *
 * Types for analyzing fields and recommending visualizations.
 */

import type { FieldDefinition, ChartType } from '../../builder/types/builder.types';

/**
 * Field classification for visualization purposes
 */
export type FieldRole =
  | 'dimension'     // Categorical fields (device name, status, etc.)
  | 'measure'       // Numeric measurements (speed, distance, temperature)
  | 'temporal'      // Time/date fields
  | 'identifier'    // IDs and keys
  | 'metadata';     // Other descriptive fields

/**
 * Analyzed field with visualization metadata
 */
export interface AnalyzedField extends FieldDefinition {
  role: FieldRole;
  isChartable: boolean;      // Can be used in charts
  isMeasure: boolean;        // Is a numeric measurement
  isDimension: boolean;      // Is a categorical dimension
  isTemporal: boolean;       // Is time-based
}

/**
 * Visualization capability based on selected fields
 */
export interface VisualizationCapability {
  canShowChart: boolean;           // At least one measure available
  canShowTable: boolean;           // Always true
  measures: AnalyzedField[];       // Numeric fields for Y-axis
  dimensions: AnalyzedField[];     // Categorical fields for X-axis
  temporal: AnalyzedField[];       // Time fields for time-series
  recommendedChartType: ChartType | null;
  chartRecommendations: ChartRecommendation[];
}

/**
 * Chart type recommendation with reasoning
 */
export interface ChartRecommendation {
  chartType: ChartType;
  score: number;              // 0-100 confidence score
  reason: string;             // Why this chart is recommended
  requirements: string[];     // What fields/conditions led to this recommendation
}

/**
 * Data cardinality (affects chart type selection)
 */
export interface DataCardinality {
  totalFields: number;
  measureCount: number;
  dimensionCount: number;
  temporalCount: number;
  hasMultipleMeasures: boolean;
  hasTimeSeries: boolean;
}
