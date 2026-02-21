/**
 * Report Builder V3 - Zenith Design System Compliant
 * Uses ONLY Geotab @zenith components
 * Enterprise patterns: Microsoft Fluent 2, Salesforce Lightning
 */

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  type IListColumn,
  type ITable,
  Button,
  SearchInput,
  Card,
} from "@geotab/zenith";
import { useGeotab } from "../services/geotab-context";
import { useDataFetcher } from "../services/data-fetcher";
import type { DataSourceDef } from "../services/geotab-mock";

// Entity interface required by Zenith Table
interface ReportRow {
  id: string;
  [key: string]: unknown;
}

const ROWS_PER_PAGE = 50; // Salesforce Lightning best practice

export function ReportBuilderV3() {
  const { api, isLive, isReady } = useGeotab();
  const dataFetcher = useDataFetcher();
  const dataSources = dataFetcher.getDataSources();

  // Selected data source
  const [selectedSource, setSelectedSource] = useState<DataSourceDef | null>(
    dataSources[0] || null
  );

  // Data
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Column visibility (all visible by default)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

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
        // Set all columns visible by default
        setVisibleColumns(selectedSource.columns.map((col) => col.key));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setRawData([]);
        setIsLoading(false);
      });
  }, [selectedSource, dataFetcher]);

  // Convert raw data to Zenith Table format (with id field)
  const entities: ReportRow[] = useMemo(() => {
    return rawData.map((row, index) => ({
      id: `row-${index}`,
      ...row,
    }));
  }, [rawData]);

  // Filter entities based on search
  const filteredEntities = useMemo(() => {
    if (!searchTerm) return entities;

    const lowerSearch = searchTerm.toLowerCase();
    return entities.filter((entity) => {
      return Object.values(entity).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      );
    });
  }, [entities, searchTerm]);

  // Build Zenith Table columns from data source definition
  const tableColumns: IListColumn<ReportRow>[] = useMemo(() => {
    if (!selectedSource) return [];

    return selectedSource.columns
      .filter((col) => visibleColumns.includes(col.key))
      .map((col) => ({
        id: col.key,
        title: col.label,
        sortable: col.sortable !== false,
        visible: true,
        render: (entity: ReportRow) => {
          const value = entity[col.key];

          // Format based on column type
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
  }, [selectedSource, visibleColumns]);

  // Table configuration
  const tableConfig: ITable<ReportRow> = {
    entities: filteredEntities,
    columns: tableColumns,
    isLoading,
    sortable: {
      defaultSort: {
        column: tableColumns[0]?.id || "",
        direction: "asc" as const,
      },
    },
    height: "calc(100vh - 200px)",
  };

  return (
    <div style={{ padding: "24px", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, margin: 0, flex: 1 }}>
          Fleet Reports
        </h1>

        {isLive && (
          <span
            style={{
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 500,
              color: "#34C759",
              backgroundColor: "rgba(52, 199, 89, 0.1)",
              borderRadius: "12px",
              textTransform: "uppercase",
            }}
          >
            Live
          </span>
        )}

        {!isLive && isReady && (
          <span
            style={{
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 500,
              color: "#8E8E93",
              backgroundColor: "#F2F2F7",
              borderRadius: "12px",
              textTransform: "uppercase",
            }}
          >
            Demo
          </span>
        )}

        {/* Data Source Selector */}
        <select
          value={selectedSource?.id || ""}
          onChange={(e) => {
            const source = dataSources.find((ds) => ds.id === e.target.value);
            setSelectedSource(source || null);
            setSearchTerm("");
          }}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: 500,
            border: "1px solid #D1D1D6",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          {dataSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search records..."
          onClear={() => setSearchTerm("")}
        />
      </div>

      {/* Table */}
      <Card style={{ flex: 1, overflow: "hidden", padding: 0 }}>
        {selectedSource && tableColumns.length > 0 ? (
          <Table {...tableConfig}>
            <Table.Pagination rowsPerPage={ROWS_PER_PAGE} />
          </Table>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
              textAlign: "center",
              padding: "48px",
            }}
          >
            <div style={{ fontSize: "48px", color: "#D1D1D6", marginBottom: "24px" }}>
              📊
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 8px 0" }}>
              Select a data source
            </h2>
            <p style={{ fontSize: "14px", color: "#8E8E93", margin: 0 }}>
              Choose a data source from the dropdown above to view your fleet data
            </p>
          </div>
        )}
      </Card>

      {/* Stats Footer */}
      {filteredEntities.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            fontSize: "14px",
            color: "#8E8E93",
            backgroundColor: "#F2F2F7",
            borderRadius: "8px",
          }}
        >
          Showing {filteredEntities.length.toLocaleString()} of{" "}
          {entities.length.toLocaleString()} records
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  );
}
