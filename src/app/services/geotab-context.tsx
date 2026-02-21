/**
 * Geotab Add-In React Context
 * ============================
 *
 * Provides the injected MyGeotab API, session info, and connection state
 * to all React components via context. Works in two modes:
 *
 *   LIVE MODE  — Running inside MyGeotab. The platform calls our lifecycle
 *                hooks (addin-lifecycle.ts), which dispatch a custom event.
 *                This context picks it up and exposes the real `api` object.
 *
 *   DEMO MODE  — Running standalone (dev server). No MyGeotab lifecycle fires.
 *                After a short timeout, `isReady` flips to true and the app
 *                runs with mock data from geotab-mock.ts.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  GEOTAB_INIT_EVENT,
  GEOTAB_FOCUS_EVENT,
  GEOTAB_BLUR_EVENT,
} from "./addin-lifecycle";

// ---------------------------------------------------------------------------
// Types — mirrors the MyGeotab api object injected into add-ins
// ---------------------------------------------------------------------------

export interface GeotabApi {
  call<T = unknown>(
    method: string,
    params: Record<string, unknown>,
    callback: (result: T) => void,
    errorCallback: (error: Error) => void
  ): void;
  multiCall(
    calls: Array<[string, Record<string, unknown>?]>,
    callback: (results: unknown[]) => void,
    errorCallback: (error: Error) => void
  ): void;
  getSession(callback: (session: GeotabSession) => void): void;
}

export interface GeotabSession {
  database: string;
  userName: string;
  sessionId: string;
  server: string;
}

export interface GeotabState {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

interface GeotabContextValue {
  /** The real MyGeotab API object (null in demo mode) */
  api: GeotabApi | null;
  /** Add-in state object passed by MyGeotab */
  state: GeotabState;
  /** Session info fetched after initialization */
  session: GeotabSession | null;
  /** true when running inside MyGeotab with a real API */
  isLive: boolean;
  /** true after initialization completes (live or demo fallback) */
  isReady: boolean;
  /** true when the add-in page is currently visible in MyGeotab */
  isFocused: boolean;
}

const GeotabContext = createContext<GeotabContextValue>({
  api: null,
  state: {},
  session: null,
  isLive: false,
  isReady: false,
  isFocused: true,
});

/**
 * Hook to access the Geotab Add-In context from any component.
 *
 * @example
 * ```tsx
 * const { api, isLive, session } = useGeotab();
 * if (isLive && api) {
 *   api.call("Get", { typeName: "Device" }, setDevices, console.error);
 * }
 * ```
 */
export function useGeotab() {
  return useContext(GeotabContext);
}

// ---------------------------------------------------------------------------
// Promise wrapper for the callback-based Geotab API
// ---------------------------------------------------------------------------

/**
 * Wraps a Geotab `api.call()` in a Promise for async/await usage.
 *
 * @example
 * ```ts
 * const devices = await callGeotabAsync<Device[]>(api, "Get", { typeName: "Device" });
 * ```
 */
export function callGeotabAsync<T = unknown>(
  api: GeotabApi,
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    api.call<T>(method, params, resolve, reject);
  });
}

/**
 * Wraps `api.multiCall()` in a Promise.
 */
export function multiCallGeotabAsync(
  api: GeotabApi,
  calls: Array<[string, Record<string, unknown>?]>
): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    api.multiCall(calls, resolve, reject);
  });
}

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

/** How long to wait for MyGeotab initialization before falling back to demo */
const DEMO_FALLBACK_MS = 1500;

export function GeotabProvider({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<GeotabApi | null>(null);
  const [state, setState] = useState<GeotabState>({});
  const [session, setSession] = useState<GeotabSession | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    let fallbackTimer: ReturnType<typeof setTimeout>;
    let initialized = false;

    // -- Handle the initialization event from addin-lifecycle.ts --
    const handleInit = (e: Event) => {
      const { api: freshApi, state: freshState } = (
        e as CustomEvent<{ api: GeotabApi; state: GeotabState }>
      ).detail;
      initialized = true;
      setApi(freshApi);
      setState(freshState);
      setIsLive(true);
      setIsReady(true);

      // Fetch session info
      try {
        freshApi.getSession((sess) => setSession(sess));
      } catch {
        // Non-critical — some API versions may not support getSession
      }
    };

    // -- Handle focus/blur lifecycle --
    const handleFocus = (e: Event) => {
      const { api: freshApi, state: freshState } = (
        e as CustomEvent<{ api: GeotabApi; state: GeotabState }>
      ).detail;
      setApi(freshApi);
      setState(freshState);
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    // Register listeners
    window.addEventListener(GEOTAB_INIT_EVENT, handleInit);
    window.addEventListener(GEOTAB_FOCUS_EVENT, handleFocus);
    window.addEventListener(GEOTAB_BLUR_EVENT, handleBlur);

    // Check if lifecycle already fired before React mounted (race condition)
    const win = window as unknown as Record<string, unknown>;
    if (win.__geotabAddinApi && !initialized) {
      handleInit(
        new CustomEvent(GEOTAB_INIT_EVENT, {
          detail: {
            api: win.__geotabAddinApi,
            state: win.__geotabAddinState || {},
          },
        })
      );
    }

    // Fallback to demo mode if MyGeotab never calls initialize
    fallbackTimer = setTimeout(() => {
      if (!initialized) {
        setIsReady(true); // Demo mode — mock data will be used
      }
    }, DEMO_FALLBACK_MS);

    return () => {
      window.removeEventListener(GEOTAB_INIT_EVENT, handleInit);
      window.removeEventListener(GEOTAB_FOCUS_EVENT, handleFocus);
      window.removeEventListener(GEOTAB_BLUR_EVENT, handleBlur);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <GeotabContext.Provider
      value={{ api, state, session, isLive, isReady, isFocused }}
    >
      {children}
    </GeotabContext.Provider>
  );
}
