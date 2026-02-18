/**
 * VisualCanvas Component
 * =======================
 *
 * Visual representation of the report being built.
 * Shows:
 * - Column headers (fields)
 * - Sample data structure
 * - Grouping indicators
 * - Chart preview
 *
 * Direct manipulation:
 * - Click columns to configure
 * - Drag to reorder
 * - Drop to add fields
 */

import { GripVertical, X, Settings, Plus } from 'lucide-react';
import { Button, ButtonType, Card, Divider } from '../../../services/zenith-adapter';
import type { MyGeotabObjectType, LayoutView, ChartType } from '../types/builder.types';
import { OBJECT_FIELDS } from '../types/objects.constants';

interface VisualCanvasProps {
  objectType: MyGeotabObjectType | null;
  selectedFields: string[];
  layoutView: LayoutView;
  chartType?: ChartType;
  groupBy?: string;
  onRemoveField: (fieldName: string) => void;
  onReorderFields: (fromIndex: number, toIndex: number) => void;
  onAddFieldClick: () => void;
  estimatedRows: number;
}

/**
 * Get field display information
 */
function getFieldInfo(objectType: MyGeotabObjectType, fieldName: string) {
  const allFields = OBJECT_FIELDS[objectType] || [];
  const field = allFields.find((f) => f.name === fieldName);

  if (!field) {
    return {
      label: fieldName,
      type: 'string',
      icon: 'Aa',
    };
  }

  const typeIcons: Record<string, string> = {
    string: 'Aa',
    number: '#',
    date: '📅',
    boolean: '✓',
    object: '{  }',
  };

  return {
    label: field.label,
    type: field.type,
    icon: typeIcons[field.type] || '?',
  };
}

export function VisualCanvas({
  objectType,
  selectedFields,
  layoutView,
  chartType,
  groupBy,
  onRemoveField,
  onReorderFields,
  onAddFieldClick,
  estimatedRows,
}: VisualCanvasProps) {
  // Empty state
  if (!objectType || selectedFields.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#f0f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <Plus style={{ width: '40px', height: '40px', color: '#003a63' }} />
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 8px 0',
            }}
          >
            Start Building Your Report
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0,
            }}
          >
            {!objectType
              ? 'Select a question or choose a data source to begin'
              : 'Add fields to see your report structure'}
          </p>
        </div>
      </div>
    );
  }

  // Get field information
  const fields = selectedFields.map((fieldName) => ({
    name: fieldName,
    ...getFieldInfo(objectType, fieldName),
  }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Canvas Header */}
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 4px 0',
          }}
        >
          {objectType} Report Preview
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: '#64748b',
            margin: 0,
          }}
        >
          Showing {fields.length} {fields.length === 1 ? 'column' : 'columns'} • ~
          {estimatedRows.toLocaleString()} records
        </p>
      </div>

      {/* Visual Table Preview */}
      <div
        style={{
          flex: '1',
          overflowY: 'auto',
          padding: '24px',
        }}
      >
        <Card>
          <div
            style={{
              padding: '20px',
            }}
          >
            {/* Column Headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${fields.length}, minmax(150px, 1fr))`,
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              {fields.map((field, index) => (
                <div
                  key={field.name}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    position: 'relative',
                  }}
                >
                  {/* Drag Handle */}
                  <button
                    style={{
                      position: 'absolute',
                      left: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'grab',
                      padding: '4px',
                    }}
                    title="Drag to reorder"
                  >
                    <GripVertical
                      style={{ width: '14px', height: '14px', color: '#94a3b8' }}
                    />
                  </button>

                  {/* Field Info */}
                  <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: '#94a3b8',
                        }}
                      >
                        {field.icon}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#0f172a',
                        }}
                      >
                        {field.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                      }}
                    >
                      {field.type}
                    </span>
                    {groupBy === field.name && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#003a63',
                          backgroundColor: '#f0f7ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginTop: '4px',
                          display: 'inline-block',
                        }}
                      >
                        GROUPED
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveField(field.name)}
                    style={{
                      position: 'absolute',
                      right: '4px',
                      top: '4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                    }}
                    title="Remove field"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <X style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                  </button>
                </div>
              ))}

              {/* Add Column Button */}
              <button
                onClick={onAddFieldClick}
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '70px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#003a63';
                  e.currentTarget.style.backgroundColor = '#f0f7ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <Plus style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                  Add Column
                </span>
              </button>
            </div>

            <Divider />

            {/* Sample Data Rows (Visual Placeholder) */}
            <div style={{ marginTop: '16px' }}>
              {[1, 2, 3].map((rowNum) => (
                <div
                  key={rowNum}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${fields.length}, minmax(150px, 1fr))`,
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: rowNum < 3 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  {fields.map((field) => (
                    <div
                      key={`${rowNum}-${field.name}`}
                      style={{
                        padding: '8px 12px',
                      }}
                    >
                      <div
                        style={{
                          height: '12px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '4px',
                          width: `${60 + Math.random() * 40}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}

              {/* Estimated Rows Indicator */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  color: '#94a3b8',
                  fontSize: '12px',
                }}
              >
                + {(estimatedRows - 3).toLocaleString()} more rows
              </div>
            </div>
          </div>
        </Card>

        {/* Chart Preview */}
        {layoutView === 'chart' && chartType && (
          <Card style={{ marginTop: '16px' }}>
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0 0 16px 0',
                }}
              >
                📊 {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Preview
              </p>
              <div
                style={{
                  height: '200px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  Chart will render with live data
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
