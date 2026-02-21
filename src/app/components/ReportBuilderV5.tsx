/**
 * Report Builder V5 - Three-Panel NotebookLM-Style Interface
 * Follows Salesforce + GA4 + NotebookLM patterns
 * Resource → Query → Output flow
 */

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  type IListColumn,
  type ITable,
  Card,
  SearchInput,
  Button,
} from "@geotab/zenith";
import { useGeotab, callGeotabAsync } from "../services/geotab-context";
import "./report-builder-v5.css";

// Geotab API Resources
interface GeotabResource {
  id: string;
  name: string;
  icon: string;
  typeName: string; // Geotab API typeName
  description: string;
  commonFields: string[];
}

const GEOTAB_RESOURCES: GeotabResource[] = [
  {
    id: "device",
    name: "Devices",
    icon: "🚗",
    typeName: "Device",
    description: "Vehicles and tracking hardware",
    commonFields: ["name", "serialNumber", "deviceType", "groups"],
  },
  {
    id: "trip",
    name: "Trips",
    icon: "🛣️",
    typeName: "Trip",
    description: "Journey records and routes",
    commonFields: ["device", "driver", "start", "stop", "distance"],
  },
  {
    id: "user",
    name: "Users",
    icon: "👤",
    typeName: "User",
    description: "Drivers and administrators",
    commonFields: ["name", "firstName", "lastName", "companyGroups"],
  },
  {
    id: "zone",
    name: "Zones",
    icon: "📍",
    typeName: "Zone",
    description: "Geofences and locations",
    commonFields: ["name", "comment", "externalReference", "groups"],
  },
  {
    id: "rule",
    name: "Rules",
    icon: "⚠️",
    typeName: "Rule",
    description: "Alerts and notifications",
    commonFields: ["name", "baseType", "condition", "groups"],
  },
  {
    id: "status-data",
    name: "Status Data",
    icon: "📊",
    typeName: "StatusData",
    description: "Real-time telemetry",
    commonFields: ["device", "data", "dateTime", "diagnostic"],
  },
];

interface ReportRow {
  id: string;
  [key: string]: unknown;
}

const ROWS_PER_PAGE = 50;

