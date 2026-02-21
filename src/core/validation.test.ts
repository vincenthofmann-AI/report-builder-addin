/**
 * Core Validation Tests
 * ======================
 *
 * Tests for input validation and sanitization logic.
 */

import { describe, it, expect } from 'vitest';
import {
  validateReportConfig,
  validateFilterRule,
  validateColumnSelection,
  sanitizeString,
} from './validation';
import { makeReportConfig, makeFilter } from '../test/helpers';

describe('validateReportConfig', () => {
  describe('name validation', () => {
    it('accepts valid name (3-100 characters)', () => {
      const config = makeReportConfig({ name: 'Valid Report Name' });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects names shorter than 3 characters', () => {
      const config = makeReportConfig({ name: 'AB' });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'name', code: 'NAME_TOO_SHORT' })
      );
    });

    it('rejects empty name after trimming', () => {
      const config = makeReportConfig({ name: '   ' });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'NAME_TOO_SHORT' })
      );
    });

    it('rejects names longer than 100 characters', () => {
      const config = makeReportConfig({ name: 'A'.repeat(101) });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'name', code: 'NAME_TOO_LONG' })
      );
    });
  });

  describe('dataSource validation', () => {
    it('rejects missing dataSource', () => {
      const config = makeReportConfig({ dataSource: '' });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'dataSource', code: 'DATA_SOURCE_REQUIRED' })
      );
    });
  });

  describe('columns validation', () => {
    it('requires at least 1 column', () => {
      const config = makeReportConfig({ columns: [] });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'columns', code: 'COLUMNS_REQUIRED' })
      );
    });

    it('limits to 20 columns max', () => {
      const config = makeReportConfig({ columns: Array(21).fill('col') });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'columns', code: 'TOO_MANY_COLUMNS' })
      );
    });

    it('accepts valid column count (1-20)', () => {
      const config = makeReportConfig({ columns: ['col1', 'col2', 'col3'] });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(true);
    });
  });

  describe('filters validation', () => {
    it('limits to 10 filters max', () => {
      const config = makeReportConfig({ filters: Array(11).fill(makeFilter()) });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'filters', code: 'TOO_MANY_FILTERS' })
      );
    });
  });

  describe('dateRange validation', () => {
    it('rejects start date after end date', () => {
      const config = makeReportConfig({
        dateRange: {
          from: new Date('2024-12-31'),
          to: new Date('2024-01-01'),
        },
      });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'dateRange', code: 'INVALID_DATE_RANGE' })
      );
    });

    it('rejects date range exceeding 1 year', () => {
      const config = makeReportConfig({
        dateRange: {
          from: new Date('2023-01-01'),
          to: new Date('2024-06-01'), // > 1 year
        },
      });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'dateRange', code: 'DATE_RANGE_TOO_LARGE' })
      );
    });

    it('accepts valid date range (<= 1 year)', () => {
      const config = makeReportConfig({
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31'), // Exactly 1 year
        },
      });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(true);
    });
  });

  describe('multiple errors', () => {
    it('accumulates all validation errors', () => {
      const config = makeReportConfig({
        name: 'AB', // Too short
        columns: [], // Required
        filters: Array(11).fill(makeFilter()), // Too many
      });

      const result = validateReportConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.map((e) => e.code)).toEqual([
        'NAME_TOO_SHORT',
        'COLUMNS_REQUIRED',
        'TOO_MANY_FILTERS',
      ]);
    });
  });
});

describe('validateFilterRule', () => {
  it('accepts valid filter', () => {
    const filter = makeFilter();

    const result = validateFilterRule(filter);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing field', () => {
    const filter = makeFilter({ field: '' });

    const result = validateFilterRule(filter);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'field', code: 'FILTER_FIELD_REQUIRED' })
    );
  });

  it('rejects missing operator', () => {
    const filter = { field: 'category', value: 'A' } as any;

    const result = validateFilterRule(filter);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'operator', code: 'FILTER_OPERATOR_REQUIRED' })
    );
  });

  it('rejects invalid operator', () => {
    const filter = makeFilter({ operator: 'invalid' as any });

    const result = validateFilterRule(filter);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'operator', code: 'INVALID_OPERATOR' })
    );
  });

  it('rejects missing value', () => {
    const filter = { field: 'category', operator: 'equals' } as any;

    const result = validateFilterRule(filter);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'value', code: 'FILTER_VALUE_REQUIRED' })
    );
  });
});

describe('validateColumnSelection', () => {
  it('accepts valid selection (3-10 columns)', () => {
    const columns = ['col1', 'col2', 'col3'];

    const result = validateColumnSelection(columns);

    expect(result.valid).toBe(true);
  });

  it('rejects fewer than 3 columns', () => {
    const columns = ['col1', 'col2'];

    const result = validateColumnSelection(columns);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'MIN_COLUMNS_NOT_MET' })
    );
  });

  it('rejects more than 10 columns', () => {
    const columns = Array(11).fill('col');

    const result = validateColumnSelection(columns);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'MAX_COLUMNS_EXCEEDED' })
    );
  });

  it('rejects duplicate columns', () => {
    const columns = ['col1', 'col2', 'col1', 'col3'];

    const result = validateColumnSelection(columns);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'DUPLICATE_COLUMNS' })
    );
  });
});

describe('sanitizeString', () => {
  it('escapes HTML special characters', () => {
    const input = '<script>alert("XSS")</script>';

    const result = sanitizeString(input);

    expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('escapes quotes (single and double)', () => {
    const input = `It's a "test"`;

    const result = sanitizeString(input);

    expect(result).toBe('It&#x27;s a &quot;test&quot;');
  });

  it('escapes forward slashes', () => {
    const input = '</script>';

    const result = sanitizeString(input);

    expect(result).toContain('&#x2F;');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('handles already-safe strings', () => {
    const input = 'Safe text with no special chars';

    const result = sanitizeString(input);

    expect(result).toBe(input);
  });
});
