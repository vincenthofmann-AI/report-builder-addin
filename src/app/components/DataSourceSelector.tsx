/**
 * Data Source Selector Component
 * ================================
 *
 * Progressive disclosure: Step 2 - Data Source Selection
 * Shows available data sources within the selected category.
 *
 * Design Pattern: List with radio selection for clarity
 */

import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Fuel,
  Shield,
  AlertTriangle,
  Wrench,
  Database,
  Check,
} from "lucide-react";
import type { DataSourceDef, CategoryDef } from "../services/categories";

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  Fuel,
  Shield,
  AlertTriangle,
  Wrench,
  Database,
};

interface DataSourceSelectorProps {
  category: CategoryDef;
  selectedSource: DataSourceDef | null;
  onSelectSource: (source: DataSourceDef) => void;
  onBack: () => void;
}

export function DataSourceSelector({
  category,
  selectedSource,
  onSelectSource,
  onBack,
}: DataSourceSelectorProps) {
  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to categories
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {category.name} Data Sources
        </h2>
        <p className="text-gray-600">{category.description}</p>
      </div>

      {/* Data Source List */}
      <div className="space-y-3 max-w-3xl">
        <AnimatePresence>
          {category.dataSources.map((source, index) => {
            const Icon = iconMap[source.icon] || Database;
            const isSelected = selectedSource?.id === source.id;

            return (
              <motion.button
                key={source.id}
                onClick={() => onSelectSource(source)}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all flex items-start gap-4
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Radio Circle */}
                <div
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center transition-all
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 bg-white"
                    }
                  `}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {source.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {source.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{source.columns.length} columns</span>
                    <span>•</span>
                    <span>
                      {
                        source.columns.filter((col) => col.filterable).length
                      }{" "}
                      filterable
                    </span>
                    <span>•</span>
                    <span>
                      {
                        source.columns.filter((col) => col.aggregatable).length
                      }{" "}
                      aggregatable
                    </span>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    className="flex-shrink-0 text-blue-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Help Text */}
      {selectedSource && (
        <motion.div
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-blue-800">
            ✓ Data source selected. Continue to customize columns and filters
            below.
          </p>
        </motion.div>
      )}
    </div>
  );
}
