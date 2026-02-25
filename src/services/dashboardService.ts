/**
 * Dashboard service for CRUD operations on dashboards
 */

import { DashboardConfig, RecipeDefinition, ModuleConfig, LayoutType } from '../types/recipe';

class DashboardService {
  /**
   * Create dashboard configuration from recipe
   */
  createFromRecipe(
    recipe: RecipeDefinition,
    modules: ModuleConfig[],
    layout: LayoutType,
    userId: string
  ): DashboardConfig {
    return {
      id: this.generateId(),
      name: recipe.name,
      description: recipe.description,
      recipeId: recipe.id,
      layout,
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
   * Create blank dashboard configuration
   */
  createBlank(
    name: string,
    modules: ModuleConfig[],
    layout: LayoutType,
    userId: string
  ): DashboardConfig {
    return {
      id: this.generateId(),
      name,
      layout,
      modules,
      dateRange: {
        defaultPeriod: '30d',
        allowCustom: true
      },
      groupsFilter: {
        enabled: true
      },
      refreshInterval: 300,
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
    _api: any,
    config: DashboardConfig
  ): Promise<string> {
    try {
      // TODO: Implement MyGeotab API call to save dashboard
      // For MVP, save to localStorage
      const dashboards = this.getAllDashboards();

      // Check if dashboard already exists (update)
      const existingIndex = dashboards.findIndex(d => d.id === config.id);
      if (existingIndex >= 0) {
        dashboards[existingIndex] = {
          ...config,
          updatedAt: new Date().toISOString()
        };
      } else {
        dashboards.push(config);
      }

      localStorage.setItem('overviewBuilder.dashboards', JSON.stringify(dashboards));

      return config.id;
    } catch (error) {
      console.error('Error saving dashboard:', error);
      throw new Error('Failed to save dashboard');
    }
  }

  /**
   * Get dashboard by ID
   */
  getDashboardById(id: string): DashboardConfig | undefined {
    const dashboards = this.getAllDashboards();
    return dashboards.find(d => d.id === id);
  }

  /**
   * Get all user dashboards
   */
  getAllDashboards(): DashboardConfig[] {
    try {
      const stored = localStorage.getItem('overviewBuilder.dashboards');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading dashboards:', error);
      return [];
    }
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(id: string): Promise<void> {
    const dashboards = this.getAllDashboards();
    const filtered = dashboards.filter(d => d.id !== id);
    localStorage.setItem('overviewBuilder.dashboards', JSON.stringify(filtered));
  }

  /**
   * Update dashboard
   */
  async updateDashboard(config: DashboardConfig): Promise<void> {
    const dashboards = this.getAllDashboards();
    const index = dashboards.findIndex(d => d.id === config.id);

    if (index >= 0) {
      dashboards[index] = {
        ...config,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('overviewBuilder.dashboards', JSON.stringify(dashboards));
    } else {
      throw new Error('Dashboard not found');
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new DashboardService();
