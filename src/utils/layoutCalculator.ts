/**
 * Layout calculation utilities for dashboard module positioning
 */

import { ModuleConfig, ModulePosition, LayoutType } from '../types/recipe';

/**
 * Calculate module positions for a given layout
 */
export function calculateLayout(
  modules: ModuleConfig[],
  layoutType: LayoutType
): ModuleConfig[] {
  switch (layoutType) {
    case 'single-column':
      return calculateSingleColumnLayout(modules);
    case 'two-column':
      return calculateTwoColumnLayout(modules);
    case 'grid':
      return calculateGridLayout(modules);
    default:
      return modules;
  }
}

/**
 * Single column layout - all modules stacked vertically
 */
function calculateSingleColumnLayout(modules: ModuleConfig[]): ModuleConfig[] {
  return modules.map((module, index) => ({
    ...module,
    defaultPosition: {
      row: index,
      column: 0,
      width: 12
    }
  }));
}

/**
 * Two column layout - modules arranged in 2 columns
 */
function calculateTwoColumnLayout(modules: ModuleConfig[]): ModuleConfig[] {
  return modules.map((module, index) => {
    const isEven = index % 2 === 0;
    const row = Math.floor(index / 2);

    return {
      ...module,
      defaultPosition: {
        row,
        column: isEven ? 0 : 6,
        width: 6
      }
    };
  });
}

/**
 * Grid layout - modules arranged in 3 columns with intelligent sizing
 */
function calculateGridLayout(modules: ModuleConfig[]): ModuleConfig[] {
  let currentRow = 0;
  let currentColumn = 0;

  return modules.map((module, index) => {
    // First 3 modules get smaller width (4 columns each)
    const width = index < 3 ? 4 : 6;

    const position: ModulePosition = {
      row: currentRow,
      column: currentColumn,
      width
    };

    // Calculate next position
    currentColumn += width;
    if (currentColumn >= 12) {
      currentColumn = 0;
      currentRow++;
    }

    return {
      ...module,
      defaultPosition: position
    };
  });
}

/**
 * Recommend layout based on module count
 */
export function recommendLayout(moduleCount: number): LayoutType {
  if (moduleCount <= 3) return 'single-column';
  if (moduleCount <= 6) return 'two-column';
  return 'grid';
}

/**
 * Get layout display name
 */
export function getLayoutDisplayName(layout: LayoutType): string {
  const names: Record<LayoutType, string> = {
    'single-column': 'Single Column',
    'two-column': 'Two Column',
    'grid': 'Grid'
  };
  return names[layout];
}

/**
 * Get layout description
 */
export function getLayoutDescription(layout: LayoutType): string {
  const descriptions: Record<LayoutType, string> = {
    'single-column': 'Best for mobile or narrow screens',
    'two-column': 'Best for desktop screens',
    'grid': 'Best for wide desktop screens'
  };
  return descriptions[layout];
}
