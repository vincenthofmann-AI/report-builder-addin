/**
 * Performance Rankings Module
 * Displays ranked list of top/bottom performers
 */

import { ModuleConfig } from '../../types/recipe';
import { useModuleData } from '../../hooks/useModuleData';
import { LoadingState } from '../common/LoadingState';

interface PerformanceRankingsProps {
  module: ModuleConfig;
  useLiveData?: boolean;
}

export function PerformanceRankings({ module, useLiveData = false }: PerformanceRankingsProps) {
  const { data, isLoading, error } = useModuleData(module, undefined, undefined, useLiveData);

  if (isLoading) {
    return (
      <div className="performance-rankings">
        <LoadingState size="small" message="Loading rankings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-rankings performance-rankings--error">
        <div className="performance-rankings__error">Error loading rankings</div>
      </div>
    );
  }

  const rankings = data?.rankings || [];
  const limit = module.options?.rankingLimit || 10;

  return (
    <div className="performance-rankings">
      <div className="performance-rankings__header">
        <h3 className="performance-rankings__title">{module.title}</h3>
        {module.description && (
          <p className="performance-rankings__description">{module.description}</p>
        )}
      </div>

      <div className="performance-rankings__list">
        {rankings.length === 0 ? (
          <div className="performance-rankings__empty">No data available</div>
        ) : (
          rankings.slice(0, limit).map((item: any, index: number) => (
            <div key={item.id} className="performance-rankings__item">
              <div className="performance-rankings__rank">#{index + 1}</div>
              <div className="performance-rankings__content">
                <div className="performance-rankings__name">{item.name}</div>
                <div className="performance-rankings__details">
                  <span className="performance-rankings__value">{item.value}</span>
                  {item.score && (
                    <span className="performance-rankings__score">
                      Score: {item.score}
                    </span>
                  )}
                </div>
              </div>
              <button className="performance-rankings__link">→</button>
            </div>
          ))
        )}
      </div>

      {rankings.length > limit && (
        <div className="performance-rankings__footer">
          <button className="performance-rankings__view-all">
            View All ({rankings.length})
          </button>
        </div>
      )}
    </div>
  );
}
