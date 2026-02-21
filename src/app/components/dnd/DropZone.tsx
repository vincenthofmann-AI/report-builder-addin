/**
 * Drop Zone - Tableau-style shelf for field pills
 * Apple Design: Highlight on hover, spring animations
 */

import { useDrop } from "react-dnd";
import { FieldPill, type Field } from "./FieldPill";
import "./drop-zone.css";

interface DroppedField {
  field: Field;
  aggregation?: string;
}

interface DropZoneProps {
  label: string;
  fields: DroppedField[];
  onDrop: (field: Field, aggregation?: string) => void;
  onRemove: (index: number) => void;
  acceptTypes?: string[];
}

export function DropZone({
  label,
  fields,
  onDrop,
  onRemove,
  acceptTypes = ["dimension", "measure"],
}: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "field",
    drop: (item: { field: Field; aggregation?: string }) => {
      onDrop(item.field, item.aggregation);
    },
    canDrop: (item: { field: Field }) => {
      return acceptTypes.includes(item.field.type);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`drop-zone ${isOver && canDrop ? "drop-zone--hover" : ""} ${
        !canDrop && isOver ? "drop-zone--invalid" : ""
      }`}
    >
      {/* Label */}
      <div className="drop-zone__label">{label}</div>

      {/* Field pills */}
      <div className="drop-zone__content">
        {fields.length === 0 ? (
          <div className="drop-zone__placeholder">
            Drop {acceptTypes.join(" or ")} here
          </div>
        ) : (
          fields.map((droppedField, index) => (
            <FieldPill
              key={`${droppedField.field.id}-${index}`}
              field={droppedField.field}
              aggregation={droppedField.aggregation}
              onRemove={() => onRemove(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}
