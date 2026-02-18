import { useMemo, useState } from "react";
import {
  MapPin,
  Fuel,
  Shield,
  AlertTriangle,
  Wrench,
  ChevronRight,
  Check,
  Search,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { dataSources, type DataSourceDef } from "../../services/geotab-mock";
import { Checkbox } from "../../services/zenith-adapter";
import { motion, AnimatePresence } from "motion/react";

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  Fuel,
  Shield,
  AlertTriangle,
  Wrench,
};

type AggregateFn = "sum" | "avg" | "count" | "min" | "max";

interface ReportOutlineProps {
  selectedSource: DataSourceDef | null;
  onSelectSource: (source: DataSourceDef) => void;
  selectedColumns: string[];
  onToggleColumn: (key: string) => void;
  onSelectAllColumns: () => void;
  onDeselectAllColumns: () => void;
  groupByColumn: string | null;
  onGroupByChange: (col: string | null) => void;
  aggregateColumn: string | null;
  onAggregateColumnChange: (col: string | null) => void;
  aggregateFn: AggregateFn;
  onAggregateFnChange: (fn: AggregateFn) => void;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
}

function SectionHeader({
  title,
  expanded,
  onToggle,
  badge,
  hint,
  icon,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  hint?: string;
  icon?: React.ElementType;
}) {
  const IconComp = icon;
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-2.5 px-2 group rounded-md hover:bg-[#f8fafc] transition-colors"
    >
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#64748b]" />
        </motion.div>
        {IconComp && <IconComp className="w-3.5 h-3.5 text-[#94a3b8]" />}
        <span
          className="text-[11px] uppercase tracking-widest text-[#64748b] group-hover:text-[#003a63] transition-colors"
          style={{ fontWeight: 600, letterSpacing: "0.08em" }}
        >
          {title}
        </span>
        {hint && !expanded && (
          <span className="text-[10px] text-[#94a3b8] normal-case tracking-normal ml-0.5" style={{ fontWeight: 400 }}>
            {hint}
          </span>
        )}
      </div>
      {badge && (
        <span className="text-[10px] text-[#64748b] bg-[#e8f0f8] px-1.5 py-0.5 rounded" style={{ fontWeight: 500 }}>
          {badge}
        </span>
      )}
    </button>
  );
}

const columnTypeBadge: Record<string, { label: string; className: string }> = {
  string: { label: "Abc", className: "bg-[#f1f5f9] text-[#475569]" },
  number: { label: "#", className: "bg-[#eff6ff] text-[#2563eb]" },
  date: { label: "Date", className: "bg-[#faf5ff] text-[#7c3aed]" },
  enum: { label: "List", className: "bg-[#f0fdf4] text-[#16a34a]" },
};

