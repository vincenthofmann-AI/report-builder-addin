/**
 * Report Builder V7 - Business Intelligence Features
 * Adds: Filtering, Grouping, Aggregations, Charting
 * Salesforce-level functionality
 */

import { useState, useMemo, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Table,
  type IListColumn,
  type ITable,
  Card,
  SearchInput,
  Divider,
  Button,
  Select,
} from "@geotab/zenith";
import { useGeotab } from "../services/geotab-context";
import { useDataFetcher } from "../services/data-fetcher";
import type { DataSourceDef } from "../services/geotab-mock";
import "./report-builder-v7.css";

// Types
interface Field {
  id: string;
  name: string;
  type: "dimension" | "metric";
  dataType: string;
}

type AggregationFn = "SUM" | "AVG" | "COUNT" | "MIN" | "MAX" | "NONE";

interface DroppedField {
  field: Field;
  aggregation?: AggregationFn;
}

interface FieldFilter {
  field: Field;
  operator: "equals" | "contains" | "greater" | "less" | "between";
  value: string;
}

interface ReportRow {
  id: string;
  [key: string]: unknown;
}

type ReportFormat = "tabular" | "summary" | "matrix";
type ChartType = "none" | "bar" | "line" | "pie";

const ROWS_PER_PAGE = 50;

// Draggable Field Component
function DraggableField({ field }: { field: Field }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "field",
    item: { field },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`ga-field ga-field--${field.type} ${isDragging ? "ga-field--dragging" : ""}`}
    >
      <div className="ga-field__indicator" />
      <span className="ga-field__name">{field.name}</span>
    </div>
  );
}

