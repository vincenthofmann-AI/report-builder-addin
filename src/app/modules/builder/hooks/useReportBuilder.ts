/**
 * useReportBuilder Hook
 * ======================
 *
 * Composable hook for managing report builder state.
 * Makes the builder reusable across different contexts.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  ReportBuilderState,
  MyGeotabObjectType,
  TimeRange,
  LayoutView,
  ChartType,
} from '../types/builder.types';
import { analyzeVisualizationCapability } from '../../data-viz';
import { OBJECT_FIELDS } from '../types/objects.constants';

/**
 * Initialize default time range (last 7 days)
 */
const getDefaultTimeRange = (): TimeRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);

  return {
    start,
    end,
    preset: 'last7days',
  };
};

/**
 * Initial builder state
 */
const initialState: ReportBuilderState = {
  selectedObject: null,
  selectedFields: [],
  timeRange: getDefaultTimeRange(),
  layoutView: 'table',
  chartType: undefined,
  data: null,
  isLoading: false,
  error: null,
};

/**
 * Report Builder composable hook
 */
export function useReportBuilder() {
  const [state, setState] = useState<ReportBuilderState>(initialState);

  /**
   * Analyze visualization capability based on selected fields
   * Updates automatically when fields change
   */
  const visualizationCapability = useMemo(() => {
    if (!state.selectedObject || state.selectedFields.length === 0) {
      return {
        canShowChart: false,
        canShowTable: true,
        measures: [],
        dimensions: [],
        temporal: [],
        recommendedChartType: null,
        chartRecommendations: [],
      };
    }

    // Get field definitions for selected fields
    const objectFields = OBJECT_FIELDS[state.selectedObject] || [];
    const selectedFieldDefs = objectFields.filter((f) =>
      state.selectedFields.includes(f.name)
    );

    return analyzeVisualizationCapability(selectedFieldDefs);
  }, [state.selectedObject, state.selectedFields]);

  /**
   * Select an object type
   */
  const selectObject = useCallback((objectType: MyGeotabObjectType | null) => {
    setState((prev) => ({
      ...prev,
      selectedObject: objectType,
      selectedFields: [], // Reset fields when object changes
      data: null,
      error: null,
    }));
  }, []);

  /**
   * Toggle field selection with progressive disclosure
   */
  const toggleField = useCallback(
    (fieldName: string) => {
      setState((prev) => {
        const newFields = prev.selectedFields.includes(fieldName)
          ? prev.selectedFields.filter((f) => f !== fieldName)
          : [...prev.selectedFields, fieldName];

        // Get field definitions for new selection
        const objectFields = OBJECT_FIELDS[prev.selectedObject || ''] || [];
        const selectedFieldDefs = objectFields.filter((f) =>
          newFields.includes(f.name)
        );

        // Analyze visualization capability
        const capability = analyzeVisualizationCapability(selectedFieldDefs);

        // Progressive disclosure logic
        let newLayoutView = prev.layoutView;
        let newChartType = prev.chartType;

        // If chart view is active but no measurements available, switch to table
        if (prev.layoutView === 'chart' && !capability.canShowChart) {
          newLayoutView = 'table';
          newChartType = undefined;
        }

        // If measurements just became available, suggest recommended chart type
        if (
          capability.canShowChart &&
          !prev.chartType &&
          capability.recommendedChartType
        ) {
          newChartType = capability.recommendedChartType;
        }

        return {
          ...prev,
          selectedFields: newFields,
          layoutView: newLayoutView,
          chartType: newChartType,
        };
      });
    },
    []
  );

  /**
   * Set selected fields
   */
  const setFields = useCallback((fields: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedFields: fields,
    }));
  }, []);

  /**
   * Update time range
   */
  const setTimeRange = useCallback((timeRange: TimeRange) => {
    setState((prev) => ({
      ...prev,
      timeRange,
      data: null, // Clear data when time range changes
    }));
  }, []);

  /**
   * Set layout view
   */
  const setLayoutView = useCallback((view: LayoutView) => {
    setState((prev) => ({
      ...prev,
      layoutView: view,
    }));
  }, []);

  /**
   * Set chart type
   */
  const setChartType = useCallback((type: ChartType | undefined) => {
    setState((prev) => ({
      ...prev,
      chartType: type,
    }));
  }, []);

  /**
   * Execute query (placeholder - will integrate with MyGeotab API)
   */
  const executeQuery = useCallback(async () => {
    if (!state.selectedObject || state.selectedFields.length === 0) {
      setState((prev) => ({
        ...prev,
        error: 'Please select an object and at least one field',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: Integrate with MyGeotab API
      // For now, mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: `record-${i + 1}`,
        ...Object.fromEntries(
          state.selectedFields.map((field) => [field, `Sample ${field} ${i + 1}`])
        ),
      }));

      setState((prev) => ({
        ...prev,
        data: mockData,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute query',
        isLoading: false,
      }));
    }
  }, [state.selectedObject, state.selectedFields]);

  /**
   * Reset builder state
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Check if query is ready to execute
   */
  const canExecute = state.selectedObject !== null && state.selectedFields.length > 0;

  return {
    // State
    state,

    // Object selection
    selectObject,
    selectedObject: state.selectedObject,

    // Field selection
    toggleField,
    setFields,
    selectedFields: state.selectedFields,

    // Time range
    setTimeRange,
    timeRange: state.timeRange,

    // Layout
    setLayoutView,
    setChartType,
    layoutView: state.layoutView,
    chartType: state.chartType,

    // Visualization capability (progressive disclosure)
    visualizationCapability,
    canShowChart: visualizationCapability.canShowChart,
    recommendedChartType: visualizationCapability.recommendedChartType,

    // Query execution
    executeQuery,
    canExecute,

    // Data
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    reset,
  };
}
