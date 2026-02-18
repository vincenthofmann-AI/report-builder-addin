/**
 * ObjectSelector Component
 * =========================
 *
 * Allows users to select a MyGeotab object type (Device, Trip, Event, etc.)
 * Organized by category with icons and descriptions.
 *
 * ZENITH-ONLY: Uses @geotab/zenith Tabs and RadioGroup components
 */

import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Tabs, Radio, Card } from '../../../services/zenith-adapter';
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

  const categoryTabs = categories.map(cat => ({
    id: cat,
    label: categoryLabels[cat]
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Category Tabs */}
      <Tabs
        tabs={categoryTabs}
        activeTab={activeCategory}
        onChange={(tabId) => setActiveCategory(tabId as ObjectCategory)}
      />

      {/* Object Cards */}
      <div style={{ display: 'grid', gap: '8px' }}>
        {filteredObjects.map((obj) => {
          const isSelected = selectedObject === obj.type;
          const IconComponent = Icons[obj.icon as keyof typeof Icons] as React.ElementType;

          return (
            <Card
              key={obj.type}
              onClick={() => onSelectObject(obj.type)}
              style={{
                cursor: 'pointer',
                border: isSelected ? '2px solid #003a63' : '1px solid #e2e8f0',
                background: isSelected ? '#f0f7ff' : 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: isSelected ? '#003a63' : '#f8fafc',
                  color: isSelected ? 'white' : '#64748b'
                }}>
                  <IconComponent style={{ width: '16px', height: '16px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: isSelected ? '#003a63' : '#0f172a'
                  }}>
                    {obj.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {obj.description}
                  </div>
                </div>
                {isSelected && (
                  <Icons.Check style={{ width: '16px', height: '16px', color: '#003a63', flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
