/**
 * Benchmark Bar Module
 * Displays fleet score vs industry benchmark
 */

import { ModuleConfig } from '../../types/recipe';
import { useModuleData } from '../../hooks/useModuleData';
import { LoadingState } from '../common/LoadingState';

interface BenchmarkBarProps {
  module: ModuleConfig;
  useLiveData?: boolean;
}

export function BenchmarkBar({ module, useLiveData = false }: BenchmarkBarProps) {
  const { data, isLoading, error } = useModuleData(module, undefined, undefined, useLiveData);

  if (isLoading) {
    return (
      <div className="benchmark-bar">
        <LoadingState size="small" message="Loading benchmark..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="benchmark-bar benchmark-bar--error">
        <div className="benchmark-bar__error">Error loading benchmark</div>
      </div>
    );
  }

  const fleetScore = data?.fleetScore || 0;
  const industryAverage = data?.industryAverage || module.options?.benchmarkValue || 65;
  const percentile = data?.percentile || 50;

  // Determine status color
  const getStatus = () => {
    if (fleetScore >= industryAverage + 10) return 'good';
    if (fleetScore >= industryAverage - 10) return 'average';
    return 'below';
  };

  const status = getStatus();

  return (
    <div className="benchmark-bar">
      <div className="benchmark-bar__header">
        <h3 className="benchmark-bar__title">{module.title}</h3>
        {module.description && (
          <p className="benchmark-bar__description">{module.description}</p>
        )}
      </div>

      <div className="benchmark-bar__content">
        <div className="benchmark-bar__scores">
          <div className="benchmark-bar__score">
            <div className="benchmark-bar__score-label">Your Fleet</div>
            <div className="benchmark-bar__score-value benchmark-bar__score-value--fleet">
              {fleetScore}
            </div>
          </div>
          <div className="benchmark-bar__score">
            <div className="benchmark-bar__score-label">Industry Average</div>
            <div className="benchmark-bar__score-value benchmark-bar__score-value--industry">
              {industryAverage}
            </div>
          </div>
        </div>

        <div className="benchmark-bar__visualization">
          <div className="benchmark-bar__track">
            <div
              className={`benchmark-bar__fill benchmark-bar__fill--${status}`}
              style={{ width: `${fleetScore}%` }}
            />
            <div
              className="benchmark-bar__marker"
              style={{ left: `${industryAverage}%` }}
              title={`Industry Average: ${industryAverage}`}
            />
          </div>
          <div className="benchmark-bar__labels">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        <div className="benchmark-bar__status">
          {status === 'good' && (
            <div className="benchmark-bar__message benchmark-bar__message--good">
              ✓ Above industry average ({percentile}th percentile)
            </div>
          )}
          {status === 'average' && (
            <div className="benchmark-bar__message benchmark-bar__message--average">
              ≈ Near industry average ({percentile}th percentile)
            </div>
          )}
          {status === 'below' && (
            <div className="benchmark-bar__message benchmark-bar__message--below">
              ⚠ Below industry average ({percentile}th percentile)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
