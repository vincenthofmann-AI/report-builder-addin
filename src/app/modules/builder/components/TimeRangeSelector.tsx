/**
 * TimeRangeSelector Component
 * ============================
 *
 * Date range picker with common presets and custom range support.
 *
 * ZENITH-ONLY: Uses @geotab/zenith Button and DateInput components
 */

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button, DateInput, Divider } from '../../../services/zenith-adapter';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Preset Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {TIME_RANGE_PRESETS.map((preset) => {
          const isActive = timeRange.preset === preset.value;
          return (
            <Button
              key={preset.value}
              variant={isActive ? 'primary' : 'secondary'}
              size="medium"
              onClick={() => handlePresetChange(preset.value)}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      {/* Custom Date Inputs */}
      {showCustom && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
          <Divider />
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>
              Start Date & Time
            </label>
            <DateInput
              value={timeRange.start}
              onChange={(date) => handleCustomDateChange('start', date.toISOString())}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>
              End Date & Time
            </label>
            <DateInput
              value={timeRange.end}
              onChange={(date) => handleCustomDateChange('end', date.toISOString())}
            />
          </div>
        </div>
      )}

      {/* Range Summary */}
      <div>
        <Divider />
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
          {timeRange.start.toLocaleDateString()} - {timeRange.end.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
