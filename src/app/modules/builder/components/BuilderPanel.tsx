/**
 * BuilderPanel Component
 * =======================
 *
 * Left panel that composes all builder controls in a progressive flow:
 * 1. Select object type
 * 2. Pick fields
 * 3. Set time range
 * 4. Configure layout
 *
 * Uses Zenith components:
 * - Accordion for collapsible sections
 * - Banner for warnings
 * - Button for execute action
 */

import { Play } from 'lucide-react';
import { useState } from 'react';
import { Accordion, Banner, Button, ButtonType } from '../../../services/zenith-adapter';
import { ObjectSelector } from './ObjectSelector';
import { FieldPicker } from './FieldPicker';
import { TimeRangeSelector } from './TimeRangeSelector';
import { LayoutSwitcher } from './LayoutSwitcher';
import type {
  MyGeotabObjectType,
  TimeRange,
  LayoutView,
  ChartType,
} from '../types/builder.types';
import type { VisualizationCapability } from '../../data-viz';
import { estimateQuerySize, getQuerySizeCategory } from '../utils/queryEstimator';

interface BuilderPanelProps {
  // Object selection
  selectedObject: MyGeotabObjectType | null;
  onSelectObject: (objectType: MyGeotabObjectType) => void;

  // Field selection
  selectedFields: string[];
  onToggleField: (fieldName: string) => void;

  // Time range
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;

  // Layout
  layoutView: LayoutView;
  chartType?: ChartType;
  onLayoutChange: (view: LayoutView) => void;
  onChartTypeChange: (type: ChartType) => void;

  // Visualization capability
  visualizationCapability: VisualizationCapability;

  // Actions
  canExecute: boolean;
  onExecute: () => void;
  isLoading?: boolean;
}

type Section = 'object' | 'fields' | 'time' | 'layout';

export function BuilderPanel({
  selectedObject,
  onSelectObject,
  selectedFields,
  onToggleField,
  timeRange,
  onTimeRangeChange,
  layoutView,
  chartType,
  onLayoutChange,
  onChartTypeChange,
  visualizationCapability,
  canExecute,
  onExecute,
  isLoading = false,
}: BuilderPanelProps) {
  const [expandedSection, setExpandedSection] = useState<Section>('object');

  // Calculate query size for progressive disclosure
  const estimatedRows = estimateQuerySize(selectedObject, timeRange);
  const sizeInfo = getQuerySizeCategory(estimatedRows);

  // Only show Generate button for large queries
  const showGenerateButton = canExecute && !sizeInfo.autoLoad;

  const toggleSection = (section: Section) => {
    setExpandedSection(expandedSection === section ? ('object' as Section) : section);
  };

  // Build accordion data
  const accordionData = [
    {
      id: 'object',
      title: '1. Select Data Source',
      content: (
        <ObjectSelector
          selectedObject={selectedObject}
          onSelectObject={onSelectObject}
        />
      ),
    },
    {
      id: 'fields',
      title: '2. Choose Fields',
      content: selectedObject ? (
        <FieldPicker
          objectType={selectedObject}
          selectedFields={selectedFields}
          onToggleField={onToggleField}
        />
      ) : (
        <div style={{ padding: '12px', color: '#94a3b8', fontSize: '14px' }}>
          Select a data source first
        </div>
      ),
    },
    {
      id: 'time',
      title: '3. Set Time Range',
      content: (
        <TimeRangeSelector
          timeRange={timeRange}
          onTimeRangeChange={onTimeRangeChange}
        />
      ),
    },
    {
      id: 'layout',
      title: '4. Configure View',
      content: (
        <LayoutSwitcher
          layoutView={layoutView}
          chartType={chartType}
          visualizationCapability={visualizationCapability}
          onLayoutChange={onLayoutChange}
          onChartTypeChange={onChartTypeChange}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', borderRight: '1px solid #e2e8f0' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Report Builder</h3>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
          Configure your custom report
        </p>
      </div>

      {/* Sections */}
      <div style={{ flex: '1', overflowY: 'auto' }}>
        <Accordion
          data={accordionData}
          activeIds={[expandedSection]}
          onItemClick={(id) => setExpandedSection(id as Section)}
        />
      </div>

      {/* Execute Button - Only for large queries */}
      <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
        {showGenerateButton ? (
          <>
            {/* Large query warning */}
            <div style={{ marginBottom: '12px' }}>
              <Banner type="warning">
                <strong>Large query:</strong> {sizeInfo.message}
              </Banner>
            </div>

            {/* Manual load button */}
            <Button
              type={ButtonType.Primary}
              onClick={onExecute}
              disabled={isLoading}
            >
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  <Play style={{ width: '16px', height: '16px' }} />
                  Load {estimatedRows.toLocaleString()} Records
                </>
              )}
            </Button>
          </>
        ) : (
          /* Small query - auto-loads, show status */
          <Banner type="info">
            {canExecute
              ? '✓ Data loads automatically for small queries'
              : 'Select object and fields to preview data'}
          </Banner>
        )}
      </div>
    </div>
  );
}
