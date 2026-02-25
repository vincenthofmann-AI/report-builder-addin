/**
 * Recipe Context Provider
 * Manages recipe data and filtering
 */

import { createContext, useContext, ReactNode } from 'react';
import { RecipeDefinition } from '../types/recipe';
import { useRecipes } from '../hooks/useRecipes';

interface RecipeContextType {
  recipes: RecipeDefinition[];
  filteredRecipes: RecipeDefinition[];
  loading: boolean;
  error: Error | null;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const { recipes, filteredRecipes, loading, error } = useRecipes();

  return (
    <RecipeContext.Provider value={{ recipes, filteredRecipes, loading, error }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipeContext() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipeContext must be used within RecipeProvider');
  }
  return context;
}
