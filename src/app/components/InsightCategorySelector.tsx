/**
 * InsightCategorySelector - Step 1 of template-driven flow
 * Displays 5 insight categories as large cards
 */

import { INSIGHT_CATEGORIES, type InsightCategory } from "../data/templates";
import "./insight-category-selector.css";

interface InsightCategorySelectorProps {
  onSelectCategory: (categoryId: string) => void;
}

export function InsightCategorySelector({ onSelectCategory }: InsightCategorySelectorProps) {
  return (
    <div className="category-selector">
      <div className="category-selector__header">
        <h1 className="category-selector__title">What do you want to know?</h1>
        <p className="category-selector__subtitle">
          Choose a category to see pre-configured insights
        </p>
      </div>

      <div className="category-selector__grid">
        {INSIGHT_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => onSelectCategory(category.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: InsightCategory;
  onClick: () => void;
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button className="category-card" onClick={onClick}>
      <div className="category-card__icon">{category.icon}</div>
      <h2 className="category-card__name">{category.name}</h2>
      <p className="category-card__description">{category.description}</p>
      <div className="category-card__count">{category.templateCount} insights</div>
    </button>
  );
}
