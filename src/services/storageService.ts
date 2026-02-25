/**
 * Storage service for persisting user preferences and draft dashboards
 */

import { DashboardConfig } from '../types/recipe';

const STORAGE_PREFIX = 'overviewBuilder.';

class StorageService {
  /**
   * Save draft dashboard (for recovery)
   */
  saveDraft(config: Partial<DashboardConfig>): void {
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}draft`,
        JSON.stringify({
          ...config,
          savedAt: new Date().toISOString()
        })
      );
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }

  /**
   * Load draft dashboard
   */
  loadDraft(): Partial<DashboardConfig> | null {
    try {
      const draft = localStorage.getItem(`${STORAGE_PREFIX}draft`);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  /**
   * Clear draft dashboard
   */
  clearDraft(): void {
    localStorage.removeItem(`${STORAGE_PREFIX}draft`);
  }

  /**
   * Save user preference
   */
  setPreference(key: string, value: any): void {
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}pref.${key}`,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  }

  /**
   * Get user preference
   */
  getPreference<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(`${STORAGE_PREFIX}pref.${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('Error loading preference:', error);
      return defaultValue;
    }
  }

  /**
   * Save recently used recipes
   */
  addRecentRecipe(recipeId: string): void {
    const recent = this.getRecentRecipes();
    const updated = [recipeId, ...recent.filter(id => id !== recipeId)].slice(0, 5);
    this.setPreference('recentRecipes', updated);
  }

  /**
   * Get recently used recipes
   */
  getRecentRecipes(): string[] {
    return this.getPreference<string[]>('recentRecipes', []);
  }

  /**
   * Clear all storage
   */
  clearAll(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}

export default new StorageService();
