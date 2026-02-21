/**
 * ReportPreview - Step 3 of template-driven flow
 * Shows report data with Figma-style title bar and refinement controls
 */

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  type IListColumn,
  type ITable,
  Button,
  Modal,
  TextInput,
  Alert,
} from "@geotab/zenith";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useGeotab } from "../services/geotab-context";
import { useDataFetcher } from "../services/data-fetcher";
import type { ReportTemplate } from "../data/templates";
import {
  saveReportToMyGeotab,
  saveReportToLocalStorage,
  type SavedReport,
} from "../services/report-storage";
import "./report-preview.css";

interface ReportPreviewProps {
  template: ReportTemplate;
  onBack: () => void;
}

interface ReportRow {
  id: string;
  [key: string]: unknown;
}

const CHART_COLORS = [
  "#1a73e8", "#34a853", "#fbbc04", "#ea4335", "#4285f4",
  "#9334e6", "#0d9488", "#dc2626", "#ea580c", "#65a30d",
];

export function ReportPreview({ template, onBack }: ReportPreviewProps) {
  const { api, isLive } = useGeotab();
  const dataFetcher = useDataFetcher();

  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"data" | "chart">("data");

  // Save modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [reportName, setReportName] = useState(template.name);
  const [reportDescription, setReportDescription] = useState(template.description);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadReportData();
  }, [template]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const data = await dataFetcher.fetchDataSource(template.dataSource);
      setRawData(data);
    } catch (error) {
      console.error("Error loading report data:", error);
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Table entities
  const entities: ReportRow[] = useMemo(() => {
    return rawData.slice(0, 100).map((row, index) => ({
      id: `row-${index}`,
      ...row,
    }));
  }, [rawData]);

  // Get data source definition to access column metadata
  const dataSourceDef = useMemo(() => {
    return dataFetcher.getDataSources().find((ds) => ds.id === template.dataSource);
  }, [template.dataSource]);

  // Table columns based on template
  const tableColumns: IListColumn<ReportRow>[] = useMemo(() => {
    if (!dataSourceDef) return [];

    return template.columns
      .map((colKey) => {
        const colDef = dataSourceDef.columns.find((c) => c.key === colKey);
        if (!colDef) return null;

        const sanitizedId = colKey.replace(/[^a-zA-Z0-9_]/g, "_");

        return {
          id: sanitizedId,
          title: colDef.label,
          sortable: true,
          visible: true,
          render: (entity: ReportRow) => {
            const value = entity[colKey];
            if (value == null || value === "") return "—";

            if (colDef.type === "date") {
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

            if (colDef.type === "number") {
              return Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 1,
              });
            }

            return String(value);
          },
        };
      })
      .filter((col): col is IListColumn<ReportRow> => col !== null);
  }, [template.columns, dataSourceDef]);

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
    if (!template.chartConfig || entities.length === 0) return [];

    const { xAxis, yAxis, groupBy } = template.chartConfig;

    if (groupBy) {
      // Grouped data (e.g., line chart with multiple series)
      const groups = new Map<string, any[]>();
      entities.forEach((row) => {
        const groupValue = String(row[groupBy] || "Unknown");
        if (!groups.has(groupValue)) {
          groups.set(groupValue, []);
        }
        groups.get(groupValue)!.push(row);
      });

      // Aggregate by xAxis
      const result: any[] = [];
      groups.forEach((groupRows, groupName) => {
        groupRows.forEach((row) => {
          const xValue = row[xAxis];
          let existing = result.find((r) => r.name === xValue);
          if (!existing) {
            existing = { name: xValue };
            result.push(existing);
          }
          yAxis.forEach((y) => {
            const key = `${groupName}_${y}`;
            existing[key] = (existing[key] || 0) + Number(row[y] || 0);
          });
        });
      });

      return result;
    } else {
      // Simple aggregation
      return entities.map((row) => {
        const point: any = {};
        point.name = String(row[xAxis] || "Unknown");
        yAxis.forEach((y) => {
          point[y] = Number(row[y] || 0);
        });
        return point;
      });
    }
  }, [entities, template.chartConfig]);

  // Save handler
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
        query: {
          dataSource: null,
          columns: [],
          timeFilter: null,
          filters: [],
          groupBy: [],
          metrics: [],
          chartType: template.chartType,
          limit: 100,
        },
      };

      if (isLive && api) {
        await saveReportToMyGeotab(api, reportData);
      } else {
        saveReportToLocalStorage(reportData);
      }

      setIsSaveModalOpen(false);
      setReportName(template.name);
      setReportDescription(template.description);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save report");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="report-preview">
      {/* Title Bar (Figma Pattern) */}
      <div className="report-preview__title-bar">
        <div className="report-preview__title-left">
          <Button variant="tertiary" size="small" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="report-preview__title">{template.name}</h1>
          <span className="report-preview__badge">Beta</span>
          <span className="report-preview__usage">
            {template.usageCount.toLocaleString()} fleets using this
          </span>
        </div>
        <div className="report-preview__title-right">
          <Button variant="secondary" onClick={() => loadReportData()}>
            🔄 Refresh
          </Button>
          <Button variant="secondary" onClick={() => setIsSaveModalOpen(true)}>
            💾 Save
          </Button>
          <Button variant="primary" onClick={() => alert("Export feature coming soon!")}>
            Export ▾
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="report-preview__tabs">
        <button
          className={`report-preview__tab ${activeTab === "data" ? "report-preview__tab--active" : ""}`}
          onClick={() => setActiveTab("data")}
        >
          📊 Data ({entities.length})
        </button>
        {template.chartType !== "table" && (
          <button
            className={`report-preview__tab ${activeTab === "chart" ? "report-preview__tab--active" : ""}`}
            onClick={() => setActiveTab("chart")}
          >
            📈 Chart
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="report-preview__content">
        {activeTab === "data" && (
          <>
            {!tableConfig ? (
              <div className="report-preview__empty">
                <div className="report-preview__empty-title">No data</div>
                <div className="report-preview__empty-subtitle">
                  {isLoading ? "Loading..." : "No data available for this report"}
                </div>
              </div>
            ) : (
              <div className="report-preview__table">
                <Table {...tableConfig}>
                  <Table.Pagination rowsPerPage={50} />
                </Table>
              </div>
            )}
          </>
        )}

        {activeTab === "chart" && (
          <div className="report-preview__chart">
            {chartData.length === 0 ? (
              <div className="report-preview__empty">
                <div className="report-preview__empty-title">No chart data</div>
                <div className="report-preview__empty-subtitle">
                  Load data to see visualization
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {template.chartType === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dadce0" />
                    <XAxis dataKey="name" tick={{ fill: "#5f6368", fontSize: 12 }} stroke="#dadce0" />
                    <YAxis tick={{ fill: "#5f6368", fontSize: 12 }} stroke="#dadce0" />
                    <Tooltip />
                    <Legend />
                    {template.chartConfig?.yAxis.map((y, idx) => (
                      <Bar
                        key={y}
                        dataKey={y}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                ) : template.chartType === "line" ? (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dadce0" />
                    <XAxis dataKey="name" tick={{ fill: "#5f6368", fontSize: 12 }} stroke="#dadce0" />
                    <YAxis tick={{ fill: "#5f6368", fontSize: 12 }} stroke="#dadce0" />
                    <Tooltip />
                    <Legend />
                    {template.chartConfig?.yAxis.map((y, idx) => (
                      <Line
                        key={y}
                        dataKey={y}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                ) : template.chartType === "pie" ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey={template.chartConfig?.yAxis[0] || "value"}
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                ) : null}
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Save Modal */}
      {isSaveModalOpen && (
        <Modal
          title="Save Report"
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
                {isSaving ? "Saving..." : "Save"}
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
                placeholder="e.g., Fleet Safety Dashboard"
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
                placeholder="Brief description..."
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
          </div>
        </Modal>
      )}
    </div>
  );
}
