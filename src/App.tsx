/**
 * App Component
 * Root component with context providers
 */

import { AddInProvider } from './context/AddInContext';
import { RecipeProvider } from './context/RecipeContext';
import { DashboardProvider } from './context/DashboardContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import DashboardWizard from './components/DashboardWizard';
import './styles/global.less';

interface AppProps {
  api: any; // MyGeotab API
  state: any; // MyGeotab state
}

export default function App({ api, state }: AppProps) {
  return (
    <ErrorBoundary>
      <AddInProvider api={api} state={state}>
        <RecipeProvider>
          <DashboardProvider>
            <DashboardWizard />
          </DashboardProvider>
        </RecipeProvider>
      </AddInProvider>
    </ErrorBoundary>
  );
}
