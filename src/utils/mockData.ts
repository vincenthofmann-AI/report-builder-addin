/**
 * Mock/placeholder data for dashboard previews
 */

/**
 * Generate mock metric data
 */
export function generateMockMetric(type: 'score' | 'count' | 'percentage' = 'score') {
  switch (type) {
    case 'score':
      return Math.floor(Math.random() * 100);
    case 'count':
      return Math.floor(Math.random() * 50);
    case 'percentage':
      return Math.floor(Math.random() * 100);
    default:
      return 0;
  }
}

/**
 * Generate mock trend data
 */
export function generateMockTrend(): {
  value: number;
  change: number;
  direction: 'up' | 'down';
} {
  const change = Math.floor(Math.random() * 20) - 10; // -10 to +10
  return {
    value: generateMockMetric('score'),
    change: Math.abs(change),
    direction: change >= 0 ? 'up' : 'down'
  };
}

/**
 * Generate mock time series data
 */
export function generateMockTimeSeries(points: number = 30): Array<{
  date: string;
  value: number;
}> {
  const data = [];
  const today = new Date();

  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 20
    });
  }

  return data;
}

/**
 * Generate mock ranking data
 */
export function generateMockRankings(count: number = 10): Array<{
  id: string;
  name: string;
  value: number;
  score: number;
}> {
  const names = [
    'John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Williams',
    'Charlie Brown', 'Diana Prince', 'Eve Anderson', 'Frank Miller',
    'Grace Lee', 'Henry Davis', 'Ivy Chen', 'Jack Wilson'
  ];

  return names.slice(0, count).map((name, index) => ({
    id: `driver-${index + 1}`,
    name,
    value: Math.floor(Math.random() * 30) + 5,
    score: 100 - (index * 5) - Math.floor(Math.random() * 5)
  }));
}

/**
 * Generate mock alert/action items
 */
export function generateMockAlerts(count: number = 3): Array<{
  id: string;
  title: string;
  count: number;
  severity: 'critical' | 'high' | 'medium';
}> {
  const alerts = [
    { title: 'Critical Exceptions', severity: 'critical' as const },
    { title: 'High-Risk Drivers', severity: 'high' as const },
    { title: 'Vehicles Needing Attention', severity: 'medium' as const },
    { title: 'Severe Work Requests', severity: 'critical' as const },
    { title: 'Active Violations', severity: 'high' as const },
    { title: 'Missing Logs', severity: 'medium' as const }
  ];

  return alerts.slice(0, count).map((alert, index) => ({
    id: `alert-${index + 1}`,
    title: alert.title,
    count: Math.floor(Math.random() * 15) + 1,
    severity: alert.severity
  }));
}

/**
 * Generate mock benchmark data
 */
export function generateMockBenchmark(): {
  fleetScore: number;
  industryAverage: number;
  percentile: number;
} {
  const fleetScore = Math.floor(Math.random() * 40) + 40; // 40-80
  const industryAverage = 65;

  return {
    fleetScore,
    industryAverage,
    percentile: Math.floor((fleetScore / 100) * 100)
  };
}

/**
 * Check if mock data should be used
 */
export function shouldUseMockData(): boolean {
  // Check localStorage for user preference
  const useMock = localStorage.getItem('overviewBuilder.useMockData');
  return useMock !== 'false'; // Default to true
}

/**
 * Set mock data preference
 */
export function setUseMockData(value: boolean): void {
  localStorage.setItem('overviewBuilder.useMockData', String(value));
}
