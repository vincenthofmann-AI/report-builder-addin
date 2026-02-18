/**
 * ObjectSelector Component
 * =========================
 *
 * Allows users to select a MyGeotab object type (Device, Trip, Event, etc.)
 * Organized by category with icons and descriptions.
 *
 * Uses Zenith components:
 * - Tabs for category selection
 * - Card for object options
 */

import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Tabs, Card } from '../../../services/zenith-adapter';
import type { MyGeotabObjectType, ObjectCategory } from '../types/builder.types';
import { MYGEOTAB_OBJECTS } from '../types/objects.constants';

interface ObjectSelectorProps {
  selectedObject: MyGeotabObjectType | null;
  onSelectObject: (objectType: MyGeotabObjectType) => void;
}

const categoryLabels: Record<ObjectCategory, string> = {
  devices: 'Devices',
  events: 'Events & Exceptions',
  trips: 'Trips & Activities',
};

export function ObjectSelector({ selectedObject, onSelectObject }: ObjectSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<ObjectCategory>('devices');

  const categories = Array.from(
    new Set(MYGEOTAB_OBJECTS.map((obj) => obj.category))
  ) as ObjectCategory[];

  const filteredObjects = MYGEOTAB_OBJECTS.filter(
    (obj) => obj.category === activeCategory
  );

  const tabs = categories.map((category) => ({
    id: category,
    label: categoryLabels[category],
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Category Tabs */}
      <Tabs
        tabs={tabs}
        activeTabId={activeCategory}
        onTabChange={(id) => setActiveCategory(id as ObjectCategory)}
      />

      {/* Object Cards */}
      <div style={{ display: 'grid', gap: '8px' }}>
        {filteredObjects.map((obj) => {
          const isSelected = selectedObject === obj.type;
          const IconComponent = Icons[obj.icon as keyof typeof Icons] as React.ElementType;

          return (
            <button
              key={obj.type}
              onClick={() => onSelectObject(obj.type)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #003a63' : '1px solid #e2e8f0',
                backgroundColor: isSelected ? '#f0f7ff' : 'white',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#003a63' : '#f8fafc',
                  color: isSelected ? 'white' : '#64748b',
                }}
              >
                <IconComponent style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ flex: '1', minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isSelected ? '#003a63' : '#0f172a',
                  }}
                >
                  {obj.label}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {obj.description}
                </div>
              </div>
              {isSelected && (
                <Icons.Check style={{ width: '16px', height: '16px', color: '#003a63', flexShrink: 0, marginTop: '4px' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
