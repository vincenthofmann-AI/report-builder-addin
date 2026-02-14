/**
 * Category Selector Component
 * ============================
 *
 * Progressive disclosure: Step 1 - Category Selection
 * Users choose a top-level category before seeing specific data sources.
 *
 * Design Pattern: Large cards in grid layout for high discoverability
 */

import { motion } from "motion/react";
import {
  Truck,
  MapPin,
  AlertTriangle,
  Database,
  Shield,
  ArrowRight,
} from "lucide-react";
import type { CategoryDef } from "../services/categories";
import { categories } from "../services/categories";
import { ZenithColors } from "../services/zenith-adapter";

const iconMap: Record<string, React.ElementType> = {
  Truck,
  MapPin,
  AlertTriangle,
  Database,
  Shield,
};

interface CategorySelectorProps {
  onSelectCategory: (category: CategoryDef) => void;
  selectedCategory?: CategoryDef | null;
}

export function CategorySelector({
  onSelectCategory,
  selectedCategory,
}: CategorySelectorProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Choose a Data Category
        </h2>
        <p className="text-gray-600">
          Select a category to see available data sources for your report
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Database;
          const isSelected = selectedCategory?.id === category.id;
          const hasDataSources = category.dataSources.length > 0;

          return (
            <motion.button
              key={category.id}
              onClick={() => hasDataSources && onSelectCategory(category)}
              disabled={!hasDataSources}
              className={`
                relative p-6 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : hasDataSources
                    ? "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                    : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                }
              `}
              whileHover={hasDataSources ? { scale: 1.02 } : {}}
              whileTap={hasDataSources ? { scale: 0.98 } : {}}
            >
              {/* Icon Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-4
                  ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : hasDataSources
                      ? "bg-gray-100 text-gray-700"
                      : "bg-gray-100 text-gray-400"
                  }
                `}
                style={{
                  backgroundColor: isSelected
                    ? category.color
                    : hasDataSources
                    ? `${category.color}15`
                    : undefined,
                  color: isSelected
                    ? ZenithColors.white
                    : hasDataSources
                    ? category.color
                    : undefined,
                }}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Category Name */}
              <h3
                className={`text-lg font-semibold mb-2 ${
                  hasDataSources ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {category.name}
              </h3>

              {/* Description */}
              <p
                className={`text-sm mb-4 ${
                  hasDataSources ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {category.description}
              </p>

              {/* Data Source Count */}
              <div className="flex items-center justify-between text-sm">
                {hasDataSources ? (
                  <>
                    <span className="text-gray-500">
                      {category.dataSources.length} source
                      {category.dataSources.length !== 1 ? "s" : ""}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    )}
                  </>
                ) : (
                  <span className="text-gray-400 italic">Coming soon</span>
                )}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
