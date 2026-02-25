/**
 * Permission checking utilities
 */

import { SecurityIdentifier } from '../types/recipe';

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(
  userPermissions: SecurityIdentifier[],
  requiredPermissions: SecurityIdentifier[]
): boolean {
  return requiredPermissions.every(required =>
    userPermissions.includes(required)
  );
}

/**
 * Get missing permissions
 */
export function getMissingPermissions(
  userPermissions: SecurityIdentifier[],
  requiredPermissions: SecurityIdentifier[]
): SecurityIdentifier[] {
  return requiredPermissions.filter(required =>
    !userPermissions.includes(required)
  );
}

/**
 * Format permission name for display
 */
export function formatPermissionName(permission: SecurityIdentifier): string {
  // Convert from camelCase to Title Case with spaces
  return permission
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, str => str.toUpperCase());
}

/**
 * Get permission description
 */
export function getPermissionDescription(permission: SecurityIdentifier): string {
  const descriptions: Record<string, string> = {
    'ViewCollisionRisk': 'Required for collision risk data and analytics',
    'ViewExceptions': 'Required for safety alerts and exception data',
    'ViewDrivers': 'Required for driver information and rankings',
    'ViewMaintenanceWorkOrders': 'Required for work order data',
    'ViewMaintenanceWorkRequests': 'Required for work request data',
    'ViewFaults': 'Required for fault data and diagnostics',
    'ViewMaintenanceOverview': 'Required for maintenance overview access',
    'ViewHoSLogs': 'Required for hours of service log access',
    'ViewDutyStatusViolations': 'Required for compliance violation data',
    'ViewIftaMiles': 'Required for IFTA reporting data'
  };

  return descriptions[permission] || 'Required for this feature';
}
