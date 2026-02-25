/**
 * Hook for loading and filtering recipes
 */

import { useState, useEffect } from 'react';
import { RecipeDefinition, RecipeCategory } from '../types/recipe';
import { usePermissions } from './usePermissions';
import recipeService from '../services/recipeService';

export function useRecipes(category?: RecipeCategory, searchQuery?: string) {
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

        // Apply filters
        let filtered = accessibleRecipes;

        if (category) {
          filtered = filtered.filter(r => r.category === category);
        }

        if (searchQuery) {
          filtered = recipeService.search(searchQuery);
        }

        // Sort by popularity
        filtered = recipeService.sortByPopularity(filtered);

        setFilteredRecipes(filtered);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, searchQuery]);

  return {
    recipes,
    filteredRecipes,
    loading,
    error
  };
}
