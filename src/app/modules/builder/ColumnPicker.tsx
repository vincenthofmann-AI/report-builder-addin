/**
 * Column Picker - Step 2
 * ======================
 *
 * Allows users to select 3-10 columns from the chosen data source.
 * Shows recommended columns and provides bulk actions.
 */

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Search, Star } from "lucide-react";
import { Checkbox, SearchInput } from "../../services/zenith-adapter";
import { dataSources } from "../../services/geotab-mock";

interface ColumnPickerProps {
  dataSourceId: string;
  selectedColumns: string[];
  onSelectColumns: (columns: string[]) => void;
}

const recommendedColumns: Record<string, string[]> = {
  trips: ["driver", "start", "distance", "drivingDuration"],
  fuel: ["driver", "dateTime", "volume", "cost"],
  behavior: ["driver", "date", "safetyScore"],
  maintenance: ["device", "dateTime", "type", "cost"],
  faults: ["device", "dateTime", "code", "severity"],
};

export function ColumnPicker({
  dataSourceId,
  selectedColumns,
  onSelectColumns,
}: ColumnPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const dataSource = dataSources.find((ds) => ds.id === dataSourceId);
  if (!dataSource) return null;

  const recommended = recommendedColumns[dataSourceId] || [];

  // Filter columns by search query
  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return dataSource.columns;

    const query = searchQuery.toLowerCase();
    return dataSource.columns.filter((col) => {
      const searchText = [col.label, col.key].join(" ").toLowerCase();
      return searchText.includes(query);
    });
  }, [dataSource.columns, searchQuery]);

  const handleToggle = (columnKey: string) => {
    const newSelection = selectedColumns.includes(columnKey)
      ? selectedColumns.filter((key) => key !== columnKey)
      : [...selectedColumns, columnKey];
    onSelectColumns(newSelection);
  };

  const handleSelectAll = () => {
    onSelectColumns(filteredColumns.map((col) => col.key));
  };

  const handleClearAll = () => {
    onSelectColumns([]);
  };

  const selectedCount = selectedColumns.length;
  const totalCount = dataSource.columns.length;
  const isValid = selectedCount >= 3 && selectedCount <= 10;

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[20px] text-[#003a63]" style={{ fontWeight: 600 }}>
            Select Columns
          </h2>
          <div
            className={`text-[14px] font-semibold ${
              isValid ? "text-[#78be20]" : "text-[#f59e0b]"
            }`}
          >
            {selectedCount} / {totalCount} selected
            {selectedCount < 3 && " (min 3)"}
            {selectedCount > 10 && " (max 10)"}
          </div>
        </div>

        <p className="text-[14px] text-[#64748b] mb-4">
          Choose 3-10 columns for your {dataSource.name} report
        </p>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search columns..."
            className="w-full pl-10"
          />
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="text-[13px] text-[#003a63] hover:text-[#78be20] font-medium transition-colors"
          >
            Select All
          </button>
          <span className="text-[#cbd5e1]">|</span>
          <button
            onClick={handleClearAll}
            className="text-[13px] text-[#003a63] hover:text-[#78be20] font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Column List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredColumns.map((column) => {
          const isSelected = selectedColumns.includes(column.key);
          const isRecommended = recommended.includes(column.key);

          return (
            <motion.button
              key={column.key}
              onClick={() => handleToggle(column.key)}
              className={`
                w-full p-4 rounded-lg border text-left transition-all flex items-start gap-3
                ${
                  isSelected
                    ? "border-[#003a63]/20 bg-[#003a63]/[0.04]"
                    : "border-[#e2e8f0] bg-white hover:border-[#003a63]/20 hover:bg-[#f8fafc]"
                }
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Checkbox */}
              <Checkbox
                checked={isSelected}
                onChange={() => handleToggle(column.key)}
                className="mt-0.5"
              />

              <div className="flex-1 min-w-0">
                {/* Column Name + Recommended Badge */}
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[14px] text-[#1e293b] font-semibold">
                    {column.label}
                  </h4>
                  {isRecommended && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#78be20]/10 text-[#78be20]">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[11px] font-medium">Recommended</span>
                    </div>
                  )}
                </div>

                {/* Column Type */}
                <div className="flex items-center gap-2 text-[12px] text-[#94a3b8]">
                  <span className="capitalize">{column.type}</span>
                  {column.filterable && <span>• Filterable</span>}
                  {column.sortable && <span>• Sortable</span>}
                  {column.aggregatable && <span>• Aggregatable</span>}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* No Results */}
      {filteredColumns.length === 0 && searchQuery.trim() && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
          <p className="text-[15px] text-[#64748b]">
            No columns match "{searchQuery}"
          </p>
        </div>
      )}

      {/* Validation Message */}
      {selectedCount > 0 && !isValid && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            selectedCount < 3
              ? "bg-[#f59e0b]/10 border border-[#f59e0b]/30"
              : "bg-[#ef4444]/10 border border-[#ef4444]/30"
          }`}
        >
          <p
            className={`text-[13px] font-medium ${
              selectedCount < 3 ? "text-[#f59e0b]" : "text-[#ef4444]"
            }`}
          >
            {selectedCount < 3
              ? `Select at least ${3 - selectedCount} more column${3 - selectedCount !== 1 ? 's' : ''} to continue`
              : `Remove ${selectedCount - 10} column${selectedCount - 10 !== 1 ? 's' : ''} (max 10 allowed)`}
          </p>
        </div>
      )}
    </div>
  );
}
