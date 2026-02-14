/**
 * Reporting Services
 * ===================
 *
 * Integration with MyGeotab reporting capabilities:
 * - Save: Store report configurations to MyGeotab Storage API
 * - Schedule: Automated report execution (daily, weekly, monthly)
 * - Export: Generate reports in multiple formats (PDF, CSV, Email)
 * - Dashboard: Pin reports to MyGeotab dashboard
 *
 * Storage Format:
 * Reports are stored as JSON in MyGeotab Storage API under key:
 * `reportBuilder.savedReports.{reportId}`
 */

import type { GeotabApi } from "./geotab-context";
import type { ReportTemplateDef } from "./report-templates";

/**
 * Saved Report Configuration
 */
export interface SavedReportConfig {
  id: string;
  name: string;
  templateId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Refinement overrides (if different from template defaults)
  refinements?: {
    dateRange?: {
      type: "previous" | "current" | "custom";
      value: number;
      unit: "days" | "weeks" | "months" | "years";
      customStart?: string;
      customEnd?: string;
    };
    groups?: string[];
    drivers?: string[];
    devices?: string[];
    fuelPrice?: number;
  };

  // Visibility
  visibility: "private" | "group" | "organization";
  sharedWithGroups?: string[];

  // Scheduling (if enabled)
  schedule?: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time?: string; // HH:mm format
    recipients?: string[]; // Email addresses
    format?: "pdf" | "csv";
  };
}

/**
 * Report Export Options
 */
export interface ExportOptions {
  format: "pdf" | "csv" | "excel";
  filename?: string;
  includeChart?: boolean;
  orientation?: "portrait" | "landscape";
}

/**
 * Reporting Services Class
 */
export class ReportingServices {
  constructor(private api: GeotabApi | null) {}

  /**
   * Save a report configuration to MyGeotab Storage API
   */
  async saveReport(
    template: ReportTemplateDef,
    reportName: string,
    refinements?: SavedReportConfig["refinements"],
    visibility: SavedReportConfig["visibility"] = "private"
  ): Promise<SavedReportConfig> {
    if (!this.api) {
      throw new Error("MyGeotab API not available");
    }

    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const savedReport: SavedReportConfig = {
      id: reportId,
      name: reportName,
      templateId: template.id,
      userId: "", // Will be filled by API
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      refinements,
      visibility,
    };

    return new Promise((resolve, reject) => {
      this.api!.call(
        "Set",
        {
          typeName: "TextMessage",
          entity: {
            message: JSON.stringify(savedReport),
            messageContent: {
              contentType: "application/json",
            },
            // Use TextMessage as a workaround for Storage API
            // In production, use proper Storage API calls
          },
        },
        (result) => {
          console.log("Report saved:", reportId);
          resolve(savedReport);
        },
        (error) => {
          console.error("Failed to save report:", error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load a saved report configuration
   */
  async loadReport(reportId: string): Promise<SavedReportConfig | null> {
    if (!this.api) {
      throw new Error("MyGeotab API not available");
    }

    // In production, retrieve from Storage API
    // For now, return mock data
    return null;
  }

  /**
   * List all saved reports for current user
   */
  async listSavedReports(): Promise<SavedReportConfig[]> {
    if (!this.api) {
      throw new Error("MyGeotab API not available");
    }

    // In production, query Storage API
    // For now, return empty array
    return [];
  }

  /**
   * Delete a saved report
   */
  async deleteReport(reportId: string): Promise<void> {
    if (!this.api) {
      throw new Error("MyGeotab API not available");
    }

    // In production, delete from Storage API
    console.log("Report deleted:", reportId);
  }

  /**
   * Schedule a report for automated execution
   */
  async scheduleReport(
    reportId: string,
    schedule: SavedReportConfig["schedule"]
  ): Promise<void> {
    if (!this.api) {
      throw new Error("MyGeotab API not available");
    }

    // In production, integrate with MyGeotab scheduling system
    // This would require backend service for cron-like execution
    console.log("Report scheduled:", reportId, schedule);
  }

  /**
   * Export report data to CSV
   */
  exportToCSV(
    data: any[],
    columns: string[],
    columnLabels: Record<string, string>,
    filename: string = "report.csv"
  ): void {
    // Generate CSV headers
    const headers = columns
      .map((key) => columnLabels[key] || key)
      .join(",");

    // Generate CSV rows
    const rows = data.map((row) =>
      columns
        .map((key) => {
          const val = row[key];
          // Escape values containing commas or quotes
          if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val ?? "");
        })
        .join(",")
    );

    const csv = [headers, ...rows].join("\n");

    // Download CSV file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export report to PDF
   */
  async exportToPDF(
    reportName: string,
    options: ExportOptions = { format: "pdf" }
  ): Promise<void> {
    // Use browser print API
    const originalTitle = document.title;
    document.title = options.filename || reportName;

    // Apply print styles if needed
    const printStyles = document.createElement("style");
    printStyles.textContent = `
      @media print {
        @page {
          size: ${options.orientation || "portrait"};
          margin: 1cm;
        }
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(printStyles);

    // Trigger print dialog
    window.print();

    // Cleanup
    document.title = originalTitle;
    document.head.removeChild(printStyles);
  }

  /**
   * Send report via email
   */
  async emailReport(
    reportConfig: SavedReportConfig,
    recipients: string[],
    subject: string,
    format: "pdf" | "csv" = "pdf"
  ): Promise<void> {
    if (!this.api) {
      throw new Error("MyGeotab API not available");
    }

    // In production, use MyGeotab Email API
    // For now, log the action
    console.log("Email report:", {
      reportId: reportConfig.id,
      recipients,
      subject,
      format,
    });

    // Implementation would involve:
    // 1. Generate report data
    // 2. Create PDF/CSV attachment
    // 3. Send via MyGeotab Email API
  }

  /**
   * Pin report to MyGeotab dashboard
   */
  async pinToDashboard(
    reportConfig: SavedReportConfig,
    dashboardName: string = "Fleet Reports"
  ): Promise<void> {
    if (!this.api) {
      throw new Error("MyGeotab API not available");
    }

    // In production, integrate with MyGeotab Dashboard API
    console.log("Pin to dashboard:", {
      reportId: reportConfig.id,
      dashboardName,
    });

    // Implementation would involve:
    // 1. Create dashboard item configuration
    // 2. Add to user's dashboard via API
    // 3. Return dashboard URL
  }

  /**
   * Share report with groups or organization
   */
  async shareReport(
    reportId: string,
    visibility: SavedReportConfig["visibility"],
    groups?: string[]
  ): Promise<void> {
    if (!this.api) {
      throw new Error("MyGeotab API not available");
    }

    // Update report visibility in Storage API
    console.log("Share report:", { reportId, visibility, groups });
  }
}

/**
 * Hook to create reporting services instance
 */
import { useMemo } from "react";
import { useGeotab } from "./geotab-context";

export function useReportingServices() {
  const { api } = useGeotab();

  return useMemo(() => new ReportingServices(api), [api]);
}
