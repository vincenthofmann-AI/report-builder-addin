/**
 * Query Estimator
 * ================
 *
 * Estimates the size of a MyGeotab query based on:
 * - Object type (historical data density)
 * - Time range (date span)
 * - Number of devices/scope
 *
 * Used to determine if query should auto-execute or require manual trigger.
 */

import type { MyGeotabObjectType, TimeRange } from '../types/builder.types';

/**
 * Average records per day for each object type
 * Based on typical MyGeotab fleet data
 */
const RECORDS_PER_DAY: Record<MyGeotabObjectType, number> = {
  // Devices (relatively static)
  Device: 0.1, // ~1 record per 10 days (device changes)
  DeviceStatusInfo: 1, // Current status, ~1 per day per device

  // Events (moderate frequency)
  ExceptionEvent: 5, // ~5 exceptions per day per device
  FaultData: 2, // ~2 faults per day per device
  DutyStatusLog: 10, // ~10 HOS events per day per driver
  DutyStatusViolation: 0.5, // ~1 violation per 2 days
  StatusData: 100, // ~100 status updates per day per device

  // Trips (high frequency)
  Trip: 15, // ~15 trips per day per device
  LogRecord: 1000, // ~1000 GPS points per day per device
  DriverChange: 3, // ~3 driver changes per day per device
  ChargeEvent: 2, // ~2 charges per day per EV
  FillUp: 0.5, // ~1 fill-up per 2 days
  FuelUsed: 50, // ~50 fuel events per day per device
};

/**
 * Estimated number of devices in typical fleet
 * (User can override this with actual fleet size)
 */
const AVERAGE_FLEET_SIZE = 50;

/**
 * Calculate number of days in time range
 */
function calculateDays(timeRange: TimeRange): number {
  const diffMs = timeRange.end.getTime() - timeRange.start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Estimate number of records for a query
 */
export function estimateQuerySize(
  objectType: MyGeotabObjectType | null,
  timeRange: TimeRange,
  fleetSize: number = AVERAGE_FLEET_SIZE
): number {
  if (!objectType) {
    return 0;
  }

  const days = calculateDays(timeRange);
  const recordsPerDay = RECORDS_PER_DAY[objectType] || 1;

  // Total records = days × records per day × fleet size
  const estimatedRecords = Math.round(days * recordsPerDay * fleetSize);

  return estimatedRecords;
}

/**
 * Determine if query should auto-execute based on size
 */
export function shouldAutoExecute(estimatedRows: number): boolean {
  return estimatedRows > 0 && estimatedRows < 1000;
}

/**
 * Get query size category for UI messaging
 */
export function getQuerySizeCategory(
  estimatedRows: number
): {
  category: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  message: string;
  autoLoad: boolean;
} {
  if (estimatedRows === 0) {
    return {
      category: 'tiny',
      message: 'No records estimated',
      autoLoad: false,
    };
  }

  if (estimatedRows < 100) {
    return {
      category: 'small',
      message: 'Small dataset - loads instantly',
      autoLoad: true,
    };
  }

  if (estimatedRows < 1000) {
    return {
      category: 'medium',
      message: 'Medium dataset - loads quickly',
      autoLoad: true,
    };
  }

  if (estimatedRows < 10000) {
    return {
      category: 'large',
      message: `Large dataset (${estimatedRows.toLocaleString()} records) - may take a moment`,
      autoLoad: false,
    };
  }

  return {
    category: 'huge',
    message: `Very large dataset (${estimatedRows.toLocaleString()} records) - consider narrowing your time range`,
    autoLoad: false,
  };
}
