# Overview-Builder Add-In Architecture

**Version:** 1.0
**Date:** 2026-02-24
**Status:** Draft

---

## Overview

The Overview-Builder is a MyGeotab add-in that guides users through creating custom dashboards using a conversational flow. It integrates with MyGeotab's framework, Zenith design system, and MyAPI data layer.

---

## Technology Stack

**Core:**
- React 18+ with TypeScript
- MyGeotab Add-In Framework
- @geotab/zenith (Design System)
- @geotab/myapi (Data Access)

**State Management:**
- React Context API (for add-in state)
- React Query (for data fetching)

**Build:**
- Webpack/Vite (bundler)
- TypeScript compiler
- ESLint + Prettier

---

## Project Structure

```
src/
├── index.tsx                       # Add-in entry point
├── App.tsx                         # Root component
├── addin.json                      # Add-in manifest
│
├── types/                          # TypeScript definitions
│   ├── recipe.ts                   # Recipe & module types
│   ├── addin.ts                    # Add-in state types
│   └── api.ts                      # API response types
│
├── recipes/                        # Recipe definitions
│   ├── safety-scorecard.json
│   ├── maintenance-overview.json
│   ├── compliance-dashboard.json
│   └── README.md
│
├── context/                        # State management
│   ├── AddInContext.tsx            # Add-in state provider
│   ├── DashboardContext.tsx        # Dashboard config state
│   └── RecipeContext.tsx           # Recipe data provider
│
├── components/                     # Reusable UI components
│   ├── steps/                      # Flow step components
│   │   ├── RecipePicker.tsx
│   │   ├── ModuleSelector.tsx
│   │   ├── LayoutSelector.tsx
│   │   ├── DashboardPreview.tsx
│   │   └── SaveDialog.tsx
│   │
│   ├── modules/                    # Dashboard module renderers
│   │   ├── OverviewCard.tsx
│   │   ├── ImmediateActions.tsx
│   │   ├── MetricChart.tsx
│   │   ├── PerformanceRankings.tsx
│   │   └── BenchmarkBar.tsx
│   │
│   ├── common/                     # Shared components
│   │   ├── ProgressBar.tsx
│   │   ├── StepNavigation.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingState.tsx
│   │
│   └── layout/                     # Layout components
│       ├── GridLayout.tsx
│       ├── TwoColumnLayout.tsx
│       └── SingleColumnLayout.tsx
│
├── hooks/                          # Custom React hooks
│   ├── useRecipes.ts               # Load and filter recipes
│   ├── useModuleData.ts            # Fetch module data
│   ├── useDashboardConfig.ts       # Manage dashboard state
│   ├── usePermissions.ts           # Check user permissions
│   └── useSaveDashboard.ts         # Save/persist dashboard
│
├── services/                       # Business logic layer
│   ├── recipeService.ts            # Load recipes, validate modules
│   ├── dashboardService.ts         # CRUD operations
│   ├── dataService.ts              # API query builder
│   └── storageService.ts           # LocalStorage/API persistence
│
├── utils/                          # Utility functions
│   ├── validation.ts               # Form/config validation
│   ├── permissions.ts              # Permission checking
│   ├── layoutCalculator.ts         # Grid position calculation
│   └── mockData.ts                 # Mock/placeholder data
│
└── styles/                         # Stylesheets
    ├── global.less                 # Global styles
    ├── variables.less              # CSS variables
    └── components/                 # Component-specific styles
        ├── recipe-picker.less
        ├── module-selector.less
        └── ...
```

---

## Add-In Manifest

**File:** `src/addin.json`

```json
{
  "name": "overview-builder",
  "supportEmail": "design@geotab.com",
  "version": "1.0.0",
  "items": [
    {
      "page": "overview-builder",
      "click": "OverviewBuilder.initialize",
      "path": "addin/OverviewBuilder/",
      "menuName": {
        "en": "Create Dashboard",
        "fr": "Créer un tableau de bord"
      },
      "icon": "IconDashboard",
      "menuId": "dashboardMenu"
    }
  ],
  "isSigned": false
}
```

---

## Entry Point

