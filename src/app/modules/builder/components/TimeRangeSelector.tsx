/**
 * TimeRangeSelector Component
 * ============================
 *
 * Date range picker with common presets and custom range support.
 */

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { TimeRange } from '../types/builder.types';
import { TIME_RANGE_PRESETS } from '../types/objects.constants';

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

/**
 * Calculate date range based on preset
 */
function getPresetRange(preset: TimeRange['preset']): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { start, end };

    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      return { start, end };

    case 'last7days':
      start.setDate(start.getDate() - 7);
      return { start, end };

    case 'last30days':
      start.setDate(start.getDate() - 30);
      return { start, end };

    case 'thisMonth':
      start.setDate(1);
      return { start, end };

    case 'lastMonth':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      end.setDate(0); // Last day of previous month
      return { start, end };

    default:
      return { start, end };
  }
}

/**
 * Format date for input[type="datetime-local"]
 */
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function TimeRangeSelector({ timeRange, onTimeRangeChange }: TimeRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(timeRange.preset === 'custom');

  const handlePresetChange = (preset: TimeRange['preset']) => {
    if (preset === 'custom') {
      setShowCustom(true);
      onTimeRangeChange({ ...timeRange, preset });
    } else {
      setShowCustom(false);
      const range = getPresetRange(preset);
      onTimeRangeChange({
        ...range,
        preset,
      });
    }
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    const newDate = new Date(value);
    onTimeRangeChange({
      ...timeRange,
      [type]: newDate,
      preset: 'custom',
    });
  };

  return (
    <div className="space-y-4">
      {/* Preset Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {TIME_RANGE_PRESETS.map((preset) => {
          const isActive = timeRange.preset === preset.value;
          return (
            <button
              key={preset.value}
              onClick={() => handlePresetChange(preset.value)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                isActive
                  ? 'border-[#003a63] bg-[#f0f7ff] text-[#003a63]'
                  : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#cbd5e1]'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Inputs */}
      {showCustom && (
        <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1.5">
              Start Date & Time
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
              <input
                type="datetime-local"
                value={formatDateTimeLocal(timeRange.start)}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003a63] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1.5">
              End Date & Time
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
              <input
                type="datetime-local"
                value={formatDateTimeLocal(timeRange.end)}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003a63] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Range Summary */}
      <div className="pt-2 border-t border-[#e2e8f0]">
        <div className="text-xs text-[#64748b]">
          {timeRange.start.toLocaleDateString()} - {timeRange.end.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
