/**
 * Module Renderer
 * Dynamically renders the correct module component based on module type
 */

import { ModuleConfig } from '../../types/recipe';
import { OverviewCard } from '../modules/OverviewCard';
import { ImmediateActions } from '../modules/ImmediateActions';
import { MetricChart } from '../modules/MetricChart';
import { PerformanceRankings } from '../modules/PerformanceRankings';
import { BenchmarkBar } from '../modules/BenchmarkBar';

interface ModuleRendererProps {
  module: ModuleConfig;
  useLiveData?: boolean;
}

export function ModuleRenderer({ module, useLiveData = false }: ModuleRendererProps) {
  switch (module.type) {
    case 'overview-card':
      return <OverviewCard module={module} useLiveData={useLiveData} />;

    case 'immediate-actions':
      return <ImmediateActions module={module} useLiveData={useLiveData} />;

    case 'metric-chart':
      return <MetricChart module={module} useLiveData={useLiveData} />;

    case 'performance-rankings':
      return <PerformanceRankings module={module} useLiveData={useLiveData} />;

    case 'benchmark-bar':
      return <BenchmarkBar module={module} useLiveData={useLiveData} />;

    default:
      return (
        <div className="module-renderer__unknown">
          Unknown module type: {module.type}
        </div>
      );
  }
}
