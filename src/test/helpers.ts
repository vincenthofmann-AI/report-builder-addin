/**
 * Test Helpers
 * =============
 *
 * Helper functions for constructing test data.
 * Explicit, readable, and reusable across test files.
 */

import type { DataRecord, ReportConfig, FilterRule, ColumnDef, InsightTemplate } from '../core/types';

/**
 * Create a test data record
 */
export function makeDataRecord(overrides: Partial<DataRecord> = {}): DataRecord {
  return {
    id: 'rec-1',
    driver: 'John Smith',
    device: 'Vehicle-001',
    date: '2024-01-15',
    value: 100,
    category: 'A',
    ...overrides,
  };
}

/**
 * Create multiple test data records
 */
export function makeDataRecords(count: number, factory?: (i: number) => Partial<DataRecord>): DataRecord[] {
  return Array.from({ length: count }, (_, i) =>
    makeDataRecord(factory ? factory(i) : { id: `rec-${i + 1}` })
  );
}

/**
 * Create a test column definition
 */
export function makeColumn(overrides: Partial<ColumnDef> = {}): ColumnDef {
  return {
    key: 'value',
    label: 'Value',
    type: 'number',
    ...overrides,
  };
}

/**
 * Create a test filter rule
 */
export function makeFilter(overrides: Partial<FilterRule> = {}): FilterRule {
  return {
    field: 'category',
    operator: 'equals',
    value: 'A',
    ...overrides,
  };
}

/**
 * Create a test report config
 */
export function makeReportConfig(overrides: Partial<ReportConfig> = {}): ReportConfig {
  return {
    id: 'report-1',
    name: 'Test Report',
    dataSource: 'trips',
    columns: ['driver', 'device', 'value'],
    filters: [],
    groupBy: null,
    aggregateColumn: null,
    aggregateFn: 'sum',
    chartType: 'bar',
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
    },
    visibility: 'private',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create a test insight template
 */
export function makeInsightTemplate(overrides: Partial<InsightTemplate> = {}): InsightTemplate {
  return {
    id: 'template-1',
    categoryId: 'safety',
    name: 'Driver Safety Scorecard',
    question: 'Which drivers need coaching?',
    description: 'Safety scores and violation counts',
    dataSource: 'behavior',
    defaultColumns: ['driver', 'safetyScore', 'violations'],
    defaultFilters: [],
    defaultGroupBy: null,
    defaultAggregateColumn: null,
    defaultAggregateFn: 'avg',
    defaultChartType: 'bar',
    usageCount: 1842,
    tags: ['safety', 'driver', 'coaching'],
    ...overrides,
  };
}
