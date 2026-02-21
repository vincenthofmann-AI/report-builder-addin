/**
 * Core Report Generation Logic
 * =============================
 *
 * Pure functions for data aggregation, grouping, and transformation.
 * Zero dependencies on React, MyGeotab API, or any framework.
 * All functions are testable in isolation.
 */

import type {
  DataRecord,
  GroupedData,
  AggregationFn,
  FilterRule,
  ColumnDef,
} from "./types";

/**
 * Apply filters to a dataset
 */
export function applyFilters(
  data: DataRecord[],
  filters: FilterRule[]
): DataRecord[] {
  if (filters.length === 0) return data;

  return data.filter((record) => {
    return filters.every((filter) => {
      const fieldValue = record[filter.field];

      switch (filter.operator) {
        case "equals":
          return fieldValue === filter.value;
        case "notEquals":
          return fieldValue !== filter.value;
        case "contains":
          return String(fieldValue)
            .toLowerCase()
            .includes(String(filter.value).toLowerCase());
        case "greaterThan":
          return Number(fieldValue) > Number(filter.value);
        case "lessThan":
          return Number(fieldValue) < Number(filter.value);
        case "between":
          if (Array.isArray(filter.value) && filter.value.length === 2) {
            const numValue = Number(fieldValue);
            return numValue >= Number(filter.value[0]) && numValue <= Number(filter.value[1]);
          }
          return false;
        default:
          return true;
      }
    });
  });
}

/**
 * Aggregate a set of values
 */
export function aggregate(values: number[], fn: AggregationFn): number {
  if (values.length === 0) return 0;

  switch (fn) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "count":
      return values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    default:
      return 0;
  }
}

/**
 * Group data by a column and aggregate
 */
export function groupAndAggregate(
  data: DataRecord[],
  groupByColumn: string,
  aggregateColumn: string,
  aggregateFn: AggregationFn
): GroupedData[] {
  // Group records by the groupBy column value
  const groups = new Map<string, DataRecord[]>();

  data.forEach((record) => {
    const groupValue = String(record[groupByColumn] || "Unknown");
    if (!groups.has(groupValue)) {
      groups.set(groupValue, []);
    }
    groups.get(groupValue)!.push(record);
  });

  // Aggregate each group
  const result: GroupedData[] = [];

  groups.forEach((records, groupName) => {
    const values = records
      .map((r) => Number(r[aggregateColumn]) || 0)
      .filter((v) => !isNaN(v));

    result.push({
      groupName,
      value: Math.round(aggregate(values, aggregateFn) * 100) / 100,
      count: records.length,
      records,
    });
  });

  // Sort by value descending
  return result.sort((a, b) => b.value - a.value);
}

/**
 * Sort data by a column
 */
export function sortData(
  data: DataRecord[],
  column: string,
  direction: "asc" | "desc"
): DataRecord[] {
  return [...data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === "asc" ? -1 : 1;
    if (bVal == null) return direction === "asc" ? 1 : -1;

    // Number comparison
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    // String comparison
    const aStr = String(aVal);
    const bStr = String(bVal);
    const comparison = aStr.localeCompare(bStr);
    return direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Paginate data
 */
export function paginateData(
  data: DataRecord[],
  page: number,
  pageSize: number
): DataRecord[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
}

/**
 * Calculate subtotals for grouped data
 */
export function calculateSubtotals(
  groupedData: GroupedData[],
  aggregateFn: AggregationFn
): { grandTotal: number; subtotals: Map<string, number> } {
  const subtotals = new Map<string, number>();
  const allValues: number[] = [];

  groupedData.forEach((group) => {
    subtotals.set(group.groupName, group.value);
    allValues.push(group.value);
  });

  const grandTotal = aggregate(allValues, aggregateFn);

  return { grandTotal, subtotals };
}

/**
 * Project columns (select specific columns from records)
 */
export function projectColumns(
  data: DataRecord[],
  columns: ColumnDef[]
): DataRecord[] {
  const columnKeys = columns.map((c) => c.key);

  return data.map((record) => {
    const projected: DataRecord = {};
    columnKeys.forEach((key) => {
      if (key in record) {
        projected[key] = record[key];
      }
    });
    return projected;
  });
}

/**
 * Format value based on column type
 */
export function formatValue(
  value: unknown,
  columnType: ColumnDef["type"]
): string {
  if (value == null) return "-";

  switch (columnType) {
    case "number":
      return Number(value).toLocaleString();
    case "datetime":
      try {
        return new Date(String(value)).toLocaleString();
      } catch {
        return String(value);
      }
    case "boolean":
      return value ? "Yes" : "No";
    case "string":
    default:
      return String(value);
  }
}
