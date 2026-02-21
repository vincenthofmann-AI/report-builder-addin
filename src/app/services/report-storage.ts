/**
 * Report Storage Service
 * ======================
 * Manages saving/loading report configurations to MyGeotab database
 * using CustomData entities for native integration.
 */

import type { GeotabApi } from "./geotab-context";
import { callGeotabAsync } from "./geotab-context";
import type { ReportQuery } from "../components/ReportBuilderV9";

// Custom data entity type for Report Builder reports
const CUSTOM_DATA_TYPE = "ReportBuilderReportConfig";

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  query: ReportQuery;
  createdAt: string;
  modifiedAt: string;
}

/**
 * CustomData entity structure in MyGeotab
 */
interface CustomDataEntity {
  id?: string;
  type: string;
  data: string; // JSON-encoded SavedReport
  device?: { id: string };
}

/**
 * Save a report configuration to MyGeotab database
 */
export async function saveReportToMyGeotab(
  api: GeotabApi,
  report: Omit<SavedReport, "id" | "createdAt" | "modifiedAt">
): Promise<SavedReport> {
  const timestamp = new Date().toISOString();

  const savedReport: SavedReport = {
    id: "", // Will be set by MyGeotab
    ...report,
    createdAt: timestamp,
    modifiedAt: timestamp,
  };

  const customData: CustomDataEntity = {
    type: CUSTOM_DATA_TYPE,
    data: JSON.stringify(savedReport),
  };

  try {
    const result = await callGeotabAsync<string>(api, "Add", {
      typeName: "CustomData",
      entity: customData,
    });

    savedReport.id = result;
    return savedReport;
  } catch (error) {
    console.error("Failed to save report to MyGeotab:", error);
    throw error;
  }
}

/**
 * Update an existing report in MyGeotab database
 */
export async function updateReportInMyGeotab(
  api: GeotabApi,
  report: SavedReport
): Promise<void> {
  const updatedReport: SavedReport = {
    ...report,
    modifiedAt: new Date().toISOString(),
  };

  const customData: CustomDataEntity = {
    id: report.id,
    type: CUSTOM_DATA_TYPE,
    data: JSON.stringify(updatedReport),
  };

  try {
    await callGeotabAsync(api, "Set", {
      typeName: "CustomData",
      entity: customData,
    });
  } catch (error) {
    console.error("Failed to update report in MyGeotab:", error);
    throw error;
  }
}

/**
 * Load all saved reports from MyGeotab database
 */
export async function loadReportsFromMyGeotab(
  api: GeotabApi
): Promise<SavedReport[]> {
  try {
    const results = await callGeotabAsync<CustomDataEntity[]>(api, "Get", {
      typeName: "CustomData",
      search: {
        type: CUSTOM_DATA_TYPE,
      },
    });

    return results
      .map((entity) => {
        try {
          const report = JSON.parse(entity.data) as SavedReport;
          // Ensure ID from entity is preserved
          report.id = entity.id || report.id;
          return report;
        } catch (parseError) {
          console.error("Failed to parse report data:", parseError);
          return null;
        }
      })
      .filter((report): report is SavedReport => report !== null)
      .sort((a, b) =>
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
      );
  } catch (error) {
    console.error("Failed to load reports from MyGeotab:", error);
    return [];
  }
}

/**
 * Delete a report from MyGeotab database
 */
export async function deleteReportFromMyGeotab(
  api: GeotabApi,
  reportId: string
): Promise<void> {
  try {
    await callGeotabAsync(api, "Remove", {
      typeName: "CustomData",
      entity: {
        id: reportId,
      },
    });
  } catch (error) {
    console.error("Failed to delete report from MyGeotab:", error);
    throw error;
  }
}

/**
 * Load a specific report by ID
 */
export async function loadReportById(
  api: GeotabApi,
  reportId: string
): Promise<SavedReport | null> {
  try {
    const results = await callGeotabAsync<CustomDataEntity[]>(api, "Get", {
      typeName: "CustomData",
      search: {
        id: reportId,
      },
    });

    if (results.length === 0) {
      return null;
    }

    const report = JSON.parse(results[0]!.data) as SavedReport;
    report.id = results[0]!.id || report.id;
    return report;
  } catch (error) {
    console.error("Failed to load report by ID:", error);
    return null;
  }
}

/**
 * Fallback to localStorage for demo mode or when API is unavailable
 */
const LOCALSTORAGE_KEY = "geotab-report-builder-reports";

export function saveReportToLocalStorage(
  report: Omit<SavedReport, "id" | "createdAt" | "modifiedAt">
): SavedReport {
  const timestamp = new Date().toISOString();
  const savedReport: SavedReport = {
    id: `local-${Date.now()}`,
    ...report,
    createdAt: timestamp,
    modifiedAt: timestamp,
  };

  const reports = loadReportsFromLocalStorage();
  reports.push(savedReport);
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(reports));

  return savedReport;
}

export function loadReportsFromLocalStorage(): SavedReport[] {
  try {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function deleteReportFromLocalStorage(reportId: string): void {
  const reports = loadReportsFromLocalStorage();
  const filtered = reports.filter((r) => r.id !== reportId);
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(filtered));
}

export function updateReportInLocalStorage(report: SavedReport): void {
  const reports = loadReportsFromLocalStorage();
  const index = reports.findIndex((r) => r.id === report.id);

  if (index !== -1) {
    reports[index] = {
      ...report,
      modifiedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(reports));
  }
}
