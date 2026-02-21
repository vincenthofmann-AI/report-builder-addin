/**
 * Minimal Drag-and-Drop Report Builder
 * Tableau + Apple: Field palette → Drop zones → Live table
 */

import { useState, useMemo, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FieldPill, type Field } from "./dnd/FieldPill";
import { DropZone } from "./dnd/DropZone";
import { type Aggregation } from "./dnd/FieldPillV2";
import { ReportTable } from "../modules/canvas/ReportTable";
import { useDataFetcher } from "../services/data-fetcher";
import type { DataSourceDef } from "../services/geotab-mock";
import "./report-builder-dnd.css";

interface DroppedField {
  field: Field;
  aggregation?: Aggregation;
}

export function ReportBuilderDnD() {
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources();

  // Selected data source
  const [selectedSource, setSelectedSource] = useState<DataSourceDef | null>(
    dataSources[0] || null
  );

  // Drop zone states
  const [rows, setRows] = useState<DroppedField[]>([]);
  const [columns, setColumns] = useState<DroppedField[]>([]);
  const [filters, setFilters] = useState<DroppedField[]>([]);

  // Data
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Available fields from data source
  const availableFields = useMemo(() => {
    if (!selectedSource) return [];
    return selectedSource.columns.map((col): Field => ({
      id: col.key,
      name: col.label,
      type: col.type === "number" ? "measure" : "dimension",
      dataType: col.type,
    }));
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

  // Handlers
  const handleDropRow = (field: Field, aggregation?: string) => {
    setRows((prev) => [...prev, { field, aggregation }]);
  };

  const handleDropColumn = (field: Field, aggregation?: string) => {
    setColumns((prev) => [...prev, { field, aggregation }]);
  };

  const handleDropFilter = (field: Field) => {
    setFilters((prev) => [...prev, { field }]);
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="report-builder-dnd">
        {/* Top Bar */}
        <div className="report-builder-dnd__header">
          <h1 className="report-builder-dnd__title">Report Builder</h1>

          {/* Data Source Selector */}
          <select
            value={selectedSource?.id || ""}
            onChange={(e) => {
              const source = dataSources.find((ds) => ds.id === e.target.value);
              setSelectedSource(source || null);
              // Reset drop zones
              setRows([]);
              setColumns([]);
              setFilters([]);
            }}
            className="report-builder-dnd__source-select"
          >
            {dataSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main Layout */}
        <div className="report-builder-dnd__body">
          {/* Left: Field Palette */}
          <aside className="report-builder-dnd__palette">
            <div className="report-builder-dnd__palette-header">
              <span className="report-builder-dnd__palette-title">Fields</span>
              <span className="report-builder-dnd__palette-count">
                {availableFields.length}
              </span>
            </div>

            {/* Dimensions */}
            <div className="report-builder-dnd__field-group">
              <div className="report-builder-dnd__field-group-label">
                Dimensions
              </div>
              <div className="report-builder-dnd__field-list">
                {availableFields
                  .filter((f) => f.type === "dimension")
                  .map((field) => (
                    <FieldPill key={field.id} field={field} />
                  ))}
              </div>
            </div>

            {/* Measures */}
            <div className="report-builder-dnd__field-group">
              <div className="report-builder-dnd__field-group-label">
                Measures
              </div>
              <div className="report-builder-dnd__field-list">
                {availableFields
                  .filter((f) => f.type === "measure")
                  .map((field) => (
                    <FieldPill key={field.id} field={field} />
                  ))}
              </div>
            </div>
          </aside>

          {/* Right: Canvas */}
          <main className="report-builder-dnd__canvas">
            {/* Drop Zones */}
            <div className="report-builder-dnd__shelves">
              <DropZone
                label="Filters"
                fields={filters}
                onDrop={handleDropFilter}
                onRemove={handleRemoveFilter}
              />
              <DropZone
                label="Columns"
                fields={columns}
                onDrop={handleDropColumn}
                onRemove={handleRemoveColumn}
              />
              <DropZone
                label="Rows"
                fields={rows}
                onDrop={handleDropRow}
                onRemove={handleRemoveRow}
              />
            </div>

            {/* Table View */}
            <div className="report-builder-dnd__view">
              {selectedSource && selectedColumns.length > 0 ? (
                <ReportTable
                  data={rawData}
                  columns={selectedSource.columns}
                  selectedColumns={selectedColumns}
                  groupByColumn={null}
                  aggregateColumn={null}
                  aggregateFn="sum"
                  isLoading={isLoading}
                />
              ) : (
                <div className="report-builder-dnd__empty">
                  <p className="report-builder-dnd__empty-title">
                    Drop fields to build your report
                  </p>
                  <p className="report-builder-dnd__empty-subtitle">
                    Drag dimensions and measures from the left into Rows or Columns
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
