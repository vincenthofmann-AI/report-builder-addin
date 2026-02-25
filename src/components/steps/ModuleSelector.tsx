/**
 * Module Selector Component
 * Step 2: Select which modules to include in the dashboard
 */

import { useDashboardContext } from '../../context/DashboardContext';
import { ModuleConfig } from '../../types/recipe';
import { StepNavigation } from '../common/StepNavigation';

export function ModuleSelector() {
  const { state, dispatch } = useDashboardContext();
  const { selectedRecipe, selectedModules } = state;

  if (!selectedRecipe) {
    return <div>No recipe selected</div>;
  }

  const isModuleSelected = (moduleId: string) => {
    return selectedModules.some(m => m.id === moduleId);
  };

  const toggleModule = (module: ModuleConfig) => {
    // Don't allow removing required modules
    if (module.required && isModuleSelected(module.id)) {
      return;
    }

    const newModules = isModuleSelected(module.id)
      ? selectedModules.filter(m => m.id !== module.id)
      : [...selectedModules, module];

    dispatch({ type: 'UPDATE_MODULES', payload: newModules });
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <div className="module-selector">
      <div className="module-selector__header">
        <h2 className="module-selector__title">{selectedRecipe.name}</h2>
        <p className="module-selector__subtitle">
          Which insights do you want to include?
        </p>
      </div>

      <div className="module-selector__section">
        <h3 className="module-selector__section-title">
          Included Modules ({selectedModules.length})
        </h3>
        <div className="module-list">
          {selectedRecipe.defaultModules.map(module => (
            <div
              key={module.id}
              className={`module-item ${isModuleSelected(module.id) ? 'module-item--selected' : ''}`}
            >
              <input
                type="checkbox"
                id={module.id}
                checked={isModuleSelected(module.id)}
                onChange={() => toggleModule(module)}
                disabled={module.required}
              />
              <label htmlFor={module.id} className="module-item__content">
                <div className="module-item__header">
                  <span className="module-item__name">{module.title}</span>
                  {module.required && (
                    <span className="module-item__badge">Required</span>
                  )}
                </div>
                <p className="module-item__description">{module.description}</p>
              </label>
            </div>
          ))}
        </div>
      </div>

      {selectedRecipe.availableModules.length > 0 && (
        <div className="module-selector__section">
          <h3 className="module-selector__section-title">
            Available Modules ({selectedRecipe.availableModules.length})
          </h3>
          <div className="module-list">
            {selectedRecipe.availableModules.map(module => (
              <div
                key={module.id}
                className={`module-item ${isModuleSelected(module.id) ? 'module-item--selected' : ''}`}
              >
                <input
                  type="checkbox"
                  id={module.id}
                  checked={isModuleSelected(module.id)}
                  onChange={() => toggleModule(module)}
                />
                <label htmlFor={module.id} className="module-item__content">
                  <div className="module-item__header">
                    <span className="module-item__name">{module.title}</span>
                  </div>
                  <p className="module-item__description">{module.description}</p>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="module-selector__tip">
        💡 Tip: You can drag to reorder modules in the next step
      </div>

      <StepNavigation
        onBack={handleBack}
        onNext={handleNext}
        canGoNext={selectedModules.length > 0}
      />
    </div>
  );
}
