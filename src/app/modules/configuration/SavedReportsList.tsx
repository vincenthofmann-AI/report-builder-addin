/**
 * Saved Reports List (Pattern B: Collection)
 * ============================================
 *
 * MYG Playbook: Pattern B (Inner Sidebar/Panel)
 * A vertical list panel on the left side of the App Canvas.
 * Selecting an item updates the content in the primary canvas.
 *
 * Best For: Management tasks where users browse a large directory
 * while viewing specific details for the selected item.
 */

import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Clock,
  Calendar,
  Star,
  MoreVertical,
  ChevronRight,
} from "lucide-react";

interface SavedReport {
  id: string;
  name: string;
  category: string;
  lastModified: string;
  isFavorite: boolean;
  isScheduled: boolean;
}

interface SavedReportsListProps {
  selectedReportId: string | null;
  onSelectReport: (reportId: string) => void;
}

export function SavedReportsList({
  selectedReportId,
  onSelectReport,
}: SavedReportsListProps) {
  // Mock data - replace with real saved reports from MyGeotab Storage API
  const savedReports: SavedReport[] = [
    {
      id: "1",
      name: "Fleet Safety Scorecard",
      category: "Safety & Compliance",
      lastModified: "2 hours ago",
      isFavorite: true,
      isScheduled: true,
    },
    {
      id: "2",
      name: "Idling Violations Q1",
      category: "Cost Savings",
      lastModified: "Yesterday",
      isFavorite: false,
      isScheduled: true,
    },
    {
      id: "3",
      name: "Maintenance Overview",
      category: "Fleet Health",
      lastModified: "3 days ago",
      isFavorite: true,
      isScheduled: false,
    },
    {
      id: "4",
      name: "Driver Performance Jan 2026",
      category: "Safety & Compliance",
      lastModified: "1 week ago",
      isFavorite: false,
      isScheduled: false,
    },
    {
      id: "5",
      name: "Fuel Efficiency Trends",
      category: "Cost Savings",
      lastModified: "2 weeks ago",
      isFavorite: false,
      isScheduled: false,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-[#e2e8f0]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e2e8f0]">
        <h2 className="text-sm font-semibold text-[#0f172a]">My Reports</h2>
        <p className="text-xs text-[#94a3b8] mt-0.5">{savedReports.length} saved</p>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {savedReports.map((report, i) => (
            <motion.button
              key={report.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelectReport(report.id)}
              className={`w-full px-4 py-3 text-left transition-colors border-l-2 ${
                selectedReportId === report.id
                  ? "bg-[#f0f4f8] border-[#003a63]"
                  : "border-transparent hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedReportId === report.id
                      ? "bg-[#003a63]"
                      : "bg-[#f1f5f9]"
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 ${
                      selectedReportId === report.id
                        ? "text-white"
                        : "text-[#64748b]"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-medium truncate ${
                        selectedReportId === report.id
                          ? "text-[#003a63]"
                          : "text-[#0f172a]"
                      }`}
                    >
                      {report.name}
                    </p>
                    {report.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b] shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-[#94a3b8] mt-0.5 truncate">
                    {report.category}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-[#cbd5e1]">
                      <Clock className="w-3 h-3" />
                      <span>{report.lastModified}</span>
                    </div>
                    {report.isScheduled && (
                      <div className="flex items-center gap-1 text-xs text-[#78be20]">
                        <Calendar className="w-3 h-3" />
                        <span>Scheduled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-opacity ${
                    selectedReportId === report.id
                      ? "text-[#003a63] opacity-100"
                      : "text-[#cbd5e1] opacity-0 group-hover:opacity-100"
                  }`}
                />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-[#e2e8f0]">
        <button className="w-full px-3 py-2 text-sm text-[#003a63] hover:bg-[#f8fafc] rounded-lg transition-colors font-medium">
          View All Reports →
        </button>
      </div>
    </div>
  );
}
