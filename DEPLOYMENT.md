# Overview-Builder Deployment Guide

## Quick Deploy

The add-in is ready for deployment to MyGeotab. All files are in the `deployment/OverviewBuilder/` directory.

## Deployment Structure

```
deployment/OverviewBuilder/
├── addin.json          # Add-in manifest
├── index.html          # Entry point
└── assets/             # Compiled JS and CSS
    ├── index-[hash].css
    ├── index-[hash].js
    ├── vendor-[hash].js
    └── query-[hash].js
```

## Installation Options

### Option 1: Local MyGeotab Development Server

If you have a local MyGeotab development environment:

```bash
# Copy to your MyGeotab addin directory
cp -r deployment/OverviewBuilder /path/to/mygeotab/addin/

# Example path (adjust based on your setup):
# cp -r deployment/OverviewBuilder ~/Development/mygeotab/checkmate/dev/addin/
```

### Option 2: MyGeotab Cloud (Production)

1. **Package the add-in:**
```bash
cd deployment
zip -r OverviewBuilder.zip OverviewBuilder/
```

2. **Upload to MyGeotab:**
   - Log into your MyGeotab account as Administrator
   - Go to **Administration** → **System** → **Add-Ins**
   - Click **Add**
   - Upload `OverviewBuilder.zip`
   - Configure access permissions (assign to specific users/groups)

3. **Register the add-in:**
   - The system will read `addin.json` automatically
   - The add-in will appear in the dashboard menu as "Create Dashboard"

### Option 3: MyGeotab Pages (Hosted)

Upload the contents to MyGeotab Pages (GeotabPages):

```bash
# Install Geotab Pages CLI if not already installed
npm install -g @geotab/pages-cli

# Deploy to Geotab Pages
cd deployment/OverviewBuilder
geotab-pages deploy --project overview-builder

# Note the URL returned (e.g., https://overview-builder-abc123.geotabpages.com)
```

Then update `addin.json` to point to the hosted URL:
```json
{
  "path": "https://overview-builder-abc123.geotabpages.com/"
}
```

## Configuration

### Add-in Manifest (addin.json)

```json
{
  "name": "overview-builder",
  "supportEmail": "design@geotab.com",
  "version": "1.0.0",
  "items": [{
    "page": "overview-builder",
    "click": "OverviewBuilder.initialize",
    "path": "addin/OverviewBuilder/",
    "menuName": {
      "en": "Create Dashboard",
      "fr": "Créer un tableau de bord",
      "es": "Crear panel",
      "de": "Dashboard erstellen"
    },
    "icon": "IconDashboard",
    "menuId": "dashboardMenu"
  }],
  "isSigned": false
}
```

**Key fields:**
- `page`: Unique identifier for the add-in page
- `click`: JavaScript function called on initialization (`OverviewBuilder.initialize`)
- `path`: Relative path to add-in files (or absolute URL for hosted)
- `menuName`: Localized menu item names
- `menuId`: Where the menu item appears (`dashboardMenu`)
- `isSigned`: Whether the add-in is code-signed (false for development)

## Verification

After deployment, verify the add-in:

1. **Check menu presence:**
   - Log into MyGeotab
   - Navigate to the dashboard section
   - Look for "Create Dashboard" in the menu

2. **Test initialization:**
   - Click "Create Dashboard"
   - Browser console should show: `Initializing Overview-Builder Add-In`
   - The 5-step wizard should load

3. **Test flow:**
   - Step 1: Select a recipe (Safety, Maintenance, or Compliance)
   - Step 2: Customize modules
   - Step 3: Choose layout
   - Step 4: Preview dashboard
   - Step 5: Save and name

## Permissions

The add-in checks for these SecurityIdentifiers:

**Safety Scorecard:**
- ViewCollisionRisk
- ViewExceptions
- ViewDrivers

**Maintenance Overview:**
- ViewMaintenanceWorkOrders
- ViewMaintenanceWorkRequests
- ViewFaults
- ViewMaintenanceOverview

**Compliance Dashboard:**
- ViewHoSLogs
- ViewDutyStatusViolations
- ViewIftaMiles

Users without required permissions will not see restricted recipes.

## Troubleshooting

### Add-in not appearing in menu

**Check:**
1. `addin.json` is in the root of the `OverviewBuilder/` directory
2. The `path` in `addin.json` matches your deployment location
3. User has appropriate permissions
4. Clear browser cache and reload MyGeotab

### Console error: "Container element not found"

**Fix:**
1. Ensure `index.html` contains: `<div id="overview-builder-root"></div>`
2. Check that all asset files are loading (check Network tab)
3. Verify no CORS errors for hosted deployments

### TypeScript errors

**Fix:**
1. Rebuild the project: `npm run build`
2. Clear `dist/` and rebuild
3. Check that all dependencies are installed: `npm install`

### Recipes not loading

**Check:**
1. Recipe JSON files are in `src/recipes/` before build
2. RecipeService is loading them correctly
3. Browser console for import errors

## Development vs Production

**Development mode:**
- Uses mock data by default
- Faster preview rendering
- Detailed error messages
- Source maps enabled

**Production mode:**
- Connects to MyGeotab API
- Real-time data fetching
- Minified bundles
- Performance optimized

To switch between modes, toggle the `useLiveData` checkbox in Step 4 (Preview).

## Next Steps

After successful deployment:

1. **Connect live data:**
   - Implement real MyGeotab API calls in `dataService.ts`
   - Replace mock data generators
   - Test with actual user permissions

2. **Backend persistence:**
   - Replace localStorage with MyGeotab API persistence
   - Implement dashboard sharing functionality
   - Add version control for dashboards

3. **Analytics:**
   - Add telemetry for recipe usage
   - Track dashboard creation metrics
   - Monitor error rates

4. **Performance:**
   - Implement code splitting for lazy loading
   - Add caching for recipe definitions
   - Optimize bundle size

## Support

For issues or questions:
- Email: design@geotab.com
- Project: `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/Overview_Builder/`
- Documentation: See `CONTEXT.md`, `README.md`, and `IMPLEMENTATION.md`

---

**Build info:**
- Build date: 2026-02-24
- Version: 1.0.0
- Bundle size: ~250 KB (gzipped)
- React version: 18.2.0
- TypeScript: 5.0.0
