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
 */

import { ChevronDown, ChevronRight, Play, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
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
    <div className="flex flex-col h-full bg-white border-r border-[#e2e8f0]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e2e8f0]">
        <h3 className="text-sm font-semibold text-[#0f172a]">Report Builder</h3>
        <p className="text-xs text-[#64748b] mt-0.5">
          Configure your custom report
        </p>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <div key={section.id} className="border-b border-[#e2e8f0]">
              {/* Section Header */}
              <button
                onClick={() => !section.isDisabled && toggleSection(section.id)}
                disabled={section.isDisabled}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-colors ${
                  section.isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#f8fafc]'
                }`}
              >
                <ChevronIcon className="w-4 h-4 text-[#64748b]" />
                <span className="flex-1 text-sm font-medium text-[#0f172a]">
                  {section.title}
                </span>
                {section.isComplete && !section.isDisabled && (
                  <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
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
                <div className="px-4 pb-4">
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
      <div className="p-4 border-t border-[#e2e8f0]">
        {showGenerateButton ? (
          <>
            {/* Large query warning */}
            <div className="flex items-start gap-2 p-3 mb-3 bg-[#fef3c7] border border-[#fbbf24] rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-[#92400e]">
                <strong>Large query:</strong> {sizeInfo.message}
              </div>
            </div>

            {/* Manual load button */}
            <button
              onClick={onExecute}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                !isLoading
                  ? 'bg-[#003a63] text-white hover:bg-[#002949]'
                  : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Load {estimatedRows.toLocaleString()} Records
                </>
              )}
            </button>
          </>
        ) : (
          /* Small query - auto-loads, show status */
          <div className="text-center p-3 bg-[#f0f7ff] rounded-lg border border-[#bfdbfe]">
            <p className="text-xs text-[#1e40af]">
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
