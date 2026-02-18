/**
 * BuilderPage Component
 * ======================
 *
 * Right-side page that displays report preview with layout switching.
 * Shows guided empty states (NO MOCK DATA) and real data when available.
 *
 * Uses Zenith components:
 * - Banner for errors
 * - HTML table with zen-table class for data display
 */

import { FileX, Loader2, AlertCircle } from 'lucide-react';
import { Banner } from '../../../services/zenith-adapter';
import type { LayoutView, ChartType, MyGeotabObjectType, TimeRange } from '../types/builder.types';
import { ReportPreviewEmpty } from './ReportPreviewEmpty';
import { estimateQuerySize, getQuerySizeCategory } from '../utils/queryEstimator';

interface BuilderPageProps {
  selectedObject: MyGeotabObjectType | null;
  selectedFields: string[];
  timeRange: TimeRange;
  data: any[] | null;
  isLoading: boolean;
  error: string | null;
  layoutView: LayoutView;
  chartType?: ChartType;
}

export function BuilderPage({
  selectedObject,
  selectedFields,
  timeRange,
  data,
  isLoading,
  error,
  layoutView,
  chartType,
}: BuilderPageProps) {
  // Estimate query size for progressive disclosure
  const estimatedRows = estimateQuerySize(selectedObject, timeRange);
  const sizeInfo = getQuerySizeCategory(estimatedRows);
  const canAutoLoad = selectedObject !== null && selectedFields.length > 0 && sizeInfo.autoLoad;
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#003a63] animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#0f172a]">Loading report data...</p>
          <p className="text-xs text-[#64748b] mt-1">
            Querying {selectedObject} records
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-[#dc2626]" />
          </div>
          <p className="text-sm font-medium text-[#0f172a] mb-1">Failed to load data</p>
          <p className="text-xs text-[#64748b]">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state (no data yet) - Show PREVIEW, not "no data" message
  if (!data || data.length === 0) {
    // If no object or fields selected, show basic guidance
    if (!selectedObject || selectedFields.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <FileX className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#0f172a] mb-1">
              {!selectedObject ? 'Select a Data Source' : 'Select Fields'}
            </p>
            <p className="text-xs text-[#64748b]">
              {!selectedObject
                ? 'Choose a MyGeotab object type to start building your report'
                : 'Pick at least one field to preview your report structure'}
            </p>
          </div>
        </div>
      );
    }

    // Show preview of what the report will contain (NO MOCK DATA)
    return (
      <ReportPreviewEmpty
        objectType={selectedObject}
        selectedFields={selectedFields}
        timeRange={timeRange}
        estimatedRows={estimatedRows}
        canAutoLoad={canAutoLoad}
      />
    );
  }

  // Table view
  if (layoutView === 'table') {
    return (
      <div className="h-full flex flex-col">
        {/* Table Header */}
        <div className="px-6 py-3 border-b border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0f172a]">
                {selectedObject} Data
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                {data.length} {data.length === 1 ? 'record' : 'records'} found
              </p>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-[#f8fafc] sticky top-0">
              <tr>
                {selectedFields.map((field) => (
                  <th
                    key={field}
                    className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider border-b border-[#e2e8f0]"
                  >
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e2e8f0]">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-[#f8fafc]">
                  {selectedFields.map((field) => (
                    <td
                      key={field}
                      className="px-6 py-4 text-sm text-[#0f172a] whitespace-nowrap"
                    >
                      {typeof row[field] === 'object'
                        ? JSON.stringify(row[field])
                        : String(row[field] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Chart view (placeholder - would integrate with chart library)
  return (
    <div className="h-full flex flex-col">
      {/* Chart Header */}
      <div className="px-6 py-3 border-b border-[#e2e8f0]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#0f172a]">
              {selectedObject} Chart
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              {chartType?.charAt(0).toUpperCase()}{chartType?.slice(1)} chart with{' '}
              {data.length} data {data.length === 1 ? 'point' : 'points'}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Content (Placeholder) */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#f0f7ff] flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-8 h-8 text-[#003a63]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#0f172a] mb-1">Chart View</p>
          <p className="text-xs text-[#64748b]">
            Chart visualization will be rendered here
          </p>
          <p className="text-xs text-[#94a3b8] mt-2">
            (Integration with chart library pending)
          </p>
        </div>
      </div>
    </div>
  );
}
