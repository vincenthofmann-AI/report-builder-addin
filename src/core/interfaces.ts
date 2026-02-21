/**
 * Core Interfaces (Dependency Inversion)
 * =======================================
 *
 * Abstract interfaces that the core depends on.
 * Concrete implementations live in the services/ layer.
 * This enables testing the core with fakes/stubs.
 */

import type { DataRecord, ReportConfig } from "./types";

/**
 * Data source interface
 * Abstracts away MyGeotab API details
 */
export interface IDataSource {
  /**
   * Fetch data for a given source ID
   * @throws {DataSourceError} if fetch fails
   */
  fetchData(sourceId: string, filters?: Record<string, unknown>): Promise<DataRecord[]>;

  /**
   * List available data sources
   */
  listDataSources(): Promise<Array<{ id: string; name: string; description: string }>>;
}

/**
 * Storage interface
 * Abstracts away MyGeotab Storage API details
 */
export interface IStorage {
  /**
   * Save a report configuration
   * @returns The saved report with generated ID
   */
  saveReport(report: ReportConfig): Promise<ReportConfig>;

  /**
   * Load a report configuration by ID
   * @returns null if not found
   */
  loadReport(id: string): Promise<ReportConfig | null>;

  /**
   * List all saved reports for the current user
   */
  listReports(): Promise<ReportConfig[]>;

  /**
   * Delete a report by ID
   */
  deleteReport(id: string): Promise<void>;
}

/**
 * Export interface
 * Abstracts away file download/CSV generation
 */
export interface IExporter {
  /**
   * Export data to CSV format
   * @returns CSV string
   */
  toCSV(data: DataRecord[], columns: string[]): string;

  /**
   * Trigger browser download of CSV file
   */
  downloadCSV(csv: string, filename: string): void;
}

/**
 * Error types for I/O operations
 */
export class DataSourceError extends Error {
  constructor(
    message: string,
    public readonly sourceId: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "DataSourceError";
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly operation: "save" | "load" | "delete" | "list",
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "StorageError";
  }
}
