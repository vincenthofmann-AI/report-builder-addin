/**
 * Insight Category Selector Component
 * =====================================
 *
 * Insight-First Architecture: Step 1
 * Presents insight-centric categories based on business questions users ask.
 *
 * Replaces data-centric categories (Activity, Events, Assets, Devices, Drivers)
 * with question-centric categories (Safety & Compliance, Cost Savings, etc.)
 *
 * Philosophy: "Users don't ask for records; they ask for insights."
 */

import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  DollarSign,
  Wrench,
  Leaf,
  BarChart3,
} from "lucide-react";
import type { InsightCategory, InsightCategoryDef } from "../../services/report-templates";
import { insightCategories } from "../../services/report-templates";
import { ZenithColors } from "../../services/zenith-adapter";

const iconMap: Record<string, React.ElementType> = {
  Shield,
  DollarSign,
  Wrench,
  Leaf,
  BarChart3,
};

interface InsightCategorySelectorProps {
  selectedCategory: InsightCategory | null;
  onSelectCategory: (category: InsightCategory) => void;
}

export function InsightCategorySelector({
  selectedCategory,
  onSelectCategory,
}: InsightCategorySelectorProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003a63]/10 to-[#78be20]/10 flex items-center justify-center mx-auto mb-5">
            <BarChart3 className="w-8 h-8 text-[#003a63]/40" />
          </div>
          <h1
            className="text-[28px] text-[#003a63] mb-2"
            style={{ fontWeight: 600 }}
          >
            What do you want to know?
          </h1>
          <p className="text-[15px] text-[#64748b] leading-relaxed max-w-lg mx-auto">
            Choose an insight category to see pre-configured reports based on
            actual usage data from 5,000+ fleets.
          </p>
        </motion.div>

        {/* Insight Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {insightCategories.map((category, index) => {
              const Icon = iconMap[category.icon] || BarChart3;
              const isSelected = selectedCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className={`
                    group relative flex flex-col items-start gap-4 p-6 rounded-2xl text-left
                    transition-all duration-300 border-2
                    ${
                      isSelected
                        ? "border-[#003a63] bg-[#003a63]/[0.04] shadow-lg shadow-[#003a63]/10"
                        : "border-[#e2e8f0] bg-white hover:border-[#003a63]/30 hover:shadow-md hover:shadow-[#003a63]/5"
                    }
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <div
                    className={`
                      w-14 h-14 rounded-xl flex items-center justify-center transition-all
                      ${
                        isSelected
                          ? "bg-[#003a63] shadow-md"
                          : "bg-[#f1f5f9] group-hover:bg-[#003a63]/[0.08]"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-7 h-7 transition-colors
                        ${
                          isSelected
                            ? "text-white"
                            : "text-[#64748b] group-hover:text-[#003a63]"
                        }
                      `}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Category Name */}
                    <h3
                      className={`
                        text-[16px] mb-2 transition-colors
                        ${
                          isSelected
                            ? "text-[#003a63]"
                            : "text-[#1e293b] group-hover:text-[#003a63]"
                        }
                      `}
                      style={{ fontWeight: 600 }}
                    >
                      {category.name}
                    </h3>

                    {/* Question Prompt */}
                    <p
                      className="text-[13px] text-[#78be20] mb-3"
                      style={{ fontWeight: 500 }}
                    >
                      {category.questionPrompt}
                    </p>

                    {/* Description */}
                    <p className="text-[13px] text-[#64748b] leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute top-4 right-4"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#78be20] flex items-center justify-center">
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
                      </div>
                    </motion.div>
                  )}

                  {/* Hover Arrow */}
                  <motion.div
                    className={`
                      absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity
                      ${isSelected ? "hidden" : ""}
                    `}
                  >
                    <svg
                      className="w-5 h-5 text-[#003a63]/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-[12px] text-[#94a3b8]">
            All reports are pre-configured with sensible defaults based on top-performing
            fleets. Customize date ranges and filters after selection.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