**File:** `src/index.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/global.less';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

/**
 * MyGeotab Add-In Initialization
 *
 * This function is called by MyGeotab when the add-in is loaded
 */
(window as any).OverviewBuilder = {
  initialize: (api: any, state: any, callback: () => void) => {
    console.log('Initializing Overview-Builder Add-In');

    // Create root container
    const container = document.getElementById('overview-builder-root');

    if (!container) {
      console.error('Container element not found');
      return;
    }

    // Render React app
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App api={api} state={state} />
        </QueryClientProvider>
      </React.StrictMode>
    );

    // Notify MyGeotab that initialization is complete
    callback();
  },

  /**
   * Called when add-in is unloaded
   */
  focus: (api: any, state: any) => {
    console.log('Overview-Builder focused');
  },

  /**
   * Called when user navigates away
   */
  blur: (api: any, state: any) => {
    console.log('Overview-Builder blurred');
  }
};
```

---

## Root Component

**File:** `src/App.tsx`

```typescript
import React from 'react';
import { AddInProvider } from './context/AddInContext';
import { RecipeProvider } from './context/RecipeContext';
import { DashboardProvider } from './context/DashboardContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import DashboardWizard from './components/DashboardWizard';

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
```

---

## State Management

### Add-In Context

**File:** `src/context/AddInContext.tsx`

```typescript
import React, { createContext, useContext, ReactNode } from 'react';

interface AddInContextType {
  api: any; // MyGeotab API instance
  state: any; // MyGeotab state
  credentials: {
    database: string;
    userName: string;
    sessionId: string;
  };
}

const AddInContext = createContext<AddInContextType | undefined>(undefined);

export function AddInProvider({
  api,
  state,
  children
}: {
  api: any;
  state: any;
  children: ReactNode;
}) {
  const value = {
    api,
    state,
    credentials: {
      database: state.database,
      userName: state.userName,
      sessionId: state.sessionId
    }
  };

  return (
    <AddInContext.Provider value={value}>
      {children}
    </AddInContext.Provider>
  );
}

export function useAddInContext() {
  const context = useContext(AddInContext);
  if (!context) {
    throw new Error('useAddInContext must be used within AddInProvider');
  }
  return context;
}
```

### Dashboard Context

**File:** `src/context/DashboardContext.tsx`

```typescript
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
```

---

## Data Hooks

### useRecipes

**File:** `src/hooks/useRecipes.ts`

```typescript
import { useState, useEffect } from 'react';
import { RecipeDefinition, RecipeCategory } from '../types/recipe';
import { usePermissions } from './usePermissions';
import recipeService from '../services/recipeService';

export function useRecipes(category?: RecipeCategory) {
  const [recipes, setRecipes] = useState<RecipeDefinition[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { hasPermissions } = usePermissions();

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);
        const allRecipes = await recipeService.loadRecipes();

        // Filter by permissions
        const accessibleRecipes = allRecipes.filter(recipe =>
          hasPermissions(recipe.requiredPermissions)
        );

        setRecipes(accessibleRecipes);

        // Filter by category if specified
        const filtered = category
          ? accessibleRecipes.filter(r => r.category === category)
          : accessibleRecipes;

        setFilteredRecipes(filtered);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, [category]);

  return { recipes, filteredRecipes, loading, error };
}
```

### useModuleData

**File:** `src/hooks/useModuleData.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { ModuleConfig } from '../types/recipe';
import { useAddInContext } from '../context/AddInContext';
import dataService from '../services/dataService';

export function useModuleData(
  module: ModuleConfig,
  dateRange?: { start: string; end: string },
  groupFilterCondition?: any
) {
  const { api, credentials } = useAddInContext();

  return useQuery({
    queryKey: ['module-data', module.id, dateRange, groupFilterCondition],
    queryFn: () => dataService.fetchModuleData(
      api,
      credentials,
      module,
      dateRange,
      groupFilterCondition
    ),
    enabled: !!api && !!module,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}
```

---

## Service Layer

### Recipe Service

**File:** `src/services/recipeService.ts`

