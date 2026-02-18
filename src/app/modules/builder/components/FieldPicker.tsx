/**
 * FieldPicker Component
 * ======================
 *
 * Multi-select field picker for the selected MyGeotab object.
 * Shows available fields with type indicators and descriptions.
 */

import { Type, Hash, Calendar, ToggleLeft } from 'lucide-react';
import type { MyGeotabObjectType } from '../types/builder.types';
import { OBJECT_FIELDS } from '../types/objects.constants';

interface FieldPickerProps {
  objectType: MyGeotabObjectType;
  selectedFields: string[];
  onToggleField: (fieldName: string) => void;
}

const fieldTypeIcons = {
  string: Type,
  number: Hash,
  date: Calendar,
  boolean: ToggleLeft,
  object: Type,
};

export function FieldPicker({
  objectType,
  selectedFields,
  onToggleField,
}: FieldPickerProps) {
  const fields = OBJECT_FIELDS[objectType] || [];

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[#94a3b8]">
        No fields available for this object type
      </div>
    );
  }

  const requiredFields = fields.filter((f) => f.required);
  const optionalFields = fields.filter((f) => !f.required);

  return (
    <div className="space-y-4">
      {/* Required Fields */}
      {requiredFields.length > 0 && (
        <div>
          <div className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-2">
            Required Fields
          </div>
          <div className="space-y-1">
            {requiredFields.map((field) => {
              const IconComponent = fieldTypeIcons[field.type];
              const isSelected = selectedFields.includes(field.name);

              return (
                <label
                  key={field.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f8fafc] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleField(field.name)}
                    className="w-4 h-4 text-[#003a63] border-[#cbd5e1] rounded focus:ring-[#003a63] focus:ring-offset-0"
                  />
                  <IconComponent className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0f172a]">
                      {field.label}
                    </div>
                    {field.description && (
                      <div className="text-xs text-[#64748b] truncate">
                        {field.description}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[#94a3b8] font-mono">{field.type}</div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Fields */}
      {optionalFields.length > 0 && (
        <div>
          <div className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-2">
            Optional Fields
          </div>
          <div className="space-y-1">
            {optionalFields.map((field) => {
              const IconComponent = fieldTypeIcons[field.type];
              const isSelected = selectedFields.includes(field.name);

              return (
                <label
                  key={field.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f8fafc] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleField(field.name)}
                    className="w-4 h-4 text-[#003a63] border-[#cbd5e1] rounded focus:ring-[#003a63] focus:ring-offset-0"
                  />
                  <IconComponent className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0f172a]">
                      {field.label}
                    </div>
                    {field.description && (
                      <div className="text-xs text-[#64748b] truncate">
                        {field.description}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[#94a3b8] font-mono">{field.type}</div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      <div className="pt-2 border-t border-[#e2e8f0]">
        <div className="text-xs text-[#64748b]">
          {selectedFields.length} {selectedFields.length === 1 ? 'field' : 'fields'}{' '}
          selected
        </div>
      </div>
    </div>
  );
}
