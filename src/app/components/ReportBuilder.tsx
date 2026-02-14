import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Truck,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  Save,
  BarChart3,
  LineChart,
  PieChart,
  Pencil,
  Check,
  X,
  Database,
  MapPin,
  Fuel,
  Shield,
  AlertTriangle,
  Wrench,
  Columns3,
  Filter,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  type DataSourceDef,
} from "../services/geotab-mock";
import type { CategoryDef } from "../services/categories";
import type { InsightCategory, ReportTemplateDef } from "../services/report-templates";
import { useGeotab } from "../services/geotab-context";
import { useDataFetcher } from "../services/data-fetcher";
import { CategorySelector } from "./CategorySelector";
import { DataSourceSelector } from "./DataSourceSelector";
import { InsightCategorySelector } from "./InsightCategorySelector";
import { InsightSelector } from "./InsightSelector";
import { ReportPreview } from "./ReportPreview";
import { ReportOutline } from "./ReportOutline";
import { FilterBar, type FilterRule } from "./FilterBar";
import { ReportTable } from "./ReportTable";
import { ChartView, type ChartType } from "./ChartView";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { motion, AnimatePresence } from "motion/react";

type AggregateFn = "sum" | "avg" | "count" | "min" | "max";

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  Fuel,
  Shield,
  AlertTriangle,
  Wrench,
};

