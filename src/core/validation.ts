/**
 * Core Validation Logic
 * ======================
 *
 * Pure validation functions with no external dependencies.
 * Parse, don't validate: transform raw input into validated domain types.
 */

import type { ReportConfig, FilterRule, ValidationResult, ValidationError } from "./types";

/**
 * Validate report configuration
 */
export function validateReportConfig(config: Partial<ReportConfig>): ValidationResult {
  const errors: ValidationError[] = [];

  // Name validation
  if (!config.name || config.name.trim().length < 3) {
    errors.push({
      field: "name",
      message: "Report name must be at least 3 characters",
      code: "NAME_TOO_SHORT",
    });
  }

  if (config.name && config.name.length > 100) {
    errors.push({
      field: "name",
      message: "Report name must be less than 100 characters",
      code: "NAME_TOO_LONG",
    });
  }

  // Data source validation
  if (!config.dataSource || config.dataSource.trim().length === 0) {
    errors.push({
      field: "dataSource",
      message: "Data source is required",
      code: "DATA_SOURCE_REQUIRED",
    });
  }

  // Columns validation
  if (!config.columns || config.columns.length < 1) {
    errors.push({
      field: "columns",
      message: "At least 1 column is required",
      code: "COLUMNS_REQUIRED",
    });
  }

  if (config.columns && config.columns.length > 20) {
    errors.push({
      field: "columns",
      message: "Maximum 20 columns allowed",
      code: "TOO_MANY_COLUMNS",
    });
  }

  // Filters validation
  if (config.filters && config.filters.length > 10) {
    errors.push({
      field: "filters",
      message: "Maximum 10 filters allowed",
      code: "TOO_MANY_FILTERS",
    });
  }

  // Date range validation
  if (config.dateRange) {
    const { from, to } = config.dateRange;
    if (from > to) {
      errors.push({
        field: "dateRange",
        message: "Start date must be before end date",
        code: "INVALID_DATE_RANGE",
      });
    }

    // Prevent queries spanning more than 1 year (performance limit)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    if (to.getTime() - from.getTime() > oneYearMs) {
      errors.push({
        field: "dateRange",
        message: "Date range cannot exceed 1 year",
        code: "DATE_RANGE_TOO_LARGE",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate filter rule
 */
export function validateFilterRule(filter: Partial<FilterRule>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!filter.field || filter.field.trim().length === 0) {
    errors.push({
      field: "field",
      message: "Filter field is required",
      code: "FILTER_FIELD_REQUIRED",
    });
  }

  if (!filter.operator) {
    errors.push({
      field: "operator",
      message: "Filter operator is required",
      code: "FILTER_OPERATOR_REQUIRED",
    });
  }

  const validOperators = ["equals", "notEquals", "contains", "greaterThan", "lessThan", "between"];
  if (filter.operator && !validOperators.includes(filter.operator)) {
    errors.push({
      field: "operator",
      message: `Invalid operator. Must be one of: ${validOperators.join(", ")}`,
      code: "INVALID_OPERATOR",
    });
  }

  if (filter.value === undefined || filter.value === null) {
    errors.push({
      field: "value",
      message: "Filter value is required",
      code: "FILTER_VALUE_REQUIRED",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate column selection for custom builder
 */
export function validateColumnSelection(columns: string[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (columns.length < 3) {
    errors.push({
      field: "columns",
      message: "Select at least 3 columns",
      code: "MIN_COLUMNS_NOT_MET",
    });
  }

  if (columns.length > 10) {
    errors.push({
      field: "columns",
      message: "Maximum 10 columns allowed",
      code: "MAX_COLUMNS_EXCEEDED",
    });
  }

  // Check for duplicates
  const uniqueColumns = new Set(columns);
  if (uniqueColumns.size !== columns.length) {
    errors.push({
      field: "columns",
      message: "Duplicate columns detected",
      code: "DUPLICATE_COLUMNS",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
