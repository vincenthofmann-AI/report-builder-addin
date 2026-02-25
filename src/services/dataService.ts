/**
 * Data service for fetching module data from MyGeotab API
 */

import { ModuleConfig } from '../types/recipe';
import {
  generateMockMetric,
  generateMockTrend,
  generateMockTimeSeries,
  generateMockRankings,
  generateMockAlerts,
  generateMockBenchmark,
  shouldUseMockData
} from '../utils/mockData';

class DataService {
  /**
   * Fetch data for a module
   */
  async fetchModuleData(
    api: any,
    credentials: any,
    module: ModuleConfig,
    dateRange?: { start: string; end: string },
    groupFilterCondition?: any
  ): Promise<any> {
    // Use mock data for preview mode
    if (shouldUseMockData()) {
      return this.fetchMockData(module);
    }

    // Fetch real data from MyGeotab API
    return this.fetchRealData(api, credentials, module, dateRange, groupFilterCondition);
  }

  /**
   * Fetch mock/placeholder data for preview
   */
  private async fetchMockData(module: ModuleConfig): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (module.type) {
      case 'overview-card':
        return {
          metric: generateMockMetric('score'),
          ...generateMockTrend()
        };

      case 'immediate-actions':
        return {
          alerts: generateMockAlerts(3)
        };

      case 'metric-chart':
        return {
          series: generateMockTimeSeries(30)
        };

      case 'performance-rankings':
        return {
          rankings: generateMockRankings(10)
        };

      case 'benchmark-bar':
        return generateMockBenchmark();

      default:
        return {};
    }
  }

  /**
   * Fetch real data from MyGeotab API
   */
  private async fetchRealData(
    api: any,
    credentials: any,
    module: ModuleConfig,
    dateRange?: { start: string; end: string },
    groupFilterCondition?: any
  ): Promise<any> {
    const { dataSource } = module;

    try {
      // Build search parameters
      const search: any = {};

      // Add date range if enabled
      if (dataSource.dateRangeEnabled && dateRange) {
        search.fromDate = dateRange.start;
        search.toDate = dateRange.end;
      }

      // Add group filter if enabled
      if (dataSource.groupFilterEnabled && groupFilterCondition) {
        search.groupFilterCondition = groupFilterCondition;
      }

      // Add static filters
      if (dataSource.filters) {
        dataSource.filters.forEach(filter => {
          search[filter.field] = filter.value;
        });
      }

      // Make API call based on aggregation type
      if (dataSource.aggregationParams) {
        // Use aggregation API
        return await this.callAggregationAPI(
          api,
          credentials,
          dataSource.apiEntity,
          dataSource.aggregationParams,
          search,
          dataSource.sort,
          dataSource.resultsLimit
        );
      } else {
        // Use regular Get API
        return await this.callGetAPI(
          api,
          credentials,
          dataSource.apiEntity,
          search,
          dataSource.sort,
          dataSource.resultsLimit
        );
      }
    } catch (error) {
      console.error('Error fetching module data:', error);
      throw error;
    }
  }

  /**
   * Call MyGeotab aggregation API
   */
  private async callAggregationAPI(
    _api: any,
    _credentials: any,
    entityType: string,
    aggregationParams: any,
    search: any,
    sort?: any,
    limit?: number
  ): Promise<any> {
    // TODO: Implement actual MyGeotab aggregation call
    // This would use the @geotab/myapi useMyGetAggregation hook pattern
    console.log('Calling aggregation API:', {
      entityType,
      aggregationParams,
      search,
      sort,
      limit
    });

    // For now, return mock data
    return this.fetchMockData({ type: 'metric-chart' } as ModuleConfig);
  }

  /**
   * Call MyGeotab Get API
   */
  private async callGetAPI(
    _api: any,
    _credentials: any,
    entityType: string,
    search: any,
    sort?: any,
    limit?: number
  ): Promise<any> {
    // TODO: Implement actual MyGeotab Get call
    // This would use the @geotab/myapi useMyGet hook pattern
    console.log('Calling Get API:', {
      entityType,
      search,
      sort,
      limit
    });

    // For now, return mock data
    return this.fetchMockData({ type: 'immediate-actions' } as ModuleConfig);
  }
}

export default new DataService();