export function ReportBuilder() {
  // ----- Geotab Add-In context -----
  const { isLive, session } = useGeotab();
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources();

  // ----- State -----
  // Insight-First flow state
  const [insightCategory, setInsightCategory] = useState<InsightCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplateDef | null>(null);

  // Legacy flow state (for advanced custom reports)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(null);
  const [selectedSource, setSelectedSource] = useState<DataSourceDef | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [chartEnabled, setChartEnabled] = useState(false);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null);
  const [aggregateColumn, setAggregateColumn] = useState<string | null>(null);
  const [aggregateFn, setAggregateFn] = useState<AggregateFn>("sum");
  const [reportName, setReportName] = useState("Untitled Report");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    source: true,
    columns: true,
    summarize: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);

  // ----- Fetch data when source changes -----
  useEffect(() => {
    if (!selectedSource) {
      setRawData([]);
      return;
    }

    setIsLoading(true);

    dataFetcher
      .fetchDataSource(selectedSource.id)
      .then((data) => {
        setRawData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error(`Failed to load ${selectedSource.name} data`);
        setRawData([]);
        setIsLoading(false);
      });
  }, [selectedSource, dataFetcher]);

  const filteredData = useMemo(() => {
    if (!selectedSource) return [];
    let data = rawData;

    filters.forEach((filter) => {
      if (!filter.value && filter.value !== "0") return;
      const col = selectedSource.columns.find((c) => c.key === filter.column);
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
        } else if (col.type === "date") {
          const dateVal = new Date(String(val)).getTime();
          const dateFilter = new Date(filterVal).getTime();
          switch (filter.operator) {
            case "after": return dateVal > dateFilter;
            case "before": return dateVal < dateFilter;
            case "equals": return Math.abs(dateVal - dateFilter) < 86400000;
          }
        }
        return true;
      });
    });

    return data;
  }, [rawData, filters, selectedSource]);

  // ----- Handlers -----
  const handleSelectSource = useCallback(
    (source: DataSourceDef) => {
      if (source.id === selectedSource?.id) return;
      setIsLoading(true);
      setSelectedSource(source);
      setSelectedColumns(source.columns.map((c) => c.key));
      setFilters([]);
      setGroupByColumn(null);
      setAggregateColumn(null);
      setChartEnabled(false);
      setExpandedSections((prev) => ({
        ...prev,
        columns: true,
        summarize: false,
      }));
      // Simulate loading for progressive reveal
      setTimeout(() => setIsLoading(false), 400);
    },
    [selectedSource]
  );

  const handleToggleColumn = useCallback((key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleSelectAllColumns = useCallback(() => {
    if (selectedSource) {
      setSelectedColumns(selectedSource.columns.map((c) => c.key));
    }
  }, [selectedSource]);

  const handleDeselectAllColumns = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  const handleToggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: prev[section] === false ? true : false,
    }));
  }, []);

  const handleStartEditName = () => {
    setNameInput(reportName);
    setEditingName(true);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setReportName(nameInput.trim());
    }
    setEditingName(false);
  };

  const handleExport = () => {
    if (!selectedSource || filteredData.length === 0) return;
    const headers = selectedColumns
      .map(
        (key) =>
          selectedSource.columns.find((c) => c.key === key)?.label || key
      )
      .join(",");
    const rows = filteredData.map((row) =>
      selectedColumns
        .map((key) => {
          const val = row[key];
          return typeof val === "string" && val.includes(",")
            ? `"${val}"`
            : String(val ?? "");
        })
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportName.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV", {
      description: `${filteredData.length} records from ${selectedSource.name}`,
    });
  };

  const handleSave = () => {
    toast.success("Report saved", {
      description: `"${reportName}" has been saved.`,
    });
  };

  // ----- Workflow step tracker -----
  const currentStep = useMemo(() => {
    if (!selectedSource) return 0;
    if (selectedColumns.length === 0) return 1;
    if (filters.length === 0 && !groupByColumn) return 2;
    return 3;
  }, [selectedSource, selectedColumns, filters, groupByColumn]);

  // ----- Chart type selector options -----
  const chartOptions: { type: ChartType; icon: React.ElementType; label: string }[] = [
    { type: "bar", icon: BarChart3, label: "Bar" },
    { type: "line", icon: LineChart, label: "Line" },
    { type: "pie", icon: PieChart, label: "Pie" },
  ];

  return (
    <div
      className="flex flex-col h-screen bg-[#f0f4f8]"
      style={{ fontFamily: "var(--font-family)" }}
    >
      {/* ========== TOOLBAR ========== */}
      <header className="bg-[#003a63] text-white shrink-0 z-10">
        <div className="flex items-center h-12 px-3 lg:px-4 gap-3">
          {/* Left: Toggle + Branding */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setOutlineOpen(!outlineOpen)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title={outlineOpen ? "Close outline" : "Open outline"}
            >
              {outlineOpen ? (
                <PanelLeftClose className="w-4 h-4 text-white/70" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-white/70" />
              )}
            </button>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4.5 h-4.5 text-[#78be20]" />
              <span
                className="text-[14px] text-white/90 hidden sm:inline"
                style={{ fontWeight: 600 }}
              >
                Report Builder
              </span>
            </div>
          </div>

          {/* Center: Report name + workflow breadcrumb */}
          <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="px-2 py-0.5 rounded bg-white/15 text-white text-[13px] border border-white/20 focus:outline-none focus:border-white/40 w-48"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <Check className="w-3.5 h-3.5 text-[#78be20]" />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5 text-white/50" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEditName}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 transition-colors max-w-xs truncate group"
              >
                <span className="text-[13px] text-white/90 truncate" style={{ fontWeight: 500 }}>
                  {reportName}
                </span>
                <Pencil className="w-3 h-3 text-white/30 group-hover:text-white/60 shrink-0" />
              </button>
            )}

            {/* Workflow breadcrumb — only shows when a source is selected */}
            <AnimatePresence>
              {selectedSource && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="hidden lg:flex items-center gap-1 text-[11px]"
                >
                  <WorkflowDot active={currentStep >= 0} label={selectedSource.name} />
                  <ArrowRight className="w-2.5 h-2.5 text-white/20" />
                  <WorkflowDot active={currentStep >= 1} label={`${selectedColumns.length} cols`} />
                  <ArrowRight className="w-2.5 h-2.5 text-white/20" />
                  <WorkflowDot active={currentStep >= 2} label={filters.length > 0 ? `${filters.length} filters` : "Filters"} />
                  {chartEnabled && (
                    <>
                      <ArrowRight className="w-2.5 h-2.5 text-white/20" />
                      <WorkflowDot active label="Chart" />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Chart toggle */}
            <AnimatePresence>
              {selectedSource && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setChartEnabled(!chartEnabled)}
                        className={`p-1.5 rounded-md transition-all duration-200 ${
                          chartEnabled
                            ? "bg-[#78be20]/20 text-[#78be20] shadow-[inset_0_0_0_1px_rgba(120,190,32,0.3)]"
                            : "text-white/50 hover:text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {chartEnabled ? "Hide chart" : "Show chart"}
                    </TooltipContent>
                  </Tooltip>

                  {/* Chart type selector */}
                  <AnimatePresence>
                    {chartEnabled && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center ml-1 gap-0.5 bg-white/10 rounded-md p-0.5">
                          {chartOptions.map((opt) => (
                            <Tooltip key={opt.type}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setChartType(opt.type)}
                                  className={`p-1 rounded transition-all duration-150 ${
                                    chartType === opt.type
                                      ? "bg-white/20 text-white shadow-sm"
                                      : "text-white/40 hover:text-white/70"
                                  }`}
                                >
                                  <opt.icon className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>{opt.label} chart</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-px h-5 bg-white/15 mx-1 hidden sm:block" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSave}
                  disabled={!selectedSource}
                  className="p-1.5 rounded-md text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Save className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Save report</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleExport}
                  disabled={!selectedSource || filteredData.length === 0}
                  className="p-1.5 rounded-md text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Download className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Export CSV</TooltipContent>
            </Tooltip>

            {/* Connection indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-1.5 ml-1 pl-2 border-l border-white/15 cursor-default">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-[#78be20]" : "bg-amber-400 animate-pulse"}`} />
                  <span className="text-[11px] text-white/40">
                    {isLive ? "Live" : "Demo"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                {isLive ? (
                  <div className="text-[11px]">
                    <p style={{ fontWeight: 500 }}>Connected to MyGeotab</p>
                    {session && (
                      <p className="text-muted-foreground mt-0.5">
                        {session.database} &middot; {session.userName}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px]">
                    <p style={{ fontWeight: 500 }}>Demo Mode</p>
                    <p className="text-muted-foreground mt-0.5">
                      Using mock data &middot; Deploy to MyGeotab for live fleet data
                    </p>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* ========== MAIN LAYOUT ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Outline Panel */}
        <motion.aside
          animate={{ width: outlineOpen ? 280 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="shrink-0 bg-white border-r border-[#e2e8f0] overflow-hidden"
        >
          <div className="w-[280px] h-full overflow-y-auto">
            <ReportOutline
              selectedSource={selectedSource}
              onSelectSource={handleSelectSource}
              selectedColumns={selectedColumns}
              onToggleColumn={handleToggleColumn}
              onSelectAllColumns={handleSelectAllColumns}
              onDeselectAllColumns={handleDeselectAllColumns}
              groupByColumn={groupByColumn}
              onGroupByChange={setGroupByColumn}
              aggregateColumn={aggregateColumn}
              onAggregateColumnChange={setAggregateColumn}
              aggregateFn={aggregateFn}
              onAggregateFnChange={setAggregateFn}
              expandedSections={expandedSections}
              onToggleSection={handleToggleSection}
            />
          </div>
        </motion.aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedSource ? (
              <motion.div
                key="report-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col min-h-0"
              >
                {/* Filter Bar */}
                <FilterBar
                  columns={selectedSource.columns}
                  filters={filters}
                  onFiltersChange={setFilters}
                  totalRecords={rawData.length}
                  filteredRecords={filteredData.length}
                />

                {/* Scrollable content */}
                <div className="flex-1 overflow-auto p-4 lg:p-5">
                  <div className="max-w-[1400px] space-y-4">
                    {/* Chart */}
                    <AnimatePresence>
                      {chartEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <ChartView
                            data={filteredData}
                            columns={selectedSource.columns}
                            chartType={chartType}
                            groupByColumn={groupByColumn}
                            aggregateColumn={aggregateColumn}
                            aggregateFn={aggregateFn}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Data Table */}
                    <ReportTable
                      data={filteredData}
                      columns={selectedSource.columns}
                      selectedColumns={selectedColumns}
                      groupByColumn={groupByColumn}
                      aggregateColumn={aggregateColumn}
                      aggregateFn={aggregateFn}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </motion.div>
            ) : selectedTemplate ? (
              <motion.div
                key="report-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col min-h-0"
              >
                <ReportPreview
                  template={selectedTemplate}
                  onBack={() => {
                    setSelectedTemplate(null);
                    setInsightCategory(null);
                  }}
                  onExport={handleExport}
                  onSave={handleSave}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-auto"
              >
                {!insightCategory ? (
                  <InsightCategorySelector
                    selectedCategory={insightCategory}
                    onSelectCategory={setInsightCategory}
                  />
                ) : (
                  <InsightSelector
                    category={insightCategory}
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={setSelectedTemplate}
                    onBack={() => setInsightCategory(null)}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// -------- Workflow Dot (breadcrumb) --------
function WorkflowDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`px-1.5 py-0.5 rounded transition-all duration-200 ${
        active
          ? "bg-white/15 text-white/80"
          : "text-white/30"
      }`}
      style={{ fontWeight: active ? 500 : 400 }}
    >
      {label}
    </span>
  );
}

// -------- Rich Empty State --------
function EmptyState({
  onSelectSource,
}: {
  onSelectSource: (source: DataSourceDef) => void;
}) {
  const steps = [
    { icon: Database, label: "Choose data source", description: "Pick from fleet data" },
    { icon: Columns3, label: "Select columns", description: "Pick fields to display" },
    { icon: Filter, label: "Add filters", description: "Narrow your results" },
    { icon: BarChart3, label: "Visualize", description: "Charts & summaries" },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003a63]/10 to-[#78be20]/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-[#003a63]/40" />
          </div>
          <h2 className="text-[#003a63] mb-1.5">Build your report</h2>
          <p className="text-[14px] text-[#64748b] leading-relaxed max-w-sm mx-auto">
            Select a data source to get started. Your report will update live as you configure it.
          </p>
        </motion.div>

        {/* Workflow steps indicator */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-0 mb-8"
        >
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  i === 0
                    ? "bg-[#003a63] text-white shadow-md shadow-[#003a63]/20"
                    : "bg-[#f1f5f9] text-[#94a3b8]"
                }`}>
                  <step.icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-center">
                  <p className={`text-[10px] whitespace-nowrap ${
                    i === 0 ? "text-[#003a63]" : "text-[#94a3b8]"
                  }`} style={{ fontWeight: i === 0 ? 600 : 400 }}>
                    {step.label}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 lg:w-12 h-px bg-[#e2e8f0] mx-2 mt-[-12px]" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Data source cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[11px] uppercase tracking-wider text-[#94a3b8] mb-3 text-center" style={{ fontWeight: 600 }}>
            Available data sources
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {dataSources.map((source, i) => {
              const Icon = iconMap[source.icon] || MapPin;
              return (
                <motion.button
                  key={source.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  onClick={() => onSelectSource(source)}
                  className="group relative flex items-start gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-left hover:border-[#003a63]/30 hover:shadow-md hover:shadow-[#003a63]/5 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#f1f5f9] group-hover:bg-[#003a63]/[0.06] flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4 text-[#64748b] group-hover:text-[#003a63] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-[#1e293b] group-hover:text-[#003a63] transition-colors" style={{ fontWeight: 500 }}>
                      {source.name}
                    </p>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5 line-clamp-2">
                      {source.description}
                    </p>
                    <p className="text-[10px] text-[#cbd5e1] mt-1.5" style={{ fontWeight: 500 }}>
                      {source.columns.length} fields
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#cbd5e1] group-hover:text-[#003a63]/40 absolute top-3.5 right-3 transition-all group-hover:translate-x-0.5" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}