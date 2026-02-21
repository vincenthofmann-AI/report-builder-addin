/**
 * Report Builder V9 - Superset-Inspired Experience
 * - MyGeotab native storage integration
 * - Interactive charts + tables
 * - Drag-and-drop query building
 * - Progressive disclosure
 */

import { useState, useMemo, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Table,
  type IListColumn,
  type ITable,
  Card,
  Button,
  SearchInput,
  Divider,
  Modal,
  TextInput,
  Alert,
} from "@geotab/zenith";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useGeotab } from "../services/geotab-context";
import { useDataFetcher } from "../services/data-fetcher";
import type { DataSourceDef } from "../services/geotab-mock";
import {
  saveReportToMyGeotab,
  updateReportInMyGeotab,
  loadReportsFromMyGeotab,
  deleteReportFromMyGeotab,
  saveReportToLocalStorage,
  loadReportsFromLocalStorage,
  deleteReportFromLocalStorage,
  updateReportInLocalStorage,
  type SavedReport,
} from "../services/report-storage";
import "./report-builder-v9.css";

// Query Model (exported for report-storage.ts)
export interface ReportQuery {
  dataSource: DataSourceDef | null;
  columns: ColumnConfig[];
  timeFilter: TimeFilter | null;
  filters: Filter[];
  groupBy: string[];
  metrics: Metric[];
  chartType: ChartType;
  limit: number;
}

interface ColumnConfig {
  key: string;
  label: string;
  type: string;
}

interface TimeFilter {
  column: string;
  range: "last_7_days" | "last_30_days" | "this_month" | "custom";
}

type Filter = {
  type: "text" | "numeric";
  column: string;
  operator: string;
  value: string;
};

interface Metric {
  field: string;
  aggregation: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";
  label: string;
}

type ChartType = "table" | "bar" | "line" | "area";

interface ReportRow {
  id: string;
  [key: string]: unknown;
}

const ITEM_TYPES = {
  COLUMN: "column",
  METRIC: "metric",
};

