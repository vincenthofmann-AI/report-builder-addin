/**
 * ReportPreviewEmpty Component
 * ==============================
 *
 * Guided empty state that shows users what they'll get
 * BEFORE they generate the report.
 *
 * Shows:
 * - Table structure with column headers
 * - Field types and format hints
 * - Estimated row count
 * - Time range summary
 * - Next actions
 *
 * ZENITH-ONLY: Uses @geotab/zenith Card component
 */

import { Table, Clock, FileText, TrendingUp } from 'lucide-react';
import { Card } from '../../../services/zenith-adapter';
import type { MyGeotabObjectType, TimeRange } from '../types/builder.types';
import type { FieldDefinition } from '../types/builder.types';
import { OBJECT_FIELDS } from '../types/objects.constants';

interface ReportPreviewEmptyProps {
  objectType: MyGeotabObjectType;
  selectedFields: string[];
  timeRange: TimeRange;
  estimatedRows?: number;
  canAutoLoad: boolean;
}

/**
 * Get field definitions for selected fields
 */
function getSelectedFieldDefs(
  objectType: MyGeotabObjectType,
  selectedFields: string[]
): FieldDefinition[] {
  const allFields = OBJECT_FIELDS[objectType] || [];
  return allFields.filter((f) => selectedFields.includes(f.name));
}

/**
 * Format field type for display
 */
function formatFieldType(type: string): { icon: string; label: string } {
  switch (type) {
    case 'string':
      return { icon: 'Aa', label: 'Text' };
    case 'number':
      return { icon: '#', label: 'Number' };
    case 'date':
      return { icon: '📅', label: 'Date/Time' };
    case 'boolean':
      return { icon: '✓', label: 'Yes/No' };
    case 'object':
      return { icon: '{  }', label: 'Object' };
    default:
      return { icon: '?', label: type };
  }
}

export function ReportPreviewEmpty({
  objectType,
  selectedFields,
  timeRange,
  estimatedRows,
  canAutoLoad,
}: ReportPreviewEmptyProps) {
  const fields = getSelectedFieldDefs(objectType, selectedFields);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '672px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#f0f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Table style={{ width: '32px', height: '32px', color: '#003a63' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
            Preview Your {objectType} Report
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Your report will show the following data
          </p>
        </div>

        {/* Table Structure Preview */}
        <Card style={{ marginBottom: '24px' }}>
          {/* Table Headers */}
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gap: '1px', gridTemplateColumns: `repeat(${fields.length}, 1fr)` }}>
              {fields.map((field, index) => {
                const typeInfo = formatFieldType(field.type);
                return (
                  <div
                    key={field.name}
                    style={{
                      padding: '12px 16px',
                      borderRight: index < fields.length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: '12px', color: '#0f172a' }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{typeInfo.icon}</span>
                      {typeInfo.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sample Row Structure (empty but formatted) */}
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8' }}>
              <FileText style={{ width: '16px', height: '16px' }} />
              <span>
                {canAutoLoad
                  ? 'Data will load automatically'
                  : 'Select fields and time range to preview data'}
              </span>
            </div>
          </div>
        </Card>

        {/* Metadata Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {/* Time Range */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '8px' }}>
              <Clock style={{ width: '16px', height: '16px' }} />
              Time Range
            </div>
            <div style={{ fontSize: '14px', color: '#0f172a' }}>
              {timeRange.start.toLocaleDateString()} -{' '}
              {timeRange.end.toLocaleDateString()}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              {timeRange.preset === 'custom' ? 'Custom range' : timeRange.preset}
            </div>
          </Card>

          {/* Estimated Results */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '8px' }}>
              <TrendingUp style={{ width: '16px', height: '16px' }} />
              Estimated Results
            </div>
            <div style={{ fontSize: '14px', color: '#0f172a' }}>
              {estimatedRows !== undefined
                ? `~${estimatedRows.toLocaleString()} records`
                : 'Calculating...'}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              {fields.length} {fields.length === 1 ? 'column' : 'columns'} selected
            </div>
          </Card>
        </div>

        {/* Guidance */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
            💡 <strong>Tip:</strong>{' '}
            {canAutoLoad
              ? 'Data loads automatically for queries under 1,000 records.'
              : 'Adjust your time range or add more fields to refine your report.'}
          </p>
        </div>
      </div>
    </div>
  );
}
