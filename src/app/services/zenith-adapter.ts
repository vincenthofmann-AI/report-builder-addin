/**
 * Zenith Design System Integration
 * ==================================
 *
 * This module integrates Geotab's Zenith design system (@geotab/zenith v3.5.0).
 *
 * Package: @geotab/zenith v3.5.0 (public npm package)
 * Installation: pnpm add @geotab/zenith
 * Styles: Imported in src/main.tsx via "@geotab/zenith/dist/index.css"
 */

// ============================================================================
// Zenith Component Re-Exports
// ============================================================================

export {
  // Core components
  Button,
  Card,
  Checkbox,
  Dialog,
  Dropdown,
  Calendar,
  DateRange,

  // Layout components
  Divider,

  // Form components
  type IButton,
  type ICard,
  type ICheckbox,
  type IDialog,
  type IDropdown,
  type ICalendar,
  type IDateRange,
} from '@geotab/zenith';

// ============================================================================
// Custom Theme Tokens for Application Use
// ============================================================================

export const ZenithColors = {
  // Primary brand colors
  navy: "#003a63",
  navyDark: "#002d4e",
  navyLight: "#004d80",
  green: "#78be20",
  greenDark: "#6aab1a",
  greenLight: "#8ed42e",

  // Extended palette
  blue: "#0077b6",
  blueLight: "#00a3e0",
  teal: "#009ca6",
  orange: "#f5a623",
  red: "#dc2626",
  yellow: "#f59e0b",

  // Neutrals
  white: "#ffffff",
  gray50: "#f8fafc",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
  gray300: "#cbd5e1",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1e293b",
  gray900: "#0f172a",

  // Semantic
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#0077b6",
} as const;

export const ZenithSpacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
  "4xl": "64px",
} as const;

export const ZenithTypography = {
  fontFamily: "Roboto, 'Segoe UI', Segoe, 'Helvetica Neue', Helvetica, sans-serif",
  fontSizes: {
    xs: "11px",
    sm: "13px",
    base: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const ZenithBorderRadius = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
} as const;

export const ZenithShadows = {
  sm: "0 1px 2px 0 rgba(0, 58, 99, 0.05)",
  md: "0 4px 6px -1px rgba(0, 58, 99, 0.08), 0 2px 4px -2px rgba(0, 58, 99, 0.05)",
  lg: "0 10px 15px -3px rgba(0, 58, 99, 0.08), 0 4px 6px -4px rgba(0, 58, 99, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 58, 99, 0.10), 0 8px 10px -6px rgba(0, 58, 99, 0.05)",
} as const;

// Complete theme object
export const ZenithTheme = {
  colors: ZenithColors,
  spacing: ZenithSpacing,
  typography: ZenithTypography,
  borderRadius: ZenithBorderRadius,
  shadows: ZenithShadows,
} as const;

// ============================================================================
// Custom Helper Functions (not from Zenith package)
// ============================================================================

export interface ZenithApiConfig {
  database: string;
  server: string;
  sessionId?: string;
  userName?: string;
}

export interface ZenithSession {
  database: string;
  userName: string;
  sessionId: string;
  server: string;
}

/**
 * Custom helper: Creates a mock Geotab API client for development
 * In production, use the real MyGeotab API injected by the platform
 */
export function createGeotabClient(config: ZenithApiConfig) {
  return {
    call: async (method: string, params?: Record<string, unknown>): Promise<unknown> => {
      return null;
    },
    multiCall: async (calls: Array<[string, Record<string, unknown>?]>): Promise<unknown[]> => {
      return calls.map(() => null);
    },
    getSession: async (): Promise<ZenithSession> => {
      return {
        database: config.database || "demo_database",
        userName: config.userName || "demo_user@geotab.com",
        sessionId: "demo-session",
        server: config.server || "my.geotab.com",
      };
    },
    isConnected: (): boolean => {
      return true;
    },
  };
}

export interface ZenithAddInCallbacks {
  initialize?: (api: ReturnType<typeof createGeotabClient>, state: Record<string, unknown>) => void;
  focus?: (api: ReturnType<typeof createGeotabClient>, state: Record<string, unknown>) => void;
  blur?: (api: ReturnType<typeof createGeotabClient>, state: Record<string, unknown>) => void;
}

/**
 * Custom helper: Registers add-in lifecycle callbacks (for demo mode)
 */
export function registerAddIn(callbacks: ZenithAddInCallbacks): void {
  if (typeof window !== "undefined") {
    (window as Record<string, unknown>).__zenithAddInCallbacks = callbacks;
  }

  if (callbacks.initialize) {
    const client = createGeotabClient({
      database: "demo_fleet",
      server: "my.geotab.com",
      userName: "demo@geotab.com",
    });
    Promise.resolve().then(() => {
      callbacks.initialize!(client, { isDemo: true });
    });
  }
}

// Flag indicating this is using demo mode (not connected to real MyGeotab)
export const ZENITH_IS_STUB = true;
