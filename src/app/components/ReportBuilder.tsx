/**
 * Report Builder - Template-Driven Interface (PRD Compliant)
 *
 * 3-Step User Flow:
 * 1. Select insight category (Safety, Cost, Health, Sustainability, Overview)
 * 2. Choose pre-configured template from library
 * 3. View report with refinement controls
 *
 * This is the CORRECT product per PRD - template-first approach for 80% of users.
 */

import { useState } from "react";
import { InsightCategorySelector } from "./InsightCategorySelector";
import { InsightSelector } from "./InsightSelector";
import { ReportPreview } from "./ReportPreview";
import type { ReportTemplate } from "../data/templates";
import { useGeotab } from "../services/geotab-context";
import "./report-builder.css";

type ViewState =
  | { type: "categories" }
  | { type: "templates"; categoryId: string }
  | { type: "preview"; template: ReportTemplate };

export function ReportBuilder() {
  const { isLive, isReady } = useGeotab();
  const [view, setView] = useState<ViewState>({ type: "categories" });

  const handleSelectCategory = (categoryId: string) => {
    setView({ type: "templates", categoryId });
  };

  const handleSelectTemplate = (template: ReportTemplate) => {
    setView({ type: "preview", template });
  };

  const handleBackToCategories = () => {
    setView({ type: "categories" });
  };

  const handleBackToTemplates = () => {
    if (view.type === "preview") {
      // Go back to the template's category
      const categoryId = view.template.categoryId;
      setView({ type: "templates", categoryId });
    }
  };

  return (
    <div className="report-builder">
      {/* Header Badge */}
      <div className="report-builder__badge-bar">
        {isLive && <span className="report-builder__badge report-builder__badge--live">Live</span>}
        {!isLive && isReady && <span className="report-builder__badge report-builder__badge--demo">Demo</span>}
      </div>

      {/* 3-Step Flow */}
      {view.type === "categories" && (
        <InsightCategorySelector onSelectCategory={handleSelectCategory} />
      )}

      {view.type === "templates" && (
        <InsightSelector
          categoryId={view.categoryId}
          onSelectTemplate={handleSelectTemplate}
          onBack={handleBackToCategories}
        />
      )}

      {view.type === "preview" && (
        <ReportPreview
          template={view.template}
          onBack={handleBackToTemplates}
        />
      )}
    </div>
  );
}
