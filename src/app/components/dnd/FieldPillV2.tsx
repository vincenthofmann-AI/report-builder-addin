/**
 * Field Pill V2 - Improved UX with context menu
 * Patterns: Tableau right-click menu + Power BI dropdown
 */

import { useState, useRef } from "react";
import { useDrag } from "react-dnd";
import { X, ChevronDown } from "lucide-react";
import { ControlledPopup } from "../../services/zenith-adapter";
import "./field-pill-v2.css";

export type FieldType = "dimension" | "measure";
export type Aggregation = "SUM" | "AVG" | "COUNT" | "MIN" | "MAX" | "NONE";

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  dataType: "string" | "number" | "date" | "enum";
}

interface FieldPillV2Props {
  field: Field;
  aggregation?: Aggregation;
  onRemove?: () => void;
  onAggregationChange?: (agg: Aggregation) => void;
  showAggregation?: boolean;
}

const AGGREGATION_OPTIONS: Aggregation[] = ["SUM", "AVG", "COUNT", "MIN", "MAX"];

export function FieldPillV2({
  field,
  aggregation = "NONE",
  onRemove,
  onAggregationChange,
  showAggregation = false,
}: FieldPillV2Props) {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "field",
    item: { field, aggregation },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const isMeasure = field.type === "measure";
  const canAggregate = isMeasure && showAggregation;

  return (
    <div
      ref={drag}
      className={`field-pill-v2 ${
        field.type === "measure" ? "field-pill-v2--measure" : "field-pill-v2--dimension"
      } ${isDragging ? "field-pill-v2--dragging" : ""}`}
    >
      {/* Field type icon */}
      <span className="field-pill-v2__icon">
        {field.type === "measure" ? "#" : "abc"}
      </span>

      {/* Field name */}
      <span className="field-pill-v2__label">
        {aggregation !== "NONE" && <span className="field-pill-v2__agg">{aggregation}(</span>}
        {field.name}
        {aggregation !== "NONE" && <span className="field-pill-v2__agg">)</span>}
      </span>

      {/* Aggregation menu (for measures in drop zones) */}
      {canAggregate && onAggregationChange && (
        <>
          <button
            ref={menuButtonRef}
            className="field-pill-v2__menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            aria-label="Change aggregation"
          >
            <ChevronDown className="w-3 h-3" />
          </button>

          {menuButtonRef.current && (
            <ControlledPopup
              triggerRef={menuButtonRef}
              isOpen={showMenu}
              onOpenChange={setShowMenu}
              alignment="bottom-right"
              className="field-pill-v2__menu"
            >
              <div className="field-pill-v2__menu-content">
                <div className="field-pill-v2__menu-label">Aggregate</div>
                {AGGREGATION_OPTIONS.map((agg) => (
                  <button
                    key={agg}
                    className={`field-pill-v2__menu-item ${
                      aggregation === agg ? "field-pill-v2__menu-item--active" : ""
                    }`}
                    onClick={() => {
                      onAggregationChange(agg);
                      setShowMenu(false);
                    }}
                  >
                    {agg}
                  </button>
                ))}
                <div className="field-pill-v2__menu-divider" />
                <button
                  className="field-pill-v2__menu-item"
                  onClick={() => {
                    onAggregationChange("NONE");
                    setShowMenu(false);
                  }}
                >
                  No Aggregation
                </button>
              </div>
            </ControlledPopup>
          )}
        </>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          className="field-pill-v2__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${field.name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
