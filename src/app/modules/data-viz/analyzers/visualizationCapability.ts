/**
 * Visualization Capability Analyzer
 * ===================================
 *
 * Analyzes selected fields and determines what visualizations
 * are possible and recommended.
 */

import type { FieldDefinition } from '../../builder/types/builder.types';
import type { VisualizationCapability } from '../types/visualization.types';
import {
  analyzeFields,
  getMeasurements,
  getDimensions,
  getTemporalFields,
  canShowChart,
} from './fieldAnalyzer';
import {
  getChartRecommendations,
  getBestChartType,
} from '../recommenders/chartRecommender';

/**
 * Analyze visualization capabilities for selected fields
 */
export function analyzeVisualizationCapability(
  fields: FieldDefinition[]
): VisualizationCapability {
  // Analyze all fields
  const analyzedFields = analyzeFields(fields);

  // Extract measures, dimensions, and temporal fields
  const measures = getMeasurements(analyzedFields);
  const dimensions = getDimensions(analyzedFields);
  const temporal = getTemporalFields(analyzedFields);

  // Determine chart capability
  const canShowChartView = canShowChart(analyzedFields);

  // Get recommendations
  const chartRecommendations = canShowChartView
    ? getChartRecommendations(analyzedFields)
    : [];

  const recommendedChartType = canShowChartView
    ? getBestChartType(analyzedFields)
    : null;

  return {
    canShowChart: canShowChartView,
    canShowTable: true, // Always can show table
    measures,
    dimensions,
    temporal,
    recommendedChartType,
    chartRecommendations,
  };
}

/**
 * Check if a specific chart type is viable for the given fields
 */
export function isChartTypeViable(
  fields: FieldDefinition[],
  chartType: string
): boolean {
  const capability = analyzeVisualizationCapability(fields);

  if (!capability.canShowChart) {
    return false;
  }

  // Check if this chart type is in the recommendations
  return capability.chartRecommendations.some(
    (rec) => rec.chartType === chartType
  );
}

/**
 * Get explanation for why a chart type is/isn't recommended
 */
export function getChartTypeExplanation(
  fields: FieldDefinition[],
  chartType: string
): string | null {
  const capability = analyzeVisualizationCapability(fields);

  if (!capability.canShowChart) {
    return 'No numeric measurements available for charting. Charts require at least one numeric field (e.g., speed, distance, temperature).';
  }

  const recommendation = capability.chartRecommendations.find(
    (rec) => rec.chartType === chartType
  );

  return recommendation
    ? `${recommendation.reason} (Score: ${recommendation.score}/100)`
    : `${chartType} chart is not recommended for this data combination.`;
}