export function ReportBuilderV5() {
  const { api, isLive, isReady } = useGeotab();

  // Selected resource
  const [selectedResource, setSelectedResource] = useState<GeotabResource | null>(null);

  // AI Query mode
  const [aiMode, setAiMode] = useState(true);
  const [aiQuery, setAiQuery] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState<any>(null);

  // Data
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual field selection
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState("");

  // Handle resource selection
  const handleSelectResource = (resource: GeotabResource) => {
    setSelectedResource(resource);
    setSelectedFields(resource.commonFields);
    setRawData([]);
    setError(null);
    setAiQuery("");
    setGeneratedQuery(null);
  };

  // Simulate AI query parsing (future: integrate with LLM)
  const handleAiSubmit = async () => {
    if (!selectedResource || !aiQuery) return;

    setIsLoading(true);
    setError(null);

    try {
      // For demo: simple keyword parsing
      // In production: Use LLM to parse natural language → API params
      const query = {
        typeName: selectedResource.typeName,
        resultsLimit: 100,
      };

      setGeneratedQuery(query);

      // Make real Geotab API call
      if (api && isLive) {
        const results = await callGeotabAsync(api, "Get", query);
        setRawData(Array.isArray(results) ? results : []);
      } else {
        // Demo mode: generate sample data
        setRawData(generateSampleData(selectedResource.typeName, 25));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual query execution
  const handleManualQuery = async () => {
    if (!selectedResource) return;

    setIsLoading(true);
    setError(null);

    try {
      const query = {
        typeName: selectedResource.typeName,
        resultsLimit: 100,
      };

      setGeneratedQuery(query);

      if (api && isLive) {
        const results = await callGeotabAsync(api, "Get", query);
        setRawData(Array.isArray(results) ? results : []);
      } else {
        setRawData(generateSampleData(selectedResource.typeName, 25));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert to table format
  const entities: ReportRow[] = useMemo(() => {
    return rawData.map((row, index) => ({
      id: row.id || `row-${index}`,
      ...row,
    }));
  }, [rawData]);

  // Build table columns
  const tableColumns: IListColumn<ReportRow>[] = useMemo(() => {
    if (entities.length === 0) return [];

    const firstRow = entities[0];
    const allKeys = Object.keys(firstRow).filter((key) => key !== "id");

    return allKeys.map((key) => ({
      id: key,
      title: formatFieldName(key),
      sortable: true,
      visible: true,
      render: (entity: ReportRow) => {
        const value = entity[key];
        if (value == null) return "—";
        if (typeof value === "object") return JSON.stringify(value).substring(0, 50);
        return String(value);
      },
    }));
  }, [entities]);

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

  return (
    <div className="rb5">
      {/* Header */}
      <div className="rb5__header">
        <h1 className="rb5__title">Fleet Reports</h1>
        {isLive && <span className="rb5__badge rb5__badge--live">Live</span>}
        {!isLive && isReady && <span className="rb5__badge rb5__badge--demo">Demo</span>}
        <Button
          variant={aiMode ? "primary" : "secondary"}
          onClick={() => setAiMode(!aiMode)}
          style={{ marginLeft: "auto" }}
        >
          ✨ AI Mode
        </Button>
      </div>

      {/* Three-Panel Layout */}
      <div className="rb5__body">
        {/* Panel 1: Sources (Resource Selector) */}
        <aside className="rb5__sources">
          <div className="rb5__sources-header">
            <h2 className="rb5__sources-title">Data Sources</h2>
            <p className="rb5__sources-subtitle">Select a Geotab API resource</p>
          </div>

          <div className="rb5__resources">
            {GEOTAB_RESOURCES.map((resource) => (
              <button
                key={resource.id}
                onClick={() => handleSelectResource(resource)}
                className={`rb5__resource ${
                  selectedResource?.id === resource.id ? "rb5__resource--active" : ""
                }`}
              >
                <span className="rb5__resource-icon">{resource.icon}</span>
                <div className="rb5__resource-content">
                  <div className="rb5__resource-name">{resource.name}</div>
                  <div className="rb5__resource-desc">{resource.description}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Panel 2: Query Builder */}
        <main className="rb5__query">
          {!selectedResource ? (
            <div className="rb5__empty">
              <div className="rb5__empty-icon">👈</div>
              <h3 className="rb5__empty-title">Select a data source</h3>
              <p className="rb5__empty-subtitle">Choose a Geotab API resource to get started</p>
            </div>
          ) : (
            <div className="rb5__query-content">
              <div className="rb5__query-header">
                <h2 className="rb5__query-title">Query Builder</h2>
                <div className="rb5__query-resource">
                  {selectedResource.icon} {selectedResource.name}
                </div>
              </div>

              {aiMode ? (
                /* AI Mode */
                <div className="rb5__ai-mode">
                  <div className="rb5__chat-input">
                    <SearchInput
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder={`Ask about ${selectedResource.name.toLowerCase()}... (e.g., "Show me all devices")`}
                      onClear={() => setAiQuery("")}
                    />
                    <Button onClick={handleAiSubmit} disabled={!aiQuery || isLoading}>
                      {isLoading ? "Running..." : "Run Query"}
                    </Button>
                  </div>

                  {generatedQuery && (
                    <Card className="rb5__generated-query">
                      <div className="rb5__generated-query-label">Generated API Call:</div>
                      <pre className="rb5__generated-query-code">
                        {JSON.stringify(generatedQuery, null, 2)}
                      </pre>
                    </Card>
                  )}

                  <div className="rb5__ai-tips">
                    <div className="rb5__ai-tips-title">Try asking:</div>
                    <ul className="rb5__ai-tips-list">
                      <li>"Show me all {selectedResource.name.toLowerCase()}"</li>
                      <li>"Get the first 50 records"</li>
                      <li>"Filter by specific criteria"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Manual Mode */
                <div className="rb5__manual-mode">
                  <div className="rb5__field-selector">
                    <h3 className="rb5__field-selector-title">Available Fields</h3>
                    {selectedResource.commonFields.map((field) => (
                      <div key={field} className="rb5__field-item">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFields([...selectedFields, field]);
                            } else {
                              setSelectedFields(selectedFields.filter((f) => f !== field));
                            }
                          }}
                        />
                        <label>{formatFieldName(field)}</label>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleManualQuery} disabled={isLoading}>
                    {isLoading ? "Running..." : "Run Query"}
                  </Button>
                </div>
              )}

              {error && (
                <div className="rb5__error">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Panel 3: Output Preview */}
        <aside className="rb5__output">
          <div className="rb5__output-header">
            <h2 className="rb5__output-title">Output</h2>
            {entities.length > 0 && (
              <span className="rb5__output-count">
                {entities.length.toLocaleString()} records
              </span>
            )}
          </div>

          <div className="rb5__output-content">
            {entities.length === 0 ? (
              <div className="rb5__empty">
                <div className="rb5__empty-icon">📊</div>
                <h3 className="rb5__empty-title">No data yet</h3>
                <p className="rb5__empty-subtitle">Run a query to see results</p>
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
  );
}

// Helpers
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function generateSampleData(typeName: string, count: number): any[] {
  const data: any[] = [];

  for (let i = 0; i < count; i++) {
    switch (typeName) {
      case "Device":
        data.push({
          id: `b${1000 + i}`,
          name: `Vehicle ${i + 1}`,
          serialNumber: `GT${9000 + i}`,
          deviceType: i % 2 === 0 ? "GO9" : "GO9+",
        });
        break;
      case "Trip":
        data.push({
          id: `t${2000 + i}`,
          device: { id: `b${1000 + (i % 10)}` },
          start: new Date(Date.now() - i * 3600000).toISOString(),
          stop: new Date(Date.now() - i * 3600000 + 1800000).toISOString(),
          distance: Math.round(Math.random() * 100000) / 100,
        });
        break;
      case "User":
        data.push({
          id: `u${3000 + i}`,
          name: `user${i + 1}@example.com`,
          firstName: `Driver${i + 1}`,
          lastName: `Test`,
        });
        break;
      default:
        data.push({
          id: `${typeName.toLowerCase()}-${i}`,
          name: `${typeName} ${i + 1}`,
        });
    }
  }

  return data;
}
