/**
 * Core Report Generation Tests
 * ==============================
 *
 * Tests for pure report generation logic.
 * All tests run without React, MyGeotab, or any framework.
 */

import { describe, it, expect } from 'vitest';
import {
  applyFilters,
  aggregate,
  groupAndAggregate,
  sortData,
  paginateData,
  calculateSubtotals,
  projectColumns,
  formatValue,
} from './report-generator';
import { makeDataRecord, makeDataRecords, makeFilter, makeColumn } from '../test/helpers';

describe('applyFilters', () => {
  describe('equals operator', () => {
    it('filters records matching exact value', () => {
      const data = [
        makeDataRecord({ id: '1', category: 'A' }),
        makeDataRecord({ id: '2', category: 'B' }),
        makeDataRecord({ id: '3', category: 'A' }),
      ];
      const filters = [makeFilter({ field: 'category', operator: 'equals', value: 'A' })];

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(['1', '3']);
    });

    it('returns empty array when no matches', () => {
      const data = [makeDataRecord({ category: 'A' })];
      const filters = [makeFilter({ field: 'category', operator: 'equals', value: 'Z' })];

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(0);
    });
  });

  describe('notEquals operator', () => {
    it('filters records NOT matching value', () => {
      const data = [
        makeDataRecord({ id: '1', category: 'A' }),
        makeDataRecord({ id: '2', category: 'B' }),
      ];
      const filters = [makeFilter({ field: 'category', operator: 'notEquals', value: 'A' })];

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('2');
    });
  });

  describe('contains operator', () => {
    it('performs case-insensitive substring match', () => {
      const data = [
        makeDataRecord({ id: '1', driver: 'John Smith' }),
        makeDataRecord({ id: '2', driver: 'Jane Doe' }),
        makeDataRecord({ id: '3', driver: 'Bob Johnson' }),
      ];
      const filters = [makeFilter({ field: 'driver', operator: 'contains', value: 'john' })];

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(['1', '3']);
    });
  });

  describe('greaterThan / lessThan operators', () => {
    it('filters numbers greater than threshold', () => {
      const data = [
        makeDataRecord({ id: '1', value: 50 }),
        makeDataRecord({ id: '2', value: 150 }),
        makeDataRecord({ id: '3', value: 200 }),
      ];
      const filters = [makeFilter({ field: 'value', operator: 'greaterThan', value: 100 })];

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(['2', '3']);
    });

    it('filters numbers less than threshold', () => {
      const data = [
        makeDataRecord({ id: '1', value: 50 }),
        makeDataRecord({ id: '2', value: 150 }),
      ];
      const filters = [makeFilter({ field: 'value', operator: 'lessThan', value: 100 })];

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('1');
    });
  });

  describe('between operator', () => {
    it('filters numbers within range (inclusive)', () => {
      const data = [
        makeDataRecord({ id: '1', value: 50 }),
        makeDataRecord({ id: '2', value: 100 }),
        makeDataRecord({ id: '3', value: 150 }),
        makeDataRecord({ id: '4', value: 200 }),
      ];
      const filters = [makeFilter({ field: 'value', operator: 'between', value: [100, 150] })];

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(['2', '3']);
    });

    it('returns false for invalid between value format', () => {
      const data = [makeDataRecord({ value: 100 })];
      const filters = [makeFilter({ field: 'value', operator: 'between', value: 100 })]; // Invalid: not array

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(0);
    });
  });

  describe('multiple filters (AND logic)', () => {
    it('applies all filters as AND (all must match)', () => {
      const data = [
        makeDataRecord({ id: '1', category: 'A', value: 100 }),
        makeDataRecord({ id: '2', category: 'A', value: 200 }),
        makeDataRecord({ id: '3', category: 'B', value: 150 }),
      ];
      const filters = [
        makeFilter({ field: 'category', operator: 'equals', value: 'A' }),
        makeFilter({ field: 'value', operator: 'greaterThan', value: 150 }),
      ];

      const result = applyFilters(data, filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('2');
    });
  });

  it('returns all data when no filters provided', () => {
    const data = makeDataRecords(3);

    const result = applyFilters(data, []);

    expect(result).toHaveLength(3);
  });
});

describe('aggregate', () => {
  describe('sum', () => {
    it('sums all values', () => {
      expect(aggregate([10, 20, 30], 'sum')).toBe(60);
    });

    it('returns 0 for empty array', () => {
      expect(aggregate([], 'sum')).toBe(0);
    });
  });

  describe('avg', () => {
    it('calculates average', () => {
      expect(aggregate([10, 20, 30], 'avg')).toBe(20);
    });

    it('returns 0 for empty array', () => {
      expect(aggregate([], 'avg')).toBe(0);
    });
  });

  describe('count', () => {
    it('returns number of values', () => {
      expect(aggregate([10, 20, 30], 'count')).toBe(3);
    });

    it('returns 0 for empty array', () => {
      expect(aggregate([], 'count')).toBe(0);
    });
  });

  describe('min', () => {
    it('finds minimum value', () => {
      expect(aggregate([30, 10, 20], 'min')).toBe(10);
    });
  });

  describe('max', () => {
    it('finds maximum value', () => {
      expect(aggregate([30, 10, 20], 'max')).toBe(30);
    });
  });
});

describe('groupAndAggregate', () => {
  it('groups records by column and aggregates', () => {
    const data = [
      makeDataRecord({ category: 'A', value: 100 }),
      makeDataRecord({ category: 'A', value: 200 }),
      makeDataRecord({ category: 'B', value: 150 }),
    ];

    const result = groupAndAggregate(data, 'category', 'value', 'sum');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ groupName: 'A', value: 300, count: 2 });
    expect(result[1]).toMatchObject({ groupName: 'B', value: 150, count: 1 });
  });

  it('sorts groups by aggregated value descending', () => {
    const data = [
      makeDataRecord({ category: 'A', value: 100 }),
      makeDataRecord({ category: 'B', value: 200 }),
      makeDataRecord({ category: 'C', value: 50 }),
    ];

    const result = groupAndAggregate(data, 'category', 'value', 'sum');

    expect(result.map((g) => g.groupName)).toEqual(['B', 'A', 'C']);
  });

  it('handles missing group values as "Unknown"', () => {
    const data = [
      makeDataRecord({ category: undefined, value: 100 }),
    ];

    const result = groupAndAggregate(data, 'category', 'value', 'sum');

    expect(result[0]?.groupName).toBe('Unknown');
  });

  it('rounds aggregated values to 2 decimal places', () => {
    const data = [
      makeDataRecord({ category: 'A', value: 10.333 }),
      makeDataRecord({ category: 'A', value: 20.666 }),
    ];

    const result = groupAndAggregate(data, 'category', 'value', 'sum');

    expect(result[0]?.value).toBe(31); // 30.999 rounded to 31
  });

  it('includes original records in each group', () => {
    const data = [
      makeDataRecord({ id: '1', category: 'A', value: 100 }),
      makeDataRecord({ id: '2', category: 'A', value: 200 }),
    ];

    const result = groupAndAggregate(data, 'category', 'value', 'sum');

    expect(result[0]?.records).toHaveLength(2);
    expect(result[0]?.records.map((r) => r.id)).toEqual(['1', '2']);
  });
});

