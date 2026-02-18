/**
 * FieldPalette Component
 * =======================
 *
 * Sidebar showing available fields organized by category.
 * Users can:
 * - Browse fields by category
 * - Click to add fields to report
 * - See which fields are already selected
 * - Drag fields to canvas (future enhancement)
 */

import { useState } from 'react';
import { Type, Hash, Calendar, ToggleLeft, Check, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { SearchInput, Divider } from '../../../services/zenith-adapter';
import type { MyGeotabObjectType } from '../types/builder.types';
import { OBJECT_FIELDS } from '../types/objects.constants';

interface FieldPaletteProps {
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

/**
 * Group fields by category for better organization
 */
function groupFieldsByCategory(objectType: MyGeotabObjectType) {
  const fields = OBJECT_FIELDS[objectType] || [];

  // Define categories based on common patterns
  const categories: Record<string, { label: string; fields: typeof fields }> = {
    essential: { label: 'Essential', fields: [] },
    identification: { label: 'Identification', fields: [] },
    location: { label: 'Location & Address', fields: [] },
    datetime: { label: 'Date & Time', fields: [] },
    performance: { label: 'Performance', fields: [] },
    technical: { label: 'Technical Details', fields: [] },
    other: { label: 'Other', fields: [] },
  };

  fields.forEach((field) => {
    // Categorize based on field name patterns and type
    const nameLower = field.name.toLowerCase();
    const labelLower = field.label.toLowerCase();

    if (field.required || ['id', 'name'].includes(nameLower)) {
      categories.essential.fields.push(field);
    } else if (nameLower.includes('location') || nameLower.includes('address') || labelLower.includes('address')) {
      categories.location.fields.push(field);
    } else if (field.type === 'date' || nameLower.includes('time') || nameLower.includes('date')) {
      categories.datetime.fields.push(field);
    } else if (nameLower.includes('vin') || nameLower.includes('serial') || nameLower.includes('license')) {
      categories.identification.fields.push(field);
    } else if (
      nameLower.includes('speed') ||
      nameLower.includes('distance') ||
      nameLower.includes('fuel') ||
      nameLower.includes('duration') ||
      field.type === 'number'
    ) {
      categories.performance.fields.push(field);
    } else if (nameLower.includes('engine') || nameLower.includes('diagnostic') || nameLower.includes('odometer')) {
      categories.technical.fields.push(field);
    } else {
      categories.other.fields.push(field);
    }
  });

  // Filter out empty categories
  return Object.entries(categories)
    .filter(([_, category]) => category.fields.length > 0)
    .map(([id, category]) => ({
      id,
      ...category,
    }));
}

export function FieldPalette({ objectType, selectedFields, onToggleField }: FieldPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['essential', 'identification'])
  );

  const categories = groupFieldsByCategory(objectType);

  // Filter fields based on search
  const filteredCategories = searchQuery
    ? categories
        .map((category) => ({
          ...category,
          fields: category.fields.filter(
            (field) =>
              field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              field.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.fields.length > 0)
    : categories;

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'white',
        borderLeft: '1px solid #e2e8f0',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 12px 0',
          }}
        >
          Available Fields
        </h3>
        <SearchInput
          placeholder="Search fields..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Field Categories */}
      <div
        style={{
          flex: '1',
          overflowY: 'auto',
          padding: '8px',
        }}
      >
        {filteredCategories.map((category) => {
          const isExpanded = searchQuery.length > 0 || expandedCategories.has(category.id);
          const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <div
              key={category.id}
              style={{
                marginBottom: '4px',
              }}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ChevronIcon style={{ width: '14px', height: '14px', color: '#64748b' }} />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {category.label}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    color: '#94a3b8',
                  }}
                >
                  {category.fields.length}
                </span>
              </button>

              {/* Category Fields */}
              {isExpanded && (
                <div style={{ paddingLeft: '8px', marginTop: '4px' }}>
                  {category.fields.map((field) => {
                    const isSelected = selectedFields.includes(field.name);
                    const IconComponent = fieldTypeIcons[field.type];

                    return (
                      <button
                        key={field.name}
                        onClick={() => onToggleField(field.name)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px',
                          backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          marginBottom: '2px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {isSelected ? (
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              backgroundColor: '#003a63',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Check style={{ width: '12px', height: '12px', color: 'white' }} />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              border: '2px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Plus style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
                          </div>
                        )}

                        <IconComponent
                          style={{
                            width: '14px',
                            height: '14px',
                            color: '#94a3b8',
                            flexShrink: 0,
                          }}
                        />

                        <div style={{ flex: '1', minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: isSelected ? '500' : '400',
                              color: isSelected ? '#003a63' : '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {field.label}
                          </div>
                          {field.description && (
                            <div
                              style={{
                                fontSize: '11px',
                                color: '#94a3b8',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {field.description}
                            </div>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            color: '#cbd5e1',
                            flexShrink: 0,
                          }}
                        >
                          {field.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          {selectedFields.length} {selectedFields.length === 1 ? 'field' : 'fields'} selected
        </div>
      </div>
    </div>
  );
}
