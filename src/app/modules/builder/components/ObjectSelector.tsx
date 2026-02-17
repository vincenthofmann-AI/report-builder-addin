/**
 * ObjectSelector Component
 * =========================
 *
 * Allows users to select a MyGeotab object type (Device, Trip, Event, etc.)
 * Organized by category with icons and descriptions.
 */

import { useState } from 'react';
import * as Icons from 'lucide-react';
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

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-[#e2e8f0]">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-[#003a63] text-[#003a63]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {categoryLabels[category]}
            </button>
          );
        })}
      </div>

      {/* Object Cards */}
      <div className="grid gap-2">
        {filteredObjects.map((obj) => {
          const isSelected = selectedObject === obj.type;
          const IconComponent = Icons[obj.icon as keyof typeof Icons] as React.ElementType;

          return (
            <button
              key={obj.type}
              onClick={() => onSelectObject(obj.type)}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-[#003a63] bg-[#f0f7ff] shadow-sm'
                  : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isSelected ? 'bg-[#003a63] text-white' : 'bg-[#f8fafc] text-[#64748b]'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${
                    isSelected ? 'text-[#003a63]' : 'text-[#0f172a]'
                  }`}
                >
                  {obj.label}
                </div>
                <div className="text-xs text-[#64748b] mt-1">{obj.description}</div>
              </div>
              {isSelected && (
                <Icons.Check className="w-4 h-4 text-[#003a63] shrink-0 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