// Drop Zone Component
function DropZone({
  label,
  fields,
  onDrop,
  onRemove,
  onAggregationChange,
  type,
}: {
  label: string;
  fields: DroppedField[];
  onDrop: (field: Field) => void;
  onRemove: (index: number) => void;
  onAggregationChange?: (index: number, agg: AggregationFn) => void;
  type: "dimension" | "metric" | "any";
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "field",
    drop: (item: { field: Field }) => onDrop(item.field),
    canDrop: (item: { field: Field }) =>
      type === "any" || item.field.type === type,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div className="ga-drop-zone">
      <div className="ga-drop-zone__label">{label}</div>
      <div
        ref={drop}
        className={`ga-drop-zone__area ${
          isOver && canDrop ? "ga-drop-zone__area--active" : ""
        } ${!canDrop && isOver ? "ga-drop-zone__area--invalid" : ""}`}
      >
        {fields.length === 0 ? (
          <span className="ga-drop-zone__placeholder">Drop field here</span>
        ) : (
          fields.map((df, index) => (
            <div
              key={`${df.field.id}-${index}`}
              className={`ga-dropped-field ga-dropped-field--${df.field.type}`}
            >
              <div className="ga-dropped-field__indicator" />
              <span className="ga-dropped-field__name">{df.field.name}</span>
              {df.aggregation && df.aggregation !== "NONE" && (
                <select
                  className="ga-dropped-field__agg-select"
                  value={df.aggregation}
                  onChange={(e) =>
                    onAggregationChange?.(index, e.target.value as AggregationFn)
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="SUM">SUM</option>
                  <option value="AVG">AVG</option>
                  <option value="COUNT">COUNT</option>
                  <option value="MIN">MIN</option>
                  <option value="MAX">MAX</option>
                </select>
              )}
              <button
                className="ga-dropped-field__remove"
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

// Simple Bar Chart Component
function SimpleBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="simple-chart">
      {data.map((item, i) => (
        <div key={i} className="simple-chart__bar-container">
          <div className="simple-chart__label">{item.label}</div>
          <div className="simple-chart__bar-wrapper">
            <div
              className="simple-chart__bar"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
            <div className="simple-chart__value">{item.value.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportBuilderV7() {
  const { api, isLive, isReady } = useGeotab();
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources();

  const [selectedSource, setSelectedSource] = useState<DataSourceDef | null>(
    dataSources[0] || null
  );

  // Report configuration
  const [reportFormat, setReportFormat] = useState<ReportFormat>("tabular");
  const [chartType, setChartType] = useState<ChartType>("none");
  const [rows, setRows] = useState<DroppedField[]>([]);
  const [columns, setColumns] = useState<DroppedField[]>([]);
  const [values, setValues] = useState<DroppedField[]>([]);
  const [filters, setFilters] = useState<FieldFilter[]>([]);

  // Data
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Available fields
  const availableFields = useMemo(() => {
    if (!selectedSource) return { dimensions: [], metrics: [] };

    const dimensions: Field[] = [];
    const metrics: Field[] = [];

    selectedSource.columns.forEach((col) => {
      const field: Field = {
        id: col.key,
        name: col.label,
        type: col.type === "number" ? "metric" : "dimension",
        dataType: col.type,
      };

      if (field.type === "dimension") {
        dimensions.push(field);
      } else {
        metrics.push(field);
      }
    });

    return { dimensions, metrics };
  }, [selectedSource]);

  // Fetch data
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
        setRawData([]);
        setIsLoading(false);
      });
  }, [selectedSource, dataFetcher]);

  // Apply filters
  const filteredData = useMemo(() => {
    let data = rawData;

    // Apply field filters
    filters.forEach((filter) => {
      data = data.filter((row) => {
        const value = row[filter.field.id];
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "equals":
            return String(value).toLowerCase() === filterValue;
          case "contains":
            return String(value).toLowerCase().includes(filterValue);
          case "greater":
            return Number(value) > Number(filter.value);
          case "less":
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      data = data.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    return data;
  }, [rawData, filters, searchTerm]);

  // Group data (for summary reports)
  const groupedData = useMemo(() => {
    if (reportFormat === "tabular" || rows.length === 0) {
      return null;
    }

    const groupField = rows[0].field;
    const groups: Record<string, any[]> = {};

    filteredData.forEach((row) => {
      const groupValue = String(row[groupField.id] || "Unknown");
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(row);
    });

    return groups;
  }, [filteredData, rows, reportFormat]);

  // Calculate aggregations
  const aggregations = useMemo(() => {
    if (values.length === 0) return {};

    const result: Record<string, number> = {};

    values.forEach((valueField) => {
      const { field, aggregation } = valueField;
      const numValues = filteredData
        .map((row) => Number(row[field.id]))
        .filter((v) => !isNaN(v));

      if (numValues.length === 0) {
        result[field.id] = 0;
        return;
      }

      switch (aggregation) {
        case "SUM":
          result[field.id] = numValues.reduce((a, b) => a + b, 0);
          break;
        case "AVG":
          result[field.id] = numValues.reduce((a, b) => a + b, 0) / numValues.length;
          break;
        case "COUNT":
          result[field.id] = numValues.length;
          break;
        case "MIN":
          result[field.id] = Math.min(...numValues);
          break;
        case "MAX":
          result[field.id] = Math.max(...numValues);
          break;
        default:
          result[field.id] = 0;
      }
    });

    return result;
  }, [filteredData, values]);

  // Chart data
  const chartData = useMemo(() => {
    if (chartType === "none" || !groupedData || values.length === 0) {
      return [];
    }

    const valueField = values[0];
    return Object.entries(groupedData).map(([label, groupRows]) => {
      const numValues = groupRows
        .map((row) => Number(row[valueField.field.id]))
        .filter((v) => !isNaN(v));

      let value = 0;
      switch (valueField.aggregation) {
        case "SUM":
          value = numValues.reduce((a, b) => a + b, 0);
          break;
        case "AVG":
          value = numValues.reduce((a, b) => a + b, 0) / numValues.length;
          break;
        case "COUNT":
          value = numValues.length;
          break;
        default:
          value = numValues.reduce((a, b) => a + b, 0);
      }

      return { label, value };
    });
  }, [groupedData, values, chartType]);

  // Convert to table format
  const entities: ReportRow[] = useMemo(() => {
    return filteredData.map((row, index) => ({
      id: `row-${index}`,
      ...row,
    }));
  }, [filteredData]);

  // Selected columns
  const selectedColumns = useMemo(() => {
    return [...rows, ...columns, ...values].map((df) => df.field.id);
  }, [rows, columns, values]);

  // Build table columns
  const tableColumns: IListColumn<ReportRow>[] = useMemo(() => {
    if (!selectedSource) return [];

    return selectedSource.columns
      .filter((col) => selectedColumns.includes(col.key))
      .map((col) => ({
        id: col.key,
        title: col.label,
        sortable: true,
        visible: true,
        render: (entity: ReportRow) => {
          const value = entity[col.key];
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
  }, [selectedSource, selectedColumns]);

  const tableConfig: ITable<ReportRow> = {
    entities: entities,
    columns: tableColumns,
    isLoading,
    sortable: {
      defaultSort: {
        column: tableColumns[0]?.id || "id",
        direction: "asc" as const,
      },
    },
    height: chartType === "none" ? "100%" : "60%",
  };

  // Add filter
  const handleAddFilter = (field: Field) => {
    setFilters([
      ...filters,
      {
        field,
        operator: field.dataType === "number" ? "greater" : "contains",
        value: "",
      },
    ]);
  };

  // Drop handlers
  const handleDropRow = (field: Field) => {
    setRows([...rows, { field, aggregation: "NONE" }]);
  };

  const handleDropColumn = (field: Field) => {
    setColumns([...columns, { field, aggregation: "NONE" }]);
  };

  const handleDropValue = (field: Field) => {
    setValues([...values, { field, aggregation: "SUM" }]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="ga">
        {/* Header */}
        <div className="ga__header">
          <div className="ga__header-left">
            <h1 className="ga__title">Fleet Reports</h1>
            {isLive && <span className="ga__badge ga__badge--live">Live</span>}
            {!isLive && isReady && <span className="ga__badge ga__badge--demo">Demo</span>}
          </div>
          <div className="ga__header-controls">
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
              className="ga__format-select"
            >
              <option value="tabular">Tabular</option>
              <option value="summary">Summary</option>
            </select>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="ga__format-select"
            >
              <option value="none">No Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>

        {/* Three-Panel Layout */}
        <div className="ga__body">
          {/* Panel 1: Variables */}
          <aside className="ga__variables">
            <div className="ga__panel-header">
              <h2 className="ga__panel-title">Variables</h2>
            </div>

            {/* Data Source */}
            <div className="ga__section">
              <div className="ga__section-label">Data Source</div>
              <select
                value={selectedSource?.id || ""}
                onChange={(e) => {
                  const source = dataSources.find((ds) => ds.id === e.target.value);
                  setSelectedSource(source || null);
                  setRows([]);
                  setColumns([]);
                  setValues([]);
                  setFilters([]);
                }}
                className="ga__select"
              >
                {dataSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>

            <Divider />

            {/* Dimensions */}
            <div className="ga__section">
              <div className="ga__section-label">
                Dimensions
                <span className="ga__section-count">
                  {availableFields.dimensions.length}
                </span>
              </div>
              <div className="ga__section-search">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search dimensions"
                  onClear={() => setSearchTerm("")}
                />
              </div>
              <div className="ga__field-list">
                {availableFields.dimensions
                  .filter((f) =>
                    f.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((field) => (
                    <DraggableField key={field.id} field={field} />
                  ))}
              </div>
            </div>

            <Divider />

            {/* Metrics */}
            <div className="ga__section">
              <div className="ga__section-label">
                Metrics
                <span className="ga__section-count">
                  {availableFields.metrics.length}
                </span>
              </div>
              <div className="ga__field-list">
                {availableFields.metrics
                  .filter((f) =>
                    f.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((field) => (
                    <DraggableField key={field.id} field={field} />
                  ))}
              </div>
            </div>
          </aside>

          {/* Panel 2: Report Settings */}
          <main className="ga__settings">
            <div className="ga__panel-header">
              <h2 className="ga__panel-title">Report Settings</h2>
            </div>

            <div className="ga__settings-content">
              <DropZone
                label="Rows (Grouping)"
                fields={rows}
                onDrop={handleDropRow}
                onRemove={(i) => setRows(rows.filter((_, idx) => idx !== i))}
                type="dimension"
              />

              <DropZone
                label="Columns"
                fields={columns}
                onDrop={handleDropColumn}
                onRemove={(i) => setColumns(columns.filter((_, idx) => idx !== i))}
                type="any"
              />

              <DropZone
                label="Values (Metrics)"
                fields={values}
                onDrop={handleDropValue}
                onRemove={(i) => setValues(values.filter((_, idx) => idx !== i))}
                onAggregationChange={(i, agg) =>
                  setValues(
                    values.map((v, idx) => (idx === i ? { ...v, aggregation: agg } : v))
                  )
                }
                type="metric"
              />

              {/* Filters */}
              <div className="ga__filters">
                <div className="ga__section-label">
                  Filters
                  <span className="ga__section-count">{filters.length}</span>
                </div>
                {filters.map((filter, i) => (
                  <div key={i} className="ga__filter">
                    <span className="ga__filter-field">{filter.field.name}</span>
                    <select
                      value={filter.operator}
                      onChange={(e) => {
                        const newFilters = [...filters];
                        newFilters[i].operator = e.target.value as any;
                        setFilters(newFilters);
                      }}
                      className="ga__filter-operator"
                    >
                      <option value="equals">equals</option>
                      <option value="contains">contains</option>
                      {filter.field.dataType === "number" && (
                        <>
                          <option value="greater">&gt;</option>
                          <option value="less">&lt;</option>
                        </>
                      )}
                    </select>
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => {
                        const newFilters = [...filters];
                        newFilters[i].value = e.target.value;
                        setFilters(newFilters);
                      }}
                      className="ga__filter-value"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => setFilters(filters.filter((_, idx) => idx !== i))}
                      className="ga__filter-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Panel 3: Output */}
          <aside className="ga__output">
            <div className="ga__panel-header">
              <h2 className="ga__panel-title">Output</h2>
              {entities.length > 0 && (
                <span className="ga__output-count">
                  {entities.length.toLocaleString()} rows
                </span>
              )}
            </div>

            <div className="ga__output-content">
              {selectedColumns.length === 0 ? (
                <div className="ga__empty">
                  <div className="ga__empty-title">No data configured</div>
                  <div className="ga__empty-subtitle">
                    Drag dimensions and metrics to build your report
                  </div>
                </div>
              ) : (
                <>
                  {/* Chart */}
                  {chartType !== "none" && chartData.length > 0 && (
                    <Card style={{ marginBottom: "16px", padding: "16px" }}>
                      <h3 className="ga__chart-title">
                        {values[0]?.field.name} by {rows[0]?.field.name}
                      </h3>
                      <SimpleBarChart data={chartData} />
                    </Card>
                  )}

                  {/* Table */}
                  <Card
                    style={{
                      height: chartType === "none" ? "100%" : "calc(100% - 280px)",
                      padding: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Table {...tableConfig}>
                      <Table.Pagination rowsPerPage={ROWS_PER_PAGE} />
                    </Table>

                    {/* Aggregation Footer */}
                    {values.length > 0 && Object.keys(aggregations).length > 0 && (
                      <div className="ga__aggregations">
                        {values.map((valueField) => (
                          <div key={valueField.field.id} className="ga__aggregation">
                            <span className="ga__aggregation-label">
                              {valueField.aggregation}({valueField.field.name}):
                            </span>
                            <span className="ga__aggregation-value">
                              {aggregations[valueField.field.id]?.toLocaleString(
                                "en-US",
                                { maximumFractionDigits: 2 }
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </DndProvider>
  );
}
