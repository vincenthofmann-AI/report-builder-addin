/**
 * Hook for checking user permissions
 */

import { useMemo } from 'react';
import { useAddInContext } from '../context/AddInContext';
import { SecurityIdentifier } from '../types/recipe';
import { hasAllPermissions, getMissingPermissions } from '../utils/permissions';

export function usePermissions() {
  const { api, state } = useAddInContext();

  // Get user permissions from MyGeotab state
  // In real implementation, this would come from the actual API
  const userPermissions = useMemo(() => {
    // TODO: Get actual permissions from MyGeotab API
    // For MVP, return all permissions (development mode)
    return [
      'ViewCollisionRisk',
      'ViewExceptions',
      'ViewDrivers',
      'ViewMaintenanceWorkOrders',
      'ViewMaintenanceWorkRequests',
      'ViewFaults',
      'ViewMaintenanceOverview',
      'ViewHoSLogs',
      'ViewDutyStatusViolations',
      'ViewIftaMiles'
    ] as SecurityIdentifier[];
  }, [api, state]);

  /**
   * Check if user has all required permissions
   */
  const hasPermissions = (required: SecurityIdentifier[]): boolean => {
    return hasAllPermissions(userPermissions, required);
  };

  /**
   * Get missing permissions
   */
  const missingPermissions = (required: SecurityIdentifier[]): SecurityIdentifier[] => {
    return getMissingPermissions(userPermissions, required);
  };

  return {
    userPermissions,
    hasPermissions,
    missingPermissions
  };
}
