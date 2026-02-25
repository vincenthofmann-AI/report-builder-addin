/**
 * Overview Card Module
 * Displays a single metric with trend indicator
 */

import { ModuleConfig } from '../../types/recipe';
import { useModuleData } from '../../hooks/useModuleData';
import { LoadingState } from '../common/LoadingState';

interface OverviewCardProps {
  module: ModuleConfig;
  useLiveData?: boolean;
}

export function OverviewCard({ module, useLiveData = false }: OverviewCardProps) {
  const { data, isLoading, error } = useModuleData(module, undefined, undefined, useLiveData);

  if (isLoading) {
    return (
      <div className="overview-card">
        <LoadingState size="small" message="" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="overview-card overview-card--error">
        <div className="overview-card__error">Error loading data</div>
      </div>
    );
  }

  const metric = data?.metric || 0;
  const change = data?.change || 0;
  const direction = data?.direction || 'up';

  return (
    <div className="overview-card">
      {module.icon && (
        <div className="overview-card__icon">{module.icon}</div>
      )}
      <div className="overview-card__content">
        <div className="overview-card__header">
          <h3 className="overview-card__title">{module.title}</h3>
        </div>
        {module.description && (
          <p className="overview-card__description">{module.description}</p>
        )}
        <div className="overview-card__metric">
          <span className="overview-card__value">{metric}</span>
        </div>
        {change !== 0 && (
          <div className={`overview-card__trend overview-card__trend--${direction}`}>
            <span className="overview-card__trend-icon">
              {direction === 'up' ? '↑' : '↓'}
            </span>
            <span className="overview-card__trend-value">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
