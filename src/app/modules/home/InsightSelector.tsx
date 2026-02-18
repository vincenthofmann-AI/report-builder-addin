/**
 * Insight Selector Component
 * ===========================
 *
 * Insight-First Architecture: Step 2
 * Shows pre-configured report templates within the selected insight category.
 *
 * Each template displays:
 * - Insight question (e.g., "Which drivers need coaching?")
 * - Usage count (e.g., "Used by 1,842 fleets")
 * - Pre-configured settings (date range, refresh period, chart type)
 *
 * Replaces DataSourceSelector which showed raw data sources.
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Check,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  AlertCircle,
  Search,
  Star,
} from "lucide-react";
import type {
  InsightCategory,
  ReportTemplateDef,
} from "../../services/report-templates";
import {
  getTemplatesByCategory,
  getInsightCategoryById,
  getAllTemplates,
} from "../../services/report-templates";
import { SearchInput } from "../../services/zenith-adapter";

const chartIconMap = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
};

interface InsightSelectorProps {
  category: InsightCategory;
  selectedTemplate: ReportTemplateDef | null;
  onSelectTemplate: (template: ReportTemplateDef) => void;
  onBack: () => void;
}

export function InsightSelector({
  category,
  selectedTemplate,
  onSelectTemplate,
  onBack,
}: InsightSelectorProps) {
  const categoryDef = getInsightCategoryById(category);
  const templates = getTemplatesByCategory(category);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  // Load recently used templates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("reportBuilder.recentTemplates");
      if (stored) {
        setRecentlyUsed(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Failed to load recent templates:", error);
    }
  }, []);

  // Save template to recently used when selected
  const handleSelectTemplate = (template: ReportTemplateDef) => {
    onSelectTemplate(template);

    // Update recently used (max 5, most recent first)
    const updated = [
      template.id,
      ...recentlyUsed.filter((id) => id !== template.id),
    ].slice(0, 5);

    setRecentlyUsed(updated);
    try {
      localStorage.setItem("reportBuilder.recentTemplates", JSON.stringify(updated));
    } catch (error) {
      console.warn("Failed to save recent templates:", error);
    }
  };

  if (!categoryDef) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: Category not found</p>
      </div>
    );
  }

  // Fuzzy search: match query against name, description, tags, insight question
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter((template) => {
      const searchText = [
        template.name,
        template.insightQuestion,
        template.description || "",
        ...(template.tags || []),
      ].join(" ").toLowerCase();

      return searchText.includes(query);
    });
  }, [templates, searchQuery]);

  // Sort templates by usage count (descending)
  const sortedTemplates = [...filteredTemplates].sort(
    (a, b) => (b.usageCount || 0) - (a.usageCount || 0)
  );

  // Get recently used templates that are in current category
  const recentTemplates = useMemo(() => {
    const allTemplates = getAllTemplates();
    return recentlyUsed
      .map((id) => allTemplates.find((t) => t.id === id))
      .filter((t): t is ReportTemplateDef => t !== undefined && t.category === category)
      .slice(0, 3);
  }, [recentlyUsed, category]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[14px] text-[#003a63] hover:text-[#78be20] mb-4 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span style={{ fontWeight: 500 }}>Back to categories</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2
              className="text-[24px] text-[#003a63] mb-2"
              style={{ fontWeight: 600 }}
            >
              {categoryDef.name}
            </h2>
            <p className="text-[15px] text-[#64748b] mb-1">
              {categoryDef.description}
            </p>
            <p
              className="text-[14px] text-[#78be20]"
              style={{ fontWeight: 500 }}
            >
              {categoryDef.questionPrompt}
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Recently Used Section */}
        {!searchQuery && recentTemplates.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-[13px] text-[#64748b] mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
              <Star className="w-4 h-4" />
              Recently Used
            </h3>
            <div className="space-y-2">
              {recentTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`
                      w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3
                      ${
                        isSelected
                          ? "border-[#003a63] bg-[#003a63]/[0.04]"
                          : "border-[#e2e8f0] bg-white hover:border-[#003a63]/30"
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-[#1e293b] truncate" style={{ fontWeight: 600 }}>
                        {template.name}
                      </p>
                      <p className="text-[12px] text-[#78be20] truncate" style={{ fontWeight: 500 }}>
                        {template.insightQuestion}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#78be20] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Search Results Count */}
        {searchQuery && (
          <div className="mb-4 text-[13px] text-[#64748b]">
            Found {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Template List */}
        {sortedTemplates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
            <p className="text-[15px] text-[#64748b]">
              No reports available in this category yet.
            </p>
            <p className="text-[13px] text-[#94a3b8] mt-2">
              More templates coming soon based on usage data.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedTemplates.map((template, index) => {
                const isSelected = selectedTemplate?.id === template.id;
                const ChartIcon = template.defaults.chart
                  ? chartIconMap[template.defaults.chart.type]
                  : BarChart3;

                return (
                  <motion.button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`
                      w-full p-5 rounded-xl border-2 text-left transition-all flex items-start gap-5
                      ${
                        isSelected
                          ? "border-[#003a63] bg-[#003a63]/[0.04] shadow-lg shadow-[#003a63]/10"
                          : "border-[#e2e8f0] bg-white hover:border-[#003a63]/30 hover:shadow-md hover:shadow-[#003a63]/5"
                      }
                    `}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Radio Circle */}
                    <div
                      className={`
                        flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center transition-all
                        ${
                          isSelected
                            ? "border-[#78be20] bg-[#78be20]"
                            : "border-[#cbd5e1] bg-white"
                        }
                      `}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Template Name */}
                      <h3
                        className={`
                          text-[16px] mb-1.5 transition-colors
                          ${
                            isSelected
                              ? "text-[#003a63]"
                              : "text-[#1e293b] group-hover:text-[#003a63]"
                          }
                        `}
                        style={{ fontWeight: 600 }}
                      >
                        {template.name}
                      </h3>

                      {/* Insight Question */}
                      <p
                        className="text-[14px] text-[#78be20] mb-3"
                        style={{ fontWeight: 500 }}
                      >
                        {template.insightQuestion}
                      </p>

                      {/* Description */}
                      <p className="text-[13px] text-[#64748b] leading-relaxed mb-4">
                        {template.description}
                      </p>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
                        {/* Usage Count */}
                        {template.usageCount && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#94a3b8]" />
                            <div>
                              <p className="text-[#94a3b8]">Used by</p>
                              <p
                                className="text-[#1e293b]"
                                style={{ fontWeight: 600 }}
                              >
                                {template.usageCount.toLocaleString()} fleets
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Date Range */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#94a3b8]" />
                          <div>
                            <p className="text-[#94a3b8]">Default period</p>
                            <p
                              className="text-[#1e293b]"
                              style={{ fontWeight: 600 }}
                            >
                              {template.defaults.dateRange.type === "previous"
                                ? "Last"
                                : "Current"}{" "}
                              {template.defaults.dateRange.value}{" "}
                              {template.defaults.dateRange.unit}
                            </p>
                          </div>
                        </div>

                        {/* Refresh Period */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#94a3b8]" />
                          <div>
                            <p className="text-[#94a3b8]">Refresh</p>
                            <p
                              className="text-[#1e293b] capitalize"
                              style={{ fontWeight: 600 }}
                            >
                              {template.defaults.refreshPeriod}
                            </p>
                          </div>
                        </div>

                        {/* Chart Type */}
                        {template.defaults.chart && (
                          <div className="flex items-center gap-2">
                            <ChartIcon className="w-4 h-4 text-[#94a3b8]" />
                            <div>
                              <p className="text-[#94a3b8]">Visualization</p>
                              <p
                                className="text-[#1e293b] capitalize"
                                style={{ fontWeight: 600 }}
                              >
                                {template.defaults.chart.type} chart
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-md bg-[#f1f5f9] text-[11px] text-[#64748b]"
                              style={{ fontWeight: 500 }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <motion.div
                        className="flex-shrink-0 text-[#78be20]"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <TrendingUp className="w-6 h-6" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Confirmation Message */}
        {selectedTemplate && (
          <motion.div
            className="mt-6 p-4 bg-[#78be20]/10 border-2 border-[#78be20]/30 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#78be20] mt-0.5 flex-shrink-0" />
              <div>
                <p
                  className="text-[14px] text-[#003a63] mb-1"
                  style={{ fontWeight: 600 }}
                >
                  Report template selected
                </p>
                <p className="text-[13px] text-[#64748b]">
                  Your report will load with pre-configured defaults. You can
                  refine the date range, groups, and filters below.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
