/**
 * BuilderPage Component
 * ======================
 *
 * Right-side page that displays report preview with layout switching.
 * Shows guided empty states (NO MOCK DATA) and real data when available.
 *
 * ZENITH-ONLY: Uses @geotab/zenith Table and EmptyState components
 */

import { FileX, Loader2, AlertCircle } from 'lucide-react';
import { Table, EmptyState } from '../../../services/zenith-adapter';
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
      <EmptyState
        icon={<Loader2 style={{ animation: 'spin 1s linear infinite' }} />}
        title="Loading report data..."
        description={`Querying ${selectedObject} records`}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle />}
        title="Failed to load data"
        description={error}
      />
    );
  }

  // Empty state (no data yet) - Show PREVIEW, not "no data" message
  if (!data || data.length === 0) {
    // If no object or fields selected, show basic guidance
    if (!selectedObject || selectedFields.length === 0) {
      return (
        <EmptyState
          icon={<FileX />}
          title={!selectedObject ? 'Select a Data Source' : 'Select Fields'}
          description={
            !selectedObject
              ? 'Choose a MyGeotab object type to start building your report'
              : 'Pick at least one field to preview your report structure'
          }
        />
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
    const columns = selectedFields.map(field => ({
      key: field,
      label: field,
      sortable: true
    }));

    const rows = data.map((row, index) => ({
      id: index.toString(),
      ...selectedFields.reduce((acc, field) => ({
        ...acc,
        [field]: typeof row[field] === 'object' ? JSON.stringify(row[field]) : String(row[field] ?? '-')
      }), {})
    }));

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Table Header */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            {selectedObject} Data
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            {data.length} {data.length === 1 ? 'record' : 'records'} found
          </p>
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Table
            columns={columns}
            data={rows}
          />
        </div>
      </div>
    );
  }

  // Chart view (placeholder - would integrate with chart library)
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chart Header */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
          {selectedObject} Chart
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
          {chartType?.charAt(0).toUpperCase()}{chartType?.slice(1)} chart with{' '}
          {data.length} data {data.length === 1 ? 'point' : 'points'}
        </p>
      </div>

      {/* Chart Content (Placeholder) */}
      <div style={{ flex: 1 }}>
        <EmptyState
          title="Chart View"
          description="Chart visualization will be rendered here (Integration with chart library pending)"
        />
      </div>
    </div>
  );
}
