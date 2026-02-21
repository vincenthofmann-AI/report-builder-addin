/**
 * Apple-Level Filter Pill Component
 * Jony Ive Principles: Clarity, Simplicity, Plain English
 */

import { ReactNode } from "react";
import "./filter-pill.css";

interface FilterPillProps {
  label: string;
  value: ReactNode;
  onRemove?: () => void;
  onEdit?: () => void;
}

export function FilterPill({ label, value, onRemove, onEdit }: FilterPillProps) {
  return (
    <div className="apple-filter-pill" onClick={onEdit} role={onEdit ? "button" : undefined}>
      <span className="apple-filter-pill__text">
        <span className="apple-filter-pill__label">{label}</span>
        <span className="apple-filter-pill__separator">:</span>
        <span className="apple-filter-pill__value">{value}</span>
      </span>

      {onRemove && (
        <button
          className="apple-filter-pill__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label} filter`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

interface FilterPillGroupProps {
  children: ReactNode;
  onClearAll?: () => void;
}

export function FilterPillGroup({ children, onClearAll }: FilterPillGroupProps) {
  return (
    <div className="apple-filter-pill-group">
      {children}
      {onClearAll && (
        <button className="apple-filter-pill-group__clear" onClick={onClearAll}>
          Clear all
        </button>
      )}
    </div>
  );
}
