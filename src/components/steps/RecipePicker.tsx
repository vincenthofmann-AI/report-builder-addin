/**
 * Recipe Picker Component
 * Step 1: Select a dashboard recipe or start from scratch
 */

import { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { useRecipeContext } from '../../context/RecipeContext';
import { RecipeDefinition, RecipeCategory } from '../../types/recipe';
import { LoadingState } from '../common/LoadingState';

export function RecipePicker() {
  const { dispatch } = useDashboardContext();
  const { recipes, loading, error } = useRecipeContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !searchQuery ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectRecipe = (recipe: RecipeDefinition) => {
    dispatch({ type: 'SELECT_RECIPE', payload: recipe });
  };

  const handleCreateCustom = () => {
    // TODO: Implement custom dashboard creation
    console.log('Create custom dashboard');
  };

  if (loading) {
    return <LoadingState message="Loading recipes..." />;
  }

  if (error) {
    return (
      <div className="recipe-picker__error">
        <p>Error loading recipes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="recipe-picker">
      <div className="recipe-picker__header">
        <h2 className="recipe-picker__title">What would you like to track?</h2>
        <p className="recipe-picker__subtitle">
          Choose a pre-built recipe or start from scratch
        </p>
      </div>

      <div className="recipe-picker__filters">
        <input
          type="text"
          className="recipe-picker__search"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="recipe-picker__category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as RecipeCategory | 'all')}
        >
          <option value="all">All Categories</option>
          <option value="safety">Safety</option>
          <option value="maintenance">Maintenance</option>
          <option value="compliance">Compliance</option>
          <option value="operations">Operations</option>
          <option value="fuel">Fuel</option>
        </select>
      </div>

      <div className="recipe-picker__grid">
        {filteredRecipes.map(recipe => (
          <div
            key={recipe.id}
            className="recipe-card"
            onClick={() => handleSelectRecipe(recipe)}
          >
            <div className="recipe-card__icon">{recipe.icon}</div>
            <h3 className="recipe-card__name">{recipe.name}</h3>
            <p className="recipe-card__description">{recipe.description}</p>
            {recipe.estimatedUsers && (
              <div className="recipe-card__users">
                {recipe.estimatedUsers.toLocaleString()}+ users
              </div>
            )}
            <div className="recipe-card__tags">
              {recipe.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="recipe-card__tag">{tag}</span>
              ))}
            </div>
            <button className="recipe-card__button">Select</button>
          </div>
        ))}

        <div
          className="recipe-card recipe-card--custom"
          onClick={handleCreateCustom}
        >
          <div className="recipe-card__icon">+</div>
          <h3 className="recipe-card__name">Start from Scratch</h3>
          <p className="recipe-card__description">
            Build a custom dashboard with your own modules
          </p>
          <button className="recipe-card__button">Create Custom</button>
        </div>
      </div>

      <div className="recipe-picker__tip">
        💡 Tip: Recipes come pre-configured with proven insights. You can customize them in the next step.
      </div>
    </div>
  );
}
