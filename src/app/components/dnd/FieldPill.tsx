/**
 * Field Pill - Tableau-style draggable data field
 * Apple Design: Lift, shadow, spring physics
 */

import { useDrag } from "react-dnd";
import { X } from "lucide-react";
import "./field-pill.css";

export type FieldType = "dimension" | "measure";

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  dataType: "string" | "number" | "date" | "enum";
}

interface FieldPillProps {
  field: Field;
  onRemove?: () => void;
  aggregation?: string;
}

export function FieldPill({ field, onRemove, aggregation }: FieldPillProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "field",
    item: { field, aggregation },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`field-pill ${field.type === "measure" ? "field-pill--measure" : "field-pill--dimension"} ${
        isDragging ? "field-pill--dragging" : ""
      }`}
    >
      {/* Field type indicator */}
      <span className="field-pill__icon">
        {field.type === "measure" ? "#" : "abc"}
      </span>

      {/* Field name */}
      <span className="field-pill__label">
        {aggregation && <span className="field-pill__agg">{aggregation}(</span>}
        {field.name}
        {aggregation && <span className="field-pill__agg">)</span>}
      </span>

      {/* Remove button */}
      {onRemove && (
        <button
          className="field-pill__remove"
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
