# Quick Start Guide

Get the Overview-Builder add-in running in **5 minutes**.

## Prerequisites

- Node.js 18+ installed
- Web browser (Chrome, Firefox, Safari, or Edge)
- (Optional) Access to MyGeotab account

---

## Local Development (Fastest)

Test the add-in standalone without MyGeotab:

```bash
# Navigate to project
cd /Users/vincenthofmann/SecondBrain/1-Projects/Geotab/Overview_Builder

# Install dependencies (if not done already)
npm install

# Start dev server
npm run dev
```

**Open browser:** http://localhost:3000

**What you'll see:**
- Full 5-step wizard interface
- 3 recipe options (Safety, Maintenance, Compliance)
- Module selection and customization
- Layout preview
- Mock data dashboard preview

**Limitations:**
- Uses mock data (not connected to real MyGeotab API)
- No real user permissions (shows all recipes)
- localStorage persistence only

---

## Test in MyGeotab (Production-Like)

### Step 1: Build Production Bundle

```bash
cd /Users/vincenthofmann/SecondBrain/1-Projects/Geotab/Overview_Builder
npm run build
```

### Step 2: Deploy to MyGeotab

**Option A: Local MyGeotab Server**

```bash
# Copy to your local MyGeotab add-in directory
cp -r deployment/OverviewBuilder /path/to/your/mygeotab/addin/

# Example paths:
# macOS: ~/Development/mygeotab/checkmate/dev/addin/
# Windows: C:\Development\mygeotab\checkmate\dev\addin\
```

**Option B: Cloud MyGeotab**

1. Create ZIP package:
```bash
cd deployment
zip -r OverviewBuilder.zip OverviewBuilder/
```

2. Upload via MyGeotab Administration:
   - Log in as Administrator
   - Go to **Administration** → **System** → **Add-Ins**
   - Click **Add**
   - Upload `OverviewBuilder.zip`

### Step 3: Access in MyGeotab

1. Log into MyGeotab
2. Navigate to dashboard section
3. Look for **"Create Dashboard"** menu item
4. Click to launch Overview-Builder

---

## Test Flow

### Step 1: Select Recipe

Try all 3 recipes:
- **Safety Scorecard** - Collision risk, safety metrics
- **Maintenance Overview** - Work orders, faults, downtime
- **Compliance Dashboard** - HOS logs, violations, IFTA

**Test:**
- Search for recipes
- Filter by category
- Check permission filtering (if using real MyGeotab)

### Step 2: Customize Modules

**Test:**
- Toggle optional modules on/off
- Try to remove required modules (should be disabled)
- Add available modules

### Step 3: Choose Layout

**Test:**
- Single column (mobile-friendly)
- Two column (desktop balanced)
- Grid (wide dashboard)
- Note the recommended layout based on module count

### Step 4: Preview Dashboard

**Test:**
- Toggle between mock and live data (if connected to MyGeotab)
- Change date range filter
- Change group filter
- Resize browser window (responsive test)

### Step 5: Save Dashboard

**Test:**
- Enter dashboard name (validation)
- Add description
- Try sharing options
- Save successfully

---

## Verify Everything Works

### Checklist

- [ ] **Build succeeds:** `npm run build` completes without errors
- [ ] **Dev server runs:** http://localhost:3000 loads
- [ ] **No console errors:** Browser console is clean
- [ ] **Step 1 works:** Can select a recipe
- [ ] **Step 2 works:** Can toggle modules
- [ ] **Step 3 works:** Can select layout
- [ ] **Step 4 works:** Preview renders with modules
- [ ] **Step 5 works:** Can save dashboard with validation
- [ ] **Responsive:** Works on mobile/tablet/desktop
- [ ] **Mock data:** Metrics, charts, and rankings display

### Expected Console Output

```
Initializing Overview-Builder Add-In
Overview-Builder focused
```

### Common Issues

**Port 3000 already in use:**
```bash
# Change port in vite.config.ts (line: server.port)
# Or kill existing process:
lsof -ti:3000 | xargs kill
```

**Build fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

**Recipes not loading:**
- Check browser console for errors
- Verify recipe JSON files are in `src/recipes/`
- Rebuild: `npm run build`

---

## Development Workflow

### Making Changes

1. **Edit code** in `src/`
2. **Hot reload** automatically in dev mode
3. **Test changes** at http://localhost:3000
4. **Build** when ready: `npm run build`
5. **Deploy** updated `deployment/OverviewBuilder/`

### File Locations

**To modify recipes:**
- `src/recipes/*.json`

**To modify UI:**
- `src/components/steps/*.tsx` (wizard steps)
- `src/components/modules/*.tsx` (dashboard modules)
- `src/styles/global.less` (styles)

**To modify data:**
- `src/services/dataService.ts` (replace mock with real API)
- `src/utils/mockData.ts` (mock data generators)

**To modify logic:**
- `src/services/*.ts` (business logic)
- `src/hooks/*.ts` (React hooks)
- `src/context/*.tsx` (state management)

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev

# Type check
npm run type-check

# Build production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

---

## Next Actions

### For Testing
1. Run `npm run dev`
2. Open http://localhost:3000
3. Test the 5-step flow
4. Report any issues

### For Deployment
1. Run `npm run build`
2. Copy `deployment/OverviewBuilder/` to MyGeotab
3. Register add-in
4. Test in production environment

### For Integration
1. Connect real MyGeotab API in `dataService.ts`
2. Implement dashboard persistence
3. Test with real user permissions
4. Performance optimization

---

## Support

**Documentation:**
- CONTEXT.md - Project overview
- IMPLEMENTATION.md - Technical details
- DEPLOYMENT.md - Full deployment guide
- DEPLOYMENT_SUMMARY.md - Build summary

**Contact:**
- design@geotab.com

**Project Location:**
- `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/Overview_Builder/`

---

**🚀 You're ready to go!**

Run `npm run dev` and open http://localhost:3000 to get started.
