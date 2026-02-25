/**
 * Metric Chart Module
 * Displays time-series chart with metric switcher
 */

import { useState } from 'react';
import { ModuleConfig } from '../../types/recipe';
import { useModuleData } from '../../hooks/useModuleData';
import { LoadingState } from '../common/LoadingState';

interface MetricChartProps {
  module: ModuleConfig;
  useLiveData?: boolean;
}

export function MetricChart({ module, useLiveData = false }: MetricChartProps) {
  const availableMetrics = module.options?.availableMetrics || [];
  const [selectedMetric, setSelectedMetric] = useState(0);

  const { data, isLoading, error } = useModuleData(module, undefined, undefined, useLiveData);

  if (isLoading) {
    return (
      <div className="metric-chart">
        <LoadingState size="small" message="Loading chart..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="metric-chart metric-chart--error">
        <div className="metric-chart__error">Error loading chart</div>
      </div>
    );
  }

  const series = data?.series || [];

  return (
    <div className="metric-chart">
      <div className="metric-chart__header">
        <h3 className="metric-chart__title">{module.title}</h3>
        {availableMetrics.length > 0 && (
          <select
            className="metric-chart__selector"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(Number(e.target.value))}
          >
            {availableMetrics.map((metric: any, index: number) => (
              <option key={metric.id} value={index}>
                {metric.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="metric-chart__chart">
        {series.length === 0 ? (
          <div className="metric-chart__empty">No data available</div>
        ) : (
          <div className="metric-chart__visualization">
            {/* Simple bar chart visualization */}
            <div className="metric-chart__bars">
              {series.slice(-10).map((point: any, index: number) => {
                const maxValue = Math.max(...series.map((p: any) => p.value));
                const height = (point.value / maxValue) * 100;

                return (
                  <div key={index} className="metric-chart__bar-wrapper">
                    <div
                      className="metric-chart__bar"
                      style={{ height: `${height}%` }}
                      title={`${point.date}: ${point.value}`}
                    />
                    <div className="metric-chart__bar-label">
                      {new Date(point.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
