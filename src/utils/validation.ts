/**
 * Validation utilities for dashboard configuration
 */

import { DashboardConfig, ModuleConfig } from '../types/recipe';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate dashboard name
 */
export function validateDashboardName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim() === '') {
    errors.push('Dashboard name is required');
  }

  if (name.length > 50) {
    errors.push('Dashboard name must be 50 characters or less');
  }

  if (name.length < 3) {
    errors.push('Dashboard name must be at least 3 characters');
  }

  // Check for invalid characters
  if (/[<>:"/\\|?*]/.test(name)) {
    errors.push('Dashboard name contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate module selection
 */
export function validateModules(modules: ModuleConfig[]): ValidationResult {
  const errors: string[] = [];

  if (modules.length === 0) {
    errors.push('At least one module must be selected');
  }

  if (modules.length > 12) {
    errors.push('Maximum 12 modules allowed per dashboard');
  }

  // Check for duplicate module IDs
  const ids = modules.map(m => m.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate module IDs: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete dashboard configuration
 */
export function validateDashboard(config: DashboardConfig): ValidationResult {
  const errors: string[] = [];

  // Validate name
  const nameValidation = validateDashboardName(config.name);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }

  // Validate modules
  const moduleValidation = validateModules(config.modules);
  if (!moduleValidation.isValid) {
    errors.push(...moduleValidation.errors);
  }

  // Validate layout
  if (!config.layout || !['single-column', 'two-column', 'grid'].includes(config.layout)) {
    errors.push('Invalid layout type');
  }

  // Validate date range if specified
  if (config.dateRange) {
    if (!config.dateRange.defaultPeriod) {
      errors.push('Default date range period is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>:"/\\|?*]/g, '');
}
