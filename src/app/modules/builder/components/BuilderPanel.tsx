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
 * Designed to be composable - can be used anywhere in the app.
 *
 * ZENITH-ONLY: Uses @geotab/zenith Card, FormLayout, FormGroup, and Button components
 */

import { ChevronDown, ChevronRight, Play, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Card, Button, Alert } from '../../../services/zenith-adapter';
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

  const sections: {
    id: Section;
    title: string;
    isComplete: boolean;
    isDisabled: boolean;
  }[] = [
    {
      id: 'object',
      title: '1. Select Data Source',
      isComplete: selectedObject !== null,
      isDisabled: false,
    },
    {
      id: 'fields',
      title: '2. Choose Fields',
      isComplete: selectedFields.length > 0,
      isDisabled: selectedObject === null,
    },
    {
      id: 'time',
      title: '3. Set Time Range',
      isComplete: true,
      isDisabled: selectedObject === null,
    },
    {
      id: 'layout',
      title: '4. Configure View',
      isComplete: true,
      isDisabled: false,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRight: '1px solid #e2e8f0' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Report Builder</h3>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
          Configure your custom report
        </p>
      </div>

      {/* Sections */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <div key={section.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              {/* Section Header */}
              <button
                onClick={() => !section.isDisabled && toggleSection(section.id)}
                disabled={section.isDisabled}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: section.isDisabled ? 'not-allowed' : 'pointer',
                  opacity: section.isDisabled ? 0.5 : 1,
                }}
              >
                <ChevronIcon style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                  {section.title}
                </span>
                {section.isComplete && !section.isDisabled && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg
                      style={{ width: '12px', height: '12px', color: 'white' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>

              {/* Section Content */}
              {isExpanded && !section.isDisabled && (
                <div style={{ padding: '0 16px 16px 16px' }}>
                  {section.id === 'object' && (
                    <ObjectSelector
                      selectedObject={selectedObject}
                      onSelectObject={onSelectObject}
                    />
                  )}

                  {section.id === 'fields' && selectedObject && (
                    <FieldPicker
                      objectType={selectedObject}
                      selectedFields={selectedFields}
                      onToggleField={onToggleField}
                    />
                  )}

                  {section.id === 'time' && (
                    <TimeRangeSelector
                      timeRange={timeRange}
                      onTimeRangeChange={onTimeRangeChange}
                    />
                  )}

                  {section.id === 'layout' && (
                    <LayoutSwitcher
                      layoutView={layoutView}
                      chartType={chartType}
                      visualizationCapability={visualizationCapability}
                      onLayoutChange={onLayoutChange}
                      onChartTypeChange={onChartTypeChange}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Execute Button - Only for large queries */}
      <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
        {showGenerateButton ? (
          <>
            {/* Large query warning */}
            <Alert
              type="warning"
              message={`Large query: ${sizeInfo.message}`}
              style={{ marginBottom: '12px' }}
            />

            {/* Manual load button */}
            <Button
              variant="primary"
              size="medium"
              onClick={onExecute}
              disabled={isLoading}
              icon={isLoading ? undefined : <Play />}
              style={{ width: '100%' }}
            >
              {isLoading ? 'Loading...' : `Load ${estimatedRows.toLocaleString()} Records`}
            </Button>
          </>
        ) : (
          /* Small query - auto-loads, show status */
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: '#f0f7ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
              {canExecute
                ? '✓ Data loads automatically for small queries'
                : 'Select object and fields to preview data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
