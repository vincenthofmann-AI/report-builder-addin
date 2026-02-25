/**
 * Dashboard Wizard Component
 * Orchestrates the 5-step dashboard creation flow
 */

import { useDashboardContext } from '../context/DashboardContext';
import { ProgressBar } from './common/ProgressBar';
import { RecipePicker } from './steps/RecipePicker';
import { ModuleSelector } from './steps/ModuleSelector';
import { LayoutSelector } from './steps/LayoutSelector';
import { DashboardPreview } from './steps/DashboardPreview';
import { SaveDialog } from './steps/SaveDialog';

export default function DashboardWizard() {
  const { state } = useDashboardContext();

  const steps = {
    'recipe-picker': <RecipePicker />,
    'module-selector': <ModuleSelector />,
    'layout-selector': <LayoutSelector />,
    'preview': <DashboardPreview />,
    'save': <SaveDialog />
  };

  const stepOrder = ['recipe-picker', 'module-selector', 'layout-selector', 'preview', 'save'];
  const currentStepIndex = stepOrder.indexOf(state.step);

  return (
    <div className="dashboard-wizard">
      <div className="dashboard-wizard__header">
        <h1 className="dashboard-wizard__title">Create Dashboard</h1>
        <ProgressBar current={currentStepIndex + 1} total={5} />
      </div>

      <div className="dashboard-wizard__content">
        {steps[state.step]}
      </div>
    </div>
  );
}
