/**
 * Hook for fetching module data
 */

import { useQuery } from '@tanstack/react-query';
import { ModuleConfig } from '../types/recipe';
import { useAddInContext } from '../context/AddInContext';
import dataService from '../services/dataService';

export function useModuleData(
  module: ModuleConfig,
  dateRange?: { start: string; end: string },
  groupFilterCondition?: any,
  enabled: boolean = true
) {
  const { api, credentials } = useAddInContext();

  return useQuery({
    queryKey: ['module-data', module.id, dateRange, groupFilterCondition],
    queryFn: () => dataService.fetchModuleData(
      api,
      credentials,
      module,
      dateRange,
      groupFilterCondition
    ),
    enabled: enabled && !!api && !!module,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}
