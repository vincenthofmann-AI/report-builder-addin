/**
 * Overview-Builder Recipe Type Definitions
 *
 * Defines the structure for dashboard recipes, modules, and configurations.
 * Used by the recipe picker, module selector, and dashboard renderer.
 */

// ============================================================================
// Security & Permissions
// ============================================================================

/**
 * MyGeotab Security Identifiers
 * Defines permissions required to access specific features
 */
export type SecurityIdentifier =
  | "ViewCollisionRisk"
  | "ViewExceptions"
  | "ViewDrivers"
  | "ViewDevices"
  | "ViewTrips"
  | "ViewMaintenanceWorkOrders"
  | "ViewMaintenanceWorkRequests"
  | "ViewFaults"
  | "ViewMaintenanceOverview"
  | "ViewHoSLogs"
  | "ViewDutyStatusViolations"
  | "ViewIftaMiles"
  | "ViewGroups"
  | "ManageData"
  | "Administrator";

// ============================================================================
// Core Types
// ============================================================================

export type RecipeCategory =
  | "safety"
  | "maintenance"
  | "compliance"
  | "operations"
  | "fuel"
  | "custom";

export type ModuleType =
  | "overview-card"
  | "immediate-actions"
  | "metric-chart"
  | "performance-rankings"
  | "benchmark-bar"
  | "map-view";

export type AggregationOperation = "sum" | "avg" | "count" | "max" | "min";

export type LayoutType = "single-column" | "two-column" | "grid";

// ============================================================================
// Data Source Configuration
// ============================================================================

export interface AggregationConfig {
  /**
   * Aggregation operation to perform
   */
  op: AggregationOperation;

  /**
   * Field to aggregate on
   */
  field: string;

  /**
   * Optional alias for the result
   */
  alias?: string;

  /**
   * Optional WHERE condition for filtered aggregation
   */
  where?: string;
}

export interface FilterConfig {
  /**
   * Field name to filter on
   */
  field: string;

  /**
   * Filter operator
   */
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "IN" | "NOT IN" | "LIKE";

  /**
   * Filter value (or array of values for IN/NOT IN)
   */
  value: string | number | boolean | (string | number)[];
}

export interface DataSourceConfig {
  /**
   * MyGeotab API entity name
   * Examples: "MaintenanceWorkOrderEntity", "ExceptionEvent", "DutyStatusViolation"
   */
  apiEntity: string;

  /**
   * Aggregation configuration for grouped queries
   */
  aggregationParams?: {
    groupBy?: string[];
    aggregations: AggregationConfig[];
  };

  /**
   * Static filters applied to all queries
   */
  filters?: FilterConfig[];

  /**
   * Whether to apply date range filter
   */
  dateRangeEnabled: boolean;

  /**
   * Whether to apply groups filter
   */
  groupFilterEnabled: boolean;

  /**
   * Sort configuration
   */
  sort?: {
    sortBy: string;
    sortDirection: "asc" | "desc";
  };

  /**
   * Maximum number of results to return
   */
  resultsLimit?: number;

  /**
   * Property selector to limit fields returned
   */
  propertySelector?: {
    fields: string[];
    isIncluded: boolean;
  };
}

// ============================================================================
// Module Configuration
// ============================================================================

export interface ModulePosition {
  /**
   * Row position in grid (0-indexed)
   */
  row: number;

  /**
   * Column position in grid (0-indexed)
   */
  column: number;

  /**
   * Width in grid columns (1-12 for 12-column grid)
   */
  width: number;

  /**
   * Height in grid rows (optional, auto if not specified)
   */
  height?: number;
}

export interface ModuleConfig {
  /**
   * Unique identifier for this module instance
   */
  id: string;

  /**
   * Module type (determines which component to render)
   */
  type: ModuleType;

  /**
   * Display title for the module
   */
  title: string;

  /**
   * Optional description/subtitle
   */
  description?: string;

  /**
   * Icon to display (icon name from Zenith)
   */
  icon?: string;

