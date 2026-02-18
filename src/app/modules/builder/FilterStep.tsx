/**
 * Filter Step - Step 3
 * ====================
 *
 * Allows users to add 0-5 filters to refine their data.
 * Shows live preview of filtered results.
 */

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Plus, X, AlertCircle, RefreshCw } from "lucide-react";
import { Button, ButtonType } from "../../services/zenith-adapter";
import type { FilterRule } from "../configuration/FilterBar";
import { dataSources, fetchData } from "../../services/geotab-mock";

interface FilterStepProps {
  dataSourceId: string;
  selectedColumns: string[];
  filters: FilterRule[];
  onFiltersChange: (filters: FilterRule[]) => void;
}

const operators: Record<string, string[]> = {
  string: ["equals", "contains", "startsWith", "endsWith"],
  number: ["equals", "greaterThan", "lessThan", "between"],
  date: ["equals", "after", "before", "between"],
  enum: ["equals", "in"],
};

const operatorLabels: Record<string, string> = {
  equals: "equals",
  contains: "contains",
  startsWith: "starts with",
  endsWith: "ends with",
  greaterThan: "is greater than",
  lessThan: "is less than",
  after: "is after",
  before: "is before",
  between: "is between",
  in: "is one of",
};

export function FilterStep({
  dataSourceId,
  selectedColumns,
  filters,
  onFiltersChange,
}: FilterStepProps) {
  const [editingFilter, setEditingFilter] = useState<string | null>(null);

  const dataSource = dataSources.find((ds) => ds.id === dataSourceId);
  if (!dataSource) return null;

  // Get filterable columns only
  const filterableColumns = dataSource.columns.filter((col) => col.filterable);

  // Fetch and filter data for preview
  const allData = fetchData(dataSourceId);
  const filteredData = useMemo(() => {
    let data = allData;

    filters.forEach((filter) => {
      const column = dataSource.columns.find((col) => col.key === filter.column);
      if (!column) return;

      data = data.filter((row) => {
        const cellValue = String(row[filter.column] || "");
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "equals":
            return cellValue.toLowerCase() === filterValue;
          case "contains":
            return cellValue.toLowerCase().includes(filterValue);
          case "startsWith":
            return cellValue.toLowerCase().startsWith(filterValue);
          case "endsWith":
            return cellValue.toLowerCase().endsWith(filterValue);
          case "greaterThan":
            return parseFloat(cellValue) > parseFloat(filter.value);
          case "lessThan":
            return parseFloat(cellValue) < parseFloat(filter.value);
          default:
            return true;
        }
      });
    });

    return data;
  }, [allData, filters, dataSource.columns]);

  const handleAddFilter = () => {
    if (filters.length >= 5) return;

    const newFilter: FilterRule = {
      id: `filter-${Date.now()}`,
      column: filterableColumns[0]?.key || "",
      operator: "equals",
      value: "",
    };

    onFiltersChange([...filters, newFilter]);
    setEditingFilter(newFilter.id);
  };

  const handleRemoveFilter = (filterId: string) => {
    onFiltersChange(filters.filter((f) => f.id !== filterId));
  };

  const handleUpdateFilter = (filterId: string, updates: Partial<FilterRule>) => {
    onFiltersChange(
      filters.map((f) => (f.id === filterId ? { ...f, ...updates } : f))
    );
  };

  const previewColumns = selectedColumns.length > 0
    ? dataSource.columns.filter((col) => selectedColumns.includes(col.key))
    : dataSource.columns.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Filter Configuration */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        <div className="mb-6">
          <h2 className="text-[20px] text-[#003a63] mb-2" style={{ fontWeight: 600 }}>
            Add Filters
          </h2>
          <p className="text-[14px] text-[#64748b]">
            Narrow down your results (optional, max 5 filters)
          </p>
        </div>

        {/* Filter List */}
        {filters.length > 0 && (
          <div className="space-y-3 mb-4">
            {filters.map((filter) => {
              const column = dataSource.columns.find((col) => col.key === filter.column);
              const availableOperators = operators[column?.type || "string"];

              return (
                <motion.div
                  key={filter.id}
                  className="p-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3">
                    {/* Column Selector */}
                    <select
                      value={filter.column}
                      onChange={(e) => handleUpdateFilter(filter.id, { column: e.target.value })}
                      className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003a63]/20"
                    >
                      {filterableColumns.map((col) => (
                        <option key={col.key} value={col.key}>
                          {col.label}
                        </option>
                      ))}
                    </select>

                    {/* Operator Selector */}
                    <select
                      value={filter.operator}
                      onChange={(e) => handleUpdateFilter(filter.id, { operator: e.target.value })}
                      className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003a63]/20"
                    >
                      {availableOperators?.map((op) => (
                        <option key={op} value={op}>
                          {operatorLabels[op]}
                        </option>
                      ))}
                    </select>

                    {/* Value Input */}
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                      placeholder="Enter value..."
                      className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003a63]/20"
                    />

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFilter(filter.id)}
                      className="p-2 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add Filter Button */}
        {filters.length < 5 && (
          <Button
            type={ButtonType.Secondary}
            onClick={handleAddFilter}
            disabled={filterableColumns.length === 0}
          >
            <Plus className="w-4 h-4" />
            Add filter
          </Button>
        )}

        {filters.length >= 5 && (
          <p className="text-[13px] text-[#f59e0b] flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Maximum 5 filters reached. Remove one to add more.
          </p>
        )}

        {/* Tip */}
        {filters.length === 0 && (
          <div className="mt-4 p-3 rounded-lg bg-[#eff6ff] border border-[#bfdbfe]">
            <p className="text-[13px] text-[#1e40af]">
              💡 Tip: Skip filters to see all data, then refine in the preview
            </p>
          </div>
        )}
      </div>

      {/* Data Preview */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] text-[#003a63]" style={{ fontWeight: 600 }}>
            Preview Results
          </h3>
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <span>
              Showing {filteredData.length.toLocaleString()} of {allData.length.toLocaleString()} records
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                {previewColumns.map((col) => (
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
                  {previewColumns.map((col) => (
                    <td key={col.key} className="py-2 px-3 text-[#1e293b]">
                      {String(row[col.key] || "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
            <p className="text-[15px] text-[#64748b]">
              No data found with current filters
            </p>
            <p className="text-[13px] text-[#94a3b8] mt-2">
              Try removing some filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