describe('sortData', () => {
  it('sorts numbers ascending', () => {
    const data = [
      makeDataRecord({ id: '1', value: 30 }),
      makeDataRecord({ id: '2', value: 10 }),
      makeDataRecord({ id: '3', value: 20 }),
    ];

    const result = sortData(data, 'value', 'asc');

    expect(result.map((r) => r.value)).toEqual([10, 20, 30]);
  });

  it('sorts numbers descending', () => {
    const data = [
      makeDataRecord({ id: '1', value: 10 }),
      makeDataRecord({ id: '2', value: 30 }),
      makeDataRecord({ id: '3', value: 20 }),
    ];

    const result = sortData(data, 'value', 'desc');

    expect(result.map((r) => r.value)).toEqual([30, 20, 10]);
  });

  it('sorts strings alphabetically ascending', () => {
    const data = [
      makeDataRecord({ id: '1', driver: 'Charlie' }),
      makeDataRecord({ id: '2', driver: 'Alice' }),
      makeDataRecord({ id: '3', driver: 'Bob' }),
    ];

    const result = sortData(data, 'driver', 'asc');

    expect(result.map((r) => r.driver)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('handles null/undefined values (pushes to end for asc)', () => {
    const data = [
      makeDataRecord({ id: '1', value: 10 }),
      makeDataRecord({ id: '2', value: undefined }),
      makeDataRecord({ id: '3', value: 20 }),
    ];

    const result = sortData(data, 'value', 'asc');

    expect(result.map((r) => r.id)).toEqual(['2', '1', '3']);
  });

  it('does not mutate original array', () => {
    const data = [makeDataRecord({ value: 30 }), makeDataRecord({ value: 10 })];
    const original = [...data];

    sortData(data, 'value', 'asc');

    expect(data).toEqual(original);
  });
});

describe('paginateData', () => {
  it('returns first page', () => {
    const data = makeDataRecords(10, (i) => ({ id: `${i + 1}` }));

    const result = paginateData(data, 1, 5);

    expect(result).toHaveLength(5);
    expect(result.map((r) => r.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('returns second page', () => {
    const data = makeDataRecords(10, (i) => ({ id: `${i + 1}` }));

    const result = paginateData(data, 2, 5);

    expect(result).toHaveLength(5);
    expect(result.map((r) => r.id)).toEqual(['6', '7', '8', '9', '10']);
  });

  it('returns partial last page', () => {
    const data = makeDataRecords(7, (i) => ({ id: `${i + 1}` }));

    const result = paginateData(data, 2, 5);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['6', '7']);
  });

  it('returns empty array for out-of-range page', () => {
    const data = makeDataRecords(5);

    const result = paginateData(data, 10, 5);

    expect(result).toHaveLength(0);
  });
});

describe('calculateSubtotals', () => {
  it('calculates grand total and subtotals', () => {
    const groupedData = [
      { groupName: 'A', value: 300, count: 2, records: [] },
      { groupName: 'B', value: 150, count: 1, records: [] },
      { groupName: 'C', value: 50, count: 1, records: [] },
    ];

    const result = calculateSubtotals(groupedData, 'sum');

    expect(result.grandTotal).toBe(500);
    expect(result.subtotals.get('A')).toBe(300);
    expect(result.subtotals.get('B')).toBe(150);
    expect(result.subtotals.get('C')).toBe(50);
  });

  it('calculates average for grandTotal when using avg function', () => {
    const groupedData = [
      { groupName: 'A', value: 100, count: 1, records: [] },
      { groupName: 'B', value: 200, count: 1, records: [] },
      { groupName: 'C', value: 300, count: 1, records: [] },
    ];

    const result = calculateSubtotals(groupedData, 'avg');

    expect(result.grandTotal).toBe(200); // (100 + 200 + 300) / 3
  });
});

describe('projectColumns', () => {
  it('selects only specified columns', () => {
    const data = [
      { id: '1', driver: 'John', device: 'V001', value: 100, extra: 'ignore' },
    ];
    const columns = [
      makeColumn({ key: 'driver' }),
      makeColumn({ key: 'value' }),
    ];

    const result = projectColumns(data, columns);

    expect(result[0]).toEqual({ driver: 'John', value: 100 });
    expect(result[0]).not.toHaveProperty('device');
    expect(result[0]).not.toHaveProperty('extra');
  });

  it('handles missing columns gracefully', () => {
    const data = [{ id: '1', driver: 'John' }];
    const columns = [
      makeColumn({ key: 'driver' }),
      makeColumn({ key: 'missing' }),
    ];

    const result = projectColumns(data, columns);

    expect(result[0]).toEqual({ driver: 'John' });
  });
});

describe('formatValue', () => {
  it('formats numbers with locale separators', () => {
    expect(formatValue(1234567, 'number')).toBe('1,234,567');
  });

  it('formats datetime as locale string', () => {
    const result = formatValue('2024-01-15T10:30:00Z', 'datetime');
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('formats booleans as Yes/No', () => {
    expect(formatValue(true, 'boolean')).toBe('Yes');
    expect(formatValue(false, 'boolean')).toBe('No');
  });

  it('formats strings as-is', () => {
    expect(formatValue('Hello World', 'string')).toBe('Hello World');
  });

  it('returns dash for null/undefined', () => {
    expect(formatValue(null, 'string')).toBe('-');
    expect(formatValue(undefined, 'number')).toBe('-');
  });
});
