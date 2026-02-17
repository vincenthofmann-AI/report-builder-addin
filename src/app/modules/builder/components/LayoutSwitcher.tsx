/**
 * LayoutSwitcher Component
 * =========================
 *
 * Toggle between table and chart views with chart type selector.
 * Applies progressive disclosure - disables chart if no measurements.
 */

import { Table, BarChart3, LineChart, PieChart, AreaChart, AlertCircle } from 'lucide-react';
import type { LayoutView, ChartType } from '../types/builder.types';
import type { VisualizationCapability } from '../../data-viz';

interface LayoutSwitcherProps {
  layoutView: LayoutView;
  chartType?: ChartType;
  visualizationCapability: VisualizationCapability;
  onLayoutChange: (view: LayoutView) => void;
  onChartTypeChange: (type: ChartType) => void;
}

const chartTypes: { value: ChartType; label: string; icon: React.ElementType }[] = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'area', label: 'Area Chart', icon: AreaChart },
];

export function LayoutSwitcher({
  layoutView,
  chartType = 'bar',
  visualizationCapability,
  onLayoutChange,
  onChartTypeChange,
}: LayoutSwitcherProps) {
  const { canShowChart, recommendedChartType, chartRecommendations } = visualizationCapability;

  return (
    <div className="space-y-3">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onLayoutChange('table')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            layoutView === 'table'
              ? 'border-[#003a63] bg-[#f0f7ff] text-[#003a63]'
              : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1]'
          }`}
        >
          <Table className="w-4 h-4" />
          Table
        </button>

        <button
          onClick={() => canShowChart && onLayoutChange('chart')}
          disabled={!canShowChart}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            layoutView === 'chart' && canShowChart
              ? 'border-[#003a63] bg-[#f0f7ff] text-[#003a63]'
              : !canShowChart
              ? 'border-[#e2e8f0] bg-[#f8fafc] text-[#cbd5e1] cursor-not-allowed'
              : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Chart
        </button>
      </div>

      {/* Progressive Disclosure: Show warning if charts disabled */}
      {!canShowChart && (
        <div className="flex items-start gap-2 p-2 bg-[#fef3c7] border border-[#fbbf24] rounded-lg">
          <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
          <p className="text-xs text-[#92400e]">
            Charts require numeric measurements. Select fields like speed, distance, or temperature.
          </p>
        </div>
      )}

      {/* Chart Type Selector (only shown when chart view is active) */}
      {layoutView === 'chart' && canShowChart && (
        <div>
          <div className="grid grid-cols-2 gap-2">
            {chartTypes.map((type) => {
              const isActive = chartType === type.value;
              const isRecommended = recommendedChartType === type.value;
              const IconComponent = type.icon;

              const recommendation = chartRecommendations.find(
                (rec) => rec.chartType === type.value
              );

              return (
                <div key={type.value} className="relative">
                  <button
                    onClick={() => onChartTypeChange(type.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      isActive
                        ? 'border-[#003a63] bg-[#f0f7ff] text-[#003a63]'
                        : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1]'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span className="flex-1 text-left">{type.label}</span>
                    {recommendation && (
                      <span className="text-xs text-[#94a3b8]">{recommendation.score}</span>
                    )}
                  </button>
                  {isRecommended && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#10b981] rounded-full border-2 border-white" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Show recommendation explanation for active chart type */}
          {chartType && chartRecommendations.length > 0 && (
            <div className="mt-2 p-2 bg-[#f0f7ff] rounded-lg">
              <p className="text-xs text-[#003a63]">
                {chartRecommendations.find((rec) => rec.chartType === chartType)?.reason ||
                  'Chart type selected'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
