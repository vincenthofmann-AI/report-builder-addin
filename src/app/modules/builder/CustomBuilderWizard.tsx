/**
 * Custom Builder Wizard
 * =====================
 *
 * 4-step wizard for creating custom reports from scratch.
 * Escape hatch for power users who need reports not covered by templates.
 *
 * Flow: Data Source → Columns → Filters → Visualize & Save
 */

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { WizardProgress } from "../../components/WizardProgress";
import { Button, ButtonType } from "../../services/zenith-adapter";
import type { FilterRule } from "../configuration/FilterBar";

// Step components (to be created)
import { DataSourcePicker } from "./DataSourcePicker";
import { ColumnPicker } from "./ColumnPicker";
import { FilterStep } from "./FilterStep";
import { VisualizationPicker } from "./VisualizationPicker";

export interface CustomReportConfig {
  // Step 1
  dataSource: string | null; // DataSourceDef.id

  // Step 2
  selectedColumns: string[]; // Column keys (min 3, max 10)

  // Step 3
  filters: FilterRule[]; // 0-5 filters

  // Step 4
  visualization?: {
    type: "bar" | "line" | "pie";
    xAxis: string;
    yAxis: string;
    groupBy?: string;
  };
  reportName: string;
  visibility: "private" | "shared" | "template";
}

interface CustomBuilderWizardProps {
  onBack: () => void;
  onComplete: (config: CustomReportConfig) => void;
}

export function CustomBuilderWizard({
  onBack,
  onComplete,
}: CustomBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<CustomReportConfig>({
    dataSource: null,
    selectedColumns: [],
    filters: [],
    reportName: "",
    visibility: "private",
  });

  const stepLabels = ["Data Source", "Columns", "Filters", "Visualize"];

  // Validation logic
  const canAdvanceFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!config.dataSource;
      case 2:
        return config.selectedColumns.length >= 3 && config.selectedColumns.length <= 10;
      case 3:
        return true; // Filters optional
      case 4:
        return config.reportName.trim().length >= 3;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canAdvanceFromStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete wizard
        onComplete(config);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleStepClick = (step: number) => {
    // Allow jumping back to previous steps only
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const updateConfig = (updates: Partial<CustomReportConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const isNextDisabled = !canAdvanceFromStep(currentStep);

  return (
    <div className="flex-1 overflow-auto bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-[#e2e8f0] px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[14px] text-[#003a63] hover:text-[#78be20] mb-4 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span style={{ fontWeight: 500 }}>
              {currentStep === 1 ? "Back to templates" : "Back"}
            </span>
          </button>

          <h1 className="text-[24px] text-[#003a63] mb-2" style={{ fontWeight: 600 }}>
            Build Custom Report
          </h1>
          <p className="text-[15px] text-[#64748b]">
            Create a custom report from scratch with full control over data sources, columns, filters, and visualizations.
          </p>
        </div>

        {/* Progress Indicator */}
        <WizardProgress
          currentStep={currentStep}
          totalSteps={4}
          stepLabels={stepLabels}
          onStepClick={handleStepClick}
        />

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <DataSourcePicker
              selectedDataSource={config.dataSource}
              onSelectDataSource={(dataSource) => updateConfig({ dataSource })}
            />
          )}

          {currentStep === 2 && config.dataSource && (
            <ColumnPicker
              dataSourceId={config.dataSource}
              selectedColumns={config.selectedColumns}
              onSelectColumns={(selectedColumns) => updateConfig({ selectedColumns })}
            />
          )}

          {currentStep === 3 && config.dataSource && (
            <FilterStep
              dataSourceId={config.dataSource}
              selectedColumns={config.selectedColumns}
              filters={config.filters}
              onFiltersChange={(filters) => updateConfig({ filters })}
            />
          )}

          {currentStep === 4 && config.dataSource && (
            <VisualizationPicker
              config={config}
              onConfigChange={updateConfig}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t border-[#e2e8f0] px-6 py-4 flex items-center justify-between sticky bottom-0">
          <div className="flex items-center gap-3">
            <Button
              type={ButtonType.Tertiary}
              onClick={handleBack}
            >
              {currentStep === 1 ? "Cancel" : "← Back"}
            </Button>

            {currentStep === 3 && (
              <Button
                type={ButtonType.Secondary}
                onClick={handleNext}
              >
                Skip Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type={ButtonType.Tertiary}
              onClick={onBack}
            >
              Cancel
            </Button>

            <Button
              type={ButtonType.Primary}
              onClick={handleNext}
              disabled={isNextDisabled}
            >
              {currentStep === 4 ? "View Report →" : `Next: ${stepLabels[currentStep]} →`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
