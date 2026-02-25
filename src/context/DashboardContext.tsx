/**
 * Dashboard Context Provider
 * Manages dashboard configuration state and wizard flow
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { RecipeDefinition, ModuleConfig, LayoutType, DashboardConfig } from '../types/recipe';

type Step = 'recipe-picker' | 'module-selector' | 'layout-selector' | 'preview' | 'save';

interface DashboardState {
  step: Step;
  selectedRecipe?: RecipeDefinition;
  selectedModules: ModuleConfig[];
  selectedLayout: LayoutType;
  draftConfig?: DashboardConfig;
  isSaved: boolean;
  savedDashboardId?: string;
}

type Action =
  | { type: 'SELECT_RECIPE'; payload: RecipeDefinition }
  | { type: 'UPDATE_MODULES'; payload: ModuleConfig[] }
  | { type: 'SELECT_LAYOUT'; payload: LayoutType }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: Step }
  | { type: 'SAVE_SUCCESS'; payload: string }
  | { type: 'RESET' };

const initialState: DashboardState = {
  step: 'recipe-picker',
  selectedModules: [],
  selectedLayout: 'grid',
  isSaved: false
};

function dashboardReducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'SELECT_RECIPE':
      return {
        ...state,
        selectedRecipe: action.payload,
        selectedModules: action.payload.defaultModules,
        step: 'module-selector'
      };

    case 'UPDATE_MODULES':
      return {
        ...state,
        selectedModules: action.payload
      };

    case 'SELECT_LAYOUT':
      return {
        ...state,
        selectedLayout: action.payload
      };

    case 'NEXT_STEP':
      const stepOrder: Step[] = [
        'recipe-picker',
        'module-selector',
        'layout-selector',
        'preview',
        'save'
      ];
      const currentIndex = stepOrder.indexOf(state.step);
      const nextStep = stepOrder[Math.min(currentIndex + 1, stepOrder.length - 1)];
      return { ...state, step: nextStep };

    case 'PREV_STEP':
      const prevStepOrder: Step[] = [
        'recipe-picker',
        'module-selector',
        'layout-selector',
        'preview',
        'save'
      ];
      const prevCurrentIndex = prevStepOrder.indexOf(state.step);
      const prevStep = prevStepOrder[Math.max(prevCurrentIndex - 1, 0)];
      return { ...state, step: prevStep };

    case 'GO_TO_STEP':
      return { ...state, step: action.payload };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isSaved: true,
        savedDashboardId: action.payload
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<Action>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardProvider');
  }
  return context;
}
