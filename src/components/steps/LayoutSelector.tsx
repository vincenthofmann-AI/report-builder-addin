/**
 * Layout Selector Component
 * Step 3: Choose dashboard layout
 */

import { useDashboardContext } from '../../context/DashboardContext';
import { LayoutType } from '../../types/recipe';
import { StepNavigation } from '../common/StepNavigation';
import {
  recommendLayout,
  getLayoutDisplayName,
  getLayoutDescription
} from '../../utils/layoutCalculator';

export function LayoutSelector() {
  const { state, dispatch } = useDashboardContext();
  const { selectedModules, selectedLayout } = state;

  const recommendedLayout = recommendLayout(selectedModules.length);

  const layouts: LayoutType[] = ['single-column', 'two-column', 'grid'];

  const handleSelectLayout = (layout: LayoutType) => {
    dispatch({ type: 'SELECT_LAYOUT', payload: layout });
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <div className="layout-selector">
      <div className="layout-selector__header">
        <h2 className="layout-selector__title">
          How would you like to arrange your dashboard?
        </h2>
      </div>

      <div className="layout-selector__grid">
        {layouts.map(layout => (
          <div
            key={layout}
            className={`layout-card ${selectedLayout === layout ? 'layout-card--selected' : ''}`}
            onClick={() => handleSelectLayout(layout)}
          >
            <div className="layout-card__preview">
              {layout === 'single-column' && (
                <div className="layout-preview layout-preview--single">
                  <div className="layout-preview__item"></div>
                  <div className="layout-preview__item"></div>
                  <div className="layout-preview__item"></div>
                </div>
              )}
              {layout === 'two-column' && (
                <div className="layout-preview layout-preview--two">
                  <div className="layout-preview__row">
                    <div className="layout-preview__item"></div>
                    <div className="layout-preview__item"></div>
                  </div>
                  <div className="layout-preview__row">
                    <div className="layout-preview__item"></div>
                    <div className="layout-preview__item"></div>
                  </div>
                  <div className="layout-preview__item layout-preview__item--full"></div>
                </div>
              )}
              {layout === 'grid' && (
                <div className="layout-preview layout-preview--grid">
                  <div className="layout-preview__row">
                    <div className="layout-preview__item"></div>
                    <div className="layout-preview__item"></div>
                    <div className="layout-preview__item"></div>
                  </div>
                  <div className="layout-preview__row">
                    <div className="layout-preview__item"></div>
                    <div className="layout-preview__item"></div>
                    <div className="layout-preview__item"></div>
                  </div>
                  <div className="layout-preview__item layout-preview__item--full"></div>
                </div>
              )}
            </div>
            <h3 className="layout-card__name">
              {getLayoutDisplayName(layout)}
              {layout === recommendedLayout && (
                <span className="layout-card__badge">Recommended</span>
              )}
            </h3>
            <p className="layout-card__description">
              {getLayoutDescription(layout)}
            </p>
            <button
              className={`layout-card__button ${selectedLayout === layout ? 'layout-card__button--selected' : ''}`}
            >
              {selectedLayout === layout ? '✓ Selected' : 'Select'}
            </button>
          </div>
        ))}
      </div>

      <StepNavigation
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Preview"
      />
    </div>
  );
}
