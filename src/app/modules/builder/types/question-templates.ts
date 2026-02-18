/**
 * Question Templates for Conversational Report Builder
 * ======================================================
 *
 * Pre-configured questions that map to report configurations.
 * Provides natural language entry point for common reporting needs.
 */

import { Car, AlertTriangle, Gauge, Wrench, MapPin, Clock, TrendingUp, Users } from 'lucide-react';
import type { MyGeotabObjectType, TimeRange, ChartType } from './builder.types';

export interface QuestionTemplate {
  id: string;
  question: string;
  category: 'fleet' | 'safety' | 'performance' | 'compliance' | 'location';
  icon: React.ElementType;
  config: {
    objectType: MyGeotabObjectType;
    fields: string[];
    timeRange: TimeRange['preset'];
    groupBy?: string;
    sortBy?: { field: string; direction: 'asc' | 'desc' };
    chartType?: ChartType;
    filters?: Array<{
      field: string;
      operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
      value: string | number;
    }>;
  };
  tags: string[]; // For search/discovery
}

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Fleet Activity Questions
  {
    id: 'vehicles-most-traveled',
    question: 'Which vehicles traveled the most today?',
    category: 'fleet',
    icon: Car,
    config: {
      objectType: 'Trip',
      fields: ['vehicle.name', 'distance', 'duration', 'driver.name'],
      timeRange: 'today',
      groupBy: 'vehicle.name',
      sortBy: { field: 'distance', direction: 'desc' },
      chartType: 'bar',
    },
    tags: ['mileage', 'distance', 'vehicles', 'daily'],
  },
  {
    id: 'trip-count-yesterday',
    question: 'How many trips happened yesterday?',
    category: 'fleet',
    icon: TrendingUp,
    config: {
      objectType: 'Trip',
      fields: ['vehicle.name', 'startTime', 'distance', 'driver.name'],
      timeRange: 'yesterday',
      sortBy: { field: 'startTime', direction: 'desc' },
    },
    tags: ['trips', 'count', 'yesterday', 'activity'],
  },
  {
    id: 'weekly-mileage',
    question: 'What was my fleet mileage this week?',
    category: 'fleet',
    icon: Gauge,
    config: {
      objectType: 'Trip',
      fields: ['vehicle.name', 'distance', 'fuelUsed', 'duration'],
      timeRange: 'last7days',
      groupBy: 'vehicle.name',
      chartType: 'bar',
    },
    tags: ['mileage', 'weekly', 'fuel', 'efficiency'],
  },

  // Safety Questions
  {
    id: 'speeding-events-week',
    question: 'Where did speeding happen this week?',
    category: 'safety',
    icon: AlertTriangle,
    config: {
      objectType: 'ExceptionEvent',
      fields: ['vehicle.name', 'location', 'speed', 'dateTime', 'driver.name'],
      timeRange: 'last7days',
      filters: [
        { field: 'rule.name', operator: 'contains', value: 'Speeding' },
      ],
      sortBy: { field: 'dateTime', direction: 'desc' },
    },
    tags: ['speeding', 'safety', 'exceptions', 'violations'],
  },
  {
    id: 'harsh-driving-events',
    question: 'Which drivers had harsh braking events?',
    category: 'safety',
    icon: Users,
    config: {
      objectType: 'ExceptionEvent',
      fields: ['driver.name', 'vehicle.name', 'dateTime', 'location'],
      timeRange: 'last7days',
      filters: [
        { field: 'rule.name', operator: 'contains', value: 'Harsh' },
      ],
      groupBy: 'driver.name',
    },
    tags: ['harsh driving', 'braking', 'driver safety', 'events'],
  },

  // Location Questions
  {
    id: 'fleet-locations',
    question: 'Where is my fleet right now?',
    category: 'location',
    icon: MapPin,
    config: {
      objectType: 'Device',
      fields: ['name', 'currentLocation', 'speed', 'engineHours'],
      timeRange: 'today',
    },
    tags: ['location', 'current', 'real-time', 'map'],
  },
  {
    id: 'route-history',
    question: 'Where did a specific vehicle go today?',
    category: 'location',
    icon: MapPin,
    config: {
      objectType: 'Trip',
      fields: ['startLocation', 'endLocation', 'startTime', 'endTime', 'distance'],
      timeRange: 'today',
      sortBy: { field: 'startTime', direction: 'asc' },
    },
    tags: ['route', 'history', 'path', 'tracking'],
  },

  // Performance Questions
  {
    id: 'fuel-consumption',
    question: 'Which vehicles used the most fuel?',
    category: 'performance',
    icon: Gauge,
    config: {
      objectType: 'Trip',
      fields: ['vehicle.name', 'fuelUsed', 'distance', 'duration'],
      timeRange: 'last30days',
      groupBy: 'vehicle.name',
      sortBy: { field: 'fuelUsed', direction: 'desc' },
      chartType: 'bar',
    },
    tags: ['fuel', 'consumption', 'efficiency', 'cost'],
  },
  {
    id: 'idle-time',
    question: 'How much idle time did I have this week?',
    category: 'performance',
    icon: Clock,
    config: {
      objectType: 'Trip',
      fields: ['vehicle.name', 'idleTime', 'duration', 'fuelUsed'],
      timeRange: 'last7days',
      groupBy: 'vehicle.name',
      sortBy: { field: 'idleTime', direction: 'desc' },
      chartType: 'bar',
    },
    tags: ['idle', 'efficiency', 'waste', 'performance'],
  },

  // Maintenance Questions
  {
    id: 'engine-faults',
    question: 'What engine faults occurred recently?',
    category: 'compliance',
    icon: Wrench,
    config: {
      objectType: 'FaultData',
      fields: ['vehicle.name', 'diagnostic.name', 'dateTime', 'count'],
      timeRange: 'last30days',
      groupBy: 'diagnostic.name',
      sortBy: { field: 'dateTime', direction: 'desc' },
    },
    tags: ['faults', 'diagnostics', 'maintenance', 'health'],
  },
  {
    id: 'maintenance-due',
    question: 'Which vehicles need maintenance?',
    category: 'compliance',
    icon: Wrench,
    config: {
      objectType: 'Device',
      fields: ['name', 'engineHours', 'odometer', 'lastServiceDate'],
      timeRange: 'today',
      sortBy: { field: 'engineHours', direction: 'desc' },
    },
    tags: ['maintenance', 'service', 'due', 'schedule'],
  },
];

/**
 * Search questions by keywords
 */
export function searchQuestions(query: string): QuestionTemplate[] {
  const lowerQuery = query.toLowerCase();
  return QUESTION_TEMPLATES.filter(
    (template) =>
      template.question.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get questions by category
 */
export function getQuestionsByCategory(
  category: QuestionTemplate['category']
): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter((template) => template.category === category);
}

/**
 * Get popular/recommended questions
 */
export function getRecommendedQuestions(limit: number = 6): QuestionTemplate[] {
  // In production, this could be based on user history or usage analytics
  return QUESTION_TEMPLATES.slice(0, limit);
}