// Draggable Field Component
function DraggableField({ field, type }: { field: ColumnConfig; type: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPES.COLUMN,
    item: { field, dragType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const icon = field.type === "number" ? "📊" : field.type === "date" ? "📅" : "📝";

  return (
    <div
      ref={drag}
      className={`rb9-field ${isDragging ? "rb9-field--dragging" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="rb9-field__icon">{icon}</span>
      <span className="rb9-field__label">{field.label}</span>
      <span className="rb9-field__type">{field.type}</span>
    </div>
  );
}

// Drop Zone Component
function DropZone({
  label,
  items,
  onDrop,
  onRemove,
  emptyText,
  accept = ITEM_TYPES.COLUMN,
}: {
  label: string;
  items: any[];
  onDrop: (item: any) => void;
  onRemove: (index: number) => void;
  emptyText?: string;
  accept?: string;
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: (item: any) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div className="rb9-dropzone">
      <div className="rb9-dropzone__label">{label}</div>
      <div
        ref={drop}
        className={`rb9-dropzone__area ${isOver && canDrop ? "rb9-dropzone__area--active" : ""}`}
      >
        {items.length === 0 ? (
          <span className="rb9-dropzone__empty">{emptyText || "Drop here"}</span>
        ) : (
          items.map((item, index) => (
            <div key={index} className="rb9-dropped-item">
              <span className="rb9-dropped-item__label">{item.label || item.field?.label}</span>
              <button
                className="rb9-dropped-item__remove"
                onClick={() => onRemove(index)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function ReportBuilderV9() {
  const { api, isLive, isReady } = useGeotab();
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources() || [];

  // Query State
  const [query, setQuery] = useState<ReportQuery>(() => ({
    dataSource: dataSources.length > 0 ? dataSources[0] : null,
    columns: [],
    timeFilter: null,
    filters: [],
    groupBy: [],
    metrics: [],
    chartType: "table",
    limit: 100,
  }));

  // UI State
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"data" | "chart">("data");
  const [expandedSections, setExpandedSections] = useState({
    time: false,
    filters: false,
    groupBy: false,
    metrics: false,
  });

  // Report Storage State
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved reports on mount
  useEffect(() => {
    const loadSavedReports = async () => {
      if (isLive && api) {
        // Load from MyGeotab
        const reports = await loadReportsFromMyGeotab(api);
        setSavedReports(reports);
      } else if (isReady) {
        // Load from localStorage in demo mode
        const reports = loadReportsFromLocalStorage();
        setSavedReports(reports);
      }
    };

    loadSavedReports();
  }, [api, isLive, isReady]);

  // Auto-load preview on data source change
  useEffect(() => {
    if (!query.dataSource || rawData.length > 0) return;

    setIsLoading(true);
    dataFetcher
      .fetchDataSource(query.dataSource.id)
      .then((data) => {
        setRawData(data.slice(0, 10)); // Preview: 10 rows
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching preview:", error);
        setRawData([]);
        setIsLoading(false);
      });
  }, [query.dataSource]);

  // Run full query
  const runQuery = () => {
    if (!query.dataSource) return;

    setIsLoading(true);
    dataFetcher
      .fetchDataSource(query.dataSource.id)
      .then((data) => {
        // Apply grouping/aggregation if configured
        let processedData = data;
        if (query.groupBy.length > 0 && query.metrics.length > 0) {
          processedData = applyGrouping(data);
        }
        setRawData(processedData.slice(0, query.limit));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setRawData([]);
        setIsLoading(false);
      });
  };

  // Apply grouping and metrics
  const applyGrouping = (data: any[]) => {
    if (query.groupBy.length === 0) return data;

    const groups: Record<string, any[]> = {};
    data.forEach((row) => {
      const groupKey = query.groupBy.map((field) => row[field] || "Unknown").join("|||");
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(row);
    });

    const results: any[] = [];
    Object.entries(groups).forEach(([groupKey, groupRows]) => {
      const result: any = {};
      const groupValues = groupKey.split("|||");
      query.groupBy.forEach((field, idx) => {
        result[field] = groupValues[idx];
      });

      query.metrics.forEach((metric) => {
        const values = groupRows
          .map((row) => Number(row[metric.field]))
          .filter((v) => !isNaN(v));

        switch (metric.aggregation) {
          case "SUM":
            result[metric.label] = values.reduce((a, b) => a + b, 0);
            break;
          case "AVG":
            result[metric.label] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case "COUNT":
            result[metric.label] = groupRows.length;
            break;
          case "MIN":
            result[metric.label] = values.length > 0 ? Math.min(...values) : 0;
            break;
          case "MAX":
            result[metric.label] = values.length > 0 ? Math.max(...values) : 0;
            break;
        }
      });

      results.push(result);
    });

    return results;
  };

  // Table entities
  const entities: ReportRow[] = useMemo(() => {
    return rawData.map((row, index) => ({
      id: `row-${index}`,
      ...row,
    }));
  }, [rawData]);

  // Table columns
  const tableColumns: IListColumn<ReportRow>[] = useMemo(() => {
    if (!query.dataSource) return [];

    const columnsToShow = query.columns.length > 0
      ? query.columns
      : query.dataSource.columns;

    const displayColumns = query.groupBy.length > 0
      ? [...query.groupBy, ...query.metrics.map(m => m.label)]
      : columnsToShow.map(c => c.key);

    return query.dataSource.columns
      .filter(col => displayColumns.includes(col.key) || displayColumns.includes(col.label))
      .concat(
        query.metrics.map(m => ({
          key: m.label,
          label: m.label,
          type: "number",
          filterable: false,
          sortable: true,
          aggregatable: false,
        }))
      )
      .map((col) => {
        const sanitizedId = (col.key || col.label).replace(/[^a-zA-Z0-9_]/g, '_');

        return {
          id: sanitizedId,
          title: col.label,
          sortable: true,
          visible: true,
          render: (entity: ReportRow) => {
            const value = entity[col.key] || entity[col.label];
            if (value == null || value === "") return "—";

            if (col.type === "date") {
              try {
                return new Date(String(value)).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              } catch {
                return String(value);
              }
            }

            if (col.type === "number") {
              return Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 1,
              });
            }

            return String(value);
          },
        };
      });
  }, [query, rawData]);

  const tableConfig: ITable<ReportRow> | null = useMemo(() => {
    if (tableColumns.length === 0 || entities.length === 0) return null;

    return {
      entities,
      columns: tableColumns,
      isLoading,
      sortable: {
        defaultSort: {
          column: tableColumns[0].id,
          direction: "asc" as const,
        },
      },
      height: "100%",
    };
  }, [entities, tableColumns, isLoading]);

  // Chart data
  const chartData = useMemo(() => {
    if (query.groupBy.length === 0 || query.metrics.length === 0) return [];

    return entities.map((row) => {
      const point: any = {};
      query.groupBy.forEach(field => {
        point.name = row[field];
      });
      query.metrics.forEach(metric => {
        point[metric.label] = row[metric.label];
      });
      return point;
    });
  }, [entities, query.groupBy, query.metrics]);

  // Report Management Handlers
  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      setSaveError("Report name is required");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const reportData = {
        name: reportName.trim(),
        description: reportDescription.trim() || undefined,
        query,
      };

      if (currentReportId) {
        // Update existing report
        const existingReport = savedReports.find(r => r.id === currentReportId);
        if (!existingReport) {
          throw new Error("Report not found");
        }

        const updatedReport: SavedReport = {
          ...existingReport,
          ...reportData,
        };

        if (isLive && api) {
          await updateReportInMyGeotab(api, updatedReport);
        } else {
          updateReportInLocalStorage(updatedReport);
        }

        setSavedReports(prev => prev.map(r => r.id === currentReportId ? updatedReport : r));
      } else {
        // Save new report
        let savedReport: SavedReport;
        if (isLive && api) {
          savedReport = await saveReportToMyGeotab(api, reportData);
        } else {
          savedReport = saveReportToLocalStorage(reportData);
        }

        setSavedReports(prev => [savedReport, ...prev]);
        setCurrentReportId(savedReport.id);
      }

      setIsSaveModalOpen(false);
      setReportName("");
      setReportDescription("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save report");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadReport = (report: SavedReport) => {
    setQuery(report.query);
    setCurrentReportId(report.id);
    setReportName(report.name);
    setReportDescription(report.description || "");
    setRawData([]);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      if (isLive && api) {
        await deleteReportFromMyGeotab(api, reportId);
      } else {
        deleteReportFromLocalStorage(reportId);
      }

      setSavedReports(prev => prev.filter(r => r.id !== reportId));

      if (currentReportId === reportId) {
        setCurrentReportId(null);
        setReportName("");
        setReportDescription("");
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
      alert("Failed to delete report. Please try again.");
    }
  };

  const handleNewReport = () => {
    if (currentReportId && confirm("Start a new report? Unsaved changes will be lost.")) {
      setQuery({
        dataSource: dataSources.length > 0 ? dataSources[0] : null,
        columns: [],
        timeFilter: null,
        filters: [],
        groupBy: [],
        metrics: [],
        chartType: "table",
        limit: 100,
      });
      setCurrentReportId(null);
      setReportName("");
      setReportDescription("");
      setRawData([]);
    } else if (!currentReportId) {
      // Already on new report, just clear
      setQuery({
        dataSource: dataSources.length > 0 ? dataSources[0] : null,
        columns: [],
        timeFilter: null,
        filters: [],
        groupBy: [],
        metrics: [],
        chartType: "table",
        limit: 100,
      });
      setRawData([]);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="rb9">
        {/* Header */}
        <div className="rb9__header">
          <div className="rb9__header-left">
            <h1 className="rb9__title">
              {currentReportId ? reportName || "Fleet Reports" : "Fleet Reports"}
            </h1>
            {isLive && <span className="rb9__badge rb9__badge--live">Live</span>}
            {!isLive && isReady && <span className="rb9__badge rb9__badge--demo">Demo</span>}
            {currentReportId && <span className="rb9__badge" style={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}>Saved</span>}
          </div>
          <div className="rb9__header-right" style={{ display: "flex", gap: "12px" }}>
            <Button variant="secondary" onClick={handleNewReport}>
              📄 New
            </Button>
            <Button variant="secondary" onClick={() => setIsSaveModalOpen(true)} disabled={!query.dataSource}>
              💾 Save
            </Button>
            <Button variant="primary" onClick={runQuery} disabled={!query.dataSource || isLoading}>
              {isLoading ? "⟳ Running..." : "⚡ Run Query"}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="rb9__body">
          {/* Left: Query Builder */}
          <aside className="rb9__sidebar">
            {/* Saved Reports */}
            {savedReports.length > 0 && (
              <>
                <div className="rb9__section">
                  <div className="rb9__section-header">
                    <span className="rb9__section-title">📁 My Reports</span>
                  </div>
                  <div className="rb9__saved-reports">
                    {savedReports.slice(0, 5).map((report) => (
                      <div
                        key={report.id}
                        className={`rb9__saved-report ${currentReportId === report.id ? "rb9__saved-report--active" : ""}`}
                      >
                        <button
                          className="rb9__saved-report-load"
                          onClick={() => handleLoadReport(report)}
                          title={report.description || report.name}
                        >
                          <span className="rb9__saved-report-name">{report.name}</span>
                          <span className="rb9__saved-report-date">
                            {new Date(report.modifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </button>
                        <button
                          className="rb9__saved-report-delete"
                          onClick={() => handleDeleteReport(report.id)}
                          title="Delete report"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <Divider />
              </>
            )}

            {/* Data Source */}
            <div className="rb9__section">
              <div className="rb9__section-header">
                <span className="rb9__section-title">📊 Data Source</span>
              </div>
              <select
                value={query.dataSource?.id || ""}
                onChange={(e) => {
                  const ds = dataSources.find((d) => d.id === e.target.value);
                  setQuery((prev) => ({
                    ...prev,
                    dataSource: ds || null,
                    columns: [],
                    groupBy: [],
                    metrics: [],
                  }));
                  setRawData([]);
                }}
                className="rb9__select"
              >
                {dataSources.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name}
                  </option>
                ))}
              </select>
            </div>

            <Divider />

            {/* Available Fields */}
            <div className="rb9__section">
              <div className="rb9__section-header">
                <span className="rb9__section-title">Available Fields</span>
              </div>
              <div className="rb9__fields">
                {query.dataSource?.columns.map((col) => (
                  <DraggableField key={col.key} field={col} type="dimension" />
                ))}
              </div>
            </div>
          </aside>

          {/* Center: Query Configuration */}
          <main className="rb9__config">
            <div className="rb9__config-scroll">
              {/* Columns */}
              <DropZone
                label="📝 Columns"
                items={query.columns}
                onDrop={(item) => {
                  if (item.field && !query.columns.find(c => c.key === item.field.key)) {
                    setQuery(prev => ({ ...prev, columns: [...prev.columns, item.field] }));
                  }
                }}
                onRemove={(index) => {
                  setQuery(prev => ({ ...prev, columns: prev.columns.filter((_, i) => i !== index) }));
                }}
                emptyText="Drop columns to display"
              />

              <Divider />

              {/* Group By */}
              <DropZone
                label="📊 Group By"
                items={query.groupBy.map(key => {
                  const col = query.dataSource?.columns.find(c => c.key === key);
                  return { label: col?.label || key };
                })}
                onDrop={(item) => {
                  if (item.field && !query.groupBy.includes(item.field.key)) {
                    setQuery(prev => ({ ...prev, groupBy: [...prev.groupBy, item.field.key] }));
                  }
                }}
                onRemove={(index) => {
                  setQuery(prev => ({ ...prev, groupBy: prev.groupBy.filter((_, i) => i !== index) }));
                }}
                emptyText="Drop fields to group by"
              />

              <Divider />

              {/* Metrics */}
              <div className="rb9__section">
                <div className="rb9__section-header">
                  <span className="rb9__section-title">📈 Metrics</span>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    const numericFields = query.dataSource?.columns.filter(c => c.type === "number") || [];
                    if (numericFields.length > 0) {
                      setQuery(prev => ({
                        ...prev,
                        metrics: [
                          ...prev.metrics,
                          {
                            field: numericFields[0].key,
                            aggregation: "SUM",
                            label: `SUM(${numericFields[0].label})`,
                          },
                        ],
                      }));
                    }
                  }}
                >
                  + Add Metric
                </Button>
                {query.metrics.map((metric, idx) => (
                  <div key={idx} className="rb9__metric">
                    <select
                      value={metric.aggregation}
                      onChange={(e) => {
                        const newMetrics = [...query.metrics];
                        newMetrics[idx].aggregation = e.target.value as any;
                        newMetrics[idx].label = `${e.target.value}(${metric.field})`;
                        setQuery(prev => ({ ...prev, metrics: newMetrics }));
                      }}
                      className="rb9__select rb9__select--small"
                    >
                      <option value="SUM">SUM</option>
                      <option value="AVG">AVG</option>
                      <option value="COUNT">COUNT</option>
                      <option value="MIN">MIN</option>
                      <option value="MAX">MAX</option>
                    </select>
                    <select
                      value={metric.field}
                      onChange={(e) => {
                        const newMetrics = [...query.metrics];
                        newMetrics[idx].field = e.target.value;
                        const field = query.dataSource?.columns.find(c => c.key === e.target.value);
                        newMetrics[idx].label = `${metric.aggregation}(${field?.label || e.target.value})`;
                        setQuery(prev => ({ ...prev, metrics: newMetrics }));
                      }}
                      className="rb9__select rb9__select--small"
                    >
                      {query.dataSource?.columns.filter(c => c.type === "number").map(f => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="rb9__metric-remove"
                      onClick={() => {
                        setQuery(prev => ({ ...prev, metrics: prev.metrics.filter((_, i) => i !== idx) }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <Divider />

              {/* Chart Type */}
              <div className="rb9__section">
                <div className="rb9__section-header">
                  <span className="rb9__section-title">📉 Chart Type</span>
                </div>
                <select
                  value={query.chartType}
                  onChange={(e) => setQuery(prev => ({ ...prev, chartType: e.target.value as ChartType }))}
                  className="rb9__select"
                >
                  <option value="table">Table Only</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>
            </div>
          </main>

          {/* Right: Results */}
          <aside className="rb9__results">
            {/* Tabs */}
            <div className="rb9__tabs">
              <button
                className={`rb9__tab ${activeTab === "data" ? "rb9__tab--active" : ""}`}
                onClick={() => setActiveTab("data")}
              >
                📊 Data ({entities.length})
              </button>
              {query.chartType !== "table" && chartData.length > 0 && (
                <button
                  className={`rb9__tab ${activeTab === "chart" ? "rb9__tab--active" : ""}`}
                  onClick={() => setActiveTab("chart")}
                >
                  📈 Chart
                </button>
              )}
            </div>

            {/* Results Content */}
            <div className="rb9__results-content">
              {activeTab === "data" && (
                <>
                  {!tableConfig ? (
                    <div className="rb9__empty">
                      <div className="rb9__empty-title">No data</div>
                      <div className="rb9__empty-subtitle">
                        {!query.dataSource ? "Select a data source" : isLoading ? "Loading..." : "Run query to see data"}
                      </div>
                    </div>
                  ) : (
                    <Card style={{ height: "100%", padding: 0, overflow: "hidden" }}>
                      <Table {...tableConfig}>
                        <Table.Pagination rowsPerPage={50} />
                      </Table>
                    </Card>
                  )}
                </>
              )}

              {activeTab === "chart" && query.chartType !== "table" && (
                <Card style={{ height: "100%", padding: 16 }}>
                  {chartData.length === 0 ? (
                    <div className="rb9__empty">
                      <div className="rb9__empty-title">No chart data</div>
                      <div className="rb9__empty-subtitle">Add grouping and metrics to see a chart</div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      {query.chartType === "bar" ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#dadce0" />
                          <XAxis dataKey="name" tick={{ fill: '#5f6368', fontSize: 12 }} stroke="#dadce0" />
                          <YAxis tick={{ fill: '#5f6368', fontSize: 12 }} stroke="#dadce0" />
                          <Tooltip />
                          <Legend />
                          {query.metrics.map(metric => (
                            <Bar key={metric.label} dataKey={metric.label} fill="#1a73e8" radius={[4, 4, 0, 0]} />
                          ))}
                        </BarChart>
                      ) : (
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#dadce0" />
                          <XAxis dataKey="name" tick={{ fill: '#5f6368', fontSize: 12 }} stroke="#dadce0" />
                          <YAxis tick={{ fill: '#5f6368', fontSize: 12 }} stroke="#dadce0" />
                          <Tooltip />
                          <Legend />
                          {query.metrics.map(metric => (
                            <Line key={metric.label} dataKey={metric.label} stroke="#1a73e8" strokeWidth={2} />
                          ))}
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </Card>
              )}
            </div>
          </aside>
        </div>

        {/* Save Modal */}
        {isSaveModalOpen && (
          <Modal
            title={currentReportId ? "Update Report" : "Save Report"}
            onClose={() => {
              setIsSaveModalOpen(false);
              setSaveError(null);
            }}
            footer={
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsSaveModalOpen(false);
                    setSaveError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveReport}
                  disabled={isSaving || !reportName.trim()}
                >
                  {isSaving ? "Saving..." : currentReportId ? "Update" : "Save"}
                </Button>
              </>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {saveError && (
                <Alert variant="error" title="Error">
                  {saveError}
                </Alert>
              )}

              <div>
                <label htmlFor="report-name" style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                  Report Name *
                </label>
                <TextInput
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Fleet Distance Summary"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="report-description" style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                  Description (optional)
                </label>
                <textarea
                  id="report-description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Brief description of what this report shows..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    color: "#1a1a1a",
                    backgroundColor: "#fff",
                    border: "1px solid #d0d0d0",
                    borderRadius: "6px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ padding: "12px", backgroundColor: "#f5f5f5", borderRadius: "6px", fontSize: "13px" }}>
                <strong>Report Configuration:</strong>
                <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                  <li>Data Source: {query.dataSource?.name || "None"}</li>
                  <li>Columns: {query.columns.length > 0 ? query.columns.map(c => c.label).join(", ") : "All"}</li>
                  {query.groupBy.length > 0 && <li>Group By: {query.groupBy.join(", ")}</li>}
                  {query.metrics.length > 0 && <li>Metrics: {query.metrics.map(m => m.label).join(", ")}</li>}
                  <li>Chart: {query.chartType}</li>
                </ul>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DndProvider>
  );
}
