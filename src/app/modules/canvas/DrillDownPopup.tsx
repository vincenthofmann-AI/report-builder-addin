/**
 * Drill-Down Popup
 * =================
 *
 * Shows detailed data when user clicks on a chart element (pie slice, bar, etc.)
 * Uses Zenith ControlledPopup for overlay with filtered table.
 *
 * Progressive disclosure pattern: Summary Chart → Detail Table → Raw Data
 */

import { useState } from "react";
import { X, Download, ChevronDown, ChevronRight } from "lucide-react";
import { Button, ButtonType } from "../../services/zenith-adapter";
import { type ColumnDef } from "../../services/geotab-mock";

interface DrillDownPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string; // e.g., "High Risk" or "Driver: John Smith"
  filteredData: Record<string, unknown>[]; // Data matching the clicked group
  columns: ColumnDef[]; // Columns to display
  anchorEl: HTMLElement | null; // Element that was clicked (for positioning)
}

export function DrillDownPopup({
  isOpen,
  onClose,
  groupName,
  filteredData,
  columns,
}: DrillDownPopupProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const exportToCSV = () => {
    const headers = columns.map((col) => col.label).join(",");
    const rows = filteredData.map((row) =>
      columns.map((col) => row[col.key] || "").join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${groupName.replace(/\s+/g, "_")}_details.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        style={{ backdropFilter: "blur(2px)" }}
      />

      {/* Popup */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-4xl md:max-h-[80vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0f172a]">{groupName}</h2>
            <p className="text-[13px] text-[#64748b] mt-0.5">
              {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type={ButtonType.Secondary}
              onClick={exportToCSV}
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
            <Button
              type={ButtonType.Tertiary}
              onClick={onClose}
              style={{ padding: "8px" }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#f8fafc] border-b border-[#e2e8f0]">
              <tr>
                <th className="w-8"></th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 text-[12px] font-semibold text-[#64748b] uppercase tracking-wide"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-8 text-center text-[13px] text-[#94a3b8]"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => {
                  const rowId = String(row.id || idx);
                  const isExpanded = expandedRows.has(rowId);

                  return (
                    <tr
                      key={rowId}
                      className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-2 py-3">
                        <button
                          onClick={() => toggleRow(rowId)}
                          className="text-[#94a3b8] hover:text-[#64748b] transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-4 py-3 text-[13px] text-[#0f172a]"
                        >
                          {col.type === "number"
                            ? Number(row[col.key] || 0).toLocaleString()
                            : col.type === "datetime"
                            ? new Date(String(row[col.key])).toLocaleString()
                            : String(row[col.key] || "-")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#64748b]">
              Click row to expand details
            </p>
            <Button type={ButtonType.Tertiary} onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
