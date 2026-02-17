import { useState, useMemo } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
} from "lucide-react";
import { type ColumnDef } from "../../services/geotab-mock";
import { motion, AnimatePresence } from "motion/react";

interface ReportTableProps {
  data: Record<string, unknown>[];
  columns: ColumnDef[];
  selectedColumns: string[];
  groupByColumn: string | null;
  aggregateColumn: string | null;
  aggregateFn: "sum" | "avg" | "count" | "min" | "max";
  isLoading?: boolean;
}

const PAGE_SIZE = 15;

export function ReportTable({
  data,
  columns,
  selectedColumns,
  groupByColumn,
  aggregateColumn,
  aggregateFn,
  isLoading = false,
}: ReportTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const visibleColumns = useMemo(
    () =>
      selectedColumns
        .map((key) => columns.find((c) => c.key === key)!)
        .filter(Boolean),
    [selectedColumns, columns]
  );

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || "");
      const bStr = String(bVal || "");
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pagedData = sortedData.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE
  );

  // Summary row
  const summaryValues = useMemo(() => {
    if (data.length === 0) return {};
    const result: Record<string, string> = {};
    visibleColumns.forEach((col) => {
      if (!col.aggregatable) return;
      const values = data
        .map((r) => Number(r[col.key]))
        .filter((v) => !isNaN(v));
      if (values.length === 0) return;
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      result[col.key] = `${avg.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      })} avg`;
    });
    return result;
  }, [data, visibleColumns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const formatValue = (value: unknown, type: string): string => {
    if (value == null || value === "") return "\u2014";
    if (type === "date") {
      try {
        return new Date(String(value)).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return String(value);
      }
    }
    if (type === "number") {
      return Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 1,
      });
    }
    return String(value);
  };

  if (selectedColumns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-48 text-center"
      >
        <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center mb-3">
          <Columns3 className="w-5 h-5 text-[#94a3b8]" />
        </div>
        <p className="text-[13px] text-[#64748b]" style={{ fontWeight: 500 }}>No columns selected</p>
        <p className="text-[12px] text-[#94a3b8] mt-1">Toggle columns from the outline panel to see data</p>
      </motion.div>
    );
  }

  if (data.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-48 text-center"
      >
        <div className="w-10 h-10 rounded-xl bg-[#fef2f2] flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-[#f87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-[13px] text-[#64748b]" style={{ fontWeight: 500 }}>No matching records</p>
        <p className="text-[12px] text-[#94a3b8] mt-1">Try adjusting or clearing your filters</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table */}
      <div className="overflow-x-auto border border-[#e2e8f0] rounded-xl bg-white shadow-sm shadow-[#003a63]/[0.03]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]/60">
              <th className="w-10 px-3 py-2.5 text-center text-[11px] text-[#94a3b8]" style={{ fontWeight: 500 }}>
                #
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-3 py-2.5 text-[11px] text-[#475569] uppercase tracking-wider whitespace-nowrap select-none"
                  style={{ fontWeight: 600 }}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-[#003a63] transition-colors group"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-[#003a63]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#003a63]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? // Skeleton loading rows
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr
                    key={`skeleton-${idx}`}
                    className="border-b border-[#f1f5f9] last:border-b-0"
                  >
                    <td className="w-10 px-3 py-2.5">
                      <div className="h-3 w-4 bg-[#f1f5f9] rounded animate-pulse mx-auto" />
                    </td>
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-3 py-2.5">
                        <div
                          className="h-3 bg-[#f1f5f9] rounded animate-pulse"
                          style={{
                            width: `${Math.random() * 40 + 40}%`,
                            animationDelay: `${idx * 50}ms`,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : pagedData.map((row, idx) => {
                  const rowNum = safePage * PAGE_SIZE + idx + 1;
                  return (
                    <motion.tr
                      key={`row-${safePage}-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: idx * 0.01 }}
                      className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#003a63]/[0.015] transition-colors group"
                    >
                      <td className="w-10 px-3 py-2 text-center text-[11px] text-[#cbd5e1] group-hover:text-[#94a3b8] tabular-nums transition-colors">
                        {rowNum}
                      </td>
                      {visibleColumns.map((col) => {
                        const val = row[col.key];
                        const isEnum = col.type === "enum";
                        return (
                          <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                            {isEnum ? (
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
                                  val === "Critical" || val === "Overdue"
                                    ? "bg-[#fef2f2] text-[#dc2626]"
                                    : val === "High"
                                    ? "bg-[#fff7ed] text-[#ea580c]"
                                    : val === "Medium" ||
                                      val === "Pending" ||
                                      val === "Scheduled"
                                    ? "bg-[#fffbeb] text-[#d97706]"
                                    : val === "Active"
                                    ? "bg-[#eff6ff] text-[#2563eb]"
                                    : val === "Completed" || val === "Resolved"
                                    ? "bg-[#f0fdf4] text-[#16a34a]"
                                    : "bg-[#f8fafc] text-[#475569]"
                                }`}
                                style={{ fontWeight: 500 }}
                              >
                                {String(val)}
                              </span>
                            ) : (
                              <span
                                className={
                                  col.type === "number"
                                    ? "tabular-nums text-[#1e293b]"
                                    : "text-[#334155]"
                                }
                              >
                                {formatValue(val, col.type)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
          </tbody>

          {/* Summary footer */}
          {Object.keys(summaryValues).length > 0 && !isLoading && (
            <tfoot>
              <tr className="bg-[#f8fafc] border-t border-[#e2e8f0]">
                <td className="px-3 py-2 text-[11px] text-[#64748b]" style={{ fontWeight: 600 }}>
                  &Sigma;
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 py-2 text-[11px] text-[#475569] tabular-nums"
                    style={{ fontWeight: 500 }}
                  >
                    {summaryValues[col.key] || ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mt-3 px-1"
        >
          <span className="text-[12px] text-[#64748b] tabular-nums">
            <span style={{ fontWeight: 500 }}>
              {safePage * PAGE_SIZE + 1}&ndash;
              {Math.min((safePage + 1) * PAGE_SIZE, sortedData.length)}
            </span>
            <span className="text-[#94a3b8]">
              {" "}of {sortedData.length.toLocaleString()}
            </span>
          </span>
          <div className="flex items-center gap-0.5">
            <PaginationButton
              disabled={safePage === 0}
              onClick={() => setPage(0)}
              title="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </PaginationButton>
            <PaginationButton
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </PaginationButton>

            {getPageNumbers(safePage, totalPages).map((pageNum, i) =>
              pageNum === -1 ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-7 text-center text-[#94a3b8] text-[12px]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded-md text-[12px] transition-all duration-150 ${
                    safePage === pageNum
                      ? "bg-[#003a63] text-white shadow-sm"
                      : "text-[#475569] hover:bg-[#f1f5f9]"
                  }`}
                  style={{ fontWeight: safePage === pageNum ? 600 : 400 }}
                >
                  {pageNum + 1}
                </button>
              )
            )}

            <PaginationButton
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </PaginationButton>
            <PaginationButton
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
              title="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </PaginationButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
  title,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md text-[#475569] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:pointer-events-none transition-colors"
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages: number[] = [];
  pages.push(0);

  if (current > 3) pages.push(-1); // ellipsis

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 4) pages.push(-1); // ellipsis

  pages.push(total - 1);
  return pages;
}
