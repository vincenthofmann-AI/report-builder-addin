/**
 * Report Builder V2 - Improved UX + Geotab SDK Integration
 * Patterns: Tableau field menu + Power BI aggregation + Apple polish
 */

import { useState, useMemo, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FieldPillV2, type Field, type Aggregation } from "./dnd/FieldPillV2";
import { DropZone } from "./dnd/DropZone";
import { ReportTable } from "../modules/canvas/ReportTable";
import { useGeotab, callGeotabAsync } from "../services/geotab-context";
import { useDataFetcher } from "../services/data-fetcher";
import type { DataSourceDef } from "../services/geotab-mock";
import "./report-builder-v2.css";

interface DroppedField {
  field: Field;
  aggregation: Aggregation;
}

export function ReportBuilderV2() {
  const { api, isLive, isReady } = useGeotab();
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources();

  // Selected data source
  const [selectedSource, setSelectedSource] = useState<DataSourceDef | null>(
    dataSources[0] || null
  );

  // Drop zone states  - using Aggregation type
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

    // Use DataFetcher which automatically switches between live API and mock
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

  // Handlers with smart aggregation
  const handleDropRow = (field: Field, existingAgg?: Aggregation) => {
    const aggregation =
      field.type === "measure" && existingAgg === "NONE"
        ? "SUM" // Default to SUM for measures
        : existingAgg || "NONE";
    setRows((prev) => [...prev, { field, aggregation }]);
  };

  const handleDropColumn = (field: Field, existingAgg?: Aggregation) => {
    const aggregation =
      field.type === "measure" && existingAgg === "NONE"
        ? "SUM"
        : existingAgg || "NONE";
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

  // Update aggregation for a field
  const handleRowAggregationChange = (index: number, aggregation: Aggregation) => {
    setRows((prev) =>
      prev.map((item, i) => (i === index ? { ...item, aggregation } : item))
    );
  };

  const handleColumnAggregationChange = (index: number, aggregation: Aggregation) => {
    setColumns((prev) =>
      prev.map((item, i) => (i === index ? { ...item, aggregation } : item))
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="report-builder-v2">
        {/* Top Bar */}
        <div className="report-builder-v2__header">
          <div className="report-builder-v2__header-left">
            <h1 className="report-builder-v2__title">Fleet Reports</h1>
            {isLive && <span className="report-builder-v2__badge report-builder-v2__badge--live">Live</span>}
            {!isLive && isReady && <span className="report-builder-v2__badge">Demo</span>}
          </div>

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
            className="report-builder-v2__source-select"
          >
            {dataSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main Layout */}
        <div className="report-builder-v2__body">
          {/* Left: Field Palette */}
          <aside className="report-builder-v2__palette">
            <div className="report-builder-v2__palette-header">
              <span className="report-builder-v2__palette-title">Data</span>
              <span className="report-builder-v2__palette-count">
                {availableFields.length} fields
              </span>
            </div>

            {/* Dimensions */}
            <div className="report-builder-v2__field-group">
              <div className="report-builder-v2__field-group-header">
                <div className="report-builder-v2__field-group-icon">abc</div>
                <div className="report-builder-v2__field-group-label">Dimensions</div>
                <div className="report-builder-v2__field-group-count">
                  {availableFields.filter((f) => f.type === "dimension").length}
                </div>
              </div>
              <div className="report-builder-v2__field-list">
                {availableFields
                  .filter((f) => f.type === "dimension")
                  .map((field) => (
                    <FieldPillV2 key={field.id} field={field} />
                  ))}
              </div>
            </div>

            {/* Measures */}
            <div className="report-builder-v2__field-group">
              <div className="report-builder-v2__field-group-header">
                <div className="report-builder-v2__field-group-icon">#</div>
                <div className="report-builder-v2__field-group-label">Measures</div>
                <div className="report-builder-v2__field-group-count">
                  {availableFields.filter((f) => f.type === "measure").length}
                </div>
              </div>
              <div className="report-builder-v2__field-list">
                {availableFields
                  .filter((f) => f.type === "measure")
                  .map((field) => (
                    <FieldPillV2 key={field.id} field={field} />
                  ))}
              </div>
            </div>
          </aside>

          {/* Right: Canvas */}
          <main className="report-builder-v2__canvas">
            {/* Drop Zones */}
            <div className="report-builder-v2__shelves">
              <div className="report-builder-v2__shelf">
                <div className="report-builder-v2__shelf-label">Filters</div>
                <div className="report-builder-v2__shelf-content">
                  {filters.length === 0 ? (
                    <div className="report-builder-v2__shelf-placeholder">
                      Drop fields here
                    </div>
                  ) : (
                    filters.map((df, index) => (
                      <FieldPillV2
                        key={`filter-${df.field.id}-${index}`}
                        field={df.field}
                        aggregation={df.aggregation}
                        onRemove={() => handleRemoveFilter(index)}
                        showAggregation={false}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="report-builder-v2__shelf">
                <div className="report-builder-v2__shelf-label">Columns</div>
                <div className="report-builder-v2__shelf-content">
                  {columns.length === 0 ? (
                    <div className="report-builder-v2__shelf-placeholder">
                      Drop fields here
                    </div>
                  ) : (
                    columns.map((df, index) => (
                      <FieldPillV2
                        key={`column-${df.field.id}-${index}`}
                        field={df.field}
                        aggregation={df.aggregation}
                        onRemove={() => handleRemoveColumn(index)}
                        onAggregationChange={(agg) =>
                          handleColumnAggregationChange(index, agg)
                        }
                        showAggregation={df.field.type === "measure"}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="report-builder-v2__shelf">
                <div className="report-builder-v2__shelf-label">Rows</div>
                <div className="report-builder-v2__shelf-content">
                  {rows.length === 0 ? (
                    <div className="report-builder-v2__shelf-placeholder">
                      Drop fields here
                    </div>
                  ) : (
                    rows.map((df, index) => (
                      <FieldPillV2
                        key={`row-${df.field.id}-${index}`}
                        field={df.field}
                        aggregation={df.aggregation}
                        onRemove={() => handleRemoveRow(index)}
                        onAggregationChange={(agg) =>
                          handleRowAggregationChange(index, agg)
                        }
                        showAggregation={df.field.type === "measure"}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Table View */}
            <div className="report-builder-v2__view">
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
                <div className="report-builder-v2__empty">
                  <div className="report-builder-v2__empty-icon">▦</div>
                  <p className="report-builder-v2__empty-title">
                    Drag fields to build your report
                  </p>
                  <p className="report-builder-v2__empty-subtitle">
                    Drag dimensions and measures into Rows or Columns
                  </p>
                  <div className="report-builder-v2__empty-hint">
                    <div className="report-builder-v2__empty-hint-item">
                      <span className="report-builder-v2__empty-hint-icon report-builder-v2__empty-hint-icon--dimension">
                        abc
                      </span>
                      <span>Dimensions</span> = categories (text, dates)
                    </div>
                    <div className="report-builder-v2__empty-hint-item">
                      <span className="report-builder-v2__empty-hint-icon report-builder-v2__empty-hint-icon--measure">
                        #
                      </span>
                      <span>Measures</span> = numbers you can aggregate
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  );
}
