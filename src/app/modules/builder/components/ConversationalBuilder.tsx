/**
 * ConversationalBuilder Component
 * =================================
 *
 * Orchestrates the conversational + visual report building experience.
 *
 * Flow:
 * 1. QuestionEntry - User selects question or custom
 * 2. VisualBuilder - User sees and refines report structure
 * 3. Preview - Live data display
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import { Button, ButtonType, Banner } from '../../../services/zenith-adapter';
import { QuestionEntry } from './QuestionEntry';
import { VisualCanvas } from './VisualCanvas';
import { FieldPalette } from './FieldPalette';
import { TimeRangeSelector } from './TimeRangeSelector';
import { LayoutSwitcher } from './LayoutSwitcher';
import type { QuestionTemplate } from '../types/question-templates';
import type {
  MyGeotabObjectType,
  TimeRange,
  LayoutView,
  ChartType,
} from '../types/builder.types';
import { analyzeVisualizationCapability } from '../../data-viz';
import { estimateQuerySize, getQuerySizeCategory } from '../utils/queryEstimator';
import { OBJECT_FIELDS } from '../types/objects.constants';

type BuilderMode = 'question' | 'visual' | 'preview';

interface ReportConfig {
  objectType: MyGeotabObjectType | null;
  selectedFields: string[];
  timeRange: TimeRange;
  layoutView: LayoutView;
  chartType?: ChartType;
  groupBy?: string;
  questionTemplate?: QuestionTemplate;
}

export function ConversationalBuilder() {
  const [mode, setMode] = useState<BuilderMode>('question');
  const [config, setConfig] = useState<ReportConfig>({
    objectType: null,
    selectedFields: [],
    timeRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
      preset: 'last7days',
    },
    layoutView: 'table',
  });
  const [showSettings, setShowSettings] = useState(false);

  // Calculate visualization capability based on selected fields
  const visualizationCapability =
    config.objectType && config.selectedFields.length > 0
      ? analyzeVisualizationCapability(config.objectType, config.selectedFields)
      : { canShowChart: false, recommendedChartType: null, chartRecommendations: [] };

  // Calculate estimated query size
  const estimatedRows = estimateQuerySize(config.objectType, config.timeRange);
  const sizeInfo = getQuerySizeCategory(estimatedRows);

  // Handle question selection
  const handleSelectQuestion = (template: QuestionTemplate) => {
    // Calculate time range from preset
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (template.config.timeRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last30days':
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }

    setConfig({
      objectType: template.config.objectType,
      selectedFields: template.config.fields,
      timeRange: {
        start,
        end,
        preset: template.config.timeRange,
      },
      layoutView: template.config.chartType ? 'chart' : 'table',
      chartType: template.config.chartType,
      groupBy: template.config.groupBy,
      questionTemplate: template,
    });
    setMode('visual');
  };

  // Handle skip to custom builder
  const handleSkipToCustom = () => {
    setMode('visual');
  };

  // Handle back to questions
  const handleBackToQuestions = () => {
    setMode('question');
  };

  // Handle field toggle
  const handleToggleField = (fieldName: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldName)
        ? prev.selectedFields.filter((f) => f !== fieldName)
        : [...prev.selectedFields, fieldName],
    }));
  };

  // Handle field removal from canvas
  const handleRemoveField = (fieldName: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.filter((f) => f !== fieldName),
    }));
  };

  // Handle field reordering
  const handleReorderFields = (fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      const newFields = [...prev.selectedFields];
      const [removed] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, removed);
      return { ...prev, selectedFields: newFields };
    });
  };

  // Handle add field click (opens field palette)
  const handleAddFieldClick = () => {
    // Field palette is always visible in visual mode
    // This could scroll to it or highlight it
  };

  // Handle time range change
  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setConfig((prev) => ({ ...prev, timeRange }));
  };

  // Handle layout change
  const handleLayoutChange = (layoutView: LayoutView) => {
    setConfig((prev) => ({ ...prev, layoutView }));
  };

  // Handle chart type change
  const handleChartTypeChange = (chartType: ChartType) => {
    setConfig((prev) => ({ ...prev, chartType }));
  };

  // Handle run report
  const handleRunReport = () => {
    // TODO: Execute query and show data
    setMode('preview');
  };

  // Question Entry Mode
  if (mode === 'question') {
    return (
      <QuestionEntry
        onSelectQuestion={handleSelectQuestion}
        onSkipToCustom={handleSkipToCustom}
      />
    );
  }

  // Visual Builder Mode
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Button type={ButtonType.Tertiary} onClick={handleBackToQuestions}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to Questions
        </Button>

        {config.questionTemplate && (
          <div style={{ flex: '1', minWidth: 0 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#0f172a',
              }}
            >
              {config.questionTemplate.question}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {config.objectType} • {config.selectedFields.length} fields
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type={ButtonType.Secondary}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings style={{ width: '16px', height: '16px' }} />
            Settings
          </Button>

          <Button
            type={ButtonType.Primary}
            onClick={handleRunReport}
            disabled={!config.objectType || config.selectedFields.length === 0}
          >
            <Play style={{ width: '16px', height: '16px' }} />
            {sizeInfo.autoLoad ? 'Preview' : `Load ${estimatedRows.toLocaleString()} Records`}
          </Button>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Time Range */}
            <div>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 12px 0',
                }}
              >
                Time Range
              </h4>
              <TimeRangeSelector
                timeRange={config.timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>

            {/* Layout */}
            <div>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 12px 0',
                }}
              >
                Display Options
              </h4>
              <LayoutSwitcher
                layoutView={config.layoutView}
                chartType={config.chartType}
                visualizationCapability={visualizationCapability}
                onLayoutChange={handleLayoutChange}
                onChartTypeChange={handleChartTypeChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Warning if large query */}
      {!sizeInfo.autoLoad && (
        <div style={{ padding: '16px 24px' }}>
          <Banner type="warning">
            <strong>Large query:</strong> {sizeInfo.message}
          </Banner>
        </div>
      )}

      {/* Main Builder Area: Canvas + Palette */}
      <div style={{ display: 'flex', flex: '1', overflow: 'hidden' }}>
        {/* Visual Canvas (Left - Main Area) */}
        <div style={{ flex: '1', overflow: 'auto' }}>
          {config.objectType ? (
            <VisualCanvas
              objectType={config.objectType}
              selectedFields={config.selectedFields}
              layoutView={config.layoutView}
              chartType={config.chartType}
              groupBy={config.groupBy}
              onRemoveField={handleRemoveField}
              onReorderFields={handleReorderFields}
              onAddFieldClick={handleAddFieldClick}
              estimatedRows={estimatedRows}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Select a data source to start building
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Field Palette (Right - Sidebar) */}
        {config.objectType && (
          <div style={{ width: '320px', flexShrink: 0 }}>
            <FieldPalette
              objectType={config.objectType}
              selectedFields={config.selectedFields}
              onToggleField={handleToggleField}
            />
          </div>
        )}
      </div>
    </div>
  );
}
