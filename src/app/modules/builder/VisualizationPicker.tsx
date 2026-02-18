/**
 * Visualization Picker - Step 4
 * ==============================
 *
 * Final step: Choose visualization type, preview report, and save configuration.
 */

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { BarChart3, LineChart, PieChart, Table, Download, FileText, Save } from "lucide-react";
import { Button, ButtonType } from "../../services/zenith-adapter";
import type { CustomReportConfig } from "./CustomBuilderWizard";
import { dataSources, fetchData } from "../../services/geotab-mock";

interface VisualizationPickerProps {
  config: CustomReportConfig;
  onConfigChange: (updates: Partial<CustomReportConfig>) => void;
}

const visualizationTypes = [
  { id: "none", label: "Table Only", icon: Table, description: "Data table without chart" },
  { id: "bar", label: "Bar Chart", icon: BarChart3, description: "Compare values across categories" },
  { id: "line", label: "Line Chart", icon: LineChart, description: "Show trends over time" },
  { id: "pie", label: "Pie Chart", icon: PieChart, description: "Show proportions of a whole" },
];

export function VisualizationPicker({
  config,
  onConfigChange,
}: VisualizationPickerProps) {
  const [selectedVizType, setSelectedVizType] = useState<string>("none");

  const dataSource = dataSources.find((ds) => ds.id === config.dataSource);
  if (!dataSource) return null;

  // Fetch and filter data
  const allData = fetchData(config.dataSource!);
  const filteredData = useMemo(() => {
    let data = allData;

    config.filters.forEach((filter) => {
      data = data.filter((row) => {
        const cellValue = String(row[filter.column] || "");
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "equals":
            return cellValue.toLowerCase() === filterValue;
          case "contains":
            return cellValue.toLowerCase().includes(filterValue);
          case "greaterThan":
            return parseFloat(cellValue) > parseFloat(filterValue);
          case "lessThan":
            return parseFloat(cellValue) < parseFloat(filterValue);
          default:
            return true;
        }
      });
    });

    return data;
  }, [allData, config.filters]);

  const displayColumns = dataSource.columns.filter((col) =>
    config.selectedColumns.includes(col.key)
  );

  const handleVizTypeChange = (vizType: string) => {
    setSelectedVizType(vizType);

    if (vizType === "none") {
      onConfigChange({ visualization: undefined });
    } else {
      // Set default axes for chart
      const numericColumns = displayColumns.filter((col) => col.type === "number");
      const stringColumns = displayColumns.filter((col) => col.type === "string");

      onConfigChange({
        visualization: {
          type: vizType as "bar" | "line" | "pie",
          xAxis: stringColumns[0]?.key || displayColumns[0]?.key || "",
          yAxis: numericColumns[0]?.key || displayColumns[1]?.key || "",
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Visualization Type Selector */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        <h2 className="text-[20px] text-[#003a63] mb-2" style={{ fontWeight: 600 }}>
          Visualization
        </h2>
        <p className="text-[14px] text-[#64748b] mb-6">
          Choose how to display your report (optional)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visualizationTypes.map((vizType) => {
            const Icon = vizType.icon;
            const isSelected = selectedVizType === vizType.id;

            return (
              <motion.button
                key={vizType.id}
                onClick={() => handleVizTypeChange(vizType.id)}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${
                    isSelected
                      ? "border-[#003a63] bg-[#003a63]/[0.04] shadow-md"
                      : "border-[#e2e8f0] bg-white hover:border-[#003a63]/30 hover:shadow-sm"
                  }
                `}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon
                  className={`w-8 h-8 mx-auto mb-2 ${
                    isSelected ? "text-[#003a63]" : "text-[#64748b]"
                  }`}
                />
                <h4 className="text-[13px] font-semibold text-[#1e293b] mb-1">
                  {vizType.label}
                </h4>
                <p className="text-[11px] text-[#94a3b8]">
                  {vizType.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Chart Configuration (if chart selected) */}
        {selectedVizType !== "none" && displayColumns.length >= 2 && (
          <motion.div
            className="mt-6 p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="text-[14px] text-[#1e293b] font-semibold mb-3">
              Chart Configuration
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-[#64748b] mb-2">
                  X-Axis (Category)
                </label>
                <select
                  value={config.visualization?.xAxis || ""}
                  onChange={(e) =>
                    onConfigChange({
                      visualization: { ...config.visualization!, xAxis: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-md text-[13px]"
                >
                  {displayColumns.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] text-[#64748b] mb-2">
                  Y-Axis (Value)
                </label>
                <select
                  value={config.visualization?.yAxis || ""}
                  onChange={(e) =>
                    onConfigChange({
                      visualization: { ...config.visualization!, yAxis: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-md text-[13px]"
                >
                  {displayColumns.filter((col) => col.type === "number").map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Data Table Preview */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] text-[#003a63]" style={{ fontWeight: 600 }}>
            Data Preview
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#64748b]">
              {filteredData.length.toLocaleString()} records
            </span>
            <Button type={ButtonType.Tertiary}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                {displayColumns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left py-2 px-3 text-[#64748b] font-semibold"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 10).map((row, index) => (
                <tr key={index} className="border-b border-[#f1f5f9]">
                  {displayColumns.map((col) => (
                    <td key={col.key} className="py-2 px-3 text-[#1e293b]">
                      {String(row[col.key] || "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length > 10 && (
          <p className="text-[12px] text-[#94a3b8] mt-3">
            Showing 10 of {filteredData.length.toLocaleString()} records
          </p>
        )}
      </div>

      {/* Save Configuration */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        <h3 className="text-[16px] text-[#003a63] mb-4" style={{ fontWeight: 600 }}>
          Save Report Configuration
        </h3>

        {/* Report Name */}
        <div className="mb-4">
          <label className="block text-[13px] text-[#64748b] mb-2">
            Report Name
          </label>
          <input
            type="text"
            value={config.reportName}
            onChange={(e) => onConfigChange({ reportName: e.target.value })}
            placeholder="e.g., My Custom Trip Report"
            className="w-full px-4 py-2 border border-[#cbd5e1] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003a63]/20"
          />
          {config.reportName.trim().length > 0 && config.reportName.trim().length < 3 && (
            <p className="text-[12px] text-[#f59e0b] mt-1">
              Name must be at least 3 characters
            </p>
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-[13px] text-[#64748b] mb-2">
            Who can access this report?
          </label>
          <div className="space-y-2">
            {[
              { value: "private", label: "Private (only me)" },
              { value: "shared", label: "Shared with my groups" },
              { value: "template", label: "Template (share with organization)" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#e2e8f0] cursor-pointer hover:bg-[#f8fafc] transition-colors"
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={config.visibility === option.value}
                  onChange={(e) => onConfigChange({ visibility: e.target.value as any })}
                  className="w-4 h-4 text-[#003a63]"
                />
                <span className="text-[13px] text-[#1e293b]">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