  /**
   * Data source configuration
   */
  dataSource: DataSourceConfig;

  /**
   * Default position in layout
   */
  defaultPosition: ModulePosition;

  /**
   * Whether user can configure this module
   */
  configurable: boolean;

  /**
   * Whether this module is required (cannot be removed)
   */
  required?: boolean;

  /**
   * Module-specific configuration options
   */
  options?: {
    /**
     * For metric-chart: available metrics to switch between
     */
    availableMetrics?: MetricConfig[];

    /**
     * For overview-card: trend calculation config
     */
    trendConfig?: TrendConfig;

    /**
     * For performance-rankings: number of items to show
     */
    rankingLimit?: number;

    /**
     * For benchmark-bar: benchmark value
     */
    benchmarkValue?: number;

    /**
     * For immediate-actions: navigation config
     */
    navigationConfig?: NavigationConfig[];
  };
}

export interface MetricConfig {
  /**
   * Metric identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Data source for this metric
   */
  dataSource: DataSourceConfig;
}

export interface TrendConfig {
  /**
   * Period to compare against (7d, 30d, etc.)
   */
  comparisonPeriod: string;

  /**
   * Whether to show percentage change
   */
  showPercentage: boolean;

  /**
   * Whether to show arrow indicator
   */
  showArrow: boolean;
}

export interface NavigationConfig {
  /**
   * Item identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Target page name
   */
  pageName: string;

  /**
   * Page state/parameters
   */
  pageState?: Record<string, unknown>;
}

// ============================================================================
// Recipe Definition
// ============================================================================

export interface RecipeDefinition {
  /**
   * Unique recipe identifier
   */
  id: string;

  /**
   * Recipe display name
   */
  name: string;

  /**
   * Recipe description
   */
  description: string;

  /**
   * Recipe category
   */
  category: RecipeCategory;

  /**
   * Icon name from Zenith
   */
  icon: string;

  /**
   * Modules included by default in this recipe
   */
  defaultModules: ModuleConfig[];

  /**
   * Additional modules available for this recipe
   */
  availableModules: ModuleConfig[];

  /**
   * Required permissions to view/use this recipe
   */
  requiredPermissions: SecurityIdentifier[];

  /**
   * Estimated user count (from BigQuery analysis)
   */
  estimatedUsers?: number;

  /**
   * Tags for search/filtering
   */
  tags?: string[];
}

// ============================================================================
// Dashboard Configuration
// ============================================================================

export interface DashboardConfig {
  /**
   * Unique dashboard identifier
   */
  id: string;

  /**
   * Dashboard name
   */
  name: string;

  /**
   * Dashboard description
   */
  description?: string;

  /**
   * Source recipe ID (if created from recipe)
   */
  recipeId?: string;

  /**
   * Layout type
   */
  layout: LayoutType;

  /**
   * Modules included in this dashboard
   */
  modules: ModuleConfig[];

  /**
   * Date range configuration
   */
  dateRange?: {
    defaultPeriod: string; // "7d", "30d", "90d", "custom"
    allowCustom: boolean;
  };

  /**
   * Groups filter configuration
   */
  groupsFilter?: {
    enabled: boolean;
    defaultSelection?: string[]; // Group IDs
  };

  /**
   * Refresh interval in seconds (0 = manual only)
   */
  refreshInterval?: number;

  /**
   * Created timestamp
   */
  createdAt: string;

  /**
   * Last modified timestamp
   */
  updatedAt: string;

  /**
   * Creator user ID
   */
  createdBy: string;

  /**
   * Whether this dashboard is shared
   */
  isShared: boolean;

  /**
   * Shared with user IDs or group IDs
   */
  sharedWith?: string[];
}

// ============================================================================
// Runtime State
// ============================================================================

export interface DashboardState {
  /**
   * Current dashboard configuration
   */
  config: DashboardConfig;

  /**
   * Current date range selection
   */
  dateRange?: {
    start: string; // ISO date
    end: string;   // ISO date
    label: string; // "Last 7 days", etc.
  };