export function ReportOutline({
  selectedSource,
  onSelectSource,
  selectedColumns,
  onToggleColumn,
  onSelectAllColumns,
  onDeselectAllColumns,
  groupByColumn,
  onGroupByChange,
  aggregateColumn,
  onAggregateColumnChange,
  aggregateFn,
  onAggregateFnChange,
  expandedSections,
  onToggleSection,
}: ReportOutlineProps) {
  const [columnSearch, setColumnSearch] = useState("");

  const numericColumns = useMemo(
    () => selectedSource?.columns.filter((c) => c.aggregatable) || [],
    [selectedSource]
  );

  const groupableColumns = useMemo(
    () =>
      selectedSource?.columns.filter(
        (c) => c.type === "string" || c.type === "enum"
      ) || [],
    [selectedSource]
  );

  const filteredColumns = useMemo(() => {
    if (!selectedSource) return [];
    if (!columnSearch.trim()) return selectedSource.columns;
    const q = columnSearch.toLowerCase();
    return selectedSource.columns.filter(
      (c) => c.label.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
    );
  }, [selectedSource, columnSearch]);

  const allSelected = selectedSource
    ? selectedColumns.length === selectedSource.columns.length
    : false;

  return (
    <div className="px-3 py-3 space-y-0.5">
      {/* DATA SOURCE */}
      <SectionHeader
        title="Data Source"
        expanded={expandedSections.source !== false}
        onToggle={() => onToggleSection("source")}
      />
      <AnimatePresence>
        {expandedSections.source !== false && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pb-3">
              {dataSources.map((source) => {
                const Icon = iconMap[source.icon] || MapPin;
                const isSelected = selectedSource?.id === source.id;
                return (
                  <button
                    key={source.id}
                    onClick={() => onSelectSource(source)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-[#003a63] text-white shadow-sm shadow-[#003a63]/20"
                        : "hover:bg-[#f1f5f9] text-[#334155]"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? "text-[#78be20]" : "text-[#64748b]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] block truncate" style={{ fontWeight: isSelected ? 500 : 400 }}>
                        {source.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-white/50 block mt-0.5">
                          {source.columns.length} fields available
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3 h-3 shrink-0 text-[#78be20]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progressive disclosure: only show columns + summarize when source is selected */}
      <AnimatePresence>
        {selectedSource && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            {/* Divider */}
            <div className="border-t border-[#e2e8f0] my-2" />

            {/* COLUMNS */}
            <SectionHeader
              title="Columns"
              expanded={expandedSections.columns !== false}
              onToggle={() => onToggleSection("columns")}
              badge={`${selectedColumns.length}/${selectedSource.columns.length}`}
            />
            <AnimatePresence>
              {expandedSections.columns !== false && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-3">
                    {/* Search + All/None toggle */}
                    <div className="flex items-center gap-2 px-1 pb-2">
                      <div className="flex-1 relative">
                        <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                        <input
                          type="text"
                          value={columnSearch}
                          onChange={(e) => setColumnSearch(e.target.value)}
                          placeholder="Search fields..."
                          className="w-full pl-6.5 pr-6 py-1.5 text-[12px] bg-[#f8fafc] border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#003a63]/30 focus:bg-white transition-colors placeholder:text-[#cbd5e1]"
                        />
                        {columnSearch && (
                          <button
                            onClick={() => setColumnSearch("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[#e2e8f0]"
                          >
                            <X className="w-2.5 h-2.5 text-[#94a3b8]" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={allSelected ? onDeselectAllColumns : onSelectAllColumns}
                          className="text-[10px] px-1.5 py-1 rounded bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#003a63] transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          {allSelected ? "None" : "All"}
                        </button>
                      </div>
                    </div>

                    {/* Column list */}
                    <div className="space-y-0.5 max-h-[260px] overflow-y-auto scrollbar-thin">
                      {filteredColumns.map((col) => {
                        const isChecked = selectedColumns.includes(col.key);
                        const badge = columnTypeBadge[col.type] || columnTypeBadge.string;
                        return (
                          <label
                            key={col.key}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-100 ${
                              isChecked
                                ? "bg-[#003a63]/[0.04] hover:bg-[#003a63]/[0.07]"
                                : "hover:bg-[#f8fafc] opacity-50 hover:opacity-75"
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={() => onToggleColumn(col.key)}
                              className="w-3.5 h-3.5"
                            />
                            <span
                              className="text-[12px] flex-1 text-[#1e293b] truncate"
                              style={{ fontWeight: isChecked ? 450 : 400 }}
                            >
                              {col.label}
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.5 rounded ${badge.className}`}
                              style={{ fontWeight: 600 }}
                            >
                              {badge.label}
                            </span>
                          </label>
                        );
                      })}
                      {filteredColumns.length === 0 && (
                        <p className="text-[11px] text-[#94a3b8] text-center py-4">
                          No fields match "{columnSearch}"
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="border-t border-[#e2e8f0] my-2" />

            {/* SUMMARIZE — progressive: collapsed by default with hint */}
            <SectionHeader
              title="Summarize"
              expanded={expandedSections.summarize !== false}
              onToggle={() => onToggleSection("summarize")}
              badge={groupByColumn || aggregateColumn ? "Active" : undefined}
              hint={!groupByColumn && !aggregateColumn ? "· optional" : undefined}
              icon={SlidersHorizontal}
            />
            <AnimatePresence>
              {expandedSections.summarize !== false && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-1 pb-3">
                    {/* Contextual hint */}
                    {!groupByColumn && !aggregateColumn && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-[#003a63]/[0.03] border border-[#003a63]/[0.06]"
                      >
                        <Sparkles className="w-3 h-3 text-[#003a63]/30 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-[#64748b] leading-relaxed">
                          Group rows and apply aggregate functions to create summaries and enable chart visualizations.
                        </p>
                      </motion.div>
                    )}

                    <div>
                      <label className="text-[11px] text-[#64748b] block mb-1" style={{ fontWeight: 500 }}>
                        Group rows by
                      </label>
                      <select
                        className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#003a63] focus:ring-1 focus:ring-[#003a63]/20 text-[#1e293b] transition-colors"
                        value={groupByColumn || ""}
                        onChange={(e) => onGroupByChange(e.target.value || null)}
                      >
                        <option value="">No grouping</option>
                        {groupableColumns.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Progressive: only show Measure when Group By is set */}
                    <AnimatePresence>
                      {groupByColumn && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div>
                            <label className="text-[11px] text-[#64748b] block mb-1" style={{ fontWeight: 500 }}>
                              Measure
                            </label>
                            <select
                              className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#e2e8f0] rounded-md focus:outline-none focus:border-[#003a63] focus:ring-1 focus:ring-[#003a63]/20 text-[#1e293b] transition-colors"
                              value={aggregateColumn || ""}
                              onChange={(e) => onAggregateColumnChange(e.target.value || null)}
                            >
                              <option value="">Select measure...</option>
                              {numericColumns.map((c) => (
                                <option key={c.key} value={c.key}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Progressive: only show Function when Measure is set */}
                    <AnimatePresence>
                      {groupByColumn && aggregateColumn && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div>
                            <label className="text-[11px] text-[#64748b] block mb-1" style={{ fontWeight: 500 }}>
                              Function
                            </label>
                            <div className="grid grid-cols-5 gap-1">
                              {(
                                [
                                  { value: "sum", label: "Sum" },
                                  { value: "avg", label: "Avg" },
                                  { value: "count", label: "Count" },
                                  { value: "min", label: "Min" },
                                  { value: "max", label: "Max" },
                                ] as { value: AggregateFn; label: string }[]
                              ).map((fn) => (
                                <button
                                  key={fn.value}
                                  onClick={() => onAggregateFnChange(fn.value)}
                                  className={`text-[11px] py-1.5 rounded-md transition-all duration-150 ${
                                    aggregateFn === fn.value
                                      ? "bg-[#003a63] text-white shadow-sm"
                                      : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                                  }`}
                                  style={{ fontWeight: 500 }}
                                >
                                  {fn.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick action: clear summarize */}
                    <AnimatePresence>
                      {(groupByColumn || aggregateColumn) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <button
                            onClick={() => {
                              onGroupByChange(null);
                              onAggregateColumnChange(null);
                            }}
                            className="text-[11px] text-[#dc2626] hover:text-[#b91c1c] transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            Clear summarize
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint when no source selected */}
      <AnimatePresence>
        {!selectedSource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 px-2"
          >
            <div className="flex items-start gap-2 px-3 py-3 rounded-lg bg-[#003a63]/[0.03] border border-dashed border-[#003a63]/10">
              <Sparkles className="w-3.5 h-3.5 text-[#003a63]/25 mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                Pick a data source above to configure columns, filters, and visualizations.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}