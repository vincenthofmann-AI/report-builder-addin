/**
 * InsightSelector - Step 2 of template-driven flow
 * Template library with search and recently used section
 */

import { useState, useEffect, useMemo } from "react";
import { SearchInput, Divider, Button } from "@geotab/zenith";
import {
  getTemplatesByCategory,
  getCategoryById,
  searchTemplates,
  type ReportTemplate,
} from "../data/templates";
import "./insight-selector.css";

interface InsightSelectorProps {
  categoryId: string;
  onSelectTemplate: (template: ReportTemplate) => void;
  onBack: () => void;
}

const RECENTLY_USED_KEY = "reportBuilder_recentlyUsed";
const MAX_RECENT = 3;

export function InsightSelector({
  categoryId,
  onSelectTemplate,
  onBack,
}: InsightSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  const category = getCategoryById(categoryId);
  const allTemplates = getTemplatesByCategory(categoryId);

  // Load recently used from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_USED_KEY);
      if (stored) {
        setRecentlyUsed(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recently used templates:", error);
    }
  }, []);

  // Filtered templates based on search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTemplates;
    }
    return searchTemplates(searchQuery).filter((t) => t.categoryId === categoryId);
  }, [searchQuery, allTemplates, categoryId]);

  // Recently used templates (max 3)
  const recentTemplates = useMemo(() => {
    return recentlyUsed
      .map((id) => allTemplates.find((t) => t.id === id))
      .filter((t): t is ReportTemplate => t !== undefined)
      .slice(0, MAX_RECENT);
  }, [recentlyUsed, allTemplates]);

  const handleSelectTemplate = (template: ReportTemplate) => {
    // Update recently used
    const updated = [
      template.id,
      ...recentlyUsed.filter((id) => id !== template.id),
    ].slice(0, MAX_RECENT);

    setRecentlyUsed(updated);
    try {
      localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save recently used template:", error);
    }

    onSelectTemplate(template);
  };

  return (
    <div className="insight-selector">
      {/* Header */}
      <div className="insight-selector__header">
        <Button size="small" onClick={onBack}>
          ← Back to Categories
        </Button>
        <h1 className="insight-selector__title">
          {category?.icon} {category?.name}
        </h1>
        <p className="insight-selector__subtitle">{category?.description}</p>
      </div>

      {/* Search */}
      <div className="insight-selector__search">
        <SearchInput
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search templates..."
        />
      </div>

      {/* Template List */}
      <div className="insight-selector__content">
        {/* Recently Used */}
        {recentTemplates.length > 0 && !searchQuery && (
          <>
            <div className="insight-selector__section-header">Recently Used</div>
            <div className="insight-selector__templates">
              {recentTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleSelectTemplate(template)}
                  isRecent
                />
              ))}
            </div>
            <Divider />
          </>
        )}

        {/* All Templates */}
        <div className="insight-selector__section-header">
          {searchQuery ? `Search Results (${filteredTemplates.length})` : "All Templates"}
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="insight-selector__empty">
            <div className="insight-selector__empty-title">No templates found</div>
            <div className="insight-selector__empty-subtitle">
              Try a different search term or browse all categories
            </div>
          </div>
        ) : (
          <div className="insight-selector__templates">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => handleSelectTemplate(template)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: ReportTemplate;
  onClick: () => void;
  isRecent?: boolean;
}

function TemplateCard({ template, onClick, isRecent = false }: TemplateCardProps) {
  return (
    <button className="template-card" onClick={onClick}>
      {isRecent && <div className="template-card__badge">⭐ Recent</div>}
      <div className="template-card__header">
        <h3 className="template-card__name">{template.name}</h3>
        <div className="template-card__usage">
          {template.usageCount.toLocaleString()} fleets
        </div>
      </div>
      <p className="template-card__question">{template.question}</p>
      <p className="template-card__description">{template.description}</p>
      <div className="template-card__footer">
        <div className="template-card__chart-type">{getChartTypeIcon(template.chartType)}</div>
        <div className="template-card__arrow">→</div>
      </div>
    </button>
  );
}

function getChartTypeIcon(chartType: string): string {
  switch (chartType) {
    case "table":
      return "📊 Table";
    case "bar":
      return "📊 Bar Chart";
    case "line":
      return "📈 Line Chart";
    case "pie":
      return "🥧 Pie Chart";
    default:
      return "📊";
  }
}
