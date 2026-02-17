/**
 * Field Analyzer
 * ===============
 *
 * Analyzes field definitions to determine their visualization role
 * and capabilities (measure, dimension, temporal, etc.)
 */

import type { FieldDefinition } from '../../builder/types/builder.types';
import type { AnalyzedField, FieldRole } from '../types/visualization.types';

/**
 * Patterns for identifying field roles by name
 */
const FIELD_PATTERNS = {
  // Identifiers
  identifiers: /^(id|.*Id|key|.*Key|guid|uuid)$/i,

  // Temporal fields
  temporal: /^(date|time|.*Date|.*Time|timestamp|dateTime|start|end|.*At|duration|period)$/i,

  // Measurements (numeric values)
  measures: /^(speed|distance|temperature|volume|cost|energy|power|duration|count|total|average|max|min|sum|.*Count|.*Total|.*Average|bearing|latitude|longitude|.*Used|.*Consumption)$/i,

  // Dimensions (categorical)
  dimensions: /^(name|type|status|state|category|group|.*Type|.*Status|.*State|.*Mode|comment|description)$/i,
};

/**
 * Determine field role based on type and name
 */
function determineFieldRole(field: FieldDefinition): FieldRole {
  const { name, type } = field;

  // Identifiers
  if (FIELD_PATTERNS.identifiers.test(name)) {
    return 'identifier';
  }

  // Temporal fields
  if (type === 'date' || FIELD_PATTERNS.temporal.test(name)) {
    return 'temporal';
  }

  // Measures (numeric)
  if (type === 'number' || FIELD_PATTERNS.measures.test(name)) {
    return 'measure';
  }

  // Dimensions (categorical)
  if (type === 'string' && FIELD_PATTERNS.dimensions.test(name)) {
    return 'dimension';
  }

  // Object types are typically references (metadata)
  if (type === 'object') {
    return 'metadata';
  }

  // Default: treat strings as dimensions, others as metadata
  return type === 'string' ? 'dimension' : 'metadata';
}

/**
 * Analyze a single field for visualization capabilities
 */
export function analyzeField(field: FieldDefinition): AnalyzedField {
  const role = determineFieldRole(field);

  const isMeasure = role === 'measure';
  const isDimension = role === 'dimension';
  const isTemporal = role === 'temporal';

  // A field is chartable if it's a measure, dimension, or temporal
  const isChartable = isMeasure || isDimension || isTemporal;

  return {
    ...field,
    role,
    isChartable,
    isMeasure,
    isDimension,
    isTemporal,
  };
}

/**
 * Analyze a collection of fields
 */
export function analyzeFields(fields: FieldDefinition[]): AnalyzedField[] {
  return fields.map(analyzeField);
}

/**
 * Filter fields by role
 */
export function filterFieldsByRole(
  fields: AnalyzedField[],
  role: FieldRole
): AnalyzedField[] {
  return fields.filter((f) => f.role === role);
}

/**
 * Get measurements from analyzed fields
 */
export function getMeasurements(fields: AnalyzedField[]): AnalyzedField[] {
  return fields.filter((f) => f.isMeasure);
}

/**
 * Get dimensions from analyzed fields
 */
export function getDimensions(fields: AnalyzedField[]): AnalyzedField[] {
  return fields.filter((f) => f.isDimension);
}

/**
 * Get temporal fields from analyzed fields
 */
export function getTemporalFields(fields: AnalyzedField[]): AnalyzedField[] {
  return fields.filter((f) => f.isTemporal);
}

/**
 * Check if fields support chart visualization
 */
export function canShowChart(fields: AnalyzedField[]): boolean {
  const measures = getMeasurements(fields);
  return measures.length > 0;
}
