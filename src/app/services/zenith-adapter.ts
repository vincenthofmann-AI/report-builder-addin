/**
 * @geotab/zenith Adapter / Shim Module
 * =====================================
 *
 * This module provides stub implementations for the @geotab/zenith package,
 * which is Geotab's internal design system and SDK integration library.
 *
 * INSTALLATION STATUS: @geotab/zenith returned 404 on npm — it is a
 * private/internal Geotab package requiring org-scoped registry access.
 *
 * SWAP INSTRUCTIONS:
 * ------------------
 * Once @geotab/zenith is accessible:
 *
 * 1. Install the real package:
 *    npm install @geotab/zenith --save
 *    (or configure .npmrc with the Geotab private registry)
 *
 * 2. Replace this file's exports with re-exports from the real package:
 *    export { ZenithTheme, ZenithProvider, ... } from '@geotab/zenith';
 *
 * 3. Remove the stub implementations below.
 *
 * 4. Update any component-specific mappings if the real API differs.
 *
 * PRIVATE REGISTRY SETUP (if needed):
 * ------------------------------------
 * Create a .npmrc file in the project root:
 *   @geotab:registry=https://npm.geotab.com/
 *   //npm.geotab.com/:_authToken=${GEOTAB_NPM_TOKEN}
 */

// ============================================================================
// Theme Tokens — mirrors expected @geotab/zenith theme constants
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
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
// Geotab SDK Integration Utilities — wraps api.call() patterns
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
 * Stub: In the real @geotab/zenith, this initializes the SDK session
 * and returns a configured API client.
 *
 * Real usage would be:
 *   import { createGeotabClient } from '@geotab/zenith';
 *   const client = createGeotabClient({ database: 'my_db', server: 'my.geotab.com' });
 */
export function createGeotabClient(config: ZenithApiConfig) {
  // In stub mode, silently create a mock client that mirrors the real SDK surface.
  // The UI (Layout header + Settings page) already indicates stub status.

  return {
    /**
     * Stub for api.call() — the core Geotab SDK method.
     * Returns null in stub mode; wire to geotab-mock for local data.
     */
    call: async (method: string, params?: Record<string, unknown>): Promise<unknown> => {
      // In production, this delegates to the injected Geotab api object
      return null;
    },

    /**
     * Stub for api.multiCall() — batch multiple API calls
     */
    multiCall: async (calls: Array<[string, Record<string, unknown>?]>): Promise<unknown[]> => {
      return calls.map(() => null);
    },

    /**
     * Stub for api.getSession()
     */
    getSession: async (): Promise<ZenithSession> => {
      return {
        database: config.database || "stub_database",
        userName: config.userName || "stub_user@geotab.com",
        sessionId: "zenith-stub-session",
        server: config.server || "my.geotab.com",
      };
    },

    /**
     * Stub for checking connection health.
     * Returns true so the app treats the stub as a working backend.
     */
    isConnected: (): boolean => {
      return true;
    },
  };
}

// ============================================================================
// Add-In Lifecycle Hooks — mirrors @geotab/zenith add-in patterns
// ============================================================================

export interface ZenithAddInCallbacks {
  initialize?: (api: ReturnType<typeof createGeotabClient>, state: Record<string, unknown>) => void;
  focus?: (api: ReturnType<typeof createGeotabClient>, state: Record<string, unknown>) => void;
  blur?: (api: ReturnType<typeof createGeotabClient>, state: Record<string, unknown>) => void;
}

/**
 * Stub: Registers add-in lifecycle callbacks with the MyGeotab platform.
 *
 * Real usage:
 *   import { registerAddIn } from '@geotab/zenith';
 *   registerAddIn({
 *     initialize: (api, state) => { ... },
 *     focus: (api, state) => { ... },
 *     blur: (api, state) => { ... },
 *   });
 */
export function registerAddIn(callbacks: ZenithAddInCallbacks): void {
  // Store callbacks for potential manual triggering in dev
  if (typeof window !== "undefined") {
    (window as Record<string, unknown>).__zenithAddInCallbacks = callbacks;
  }

  // In stub mode, simulate the platform by firing the initialize callback
  // after a microtask so the add-in lifecycle starts as expected.
  if (callbacks.initialize) {
    const stubClient = createGeotabClient({
      database: "demo_fleet",
      server: "my.geotab.com",
      userName: "admin@fleet.com",
    });
    Promise.resolve().then(() => {
      callbacks.initialize!(stubClient, { isStub: true });
    });
  }
}

// ============================================================================
// Data Helpers — common data transformation utilities
// ============================================================================

/**
 * Stub: Format a Geotab date string for display
 */
export function formatGeotabDate(dateStr: string, format: "short" | "long" | "iso" = "short"): string {
  try {
    const date = new Date(dateStr);
    switch (format) {
      case "short":
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      case "long":
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      case "iso":
        return date.toISOString();
      default:
        return dateStr;
    }
  } catch {
    return dateStr;
  }
}

/**
 * Stub: Convert Geotab distance units
 */
export function convertDistance(value: number, from: "km" | "mi", to: "km" | "mi"): number {
  if (from === to) return value;
  return from === "km" ? value * 0.621371 : value * 1.60934;
}

/**
 * Stub: Convert Geotab speed units
 */
export function convertSpeed(value: number, from: "kmh" | "mph", to: "kmh" | "mph"): number {
  if (from === to) return value;
  return from === "kmh" ? value * 0.621371 : value * 1.60934;
}

/**
 * Stub: Convert fuel volume units
 */
export function convertVolume(value: number, from: "L" | "gal", to: "L" | "gal"): number {
  if (from === to) return value;
  return from === "L" ? value * 0.264172 : value * 3.78541;
}

// ============================================================================
// Package Info — for integration status checks
// ============================================================================

export const ZENITH_PACKAGE_NAME = "@geotab/zenith";
export const ZENITH_ADAPTER_VERSION = "0.1.0-stub";
export const ZENITH_IS_STUB = true;

/**
 * Returns integration status info for the Settings/diagnostics page.
 */
export function getZenithStatus() {
  return {
    packageName: ZENITH_PACKAGE_NAME,
    installed: false,
    isStub: ZENITH_IS_STUB,
    adapterVersion: ZENITH_ADAPTER_VERSION,
    message: "Using local adapter stubs. Install @geotab/zenith for full integration.",
    requiredSetup: [
      "Configure .npmrc with Geotab private registry credentials",
      "Run: npm install @geotab/zenith --save",
      "Replace zenith-adapter.ts exports with real package re-exports",
      "Verify add-in lifecycle hooks in MyGeotab environment",
    ],
  };
}