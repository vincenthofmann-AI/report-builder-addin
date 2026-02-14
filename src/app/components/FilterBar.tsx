import { useState, useEffect, useMemo } from "react";
import { X, Plus, Filter, Sparkles } from "lucide-react";
import { type ColumnDef } from "../services/geotab-mock";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { motion, AnimatePresence } from "motion/react";

export interface FilterRule {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface FilterBarProps {
  columns: ColumnDef[];
  filters: FilterRule[];
  onFiltersChange: (filters: FilterRule[]) => void;
  totalRecords: number;
  filteredRecords: number;
}

const operatorsByType: Record<string, { value: string; label: string }[]> = {
  string: [
    { value: "contains", label: "contains" },
    { value: "equals", label: "equals" },
    { value: "startsWith", label: "starts with" },
    { value: "notEquals", label: "does not equal" },
  ],
  number: [
    { value: "equals", label: "=" },
    { value: "gt", label: ">" },
    { value: "gte", label: ">=" },
    { value: "lt", label: "<" },
    { value: "lte", label: "<=" },
    { value: "notEquals", label: "!=" },
  ],
  date: [
    { value: "after", label: "is after" },
    { value: "before", label: "is before" },
    { value: "equals", label: "is on" },
  ],
  enum: [
    { value: "equals", label: "is" },
    { value: "notEquals", label: "is not" },
  ],
};

function operatorLabel(type: string, operator: string): string {
  const ops = operatorsByType[type] || operatorsByType.string;
  return ops.find((o) => o.value === operator)?.label || operator;
}

export function FilterBar({
  columns,
  filters,
  onFiltersChange,
  totalRecords,
  filteredRecords,
}: FilterBarProps) {
  const [addingFilter, setAddingFilter] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filterableColumns = columns.filter((c) => c.filterable);
  const hasFilters = filters.length > 0;
  const isFiltered = filteredRecords !== totalRecords;

  // Smart suggestions: suggest popular filter columns
  const suggestions = useMemo(() => {
    if (filters.length > 0) return [];
    // Suggest up to 2 filterable columns that make sense
    return filterableColumns
      .filter((c) => c.type === "string" || c.type === "enum")
      .slice(0, 2);
  }, [filterableColumns, filters.length]);

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    onFiltersChange([]);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-[#e2e8f0] min-h-[44px] overflow-x-auto">
      <div className="flex items-center gap-1.5 text-[#64748b] shrink-0">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-[12px]" style={{ fontWeight: 500 }}>
          Filters
        </span>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <AnimatePresence mode="popLayout">
          {filters.map((filter) => {
            const col = columns.find((c) => c.key === filter.column);
            if (!col) return null;
            const opLabel = operatorLabel(col.type, filter.operator);
            const displayValue =
              filter.value.length > 20
                ? filter.value.slice(0, 20) + "..."
                : filter.value;

            return (
              <motion.div
                key={filter.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                <Popover
                  open={editingId === filter.id}
                  onOpenChange={(open) => setEditingId(open ? filter.id : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#003a63]/[0.06] text-[#003a63] text-[12px] hover:bg-[#003a63]/[0.10] transition-all duration-150 group border border-transparent hover:border-[#003a63]/10"
                      style={{ fontWeight: 450 }}
                    >
                      <span className="text-[#64748b]">{col.label}</span>
                      <span className="text-[#94a3b8]">{opLabel}</span>
                      <span style={{ fontWeight: 500 }}>
                        {displayValue || "(empty)"}
                      </span>
                      <X
                        className="w-3 h-3 ml-0.5 text-[#94a3b8] hover:text-[#dc2626] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter(filter.id);
                        }}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72 p-3">
                    <FilterEditor
                      filter={filter}
                      columns={filterableColumns}
                      onSave={(updated) => {
                        onFiltersChange(
                          filters.map((f) => (f.id === updated.id ? updated : f))
                        );
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </PopoverContent>
                </Popover>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Smart filter suggestions (when no filters yet) */}
        <AnimatePresence>
          {suggestions.length > 0 && !addingFilter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              {suggestions.map((col) => (
                <button
                  key={col.key}
                  onClick={() => {
                    const ops = operatorsByType[col.type] || operatorsByType.string;
                    onFiltersChange([
                      ...filters,
                      {
                        id: `filter-${Date.now()}-${col.key}`,
                        column: col.key,
                        operator: ops[0].value,
                        value: "",
                      },
                    ]);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-[#e2e8f0] text-[11px] text-[#94a3b8] hover:text-[#64748b] hover:border-[#cbd5e1] transition-all duration-150"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {col.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add filter button */}
        <Popover open={addingFilter} onOpenChange={setAddingFilter}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-[#cbd5e1] text-[12px] text-[#64748b] hover:border-[#003a63]/30 hover:text-[#003a63] hover:bg-[#003a63]/[0.02] transition-all duration-150">
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Add filter</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-3">
            <FilterEditor
              columns={filterableColumns}
              onSave={(newFilter) => {
                onFiltersChange([...filters, newFilter]);
                setAddingFilter(false);
              }}
              onCancel={() => setAddingFilter(false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Right side: record count + clear */}
      <div className="ml-auto flex items-center gap-3 shrink-0">
        <AnimatePresence>
          {isFiltered && (
            <motion.span
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              className="text-[11px] text-[#64748b] tabular-nums"
            >
              <span style={{ fontWeight: 500 }}>{filteredRecords.toLocaleString()}</span>
              <span className="text-[#94a3b8]"> of {totalRecords.toLocaleString()}</span>
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {hasFilters && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearAll}
              className="text-[11px] text-[#dc2626]/70 hover:text-[#dc2626] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Clear all
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ------- Filter Editor (used in popover) -------

function FilterEditor({
  filter,
  columns,
  onSave,
  onCancel,
}: {
  filter?: FilterRule;
  columns: ColumnDef[];
  onSave: (filter: FilterRule) => void;
  onCancel: () => void;
}) {
  const [column, setColumn] = useState(filter?.column || columns[0]?.key || "");
  const [operator, setOperator] = useState(filter?.operator || "");
  const [value, setValue] = useState(filter?.value || "");

  const selectedCol = columns.find((c) => c.key === column);
  const operators = operatorsByType[selectedCol?.type || "string"] || operatorsByType.string;

  // Reset operator when column changes
  useEffect(() => {
    if (!filter) {
      const col = columns.find((c) => c.key === column);
      const ops = operatorsByType[col?.type || "string"] || operatorsByType.string;
      setOperator(ops[0].value);
      setValue("");
    }
  }, [column, columns, filter]);

  // Set initial operator
  useEffect(() => {
    if (!operator && operators.length > 0) {
      setOperator(operators[0].value);
    }
  }, [operator, operators]);

  const handleSave = () => {
    onSave({
      id: filter?.id || `filter-${Date.now()}`,
      column,
      operator: operator || operators[0].value,
      value,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] text-[#64748b] block mb-1" style={{ fontWeight: 500 }}>
          Column
        </label>
        <select
          className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#003a63] transition-colors"
          value={column}
          onChange={(e) => setColumn(e.target.value)}
        >
          {columns.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[11px] text-[#64748b] block mb-1" style={{ fontWeight: 500 }}>
          Condition
        </label>
        <select
          className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#003a63] transition-colors"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[11px] text-[#64748b] block mb-1" style={{ fontWeight: 500 }}>
          Value
        </label>
        {selectedCol?.type === "enum" && selectedCol.enumValues ? (
          <select
            className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#003a63] transition-colors"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            <option value="">Select...</option>
            {selectedCol.enumValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={
              selectedCol?.type === "number"
                ? "number"
                : selectedCol?.type === "date"
                ? "date"
                : "text"
            }
            placeholder={
              selectedCol?.type === "number"
                ? "Enter number..."
                : selectedCol?.type === "date"
                ? ""
                : "Enter value..."
            }
            className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#003a63] transition-colors"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            autoFocus
          />
        )}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-1.5 text-[12px] bg-[#003a63] text-white rounded-md hover:bg-[#002d4e] transition-colors"
          style={{ fontWeight: 500 }}
        >
          Apply
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 text-[12px] bg-[#f1f5f9] text-[#475569] rounded-md hover:bg-[#e2e8f0] transition-colors"
          style={{ fontWeight: 500 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}