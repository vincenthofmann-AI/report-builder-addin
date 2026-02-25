# Troubleshooting Guide

## Issue: Blank Page on GitHub Pages

**Date:** February 24, 2026
**Status:** ✅ RESOLVED

### Problem Description

When viewing the deployed site at https://vincenthofmann-ai.github.io/report-builder-addin/, the page appeared blank with:
- ✅ HTML loaded correctly
- ✅ JavaScript bundles accessible (HTTP 200)
- ✅ CSS loaded
- ❌ No visible content
- ❌ No console errors

### Root Cause Analysis

The Overview-Builder is designed as a **MyGeotab add-in**, which means it expects to be initialized by the MyGeotab platform:

```typescript
// MyGeotab calls this when loading the add-in
(window as any).OverviewBuilder = {
  initialize: (api: any, state: any, callback: () => void) => {
    // Render React app with MyGeotab API
    root.render(<App api={api} state={state} />);
  }
};
```

The original code had a development-only fallback:

```typescript
// Old code - only ran in development mode
if (process.env.NODE_ENV === 'development') {
  root.render(<App api={{}} state={{ database: 'demo' }} />);
}
```

**The Problem:**
1. In production builds, `process.env.NODE_ENV === 'production'`
2. The development fallback never executed
3. When viewing standalone (outside MyGeotab), the initialize function never got called
4. React app never rendered = blank page

### Solution

Replace environment-specific initialization with **environment-agnostic auto-detection**:

```typescript
// New code - works in all environments
const initializeStandalone = () => {
  const container = document.getElementById('overview-builder-root');
  if (container && !container.hasChildNodes()) {
    console.log('Initializing in standalone mode');
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App api={{}} state={{ database: 'demo', userName: 'developer' }} />
        </QueryClientProvider>
      </React.StrictMode>
    );
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStandalone);
} else {
  initializeStandalone();
}
```

**Key Features:**
- ✅ Checks if container is empty (avoids re-rendering when MyGeotab calls initialize)
- ✅ Uses DOMContentLoaded to ensure container exists
- ✅ Works in both development and production builds
- ✅ Doesn't interfere with MyGeotab initialization

### Deployment

**File Changed:** `src/index.tsx` (lines 67-81)

**Deployment Steps:**
1. Modified initialization logic
2. Rebuilt: `npm run build` (555ms)
3. Deployed: `npm run deploy`
4. Pushed to gh-pages branch
5. GitHub Pages CDN updated (~1-2 minutes)

**Verification:**
```bash
curl https://vincenthofmann-ai.github.io/report-builder-addin/
# Now loads: index-2eb8f992.js (new build with fix)
# Previously: index-01914cfa.js (old build without fix)
```

### Testing Checklist

- [x] GitHub Pages shows content (https://vincenthofmann-ai.github.io/report-builder-addin/)
- [x] Local dev server works (http://localhost:3000)
- [x] Production build works standalone
- [x] No console errors
- [x] Recipe picker loads
- [ ] Test in actual MyGeotab environment (requires MyGeotab deployment)

### Impact

**Before Fix:**
- ❌ Blank page on GitHub Pages
- ✅ Worked in local dev (NODE_ENV=development)
- ⚠️  Untested in MyGeotab

**After Fix:**
- ✅ Works on GitHub Pages (standalone demo mode)
- ✅ Works in local dev
- ✅ Should work in MyGeotab (initialize still gets called)

### Future Considerations

**For Production MyGeotab Deployment:**
1. Deploy `deployment/OverviewBuilder/` to MyGeotab add-in directory
2. Register add-in in MyGeotab Administration
3. MyGeotab will call `window.OverviewBuilder.initialize()`
4. The hasChildNodes() check prevents double-rendering

**For Debugging:**
- Check browser console for "Initializing in standalone mode" message
- Verify container exists: `document.getElementById('overview-builder-root')`
- Check if React is mounted: container should have child elements

### Related Files

- `src/index.tsx` - Entry point with initialization logic (src/index.tsx:67-81)
- `src/App.tsx` - Root React component (src/App.tsx:1-50)
- `src/addin.json` - MyGeotab add-in manifest
- `vite.config.ts` - Build configuration with GitHub Pages base path

### Commit History

- **e1dcbb0** - Fix: Enable standalone demo mode for GitHub Pages
- **928a687** - Add live demo URL to documentation
- **45f40b8** - Add GitHub Pages deployment configuration

---

## Other Common Issues

### Issue: CSS Not Loading

**Symptoms:** Page loads but has no styling

**Solution:** Check base path in vite.config.ts matches GitHub Pages repository name:
```typescript
export default defineConfig({
  base: '/report-builder-addin/', // Must match repo name
  // ...
});
```

### Issue: JavaScript Module Errors

**Symptoms:** Console shows "Failed to load module" errors

**Solution:** Verify asset paths in dist/index.html match the base path:
```html
<script type="module" src="/report-builder-addin/assets/index-xxx.js"></script>
```

### Issue: GitHub Pages 404

**Symptoms:** Page not found when visiting GitHub Pages URL

**Solution:**
1. Check GitHub Pages is enabled: `gh api repos/OWNER/REPO/pages`
2. Verify gh-pages branch exists: `git branch -a | grep gh-pages`
3. Check deployment: `gh run list --repo OWNER/REPO`

---

**Last Updated:** February 24, 2026
**Status:** All issues resolved ✅
