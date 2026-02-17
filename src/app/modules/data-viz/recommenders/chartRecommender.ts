/**
 * Chart Recommender
 * ==================
 *
 * Recommends appropriate chart types based on selected fields
 * and their characteristics.
 *
 * Logic:
 * - Bar Chart: Best for comparing categorical values
 * - Line Chart: Best for time-series or trends
 * - Pie Chart: Best for parts-of-whole with few categories
 * - Area Chart: Best for cumulative time-series
 */

import type { ChartType } from '../../builder/types/builder.types';
import type {
  AnalyzedField,
  ChartRecommendation,
  DataCardinality,
} from '../types/visualization.types';
import {
  getMeasurements,
  getDimensions,
  getTemporalFields,
} from '../analyzers/fieldAnalyzer';

/**
 * Calculate data cardinality
 */
function calculateCardinality(fields: AnalyzedField[]): DataCardinality {
  const measures = getMeasurements(fields);
  const dimensions = getDimensions(fields);
  const temporal = getTemporalFields(fields);

  return {
    totalFields: fields.length,
    measureCount: measures.length,
    dimensionCount: dimensions.length,
    temporalCount: temporal.length,
    hasMultipleMeasures: measures.length > 1,
    hasTimeSeries: temporal.length > 0,
  };
}

/**
 * Recommend bar chart
 */
function recommendBarChart(
  cardinality: DataCardinality,
  fields: AnalyzedField[]
): ChartRecommendation | null {
  const measures = getMeasurements(fields);
  const dimensions = getDimensions(fields);

  // Bar charts need at least one measure and one dimension
  if (measures.length === 0 || dimensions.length === 0) {
    return null;
  }

  const requirements: string[] = [];
  let score = 60; // Base score

  // Boost score for categorical comparisons
  if (dimensions.length >= 1) {
    score += 20;
    requirements.push(`${dimensions.length} categorical dimension(s)`);
  }

  // Boost for single measure
  if (measures.length === 1) {
    score += 10;
    requirements.push('Single measure for clear comparison');
  }

  // Reduce score if temporal data exists (line chart better)
  if (cardinality.hasTimeSeries) {
    score -= 15;
  }

  return {
    chartType: 'bar',
    score,
    reason: 'Best for comparing values across categories',
    requirements,
  };
}

/**
 * Recommend line chart
 */
function recommendLineChart(
  cardinality: DataCardinality,
  fields: AnalyzedField[]
): ChartRecommendation | null {
  const measures = getMeasurements(fields);
  const temporal = getTemporalFields(fields);

  // Line charts need at least one measure
  if (measures.length === 0) {
    return null;
  }

  const requirements: string[] = [];
  let score = 50; // Base score

  // Strong boost for time-series data
  if (temporal.length > 0) {
    score += 35;
    requirements.push(`${temporal.length} time field(s) for trend analysis`);
  }

  // Boost for multiple measures (can show multiple lines)
  if (cardinality.hasMultipleMeasures) {
    score += 10;
    requirements.push('Multiple measures for comparison');
  }

  // Reduce score if no temporal data
  if (!cardinality.hasTimeSeries) {
    score -= 20;
  }

  return {
    chartType: 'line',
    score,
    reason: temporal.length > 0
      ? 'Best for showing trends over time'
      : 'Good for showing continuous data patterns',
    requirements,
  };
}

/**
 * Recommend pie chart
 */
function recommendPieChart(
  cardinality: DataCardinality,
  fields: AnalyzedField[]
): ChartRecommendation | null {
  const measures = getMeasurements(fields);
  const dimensions = getDimensions(fields);

  // Pie charts need exactly one measure and one dimension
  if (measures.length !== 1 || dimensions.length === 0) {
    return null;
  }

  const requirements: string[] = [];
  let score = 40; // Base score (lower preference)

  // Good for part-to-whole relationships
  if (dimensions.length === 1 && measures.length === 1) {
    score += 15;
    requirements.push('Single dimension and measure for part-to-whole view');
  }

  // Reduce score if temporal (bad for time-series)
  if (cardinality.hasTimeSeries) {
    score -= 25;
  }

  // Reduce score if multiple measures
  if (cardinality.hasMultipleMeasures) {
    score -= 20;
  }

  return {
    chartType: 'pie',
    score,
    reason: 'Best for showing parts of a whole',
    requirements,
  };
}

/**
 * Recommend area chart
 */
function recommendAreaChart(
  cardinality: DataCardinality,
  fields: AnalyzedField[]
): ChartRecommendation | null {
  const measures = getMeasurements(fields);
  const temporal = getTemporalFields(fields);

  // Area charts need measures
  if (measures.length === 0) {
    return null;
  }

  const requirements: string[] = [];
  let score = 45; // Base score

  // Strong boost for time-series with cumulative data
  if (temporal.length > 0) {
    score += 25;
    requirements.push('Time-series data for cumulative view');
  }

  // Boost for multiple measures (stacked areas)
  if (cardinality.hasMultipleMeasures) {
    score += 15;
    requirements.push('Multiple measures for stacked comparison');
  }

  // Reduce score if no temporal data
  if (!cardinality.hasTimeSeries) {
    score -= 25;
  }

  return {
    chartType: 'area',
    score,
    reason: temporal.length > 0
      ? 'Best for showing cumulative trends over time'
      : 'Good for visualizing volume',
    requirements,
  };
}

/**
 * Get all chart recommendations sorted by score
 */
export function getChartRecommendations(
  fields: AnalyzedField[]
): ChartRecommendation[] {
  const cardinality = calculateCardinality(fields);

  const recommendations: ChartRecommendation[] = [
    recommendBarChart(cardinality, fields),
    recommendLineChart(cardinality, fields),
    recommendPieChart(cardinality, fields),
    recommendAreaChart(cardinality, fields),
  ].filter((rec): rec is ChartRecommendation => rec !== null);

  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Get the single best chart recommendation
 */
export function getBestChartType(fields: AnalyzedField[]): ChartType | null {
  const recommendations = getChartRecommendations(fields);
  return recommendations.length > 0 ? recommendations[0].chartType : null;
}
