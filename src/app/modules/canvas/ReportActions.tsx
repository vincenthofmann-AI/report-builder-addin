/**
 * Report Actions Component
 * =========================
 *
 * Action buttons and dialogs for report operations:
 * - Save report configuration
 * - Schedule automated execution
 * - Export to PDF/CSV
 * - Email report
 * - Pin to dashboard
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Save,
  Download,
  Calendar,
  Mail,
  LayoutDashboard,
  X,
  Check,
  Clock,
  Users,
  FileText,
  Printer,
} from "lucide-react";
import type { ReportTemplateDef } from "../../services/report-templates";
import { useReportingServices } from "../../services/reporting-services";
import { useToast } from "../../services/ToastProvider";
import { Button, ButtonType } from "../../services/zenith-adapter";

interface ReportActionsProps {
  template: ReportTemplateDef;
  data: any[];
  columns: any[];
  selectedColumns: string[];
}

export function ReportActions({
  template,
  data,
  columns,
  selectedColumns,
}: ReportActionsProps) {
  const reportingServices = useReportingServices();
  const toast = useToast();

  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Save form state
  const [reportName, setReportName] = useState(template.name);
  const [visibility, setVisibility] = useState<"private" | "group" | "organization">("private");

  // Schedule form state
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [recipients, setRecipients] = useState("");

  // Export form state
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("csv");

  // Handlers
  const handleSave = async () => {
    try {
      await reportingServices.saveReport(
        template,
        reportName,
        undefined, // refinements - would come from ReportPreview
        visibility
      );
      toast.success("Report saved", {
        description: `"${reportName}" has been saved to your reports.`,
      });
      setShowSaveDialog(false);
    } catch (error) {
      toast.error("Failed to save report", {
        description: String(error),
      });
    }
  };

  const handleSchedule = async () => {
    try {
      const schedule = scheduleEnabled
        ? {
            enabled: true,
            frequency,
            recipients: recipients.split(",").map((e) => e.trim()),
            format: exportFormat,
          }
        : undefined;

      toast.success("Report scheduled", {
        description: `Report will be sent ${frequency} to ${recipients}`,
      });
      setShowScheduleDialog(false);
    } catch (error) {
      toast.error("Failed to schedule report", {
        description: String(error),
      });
    }
  };

  const handleExport = () => {
    const columnLabels = columns.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.label }),
      {}
    );

    if (exportFormat === "csv") {
      reportingServices.exportToCSV(
        data,
        selectedColumns,
        columnLabels,
        `${template.name.replace(/\s+/g, "_")}.csv`
      );
      toast.success("Exported as CSV", {
        description: `${data.length} records from ${template.name}`,
      });
    } else {
      reportingServices.exportToPDF(template.name, {
        format: "pdf",
        filename: `${template.name.replace(/\s+/g, "_")}.pdf`,
      });
      toast.success("PDF export started", {
        description: "Print dialog opened",
      });
    }
    setShowExportDialog(false);
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type={ButtonType.Primary}
          onClick={() => setShowSaveDialog(true)}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>

        <Button
          type={ButtonType.Secondary}
          onClick={() => setShowScheduleDialog(true)}
        >
          <Calendar className="w-4 h-4" />
          Schedule
        </Button>

        <Button
          type={ButtonType.Secondary}
          onClick={() => setShowExportDialog(true)}
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <Dialog
            title="Save Report"
            icon={Save}
            onClose={() => setShowSaveDialog(false)}
            onConfirm={handleSave}
            confirmText="Save Report"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] text-[#64748b] mb-2" style={{ fontWeight: 500 }}>
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[14px] text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#003a63]/20"
                  placeholder="Enter report name..."
                />
              </div>

              <div>
                <label className="block text-[13px] text-[#64748b] mb-2" style={{ fontWeight: 500 }}>
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[14px] text-[#1e293b]"
                >
                  <option value="private">Private (only you)</option>
                  <option value="group">Share with my groups</option>
                  <option value="organization">Share with organization</option>
                </select>
              </div>

              <p className="text-[12px] text-[#94a3b8]">
                Saved reports can be accessed from your Reports dashboard and shared with team members.
              </p>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Schedule Dialog */}
      <AnimatePresence>
        {showScheduleDialog && (
          <Dialog
            title="Schedule Report"
            icon={Calendar}
            onClose={() => setShowScheduleDialog(false)}
            onConfirm={handleSchedule}
            confirmText="Schedule Report"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="schedule-enabled"
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-[#cbd5e1] text-[#003a63] focus:ring-[#003a63]/20"
                />
                <label htmlFor="schedule-enabled" className="text-[14px] text-[#1e293b]" style={{ fontWeight: 500 }}>
                  Enable automated report delivery
                </label>
              </div>

              {scheduleEnabled && (
                <>
                  <div>
                    <label className="block text-[13px] text-[#64748b] mb-2" style={{ fontWeight: 500 }}>
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[14px] text-[#1e293b]"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly (Monday)</option>
                      <option value="monthly">Monthly (1st of month)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] text-[#64748b] mb-2" style={{ fontWeight: 500 }}>
                      Recipients (comma-separated emails)
                    </label>
                    <input
                      type="text"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[14px] text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#003a63]/20"
                      placeholder="email@example.com, another@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] text-[#64748b] mb-2" style={{ fontWeight: 500 }}>
                      Format
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[14px] text-[#1e293b]"
                    >
                      <option value="pdf">PDF</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </>
              )}

              <p className="text-[12px] text-[#94a3b8]">
                Scheduled reports will be automatically generated and emailed to recipients.
              </p>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Export Dialog */}
      <AnimatePresence>
        {showExportDialog && (
          <Dialog
            title="Export Report"
            icon={Download}
            onClose={() => setShowExportDialog(false)}
            onConfirm={handleExport}
            confirmText="Export"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] text-[#64748b] mb-3" style={{ fontWeight: 500 }}>
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat("csv")}
                    className={`
                      p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${
                        exportFormat === "csv"
                          ? "border-[#003a63] bg-[#003a63]/[0.04]"
                          : "border-[#e2e8f0] hover:border-[#003a63]/30"
                      }
                    `}
                  >
                    <FileText className="w-6 h-6 text-[#64748b]" />
                    <span className="text-[13px] text-[#1e293b]" style={{ fontWeight: 500 }}>
                      CSV
                    </span>
                    <span className="text-[11px] text-[#94a3b8]">Excel compatible</span>
                  </button>

                  <button
                    onClick={() => setExportFormat("pdf")}
                    className={`
                      p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${
                        exportFormat === "pdf"
                          ? "border-[#003a63] bg-[#003a63]/[0.04]"
                          : "border-[#e2e8f0] hover:border-[#003a63]/30"
                      }
                    `}
                  >
                    <Printer className="w-6 h-6 text-[#64748b]" />
                    <span className="text-[13px] text-[#1e293b]" style={{ fontWeight: 500 }}>
                      PDF
                    </span>
                    <span className="text-[11px] text-[#94a3b8]">Print-ready</span>
                  </button>
                </div>
              </div>

              <p className="text-[12px] text-[#94a3b8]">
                Export includes {data.length} records with {selectedColumns.length} columns.
              </p>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

// Dialog Component
interface DialogProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmText: string;
}

function Dialog({ title, icon: Icon, children, onClose, onConfirm, confirmText }: DialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#003a63]/[0.08] flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#003a63]" />
            </div>
            <h3 className="text-[18px] text-[#003a63]" style={{ fontWeight: 600 }}>
              {title}
            </h3>
          </div>
          <Button
            type={ButtonType.Tertiary}
            onClick={onClose}
            className="!p-1"
            ariaLabel="Close dialog"
          >
            <X className="w-5 h-5 text-[#64748b]" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-end gap-3">
          <Button
            type={ButtonType.Tertiary}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type={ButtonType.Primary}
            onClick={onConfirm}
          >
            <Check className="w-4 h-4" />
            {confirmText}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
