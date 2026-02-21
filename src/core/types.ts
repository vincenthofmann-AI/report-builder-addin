/**
 * Core Domain Types
 * ==================
 *
 * Pure TypeScript types with no external dependencies.
 * These represent the business domain, independent of React, MyGeotab, or any framework.
 */

/**
 * Column definition for report data
 */
export interface ColumnDef {
  key: string;
  label: string;
  type: "string" | "number" | "datetime" | "boolean";
  format?: string;
}

/**
 * Filter rule for data queries
 */
export interface FilterRule {
  field: string;
  operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan" | "between";
  value: unknown;
}

/**
 * Aggregation function types
 */
export type AggregationFn = "sum" | "avg" | "count" | "min" | "max";

/**
 * Chart type for visualizations
 */
export type ChartType = "bar" | "line" | "pie";

/**
 * Report configuration
 */
export interface ReportConfig {
  id: string;
  name: string;
  dataSource: string;
  columns: string[];
  filters: FilterRule[];
  groupBy: string | null;
  aggregateColumn: string | null;
  aggregateFn: AggregationFn;
  chartType: ChartType;
  dateRange: {
    from: Date;
    to: Date;
  };
  visibility: "private" | "shared" | "org";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Insight template definition
 */
export interface InsightTemplate {
  id: string;
  categoryId: string;
  name: string;
  question: string;
  description: string;
  dataSource: string;
  defaultColumns: string[];
  defaultFilters: FilterRule[];
  defaultGroupBy: string | null;
  defaultAggregateColumn: string | null;
  defaultAggregateFn: AggregationFn;
  defaultChartType: ChartType;
  usageCount: number;
  tags: string[];
}

/**
 * Data record (generic row)
 */
export type DataRecord = Record<string, unknown>;

/**
 * Grouped data result
 */
export interface GroupedData {
  groupName: string;
  value: number;
  count: number;
  records: DataRecord[];
}

/**
 * Report execution result
 */
export interface ReportResult {
  data: DataRecord[];
  groupedData: GroupedData[];
  totalRecords: number;
  executionTime: number;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
