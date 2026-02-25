/**
 * Immediate Actions Module
 * Displays alert/action items requiring attention
 */

import { ModuleConfig } from '../../types/recipe';
import { useModuleData } from '../../hooks/useModuleData';
import { LoadingState } from '../common/LoadingState';

interface ImmediateActionsProps {
  module: ModuleConfig;
  useLiveData?: boolean;
}

export function ImmediateActions({ module, useLiveData = false }: ImmediateActionsProps) {
  const { data, isLoading, error } = useModuleData(module, undefined, undefined, useLiveData);

  if (isLoading) {
    return (
      <div className="immediate-actions">
        <LoadingState size="small" message="Loading actions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="immediate-actions immediate-actions--error">
        <div className="immediate-actions__error">Error loading actions</div>
      </div>
    );
  }

  const alerts = data?.alerts || [];
  const navigationConfig = module.options?.navigationConfig || [];

  return (
    <div className="immediate-actions">
      <div className="immediate-actions__header">
        <h3 className="immediate-actions__title">{module.title}</h3>
        {module.description && (
          <p className="immediate-actions__description">{module.description}</p>
        )}
      </div>

      <div className="immediate-actions__list">
        {alerts.length === 0 ? (
          <div className="immediate-actions__empty">
            ✓ No items requiring immediate attention
          </div>
        ) : (
          alerts.map((alert: any, index: number) => (
            <div
              key={index}
              className={`immediate-actions__item immediate-actions__item--${alert.severity}`}
            >
              <div className="immediate-actions__item-header">
                <span className="immediate-actions__item-title">{alert.title}</span>
                <span className="immediate-actions__item-count">{alert.count}</span>
              </div>
              {navigationConfig[index] && (
                <button className="immediate-actions__item-link">
                  View Details →
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {navigationConfig.length > 0 && (
        <div className="immediate-actions__footer">
          {navigationConfig.map((nav: any) => (
            <button
              key={nav.id}
              className="immediate-actions__quick-link"
            >
              {nav.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