```typescript
import { RecipeDefinition } from '../types/recipe';

// Import recipe JSON files
import safetyScorecard from '../recipes/safety-scorecard.json';
import maintenanceOverview from '../recipes/maintenance-overview.json';
import complianceDashboard from '../recipes/compliance-dashboard.json';

class RecipeService {
  private recipes: RecipeDefinition[];

  constructor() {
    this.recipes = [
      safetyScorecard as RecipeDefinition,
      maintenanceOverview as RecipeDefinition,
      complianceDashboard as RecipeDefinition
    ];
  }

  /**
   * Load all available recipes
   */
  async loadRecipes(): Promise<RecipeDefinition[]> {
    return Promise.resolve(this.recipes);
  }

  /**
   * Get recipe by ID
   */
  getRecipeById(id: string): RecipeDefinition | undefined {
    return this.recipes.find(r => r.id === id);
  }

  /**
   * Filter recipes by category
   */
  filterByCategory(category: string): RecipeDefinition[] {
    return this.recipes.filter(r => r.category === category);
  }

  /**
   * Search recipes by query
   */
  search(query: string): RecipeDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

export default new RecipeService();
```

### Dashboard Service

**File:** `src/services/dashboardService.ts`

```typescript
import { DashboardConfig, RecipeDefinition, ModuleConfig } from '../types/recipe';

class DashboardService {
  /**
   * Create dashboard configuration from recipe
   */
  createFromRecipe(
    recipe: RecipeDefinition,
    modules: ModuleConfig[],
    userId: string
  ): DashboardConfig {
    return {
      id: this.generateId(),
      name: recipe.name,
      description: recipe.description,
      recipeId: recipe.id,
      layout: 'grid',
      modules,
      dateRange: {
        defaultPeriod: '30d',
        allowCustom: true
      },
      groupsFilter: {
        enabled: true
      },
      refreshInterval: 300, // 5 minutes
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      isShared: false
    };
  }

  /**
   * Save dashboard to backend
   */
  async saveDashboard(
    api: any,
    config: DashboardConfig
  ): Promise<string> {
    // TODO: Implement MyGeotab API call to save dashboard
    // For now, save to localStorage
    const dashboards = this.getAllDashboards();
    dashboards.push(config);
    localStorage.setItem('dashboards', JSON.stringify(dashboards));
    return config.id;
  }

  /**
   * Get all user dashboards
   */
  getAllDashboards(): DashboardConfig[] {
    const stored = localStorage.getItem('dashboards');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new DashboardService();
```

---

## Build Configuration

### package.json

```json
{
  "name": "overview-builder-addin",
  "version": "1.0.0",
  "description": "MyGeotab add-in for building custom dashboards",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^4.29.0",
    "@geotab/zenith": "latest",
    "@geotab/myapi": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.40.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "less": "^4.1.3",
    "typescript": "^5.0.0",
    "vite": "^4.3.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Access at http://localhost:5173
```

### MyGeotab Integration

```bash
# Build for production
npm run build

# Output: dist/

# Deploy to MyGeotab add-in directory
cp -r dist/ /path/to/mygeotab/addin/OverviewBuilder/
```

### Testing in MyGeotab

1. Open MyGeotab
2. Navigate to Administration > System > Add-Ins
3. Add new add-in with path: `addin/OverviewBuilder/addin.json`
4. Find "Create Dashboard" in menu
5. Click to launch add-in

---

## Next Steps

1. ✅ Create add-in architecture
2. ⏳ Implement RecipePicker component
3. ⏳ Implement ModuleSelector component
4. ⏳ Implement LayoutSelector component
5. ⏳ Implement DashboardPreview component
6. ⏳ Implement SaveDialog component
7. ⏳ Build module renderers
8. ⏳ Implement data fetching layer
9. ⏳ Add error handling
10. ⏳ Add loading states
11. ⏳ Add analytics tracking

---

## References

- MyGeotab SDK: https://developers.geotab.com
- Zenith Design System: https://design.geotab.com
- MyAPI Documentation: https://geotab.github.io/sdk/software/api/reference/
- Recipe definitions: `src/recipes/`
- Type definitions: `src/types/recipe.ts`
