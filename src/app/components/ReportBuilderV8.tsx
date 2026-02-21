/**
 * Report Builder V8 - Proper Query Builder Architecture
 * Following Superset patterns with clear terminology
 * Version: 8.0.1
 */

import { useState, useMemo } from "react";
import {
  Table,
  type IListColumn,
  type ITable,
  Card,
  SearchInput,
  Divider,
  Button,
} from "@geotab/zenith";
import {
  BarChart,
  Bar,
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
import "./report-builder-v8.css";

// Clear Query Model
interface ReportQuery {
  dataSource: DataSourceDef | null;
  selectedFields: string[];
  timeFilter: TimeFilter | null;
  filters: Filter[];
  groupBy: string[];
  metrics: Metric[];
  chartType: ChartType;
  limit: number;
}

interface TimeFilter {
  column: string;
  range: "last_7_days" | "last_30_days" | "this_month" | "custom";
  customStart?: string;
  customEnd?: string;
}

type Filter =
  | { type: "categorical"; column: string; operator: "in" | "not_in"; values: string[] }
  | { type: "numeric"; column: string; operator: ">" | "<" | "between"; min?: number; max?: number }
  | { type: "text"; column: string; operator: "contains" | "equals"; value: string };

interface Metric {
  field: string;
  aggregation: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";
  label: string;
}

type ChartType = "table" | "bar" | "line";

interface ReportRow {
  id: string;
  [key: string]: unknown;
}

const PREVIEW_ROWS = 10;

export function ReportBuilderV8() {
  const { api, isLive, isReady } = useGeotab();
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources() || [];

  // Query State
  const [query, setQuery] = useState<ReportQuery>(() => ({
    dataSource: dataSources.length > 0 ? dataSources[0] : null,
    selectedFields: [],
    timeFilter: null,
    filters: [],
    groupBy: [],
    metrics: [],
    chartType: "table",
    limit: 50,
  }));

  // Data State
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<number | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  // Field search
  const [fieldSearch, setFieldSearch] = useState("");

  // Available fields from selected data source
  const availableFields = useMemo(() => {
    if (!query.dataSource) return [];
    return query.dataSource.columns.map((col) => ({
      key: col.key,
      label: col.label,
      type: col.type,
    }));
  }, [query.dataSource]);

  // Filtered fields for search
  const filteredFields = useMemo(() => {
    if (!fieldSearch) return availableFields;
    const search = fieldSearch.toLowerCase();
    return availableFields.filter((f) =>
      f.label.toLowerCase().includes(search) || f.key.toLowerCase().includes(search)
    );
  }, [availableFields, fieldSearch]);

  // Time columns (date/datetime fields)
  const timeColumns = useMemo(() => {
    return availableFields.filter((f) => f.type === "date");
  }, [availableFields]);

  // Groupable fields (string fields)
  const groupableFields = useMemo(() => {
    return availableFields.filter((f) => f.type === "string");
  }, [availableFields]);

  // Aggregatable fields (number fields)
  const aggregatableFields = useMemo(() => {
    return availableFields.filter((f) => f.type === "number");
  }, [availableFields]);

  // Toggle field selection
  const toggleField = (fieldKey: string) => {
    setQuery((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldKey)
        ? prev.selectedFields.filter((f) => f !== fieldKey)
        : [...prev.selectedFields, fieldKey],
    }));
  };

  // Select/deselect all fields
  const selectAllFields = () => {
    setQuery((prev) => ({
      ...prev,
      selectedFields: availableFields.map((f) => f.key),
    }));
  };

  const clearAllFields = () => {
    setQuery((prev) => ({
      ...prev,
      selectedFields: [],
    }));
  };

  // Run Query
  const runQuery = (preview = false) => {
    if (!query.dataSource) {
      console.log("No data source selected");
      return;
    }

    console.log("Running query for:", query.dataSource.id);
    setIsLoading(true);
    setIsPreview(preview);
    const startTime = performance.now();

    dataFetcher
      .fetchDataSource(query.dataSource.id)
      .then((data) => {
        console.log("Fetched data:", data.length, "rows");
        const endTime = performance.now();
        // Apply filters
        let filteredData = applyFilters(data);
        console.log("After filters:", filteredData.length, "rows");

        // Apply grouping and aggregation if configured
        if (query.groupBy.length > 0 || query.metrics.length > 0) {
          filteredData = applyGrouping(filteredData);
          console.log("After grouping:", filteredData.length, "rows");
        }

        // Limit for preview
        if (preview) {
          filteredData = filteredData.slice(0, PREVIEW_ROWS);
        } else {
          filteredData = filteredData.slice(0, query.limit);
        }

        console.log("Final data:", filteredData.length, "rows", filteredData);
        setRawData(filteredData);
        setLastRunTime(Math.round(endTime - startTime));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setRawData([]);
        setIsLoading(false);
      });
  };

  // Apply filters to data
  const applyFilters = (data: any[]) => {
    let filtered = data;

    // Apply time filter
    if (query.timeFilter && query.timeFilter.column) {
      // TODO: Implement time filtering
    }

    // Apply other filters
    query.filters.forEach((filter) => {
      if (filter.type === "text" && filter.operator === "contains") {
        filtered = filtered.filter((row) =>
          String(row[filter.column] || "")
            .toLowerCase()
            .includes(filter.value.toLowerCase())
        );
      } else if (filter.type === "numeric" && filter.operator === ">") {
        filtered = filtered.filter((row) => Number(row[filter.column]) > (filter.min || 0));
      }
      // TODO: Implement other filter types
    });

    return filtered;
  };

  // Apply grouping and aggregation
  const applyGrouping = (data: any[]) => {
    if (query.groupBy.length === 0 && query.metrics.length === 0) {
      return data;
    }

    // Group data
    const groups: Record<string, any[]> = {};
    data.forEach((row) => {
      const groupKey = query.groupBy.map((field) => row[field] || "Unknown").join("|||");
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(row);
    });

    // Calculate aggregations
    const results: any[] = [];
    Object.entries(groups).forEach(([groupKey, groupRows]) => {
      const result: any = {};

      // Add group by fields
      const groupValues = groupKey.split("|||");
      query.groupBy.forEach((field, idx) => {
        result[field] = groupValues[idx];
      });

      // Calculate metrics
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

  // Convert to table format
  const entities: ReportRow[] = useMemo(() => {
    return rawData.map((row, index) => ({
      id: `row-${index}`,
      ...row,
    }));
  }, [rawData]);

  // Build table columns
  const tableColumns: IListColumn<ReportRow>[] = useMemo(() => {
    if (!query.dataSource) return [];

    // Show selected fields, or all if none selected
    const fieldsToShow = query.selectedFields.length > 0
      ? query.selectedFields
      : query.dataSource.columns.map((c) => c.key);

    // If grouping, show group fields + metrics
    const columnsToShow = query.groupBy.length > 0 || query.metrics.length > 0
      ? [...query.groupBy, ...query.metrics.map((m) => m.label)]
      : fieldsToShow;

    console.log("Building columns for fields:", columnsToShow);

    return query.dataSource.columns
      .filter((col) => columnsToShow.includes(col.key) || columnsToShow.includes(col.label))
      .concat(
        query.metrics.map((m) => ({
          key: m.label,
          label: m.label,
          type: "number",
          filterable: false,
          sortable: true,
          aggregatable: false,
        }))
      )
      .map((col) => ({
        id: col.key || col.label,
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
      }));
  }, [query, rawData]);

  const tableConfig: ITable<ReportRow> | null = useMemo(() => {
    if (tableColumns.length === 0) return null;

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

  return (
    <div className="rb8">
      {/* Header */}
      <div className="rb8__header">
        <div className="rb8__header-left">
          <h1 className="rb8__title">Fleet Reports</h1>
          {isLive && <span className="rb8__badge rb8__badge--live">Live</span>}
          {!isLive && isReady && <span className="rb8__badge rb8__badge--demo">Demo</span>}
        </div>
        <div className="rb8__header-controls">
          <Button variant="secondary" onClick={() => runQuery(true)} disabled={!query.dataSource || isLoading}>
            👁️ Preview ({PREVIEW_ROWS} rows)
          </Button>
          <Button variant="primary" onClick={() => runQuery(false)} disabled={!query.dataSource || isLoading}>
            {isLoading ? "⟳ Running..." : "⚡ Run Query"}
          </Button>
          {lastRunTime !== null && !isLoading && (
            <span className="rb8__run-time">{lastRunTime}ms</span>
          )}
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="rb8__body">
        {/* Panel 1: Data Source & Fields */}
        <aside className="rb8__sidebar">
          <div className="rb8__section">
            <div className="rb8__section-header">
              <span className="rb8__section-icon">📊</span>
              <span className="rb8__section-title">Data Source</span>
            </div>
            {dataSources.length > 0 ? (
              <select
                value={query.dataSource?.id || ""}
                onChange={(e) => {
                  const ds = dataSources.find((d) => d.id === e.target.value);
                  setQuery((prev) => ({
                    ...prev,
                    dataSource: ds || null,
                    selectedFields: [],
                    groupBy: [],
                    metrics: [],
                  }));
                }}
                className="rb8__select"
              >
                {dataSources.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rb8__empty-subtitle">No data sources available</div>
            )}
          </div>

          <Divider />

          <div className="rb8__section">
            <div className="rb8__section-header">
              <span className="rb8__section-icon">✓</span>
              <span className="rb8__section-title">Fields</span>
              <span className="rb8__section-count">
                {query.selectedFields.length}/{availableFields.length}
              </span>
            </div>

            <div className="rb8__field-actions">
              <button onClick={selectAllFields} className="rb8__field-action">
                Select All
              </button>
              <button onClick={clearAllFields} className="rb8__field-action">
                Clear
              </button>
            </div>

            <SearchInput
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              placeholder="Search fields..."
              onClear={() => setFieldSearch("")}
            />

            <div className="rb8__field-list">
              {filteredFields.map((field) => (
                <label key={field.key} className="rb8__field-checkbox">
                  <input
                    type="checkbox"
                    checked={query.selectedFields.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                  />
                  <span className="rb8__field-label">{field.label}</span>
                  <span className="rb8__field-type">{field.type}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Panel 2: Query Configuration */}
        <main className="rb8__config">
          <div className="rb8__config-scroll">
            {/* Time Filter */}
            {timeColumns.length > 0 && (
              <>
                <div className="rb8__section">
                  <div className="rb8__section-header">
                    <span className="rb8__section-icon">⏰</span>
                    <span className="rb8__section-title">Time</span>
                  </div>
                  <div className="rb8__form-group">
                    <label className="rb8__label">Time Column</label>
                    <select
                      value={query.timeFilter?.column || ""}
                      onChange={(e) =>
                        setQuery((prev) => ({
                          ...prev,
                          timeFilter: e.target.value
                            ? { column: e.target.value, range: "last_30_days" }
                            : null,
                        }))
                      }
                      className="rb8__select"
                    >
                      <option value="">No time filter</option>
                      {(timeColumns || []).map((col) => (
                        <option key={col.key} value={col.key}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {query.timeFilter && (
                    <div className="rb8__form-group">
                      <label className="rb8__label">Time Range</label>
                      <select
                        value={query.timeFilter.range}
                        onChange={(e) =>
                          setQuery((prev) => ({
                            ...prev,
                            timeFilter: prev.timeFilter
                              ? { ...prev.timeFilter, range: e.target.value as any }
                              : null,
                          }))
                        }
                        className="rb8__select"
                      >
                        <option value="last_7_days">Last 7 days</option>
                        <option value="last_30_days">Last 30 days</option>
                        <option value="this_month">This month</option>
                      </select>
                    </div>
                  )}
                </div>
                <Divider />
              </>
            )}

            {/* Group By */}
            {groupableFields.length > 0 && (
              <>
                <div className="rb8__section">
                  <div className="rb8__section-header">
                    <span className="rb8__section-icon">📊</span>
                    <span className="rb8__section-title">Group By</span>
                  </div>
                  <div className="rb8__form-group">
                    <select
                      value={query.groupBy[0] || ""}
                      onChange={(e) =>
                        setQuery((prev) => ({
                          ...prev,
                          groupBy: e.target.value ? [e.target.value] : [],
                        }))
                      }
                      className="rb8__select"
                    >
                      <option value="">No grouping</option>
                      {(groupableFields || []).map((col) => (
                        <option key={col.key} value={col.key}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Divider />
              </>
            )}

            {/* Metrics */}
            {aggregatableFields.length > 0 && (
              <>
                <div className="rb8__section">
                  <div className="rb8__section-header">
                    <span className="rb8__section-icon">📈</span>
                    <span className="rb8__section-title">Metrics</span>
                  </div>
                  <p className="rb8__section-hint">Add aggregations (requires grouping)</p>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={query.groupBy.length === 0}
                    onClick={() => {
                      if (aggregatableFields.length > 0) {
                        setQuery((prev) => ({
                          ...prev,
                          metrics: [
                            ...prev.metrics,
                            {
                              field: aggregatableFields[0].key,
                              aggregation: "SUM",
                              label: `SUM(${aggregatableFields[0].label})`,
                            },
                          ],
                        }));
                      }
                    }}
                  >
                    + Add Metric
                  </Button>
                  {query.metrics.map((metric, idx) => (
                    <div key={idx} className="rb8__metric">
                      <select
                        value={metric.aggregation}
                        onChange={(e) => {
                          const newMetrics = [...query.metrics];
                          newMetrics[idx].aggregation = e.target.value as any;
                          newMetrics[idx].label = `${e.target.value}(${metric.field})`;
                          setQuery((prev) => ({ ...prev, metrics: newMetrics }));
                        }}
                        className="rb8__select rb8__select--small"
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
                          newMetrics[idx].label = `${metric.aggregation}(${e.target.value})`;
                          setQuery((prev) => ({ ...prev, metrics: newMetrics }));
                        }}
                        className="rb8__select rb8__select--small"
                      >
                        {(aggregatableFields || []).map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setQuery((prev) => ({
                            ...prev,
                            metrics: prev.metrics.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="rb8__metric-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <Divider />
              </>
            )}

            {/* Chart Type */}
            <div className="rb8__section">
              <div className="rb8__section-header">
                <span className="rb8__section-icon">📉</span>
                <span className="rb8__section-title">Visualization</span>
              </div>
              <select
                value={query.chartType}
                onChange={(e) =>
                  setQuery((prev) => ({ ...prev, chartType: e.target.value as ChartType }))
                }
                className="rb8__select"
              >
                <option value="table">Table</option>
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
              </select>
            </div>
          </div>
        </main>

        {/* Panel 3: Results */}
        <aside className="rb8__results">
          <div className="rb8__results-header">
            <h2 className="rb8__results-title">Results</h2>
            {entities.length > 0 && (
              <span className="rb8__results-count">
                {entities.length.toLocaleString()} rows
                {isPreview && " (preview)"}
              </span>
            )}
          </div>

          <div className="rb8__results-content">
            {!tableConfig || entities.length === 0 ? (
              <div className="rb8__empty">
                <div className="rb8__empty-title">No results</div>
                <div className="rb8__empty-subtitle">
                  {!query.dataSource
                    ? "Select a data source to get started"
                    : "Click \"Run Query\" to see data"}
                </div>
              </div>
            ) : (
              <Card style={{ height: "100%", padding: 0, overflow: "hidden" }}>
                <Table {...tableConfig}>
                  <Table.Pagination rowsPerPage={50} />
                </Table>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
