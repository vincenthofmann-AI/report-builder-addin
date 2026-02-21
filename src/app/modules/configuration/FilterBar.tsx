/**
 * Apple-Level Filter Bar
 * Jony Ive Principles: Plain English, Invisible UI, Content First
 */

import { useState, useRef } from "react";
import { type ColumnDef } from "../../services/geotab-mock";
import { ControlledPopup } from "../../services/zenith-adapter";
import { FilterPill, FilterPillGroup } from "../../components/apple";
import { Button, Input } from "../../components/apple";
import "./filter-bar.css";

export interface FilterRule {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface FilterBarProps {
  columns: ColumnDef[];
  filters: FilterRule[];
  onFiltersChange: (filters: FilterRule[]) => void;
  totalRecords: number;
  filteredRecords: number;
}

const operatorsByType: Record<string, { value: string; label: string }[]> = {
  string: [
    { value: "contains", label: "contains" },
    { value: "equals", label: "is" },
    { value: "startsWith", label: "starts with" },
    { value: "notEquals", label: "is not" },
  ],
  number: [
    { value: "equals", label: "=" },
    { value: "gt", label: ">" },
    { value: "gte", label: ">=" },
    { value: "lt", label: "<" },
    { value: "lte", label: "<=" },
    { value: "notEquals", label: "!=" },
  ],
  date: [
    { value: "after", label: "after" },
    { value: "before", label: "before" },
    { value: "equals", label: "on" },
  ],
  enum: [
    { value: "equals", label: "is" },
    { value: "notEquals", label: "is not" },
  ],
};

function formatFilterValue(
  column: ColumnDef,
  operator: string,
  value: string
): string {
  const ops = operatorsByType[column.type] || operatorsByType.string;
  const opLabel = ops.find((o) => o.value === operator)?.label || operator;

  // For string "contains", don't show operator
  if (column.type === "string" && operator === "contains") {
    return value;
  }

  // For equals, just show value
  if (operator === "equals" && column.type !== "date") {
    return value;
  }

  // Otherwise show operator + value
  return `${opLabel} ${value}`;
}

export function FilterBar({
  columns,
  filters,
  onFiltersChange,
  totalRecords,
  filteredRecords,
}: FilterBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingFilter, setAddingFilter] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const filterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filterableColumns = columns.filter((c) => c.filterable);
  const hasFilters = filters.length > 0;
  const isFiltered = filteredRecords !== totalRecords;

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    onFiltersChange([]);
  };

  return (
    <div className="apple-filter-bar">
      {/* Filter Pills */}
      {hasFilters ? (
        <FilterPillGroup onClearAll={clearAll}>
          {filters.map((filter) => {
            const col = columns.find((c) => c.key === filter.column);
            if (!col) return null;

            return (
              <div
                key={filter.id}
                ref={(el) => {
                  if (el) filterRefs.current.set(filter.id, el);
                  else filterRefs.current.delete(filter.id);
                }}
              >
                <FilterPill
                  label={col.label}
                  value={formatFilterValue(col, filter.operator, filter.value)}
                  onRemove={() => removeFilter(filter.id)}
                  onEdit={() =>
                    setEditingId(editingId === filter.id ? null : filter.id)
                  }
                />

                {filterRefs.current.get(filter.id) && editingId === filter.id && (
                  <ControlledPopup
                    triggerRef={{
                      current: filterRefs.current.get(filter.id) || null,
                    }}
                    isOpen={editingId === filter.id}
                    onOpenChange={(open) => setEditingId(open ? filter.id : null)}
                    alignment="bottom-left"
                    className="apple-filter-editor"
                  >
                    <FilterEditor
                      filter={filter}
                      columns={filterableColumns}
                      onSave={(updated) => {
                        onFiltersChange(
                          filters.map((f) => (f.id === updated.id ? updated : f))
                        );
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </ControlledPopup>
                )}
              </div>
            );
          })}
        </FilterPillGroup>
      ) : (
        <span className="apple-filter-bar__empty">No filters</span>
      )}

      {/* Add Filter Button */}
      <Button
        ref={addButtonRef}
        variant="text"
        size="small"
        onClick={() => setAddingFilter(!addingFilter)}
      >
        Add filter
      </Button>

      {addButtonRef.current && (
        <ControlledPopup
          triggerRef={addButtonRef}
          isOpen={addingFilter}
          onOpenChange={setAddingFilter}
          alignment="bottom-left"
          className="apple-filter-editor"
        >
          <FilterEditor
            columns={filterableColumns}
            onSave={(newFilter) => {
              onFiltersChange([...filters, newFilter]);
              setAddingFilter(false);
            }}
            onCancel={() => setAddingFilter(false)}
          />
        </ControlledPopup>
      )}

      {/* Record Count - Right side */}
      {isFiltered && (
        <div className="apple-filter-bar__count">
          <span className="apple-filter-bar__count-value">
            {filteredRecords.toLocaleString()}
          </span>
          <span className="apple-filter-bar__count-total">
            {" "}
            of {totalRecords.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

// ------- Filter Editor (Apple-level) -------

function FilterEditor({
  filter,
  columns,
  onSave,
  onCancel,
}: {
  filter?: FilterRule;
  columns: ColumnDef[];
  onSave: (filter: FilterRule) => void;
  onCancel: () => void;
}) {
  const [column, setColumn] = useState(filter?.column || columns[0]?.key || "");
  const [operator, setOperator] = useState(filter?.operator || "");
  const [value, setValue] = useState(filter?.value || "");

  const selectedCol = columns.find((c) => c.key === column);
  const operators =
    operatorsByType[selectedCol?.type || "string"] || operatorsByType.string;

  // Set initial operator
  useState(() => {
    if (!operator && operators.length > 0) {
      setOperator(operators[0].value);
    }
  });

  const handleSave = () => {
    onSave({
      id: filter?.id || `filter-${Date.now()}`,
      column,
      operator: operator || operators[0].value,
      value,
    });
  };

  const handleColumnChange = (newColumn: string) => {
    setColumn(newColumn);
    const col = columns.find((c) => c.key === newColumn);
    const ops = operatorsByType[col?.type || "string"] || operatorsByType.string;
    setOperator(ops[0].value);
    setValue("");
  };

  return (
    <div className="apple-filter-editor__content">
      {/* Column */}
      <div className="apple-filter-editor__field">
        <label className="apple-filter-editor__label">Column</label>
        <select
          className="apple-filter-editor__select"
          value={column}
          onChange={(e) => handleColumnChange(e.target.value)}
        >
          {columns.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Operator */}
      <div className="apple-filter-editor__field">
        <label className="apple-filter-editor__label">Condition</label>
        <select
          className="apple-filter-editor__select"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Value */}
      <div className="apple-filter-editor__field">
        <label className="apple-filter-editor__label">Value</label>
        {selectedCol?.type === "enum" && selectedCol.enumValues ? (
          <select
            className="apple-filter-editor__select"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            <option value="">Select...</option>
            {selectedCol.enumValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ) : (
          <Input
            type={
              selectedCol?.type === "number"
                ? "number"
                : selectedCol?.type === "date"
                ? "date"
                : "text"
            }
            placeholder={
              selectedCol?.type === "number"
                ? "Enter number..."
                : selectedCol?.type === "date"
                ? ""
                : "Type to filter..."
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") onCancel();
            }}
            autoFocus
          />
        )}
      </div>

      {/* Actions */}
      <div className="apple-filter-editor__actions">
        <Button onClick={handleSave} variant="primary" size="small">
          Apply
        </Button>
        <Button onClick={onCancel} variant="secondary" size="small">
          Cancel
        </Button>
      </div>
    </div>
  );
}
