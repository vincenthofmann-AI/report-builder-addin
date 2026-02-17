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
 */

import { Table, Clock, FileText, TrendingUp } from 'lucide-react';
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
    <div className="flex items-center justify-center h-full p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#f0f7ff] flex items-center justify-center mx-auto mb-4">
            <Table className="w-8 h-8 text-[#003a63]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0f172a] mb-2">
            Preview Your {objectType} Report
          </h3>
          <p className="text-sm text-[#64748b]">
            Your report will show the following data
          </p>
        </div>

        {/* Table Structure Preview */}
        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden mb-6">
          {/* Table Headers */}
          <div className="bg-[#f8fafc] border-b border-[#e2e8f0]">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${fields.length}, 1fr)` }}>
              {fields.map((field) => {
                const typeInfo = formatFieldType(field.type);
                return (
                  <div
                    key={field.name}
                    className="px-4 py-3 border-r border-[#e2e8f0] last:border-r-0"
                  >
                    <div className="font-medium text-xs text-[#0f172a]">
                      {field.label}
                    </div>
                    <div className="text-xs text-[#94a3b8] mt-0.5 flex items-center gap-1">
                      <span className="font-mono text-[10px]">{typeInfo.icon}</span>
                      {typeInfo.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sample Row Structure (empty but formatted) */}
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-[#94a3b8]">
              <FileText className="w-4 h-4" />
              <span>
                {canAutoLoad
                  ? 'Data will load automatically'
                  : 'Select fields and time range to preview data'}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Summary */}
        <div className="grid grid-cols-2 gap-4">
          {/* Time Range */}
          <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]">
            <div className="flex items-center gap-2 text-sm font-medium text-[#64748b] mb-2">
              <Clock className="w-4 h-4" />
              Time Range
            </div>
            <div className="text-sm text-[#0f172a]">
              {timeRange.start.toLocaleDateString()} -{' '}
              {timeRange.end.toLocaleDateString()}
            </div>
            <div className="text-xs text-[#94a3b8] mt-1">
              {timeRange.preset === 'custom' ? 'Custom range' : timeRange.preset}
            </div>
          </div>

          {/* Estimated Results */}
          <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]">
            <div className="flex items-center gap-2 text-sm font-medium text-[#64748b] mb-2">
              <TrendingUp className="w-4 h-4" />
              Estimated Results
            </div>
            <div className="text-sm text-[#0f172a]">
              {estimatedRows !== undefined
                ? `~${estimatedRows.toLocaleString()} records`
                : 'Calculating...'}
            </div>
            <div className="text-xs text-[#94a3b8] mt-1">
              {fields.length} {fields.length === 1 ? 'column' : 'columns'} selected
            </div>
          </div>
        </div>

        {/* Guidance */}
        <div className="mt-6 p-4 bg-[#f0f7ff] border border-[#bfdbfe] rounded-lg">
          <p className="text-xs text-[#1e40af]">
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