  /**
   * Current groups filter selection
   */
  groupsFilter?: {
    selected: string[]; // Group IDs
    condition: "include" | "exclude";
  };

  /**
   * Loading state per module
   */
  moduleLoadingState: Record<string, boolean>;

  /**
   * Error state per module
   */
  moduleErrors: Record<string, Error | null>;

  /**
   * Module data cache
   */
  moduleData: Record<string, unknown>;
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface ModuleComponentProps<T = unknown> {
  /**
   * Module configuration
   */
  config: ModuleConfig;

  /**
   * Data fetched for this module
   */
  data?: T;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error if any
   */
  error?: Error | null;

  /**
   * Current date range (if applicable)
   */
  dateRange?: {
    start: string;
    end: string;
    label: string;
  };

  /**
   * Current groups filter (if applicable)
   */
  groupFilterCondition?: unknown; // GroupFilterCondition from MyGeotab

  /**
   * Callback when user interacts with module
   */
  onAction?: (action: string, payload?: unknown) => void;
}

export interface RecipePickerProps {
  /**
   * Available recipes to choose from
   */
  recipes: RecipeDefinition[];

  /**
   * Callback when recipe is selected
   */
  onSelectRecipe: (recipe: RecipeDefinition) => void;

  /**
   * Callback to create custom dashboard
   */
  onCreateCustom: () => void;
}

export interface ModuleSelectorProps {
  /**
   * Current recipe being configured
   */
  recipe: RecipeDefinition;

  /**
   * Currently selected modules
   */
  selectedModules: ModuleConfig[];

  /**
   * Callback when modules change
   */
  onModulesChange: (modules: ModuleConfig[]) => void;

  /**
   * Callback to proceed to next step
   */
  onNext: () => void;

  /**
   * Callback to go back
   */
  onBack: () => void;
}

export interface LayoutSelectorProps {
  /**
   * Current layout selection
   */
  layout: LayoutType;

  /**
   * Callback when layout changes
   */
  onLayoutChange: (layout: LayoutType) => void;

  /**
   * Number of modules to lay out
   */
  moduleCount: number;
}

export interface DashboardPreviewProps {
  /**
   * Dashboard configuration to preview
   */
  config: DashboardConfig;

  /**
   * Whether to show live data or placeholder
   */
  showLiveData: boolean;

  /**
   * Callback to save dashboard
   */
  onSave: (name: string, description?: string) => Promise<void>;

  /**
   * Callback to edit configuration
   */
  onEdit: () => void;
}

// ============================================================================
// Add-In Integration
// ============================================================================

export interface AddInState {
  /**
   * Current step in dashboard creation flow
   */
  step: "recipe-picker" | "module-selector" | "layout-selector" | "preview" | "complete";

  /**
   * Selected recipe
   */
  selectedRecipe?: RecipeDefinition;

  /**
   * Selected modules
   */
  selectedModules: ModuleConfig[];

  /**
   * Selected layout
   */
  selectedLayout: LayoutType;

  /**
   * Draft dashboard configuration
   */
  draftConfig?: DashboardConfig;

  /**
   * Whether dashboard has been saved
   */
  isSaved: boolean;

  /**
   * Saved dashboard ID
   */
  savedDashboardId?: string;
}

// ============================================================================
// Storage Schema
// ============================================================================

export interface StoredDashboard {
  /**
   * Storage version (for migration)
   */
  version: string;

  /**
   * Dashboard configuration
   */
  dashboard: DashboardConfig;

  /**
   * Storage metadata
   */
  metadata: {
    savedAt: string;
    lastAccessedAt?: string;
    accessCount?: number;
  };
}

export interface UserDashboards {
  /**
   * User ID
   */
  userId: string;

  /**
   * List of saved dashboards
   */
  dashboards: StoredDashboard[];

  /**
   * Default dashboard ID (shown on add-in launch)
   */
  defaultDashboardId?: string;
}
