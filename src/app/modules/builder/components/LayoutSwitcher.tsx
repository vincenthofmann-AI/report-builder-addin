/**
 * LayoutSwitcher Component
 * =========================
 *
 * Toggle between table and chart views with chart type selector.
 */

import { Table, BarChart3, LineChart, PieChart, AreaChart } from 'lucide-react';
import type { LayoutView, ChartType } from '../types/builder.types';

interface LayoutSwitcherProps {
  layoutView: LayoutView;
  chartType?: ChartType;
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
  onLayoutChange,
  onChartTypeChange,
}: LayoutSwitcherProps) {
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
          onClick={() => onLayoutChange('chart')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            layoutView === 'chart'
              ? 'border-[#003a63] bg-[#f0f7ff] text-[#003a63]'
              : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Chart
        </button>
      </div>

      {/* Chart Type Selector (only shown when chart view is active) */}
      {layoutView === 'chart' && (
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map((type) => {
            const isActive = chartType === type.value;
            const IconComponent = type.icon;

            return (
              <button
                key={type.value}
                onClick={() => onChartTypeChange(type.value)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isActive
                    ? 'border-[#003a63] bg-[#f0f7ff] text-[#003a63]'
                    : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1]'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {type.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
