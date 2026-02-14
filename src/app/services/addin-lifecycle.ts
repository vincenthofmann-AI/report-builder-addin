/**
 * Geotab Add-In Lifecycle Bridge
 * ===============================
 *
 * Registers `geotab.addin.reportBuilder` on the window object so that the
 * MyGeotab platform can invoke the standard add-in lifecycle hooks:
 *
 *   initialize(api, state, callback)  — called once when the add-in loads
 *   focus(api, state)                 — called when the add-in page becomes visible
 *   blur()                            — called when the user navigates away
 *
 * This bridge communicates with the React layer (GeotabProvider) via
 * CustomEvents dispatched on `window`. It also stores the API reference
 * on `window.__geotabAddinApi` to handle the race condition where
 * MyGeotab fires before React mounts.
 *
 * STANDALONE / DEV MODE:
 *   When running outside MyGeotab (e.g., `pnpm dev`), none of these hooks
 *   are ever called. The GeotabProvider falls back to demo mode after a
 *   short timeout.
 *
 * DEPLOYMENT:
 *   1. Run `pnpm build` — produces `dist/` with index.html + assets
 *   2. Copy `dist/` contents + `configuration.json` into a zip
 *   3. Upload via MyGeotab > Administration > System > Add-Ins
 *   4. Or host `dist/` on a web server and set the URL in configuration.json
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The add-in's identifier — must match `geotab.addin.<NAME>` */
export const ADDIN_NAME = "reportBuilder";

/** Custom events dispatched to notify the React tree */
export const GEOTAB_INIT_EVENT = "geotab-addin-initialized";
export const GEOTAB_FOCUS_EVENT = "geotab-addin-focus";
export const GEOTAB_BLUR_EVENT = "geotab-addin-blur";

// ---------------------------------------------------------------------------
// Type augmentation for window globals
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    geotab?: {
      addin: Record<
        string,
        () => {
          initialize: (
            api: unknown,
            state: unknown,
            callback: () => void
          ) => void;
          focus: (api: unknown, state: unknown) => void;
          blur: () => void;
        }
      >;
    };
    /** Stored API reference for late-mounting components */
    __geotabAddinApi?: unknown;
    /** Stored state reference */
    __geotabAddinState?: unknown;
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

function registerAddin() {
  // Ensure the geotab.addin namespace exists
  if (!window.geotab) {
    (window as Window).geotab = { addin: {} };
  }
  if (!window.geotab!.addin) {
    window.geotab!.addin = {};
  }

  /**
   * MyGeotab calls this factory function, then invokes the returned lifecycle
   * methods. The standard sequence is:
   *   1. const addin = geotab.addin.reportBuilder();
   *   2. addin.initialize(api, state, callback);
   *   3. addin.focus(api, state);   // each time the page is shown
   *   4. addin.blur();              // when navigating away
   */
  window.geotab!.addin[ADDIN_NAME] = () => ({
    initialize(
      api: unknown,
      state: unknown,
      callback: () => void
    ) {
      // Persist for components that mount after this fires
      window.__geotabAddinApi = api;
      window.__geotabAddinState = state;

      // Notify React's GeotabProvider
      window.dispatchEvent(
        new CustomEvent(GEOTAB_INIT_EVENT, {
          detail: { api, state },
        })
      );

      // Tell MyGeotab we're ready to display
      if (typeof callback === "function") {
        callback();
      }
    },

    focus(api: unknown, state: unknown) {
      // API reference may be refreshed on each focus
      window.__geotabAddinApi = api;
      window.__geotabAddinState = state;

      window.dispatchEvent(
        new CustomEvent(GEOTAB_FOCUS_EVENT, {
          detail: { api, state },
        })
      );
    },

    blur() {
      window.dispatchEvent(new CustomEvent(GEOTAB_BLUR_EVENT));
    },
  });
}

// Register immediately on module load — this runs before React mounts,
// ensuring the global is available when MyGeotab checks for it.
registerAddin();
