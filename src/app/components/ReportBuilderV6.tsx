/**
 * Report Builder V6 - Google Analytics 4 Style
 * Professional three-panel layout: Variables → Settings → Output
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
} from "@geotab/zenith";
import { useGeotab } from "../services/geotab-context";
import { useDataFetcher } from "../services/data-fetcher";
import type { DataSourceDef } from "../services/geotab-mock";
import "./report-builder-v6.css";

// Field types
interface Field {
  id: string;
  name: string;
  type: "dimension" | "metric";
  category: string;
}

interface DroppedField {
  field: Field;
  aggregation?: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";
}

interface ReportRow {
  id: string;
  [key: string]: unknown;
}

const ROWS_PER_PAGE = 50;

// Draggable Field
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

// Drop Zone
function DropZone({
  label,
  fields,
  onDrop,
  onRemove,
  type,
}: {
  label: string;
  fields: DroppedField[];
  onDrop: (field: Field) => void;
  onRemove: (index: number) => void;
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
              {df.aggregation && (
                <span className="ga-dropped-field__agg">{df.aggregation}</span>
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

export function ReportBuilderV6() {
  const { api, isLive, isReady } = useGeotab();
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources();

  const [selectedSource, setSelectedSource] = useState<DataSourceDef | null>(
    dataSources[0] || null
  );

  // Report configuration
  const [rows, setRows] = useState<DroppedField[]>([]);
  const [columns, setColumns] = useState<DroppedField[]>([]);
  const [values, setValues] = useState<DroppedField[]>([]);
  const [filters, setFilters] = useState<DroppedField[]>([]);

  // Data
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Available fields from data source
  const availableFields = useMemo(() => {
    if (!selectedSource) return { dimensions: [], metrics: [] };

    const dimensions: Field[] = [];
    const metrics: Field[] = [];

    selectedSource.columns.forEach((col) => {
      const field: Field = {
        id: col.key,
        name: col.label,
        type: col.type === "number" ? "metric" : "dimension",
        category: "General",
      };

      if (field.type === "dimension") {
        dimensions.push(field);
      } else {
        metrics.push(field);
      }
    });

    return { dimensions, metrics };
  }, [selectedSource]);

  // Fetch data when source changes
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

  // Selected columns for table
  const selectedColumns = useMemo(() => {
    return [...rows, ...columns, ...values].map((df) => df.field.id);
  }, [rows, columns, values]);

  // Convert to table format
  const entities: ReportRow[] = useMemo(() => {
    return rawData.map((row, index) => ({
      id: `row-${index}`,
      ...row,
    }));
  }, [rawData]);

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
    height: "100%",
  };

  // Drop handlers
  const handleDropRow = (field: Field) => {
    setRows((prev) => [...prev, { field, aggregation: field.type === "metric" ? "SUM" : undefined }]);
  };

  const handleDropColumn = (field: Field) => {
    setColumns((prev) => [...prev, { field, aggregation: field.type === "metric" ? "SUM" : undefined }]);
  };

  const handleDropValue = (field: Field) => {
    setValues((prev) => [...prev, { field, aggregation: "SUM" }]);
  };

  const handleDropFilter = (field: Field) => {
    setFilters((prev) => [...prev, { field }]);
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
                label="Rows"
                fields={rows}
                onDrop={handleDropRow}
                onRemove={(i) => setRows(rows.filter((_, idx) => idx !== i))}
                type="any"
              />

              <DropZone
                label="Columns"
                fields={columns}
                onDrop={handleDropColumn}
                onRemove={(i) => setColumns(columns.filter((_, idx) => idx !== i))}
                type="any"
              />

              <DropZone
                label="Values"
                fields={values}
                onDrop={handleDropValue}
                onRemove={(i) => setValues(values.filter((_, idx) => idx !== i))}
                type="metric"
              />

              <DropZone
                label="Filters"
                fields={filters}
                onDrop={handleDropFilter}
                onRemove={(i) => setFilters(filters.filter((_, idx) => idx !== i))}
                type="any"
              />
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
                <Card style={{ height: "100%", padding: 0, overflow: "hidden" }}>
                  <Table {...tableConfig}>
                    <Table.Pagination rowsPerPage={ROWS_PER_PAGE} />
                  </Table>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </div>
    </DndProvider>
  );
}
