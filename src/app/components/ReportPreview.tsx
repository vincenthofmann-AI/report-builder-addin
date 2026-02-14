/**
 * Report Preview Component
 * =========================
 *
 * Insight-First Architecture: Step 3
 * Shows a pre-configured report with template defaults applied.
 *
 * Features:
 * - Displays data using template's pre-selected columns
 * - Applies template's default chart configuration
 * - Shows refinement controls (date range, groups, filters)
 * - Maintains "locked defaults + strategic refinement" pattern
 *
 * This component replaces the empty state that required users to manually
 * configure everything from scratch.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Calendar,
  Users,
  Settings,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";
import type { ReportTemplateDef } from "../services/report-templates";
import type { FilterRule } from "./FilterBar";
import { ReportTable } from "./ReportTable";
import { ChartView } from "./ChartView";
import { ReportActions } from "./ReportActions";
import { useDataFetcher } from "../services/data-fetcher";
import { getDataSourceById } from "../services/categories";
import { toast } from "sonner";

interface ReportPreviewProps {
  template: ReportTemplateDef;
  onBack: () => void;
  onExport?: () => void;
  onSave?: () => void;
  onSchedule?: () => void;
}

export function ReportPreview({
  template,
  onBack,
  onExport,
  onSave,
  onSchedule,
}: ReportPreviewProps) {
  const dataFetcher = useDataFetcher();

  // Get data source definition
  const dataSource = getDataSourceById(template.dataSource);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);
  const [showRefinement, setShowRefinement] = useState(false);
  const [filters, setFilters] = useState<FilterRule[]>([]);

  // Refinement state (user can adjust these)
  const [dateRange, setDateRange] = useState(template.defaults.dateRange);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);

  // Fetch data on mount
  useEffect(() => {
    if (!dataSource) {
      toast.error("Data source not found");
      return;
    }

    setIsLoading(true);
    dataFetcher
      .fetchDataSource(template.dataSource)
      .then((data) => {
        setRawData(data);
        setIsLoading(false);
        toast.success(`Loaded ${data.length} records`, {
          description: template.name,
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error(`Failed to load ${template.name}`);
        setRawData([]);
        setIsLoading(false);
      });
  }, [template, dataSource, dataFetcher]);

  // Apply filters
  const filteredData = useMemo(() => {
    if (!dataSource) return [];
    let data = rawData;

    // Apply user-defined filters
    filters.forEach((filter) => {
      if (!filter.value && filter.value !== "0") return;
      const col = dataSource.columns.find((c) => c.key === filter.column);
      if (!col) return;

      data = data.filter((row) => {
        const val = row[filter.column];
        const filterVal = filter.value;

        if (col.type === "number") {
          const numVal = Number(val);
          const numFilter = Number(filterVal);
          switch (filter.operator) {
            case "equals": return numVal === numFilter;
            case "gt": return numVal > numFilter;
            case "gte": return numVal >= numFilter;
            case "lt": return numVal < numFilter;
            case "lte": return numVal <= numFilter;
            case "notEquals": return numVal !== numFilter;
          }
        } else if (col.type === "string" || col.type === "enum") {
          const strVal = String(val || "").toLowerCase();
          const strFilter = filterVal.toLowerCase();
          switch (filter.operator) {
            case "equals": return strVal === strFilter;
            case "contains": return strVal.includes(strFilter);
            case "startsWith": return strVal.startsWith(strFilter);
            case "notEquals": return strVal !== strFilter;
          }
        }
        return true;
      });
    });

    return data;
  }, [rawData, filters, dataSource]);

  if (!dataSource) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[15px] text-[#64748b]">
            Data source not found: {template.dataSource}
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-[#003a63] text-white rounded-lg hover:bg-[#002945] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-[#e2e8f0] px-4 lg:px-6 py-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[13px] text-[#003a63] hover:text-[#78be20] mb-2 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span style={{ fontWeight: 500 }}>Back to templates</span>
            </button>

            <h2
              className="text-[20px] text-[#003a63] mb-1"
              style={{ fontWeight: 600 }}
            >
              {template.name}
            </h2>
            <p className="text-[14px] text-[#78be20]" style={{ fontWeight: 500 }}>
              {template.insightQuestion}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRefinement(!showRefinement)}
              className={`
                px-3 py-2 rounded-lg flex items-center gap-2 text-[13px] transition-all
                ${
                  showRefinement
                    ? "bg-[#003a63] text-white"
                    : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                }
              `}
              style={{ fontWeight: 500 }}
            >
              <Settings className="w-4 h-4" />
              Refine
            </button>

            <div className="w-px h-6 bg-[#e2e8f0]" />

            <ReportActions
              template={template}
              data={filteredData}
              columns={dataSource.columns}
              selectedColumns={template.defaults.columns}
            />
          </div>
        </div>

        {/* Template Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#64748b]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>
              {dateRange.type === "previous" ? "Last" : "Current"}{" "}
              {dateRange.value} {dateRange.unit}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            <span className="capitalize">{template.defaults.refreshPeriod} refresh</span>
          </div>
          {template.usageCount && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Used by {template.usageCount.toLocaleString()} fleets</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4" />
            <span>{filteredData.length} of {rawData.length} records</span>
          </div>
        </div>
      </div>

      {/* Refinement Panel */}
      <AnimatePresence>
        {showRefinement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 overflow-hidden bg-[#f8fafc] border-b border-[#e2e8f0]"
          >
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-[15px] text-[#003a63]"
                  style={{ fontWeight: 600 }}
                >
                  Refinement Options
                </h3>
                <button
                  onClick={() => setShowRefinement(false)}
                  className="p-1 rounded hover:bg-white/50 transition-colors"
                >
                  <X className="w-4 h-4 text-[#64748b]" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range (if refinable) */}
                {template.refinableFields.includes("dateRange") && (
                  <div>
                    <label className="block text-[13px] text-[#64748b] mb-2" style={{ fontWeight: 500 }}>
                      Date Range
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#1e293b]"
                      value={`${dateRange.value}-${dateRange.unit}`}
                      onChange={(e) => {
                        const [value, unit] = e.target.value.split("-");
                        setDateRange({
                          type: "previous",
                          value: parseInt(value),
                          unit: unit as any,
                        });
                      }}
                    >
                      <option value="7-days">Last 7 days</option>
                      <option value="30-days">Last 30 days</option>
                      <option value="90-days">Last 90 days</option>
                      <option value="1-months">Current month</option>
                      <option value="3-months">Last 3 months</option>
                      <option value="1-years">Current year</option>
                    </select>
                  </div>
                )}

                {/* Groups (if refinable) */}
                {template.refinableFields.includes("groups") && (
                  <div>
                    <label className="block text-[13px] text-[#64748b] mb-2" style={{ fontWeight: 500 }}>
                      Groups
                    </label>
                    <input
                      type="text"
                      placeholder="Select groups..."
                      className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#1e293b]"
                    />
                  </div>
                )}

                {/* Drivers (if refinable) */}
                {template.refinableFields.includes("drivers") && (
                  <div>
                    <label className="block text-[13px] text-[#64748b] mb-2" style={{ fontWeight: 500 }}>
                      Drivers
                    </label>
                    <input
                      type="text"
                      placeholder="Select drivers..."
                      className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#1e293b]"
                    />
                  </div>
                )}
              </div>

              <p className="text-[12px] text-[#94a3b8] mt-4">
                Core report configuration is locked to maintain consistency with top-performing fleets.
                Refinement options are strategic choices that don't affect report integrity.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="max-w-[1400px] space-y-4">
          {/* Chart (if configured) */}
          {template.defaults.chart && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChartView
                  data={filteredData}
                  columns={dataSource.columns}
                  chartType={template.defaults.chart.type}
                  groupByColumn={template.defaults.chart.groupBy || null}
                  aggregateColumn={template.defaults.chart.yAxis || null}
                  aggregateFn={template.defaults.chart.aggregate || "sum"}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Data Table */}
          <ReportTable
            data={filteredData}
            columns={dataSource.columns}
            selectedColumns={template.defaults.columns}
            groupByColumn={template.defaults.chart?.groupBy || null}
            aggregateColumn={template.defaults.chart?.yAxis || null}
            aggregateFn={template.defaults.chart?.aggregate || "sum"}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
