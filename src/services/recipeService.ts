/**
 * Recipe service for loading and managing dashboard recipes
 */

import { RecipeDefinition, RecipeCategory } from '../types/recipe';

// Import recipe JSON files
import safetyScorecard from '../recipes/safety-scorecard.json';
import maintenanceOverview from '../recipes/maintenance-overview.json';
import complianceDashboard from '../recipes/compliance-dashboard.json';

class RecipeService {
  private recipes: RecipeDefinition[];

  constructor() {
    this.recipes = [
      safetyScorecard as unknown as RecipeDefinition,
      maintenanceOverview as unknown as RecipeDefinition,
      complianceDashboard as unknown as RecipeDefinition
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
  filterByCategory(category: RecipeCategory): RecipeDefinition[] {
    return this.recipes.filter(r => r.category === category);
  }

  /**
   * Search recipes by query
   */
  search(query: string): RecipeDefinition[] {
    if (!query || query.trim() === '') {
      return this.recipes;
    }

    const lowerQuery = query.toLowerCase();
    return this.recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get all recipe categories
   */
  getCategories(): RecipeCategory[] {
    const categories = this.recipes.map(r => r.category);
    return Array.from(new Set(categories));
  }

  /**
   * Sort recipes by estimated users (descending)
   */
  sortByPopularity(recipes: RecipeDefinition[]): RecipeDefinition[] {
    return [...recipes].sort((a, b) =>
      (b.estimatedUsers || 0) - (a.estimatedUsers || 0)
    );
  }
}

export default new RecipeService();
