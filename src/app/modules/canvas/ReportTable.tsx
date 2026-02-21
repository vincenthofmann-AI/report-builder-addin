/**
 * Apple-Level Report Table
 * Jony Ive Principles: Content First, Invisible Structure, Data Hero
 */

import { useState, useMemo } from "react";
import { type ColumnDef } from "../../services/geotab-mock";
import { groupAndAggregate, calculateSubtotals } from "../../../core/report-generator";
import "./report-table.css";

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

  // Compute grouped data if groupByColumn is provided
  const groupedData = useMemo(() => {
    if (!groupByColumn || !aggregateColumn) return null;
    return groupAndAggregate(data, groupByColumn, aggregateColumn, aggregateFn);
  }, [data, groupByColumn, aggregateColumn, aggregateFn]);

  // Calculate subtotals and grand total for grouped data
  const { grandTotal, subtotals } = useMemo(() => {
    if (!groupedData) return { grandTotal: 0, subtotals: new Map() };
    return calculateSubtotals(groupedData, aggregateFn);
  }, [groupedData, aggregateFn]);

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
      result[col.key] = avg.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      });
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
    if (value == null || value === "") return "—";
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

  // Empty states
  if (selectedColumns.length === 0) {
    return (
      <div className="apple-table-empty">
        <span className="apple-table-empty__icon">▦</span>
        <p className="apple-table-empty__title">No columns selected</p>
        <p className="apple-table-empty__subtitle">
          Toggle columns from the outline panel
        </p>
      </div>
    );
  }

  if (data.length === 0 && !isLoading) {
    return (
      <div className="apple-table-empty">
        <span className="apple-table-empty__icon">○</span>
        <p className="apple-table-empty__title">No matching records</p>
        <p className="apple-table-empty__subtitle">
          Try adjusting or clearing your filters
        </p>
      </div>
    );
  }

  return (
    <div className="apple-table-container">
      {/* Table */}
      <div className="apple-table-wrapper">
        <table className="apple-table">
          <thead className="apple-table__head">
            <tr>
              <th className="apple-table__cell apple-table__cell--number">#</th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`apple-table__cell apple-table__cell--header ${
                    col.type === "number" ? "apple-table__cell--number" : ""
                  }`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className={`apple-table__sort ${
                        sortKey === col.key ? "apple-table__sort--active" : ""
                      } ${
                        sortKey === col.key && sortDir === "desc"
                          ? "apple-table__sort--desc"
                          : ""
                      }`}
                    >
                      {col.label}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="apple-table__body">
            {isLoading
              ? // Shimmer skeleton
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="apple-table__row">
                    <td className="apple-table__cell apple-table__cell--number">
                      <div className="apple-table__skeleton apple-table__skeleton--sm" />
                    </td>
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`apple-table__cell ${
                          col.type === "number" ? "apple-table__cell--number" : ""
                        }`}
                      >
                        <div
                          className="apple-table__skeleton shimmer"
                          style={{
                            width: `${Math.random() * 40 + 40}%`,
                            animationDelay: `${idx * 100}ms`,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : groupedData && groupByColumn
              ? // Render grouped data with subtotals
                groupedData.flatMap((group, groupIdx) => {
                  const rows = [];

                  // Group header
                  rows.push(
                    <tr key={`group-${groupIdx}`} className="apple-table__row apple-table__row--group-header">
                      <td className="apple-table__cell" colSpan={1 + visibleColumns.length} style={{ fontWeight: 600, background: '#f1f5f9', padding: '12px 16px' }}>
                        {group.groupName}
                      </td>
                    </tr>
                  );

                  // Group records
                  group.records.forEach((row, idx) => {
                    rows.push(
                      <tr key={`group-${groupIdx}-row-${idx}`} className="apple-table__row">
                        <td className="apple-table__cell apple-table__cell--number apple-table__cell--row-num">
                          {idx + 1}
                        </td>
                        {visibleColumns.map((col) => {
                          const val = row[col.key];
                          const isEnum = col.type === "enum";
                          return (
                            <td
                              key={col.key}
                              className={`apple-table__cell ${
                                col.type === "number" ? "apple-table__cell--number" : ""
                              }`}
                            >
                              {isEnum ? (
                                <span className={`apple-table__badge ${getBadgeClass(val)}`}>
                                  {String(val)}
                                </span>
                              ) : (
                                formatValue(val, col.type)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  });

                  // Subtotal row
                  rows.push(
                    <tr key={`group-${groupIdx}-subtotal`} className="apple-table__row" style={{ fontWeight: 600, background: '#f8fafc' }}>
                      <td className="apple-table__cell apple-table__cell--number">Σ</td>
                      {visibleColumns.map((col, colIdx) => {
                        const isAggregateCol = col.key === aggregateColumn;
                        return (
                          <td
                            key={col.key}
                            className={`apple-table__cell ${
                              col.type === "number" ? "apple-table__cell--number" : ""
                            }`}
                          >
                            {colIdx === 0 ? (
                              <>Subtotal: ({group.count} records)</>
                            ) : isAggregateCol ? (
                              group.value.toLocaleString("en-US", { maximumFractionDigits: 1 })
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );

                  return rows;
                })
              : // Render flat data
                pagedData.map((row, idx) => {
                  const rowNum = safePage * PAGE_SIZE + idx + 1;
                  return (
                    <tr key={`row-${safePage}-${idx}`} className="apple-table__row">
                      <td className="apple-table__cell apple-table__cell--number apple-table__cell--row-num">
                        {rowNum}
                      </td>
                      {visibleColumns.map((col) => {
                        const val = row[col.key];
                        const isEnum = col.type === "enum";
                        return (
                          <td
                            key={col.key}
                            className={`apple-table__cell ${
                              col.type === "number" ? "apple-table__cell--number" : ""
                            }`}
                          >
                            {isEnum ? (
                              <span
                                className={`apple-table__badge ${getBadgeClass(val)}`}
                              >
                                {String(val)}
                              </span>
                            ) : (
                              formatValue(val, col.type)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
          </tbody>

          {/* Summary footer */}
          {!isLoading && (
            <tfoot className="apple-table__footer">
              {groupedData && groupByColumn ? (
                // Grand total for grouped data
                <tr style={{ fontWeight: 700, background: '#e2e8f0' }}>
                  <td className="apple-table__cell apple-table__cell--number">Σ</td>
                  {visibleColumns.map((col, colIdx) => {
                    const isAggregateCol = col.key === aggregateColumn;
                    return (
                      <td
                        key={col.key}
                        className={`apple-table__cell ${
                          col.type === "number" ? "apple-table__cell--number" : ""
                        }`}
                      >
                        {colIdx === 0 ? (
                          <>GRAND TOTAL: ({data.length} records)</>
                        ) : isAggregateCol ? (
                          grandTotal.toLocaleString("en-US", { maximumFractionDigits: 1 })
                        ) : (
                          ""
                        )}
                      </td>
                    );
                  })}
                </tr>
              ) : Object.keys(summaryValues).length > 0 ? (
                // Average summary for flat data
                <tr>
                  <td className="apple-table__cell apple-table__cell--number">Σ</td>
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`apple-table__cell ${
                        col.type === "number" ? "apple-table__cell--number" : ""
                      }`}
                    >
                      {summaryValues[col.key] ? (
                        <>
                          <span className="apple-table__summary-value">
                            {summaryValues[col.key]}
                          </span>
                          <span className="apple-table__summary-label"> avg</span>
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                  ))}
                </tr>
              ) : null}
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="apple-table-pagination">
          <span className="apple-table-pagination__info">
            <span className="apple-table-pagination__range">
              {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, sortedData.length)}
            </span>
            <span className="apple-table-pagination__total">
              {" "}
              of {sortedData.length.toLocaleString()}
            </span>
          </span>
          <div className="apple-table-pagination__controls">
            <PaginationButton
              disabled={safePage === 0}
              onClick={() => setPage(0)}
              title="First"
            >
              ‹‹
            </PaginationButton>
            <PaginationButton
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              title="Previous"
            >
              ‹
            </PaginationButton>

            {getPageNumbers(safePage, totalPages).map((pageNum, i) =>
              pageNum === -1 ? (
                <span key={`ellipsis-${i}`} className="apple-table-pagination__ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`apple-table-pagination__page ${
                    safePage === pageNum ? "apple-table-pagination__page--active" : ""
                  }`}
                >
                  {pageNum + 1}
                </button>
              )
            )}

            <PaginationButton
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
              title="Next"
            >
              ›
            </PaginationButton>
            <PaginationButton
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
              title="Last"
            >
              ››
            </PaginationButton>
          </div>
        </div>
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
      className="apple-table-pagination__button"
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

function getBadgeClass(value: unknown): string {
  const val = String(value);
  if (val === "Critical" || val === "Overdue") return "apple-table__badge--red";
  if (val === "High") return "apple-table__badge--orange";
  if (val === "Medium" || val === "Pending" || val === "Scheduled")
    return "apple-table__badge--yellow";
  if (val === "Active") return "apple-table__badge--blue";
  if (val === "Completed" || val === "Resolved") return "apple-table__badge--green";
  return "apple-table__badge--gray";
}
