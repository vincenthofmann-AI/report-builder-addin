/**
 * FieldPicker Component
 * ======================
 *
 * Multi-select field picker for the selected MyGeotab object.
 * Shows available fields with type indicators and descriptions.
 *
 * ZENITH-ONLY: Uses @geotab/zenith Checkbox and FormGroup components
 */

import { Type, Hash, Calendar, ToggleLeft } from 'lucide-react';
import { Checkbox, FormGroup, Divider } from '../../../services/zenith-adapter';
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
      <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '14px', color: '#94a3b8' }}>
        No fields available for this object type
      </div>
    );
  }

  const requiredFields = fields.filter((f) => f.required);
  const optionalFields = fields.filter((f) => !f.required);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Required Fields */}
      {requiredFields.length > 0 && (
        <FormGroup label="Required Fields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {requiredFields.map((field) => {
              const IconComponent = fieldTypeIcons[field.type];
              const isSelected = selectedFields.includes(field.name);

              return (
                <div
                  key={field.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleField(field.name)}
                  />
                  <IconComponent style={{ width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                      {field.label}
                    </div>
                    {field.description && (
                      <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {field.description}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{field.type}</div>
                </div>
              );
            })}
          </div>
        </FormGroup>
      )}

      {/* Optional Fields */}
      {optionalFields.length > 0 && (
        <FormGroup label="Optional Fields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {optionalFields.map((field) => {
              const IconComponent = fieldTypeIcons[field.type];
              const isSelected = selectedFields.includes(field.name);

              return (
                <div
                  key={field.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleField(field.name)}
                  />
                  <IconComponent style={{ width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                      {field.label}
                    </div>
                    {field.description && (
                      <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {field.description}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{field.type}</div>
                </div>
              );
            })}
          </div>
        </FormGroup>
      )}

      {/* Selection Summary */}
      <div>
        <Divider />
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
          {selectedFields.length} {selectedFields.length === 1 ? 'field' : 'fields'}{' '}
          selected
        </div>
      </div>
    </div>
  );
}
