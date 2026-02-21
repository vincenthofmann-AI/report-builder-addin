/**
 * Report Builder V4 - Drag-and-Drop with Zenith Components
 * Restores drag-and-drop functionality using ONLY Zenith design system
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
} from "@geotab/zenith";
import { useGeotab } from "../services/geotab-context";
import { useDataFetcher } from "../services/data-fetcher";
import type { DataSourceDef } from "../services/geotab-mock";
import "./report-builder-v4.css";

// Field types
interface Field {
  id: string;
  name: string;
  type: "dimension" | "measure";
  dataType: string;
}

type Aggregation = "NONE" | "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";

interface DroppedField {
  field: Field;
  aggregation: Aggregation;
}

interface ReportRow {
  id: string;
  [key: string]: unknown;
}

const ROWS_PER_PAGE = 50;

// Draggable Field Pill (Zenith-styled)
function FieldPill({ field, isDraggable = true }: { field: Field; isDraggable?: boolean }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "field",
      item: { field, aggregation: "NONE" },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [field]
  );

  return (
    <div
      ref={isDraggable ? drag : null}
      className={`zenith-field-pill zenith-field-pill--${field.type} ${
        isDragging ? "zenith-field-pill--dragging" : ""
      }`}
      style={{ cursor: isDraggable ? "grab" : "default" }}
    >
      <span className="zenith-field-pill__icon">{field.type === "dimension" ? "abc" : "#"}</span>
      <span className="zenith-field-pill__label">{field.name}</span>
    </div>
  );
}

// Droppable Field Pill (with remove and aggregation)
function DroppedFieldPill({
  droppedField,
  onRemove,
  onAggregationChange,
  showAggregation,
}: {
  droppedField: DroppedField;
  onRemove: () => void;
  onAggregationChange?: (agg: Aggregation) => void;
  showAggregation: boolean;
}) {
  const { field, aggregation } = droppedField;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`zenith-dropped-pill zenith-dropped-pill--${field.type}`}>
      <span className="zenith-dropped-pill__icon">{field.type === "dimension" ? "abc" : "#"}</span>
      {showAggregation && aggregation !== "NONE" && (
        <span className="zenith-dropped-pill__agg">{aggregation}</span>
      )}
      <span className="zenith-dropped-pill__label">{field.name}</span>

      {showAggregation && onAggregationChange && (
        <div className="zenith-dropped-pill__menu-container">
          <button
            className="zenith-dropped-pill__menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            title="Change aggregation"
          >
            ▾
          </button>
          {showMenu && (
            <div className="zenith-dropped-pill__menu">
              {(["SUM", "AVG", "COUNT", "MIN", "MAX"] as Aggregation[]).map((agg) => (
                <button
                  key={agg}
                  className={`zenith-dropped-pill__menu-item ${
                    aggregation === agg ? "zenith-dropped-pill__menu-item--active" : ""
                  }`}
                  onClick={() => {
                    onAggregationChange(agg);
                    setShowMenu(false);
                  }}
                >
                  {agg}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button className="zenith-dropped-pill__remove" onClick={onRemove} title="Remove">
        ×
      </button>
    </div>
  );
}

// Drop Zone
function DropZone({
  label,
  fields,
  onDrop,
  onRemove,
  onAggregationChange,
  acceptTypes = ["dimension", "measure"],
  showAggregation = false,
}: {
  label: string;
  fields: DroppedField[];
  onDrop: (field: Field, aggregation?: Aggregation) => void;
  onRemove: (index: number) => void;
  onAggregationChange?: (index: number, agg: Aggregation) => void;
  acceptTypes?: string[];
  showAggregation?: boolean;
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "field",
    drop: (item: { field: Field; aggregation?: Aggregation }) => {
      onDrop(item.field, item.aggregation);
    },
    canDrop: (item: { field: Field }) => {
      return acceptTypes.includes(item.field.type);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div className="zenith-drop-zone">
      <div className="zenith-drop-zone__label">{label}</div>
      <div
        ref={drop}
        className={`zenith-drop-zone__content ${isOver && canDrop ? "zenith-drop-zone__content--hover" : ""} ${
          !canDrop && isOver ? "zenith-drop-zone__content--invalid" : ""
        }`}
      >
        {fields.length === 0 ? (
          <div className="zenith-drop-zone__placeholder">Drop {acceptTypes.join(" or ")} here</div>
        ) : (
          fields.map((df, index) => (
            <DroppedFieldPill
              key={`${df.field.id}-${index}`}
              droppedField={df}
              onRemove={() => onRemove(index)}
              onAggregationChange={
                onAggregationChange ? (agg) => onAggregationChange(index, agg) : undefined
              }
              showAggregation={showAggregation}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function ReportBuilderV4() {
  const { api, isLive, isReady } = useGeotab();
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources();

  const [selectedSource, setSelectedSource] = useState<DataSourceDef | null>(
    dataSources[0] || null
  );

  const [rows, setRows] = useState<DroppedField[]>([]);
  const [columns, setColumns] = useState<DroppedField[]>([]);
  const [filters, setFilters] = useState<DroppedField[]>([]);

  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Available fields from data source
  const availableFields = useMemo(() => {
    if (!selectedSource) return [];
    return selectedSource.columns.map(
      (col): Field => ({
        id: col.key,
        name: col.label,
        type: col.type === "number" ? "measure" : "dimension",
        dataType: col.type,
      })
    );
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

  // Selected columns for table display
  const selectedColumns = useMemo(() => {
    return [...rows, ...columns].map((df) => df.field.id);
  }, [rows, columns]);

  // Convert to Zenith Table format
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

  // Drop handlers
  const handleDropRow = (field: Field, existingAgg?: Aggregation) => {
    const aggregation = field.type === "measure" && existingAgg === "NONE" ? "SUM" : existingAgg || "NONE";
    setRows((prev) => [...prev, { field, aggregation }]);
  };

  const handleDropColumn = (field: Field, existingAgg?: Aggregation) => {
    const aggregation = field.type === "measure" && existingAgg === "NONE" ? "SUM" : existingAgg || "NONE";
    setColumns((prev) => [...prev, { field, aggregation }]);
  };

  const handleDropFilter = (field: Field) => {
    setFilters((prev) => [...prev, { field, aggregation: "NONE" }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveColumn = (index: number) => {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowAggregationChange = (index: number, aggregation: Aggregation) => {
    setRows((prev) => prev.map((item, i) => (i === index ? { ...item, aggregation } : item)));
  };

  const handleColumnAggregationChange = (index: number, aggregation: Aggregation) => {
    setColumns((prev) => prev.map((item, i) => (i === index ? { ...item, aggregation } : item)));
  };

  const tableConfig: ITable<ReportRow> = {
    entities: entities,
    columns: tableColumns,
    isLoading,
    sortable: {
      defaultSort: {
        column: tableColumns[0]?.id || "",
        direction: "asc" as const,
      },
    },
    height: "100%",
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="zenith-report-builder">
        {/* Header */}
        <div className="zenith-report-builder__header">
          <h1 className="zenith-report-builder__title">Fleet Reports</h1>

          {isLive && <span className="zenith-badge zenith-badge--live">Live</span>}
          {!isLive && isReady && <span className="zenith-badge zenith-badge--demo">Demo</span>}

          <select
            value={selectedSource?.id || ""}
            onChange={(e) => {
              const source = dataSources.find((ds) => ds.id === e.target.value);
              setSelectedSource(source || null);
              setRows([]);
              setColumns([]);
              setFilters([]);
            }}
            className="zenith-select"
          >
            {dataSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main Layout */}
        <div className="zenith-report-builder__body">
          {/* Left: Field Palette */}
          <aside className="zenith-field-palette">
            <div className="zenith-field-palette__header">
              <span className="zenith-field-palette__title">Data</span>
              <span className="zenith-field-palette__count">{availableFields.length} fields</span>
            </div>

            {/* Dimensions */}
            <div className="zenith-field-group">
              <div className="zenith-field-group__header">
                <span className="zenith-field-group__icon">abc</span>
                <span className="zenith-field-group__label">Dimensions</span>
                <span className="zenith-field-group__count">
                  {availableFields.filter((f) => f.type === "dimension").length}
                </span>
              </div>
              <div className="zenith-field-group__list">
                {availableFields
                  .filter((f) => f.type === "dimension")
                  .map((field) => (
                    <FieldPill key={field.id} field={field} />
                  ))}
              </div>
            </div>

            {/* Measures */}
            <div className="zenith-field-group">
              <div className="zenith-field-group__header">
                <span className="zenith-field-group__icon">#</span>
                <span className="zenith-field-group__label">Measures</span>
                <span className="zenith-field-group__count">
                  {availableFields.filter((f) => f.type === "measure").length}
                </span>
              </div>
              <div className="zenith-field-group__list">
                {availableFields
                  .filter((f) => f.type === "measure")
                  .map((field) => (
                    <FieldPill key={field.id} field={field} />
                  ))}
              </div>
            </div>
          </aside>

          {/* Right: Canvas */}
          <main className="zenith-canvas">
            {/* Drop Zones */}
            <div className="zenith-shelves">
              <DropZone
                label="Filters"
                fields={filters}
                onDrop={handleDropFilter}
                onRemove={handleRemoveFilter}
                showAggregation={false}
              />
              <DropZone
                label="Columns"
                fields={columns}
                onDrop={handleDropColumn}
                onRemove={handleRemoveColumn}
                onAggregationChange={handleColumnAggregationChange}
                showAggregation={true}
              />
              <DropZone
                label="Rows"
                fields={rows}
                onDrop={handleDropRow}
                onRemove={handleRemoveRow}
                onAggregationChange={handleRowAggregationChange}
                showAggregation={true}
              />
            </div>

            {/* Table View */}
            <div className="zenith-table-container">
              {selectedSource && selectedColumns.length > 0 ? (
                <Card style={{ height: "100%", padding: 0, overflow: "hidden" }}>
                  <Table {...tableConfig}>
                    <Table.Pagination rowsPerPage={ROWS_PER_PAGE} />
                  </Table>
                </Card>
              ) : (
                <div className="zenith-empty-state">
                  <div className="zenith-empty-state__icon">📊</div>
                  <h2 className="zenith-empty-state__title">Drag fields to build your report</h2>
                  <p className="zenith-empty-state__subtitle">
                    Drag dimensions and measures into Rows or Columns
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  );
}
