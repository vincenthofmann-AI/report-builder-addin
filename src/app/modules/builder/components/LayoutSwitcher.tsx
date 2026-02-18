/**
 * LayoutSwitcher Component
 * =========================
 *
 * Toggle between table and chart views with chart type selector.
 * Applies progressive disclosure - disables chart if no measurements.
 *
 * Uses Zenith components:
 * - Button for view toggle and chart type selection
 * - Banner for warnings
 */

import { Table, BarChart3, LineChart, PieChart, AreaChart } from 'lucide-react';
import { Button, ButtonType, Banner } from '../../../services/zenith-adapter';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          type={layoutView === 'table' ? ButtonType.Primary : ButtonType.Secondary}
          onClick={() => onLayoutChange('table')}
        >
          <Table style={{ width: '16px', height: '16px' }} />
          Table
        </Button>

        <Button
          type={layoutView === 'chart' && canShowChart ? ButtonType.Primary : ButtonType.Secondary}
          onClick={() => canShowChart && onLayoutChange('chart')}
          disabled={!canShowChart}
        >
          <BarChart3 style={{ width: '16px', height: '16px' }} />
          Chart
        </Button>
      </div>

      {/* Progressive Disclosure: Show warning if charts disabled */}
      {!canShowChart && (
        <Banner type="warning">
          Charts require numeric measurements. Select fields like speed, distance, or temperature.
        </Banner>
      )}

      {/* Chart Type Selector (only shown when chart view is active) */}
      {layoutView === 'chart' && canShowChart && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {chartTypes.map((type) => {
              const isActive = chartType === type.value;
              const isRecommended = recommendedChartType === type.value;
              const IconComponent = type.icon;

              const recommendation = chartRecommendations.find(
                (rec) => rec.chartType === type.value
              );

              return (
                <div key={type.value} style={{ position: 'relative' }}>
                  <Button
                    type={isActive ? ButtonType.Primary : ButtonType.Secondary}
                    onClick={() => onChartTypeChange(type.value)}
                  >
                    <IconComponent style={{ width: '14px', height: '14px' }} />
                    <span style={{ flex: '1', textAlign: 'left' }}>{type.label}</span>
                    {recommendation && (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{recommendation.score}</span>
                    )}
                  </Button>
                  {isRecommended && (
                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid white' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Show recommendation explanation for active chart type */}
          {chartType && chartRecommendations.length > 0 && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f7ff', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#003a63', margin: 0 }}>
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
