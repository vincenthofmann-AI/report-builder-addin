/**
 * Data Visualization Module
 * ==========================
 *
 * Analyzes fields and recommends appropriate visualizations
 * with progressive disclosure logic.
 *
 * Key Features:
 * - Field role detection (measure, dimension, temporal)
 * - Chart type recommendations based on data characteristics
 * - Progressive disclosure (hide chart options if no measurements)
 * - Scoring system for chart recommendations
 *
 * Usage:
 * ```tsx
 * import { analyzeVisualizationCapability } from './modules/data-viz';
 *
 * const capability = analyzeVisualizationCapability(selectedFields);
 *
 * if (capability.canShowChart) {
 *   // Show chart options
 *   // Use capability.recommendedChartType as default
 * } else {
 *   // Only show table option
 * }
 * ```
 */

// Analyzers
export {
  analyzeField,
  analyzeFields,
  filterFieldsByRole,
  getMeasurements,
  getDimensions,
  getTemporalFields,
  canShowChart,
} from './analyzers/fieldAnalyzer';

export {
  analyzeVisualizationCapability,
  isChartTypeViable,
  getChartTypeExplanation,
} from './analyzers/visualizationCapability';

// Recommenders
export {
  getChartRecommendations,
  getBestChartType,
} from './recommenders/chartRecommender';

// Types
export type {
  FieldRole,
  AnalyzedField,
  VisualizationCapability,
  ChartRecommendation,
  DataCardinality,
} from './types/visualization.types';
