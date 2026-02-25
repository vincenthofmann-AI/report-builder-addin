# MyGeotab Add-In Setup Guide

## Prerequisites

You need access to MyGeotab with **Administrator** permissions.

## Method 1: Using MyGeotab SDK (Recommended)

### Step 1: Get Your Files Ready

The deployment package is ready at:
```
deployment/OverviewBuilder/
├── index.html
├── addin.json
└── assets/
    ├── index-2eb8f992.js
    ├── vendor-b1791c80.js
    ├── query-0b6e7572.js
    └── index-25a7351c.css
```

### Step 2: Upload to Your Web Server

You need to host these files on a web server accessible to your MyGeotab instance:

**Option A: Internal Server**
```bash
# Upload to your company's web server
scp -r deployment/OverviewBuilder/* user@your-server.com:/var/www/html/addins/overview-builder/
```

**Option B: GeotabPages (Recommended for Geotab employees)**
```bash
# Contact Geotab IT to get access to GeotabPages
# They will provide you with deployment credentials
# Once you have access:
cd deployment/OverviewBuilder
# Deploy using their CLI tool
```

**Example URL after upload:**
`https://your-server.com/addins/overview-builder/`

### Step 3: Register the Add-In via MyGeotab SDK

Use the MyGeotab SDK to register the add-in:

```javascript
// Using MyGeotab SDK
api.call("Add", {
  typeName: "CustomDevice",
  entity: {
    name: "Overview Builder",
    customParameters: [{
      name: "configuration",
      value: JSON.stringify({
        "name": "Overview Builder",
        "supportEmail": "vincenthofmann@geotab.com",
        "version": "1.0.0",
        "isSigned": false,
        "items": [{
          "page": "overviewBuilder",
          "click": "OverviewBuilder.initialize",
          "menuName": {
            "en": "Create Dashboard",
            "fr": "Créer un tableau de bord",
            "es": "Crear panel",
            "de": "Dashboard erstellen"
          },
          "url": "https://YOUR-SERVER.com/addins/overview-builder/",
          "icon": "https://cdn.geotab.com/resources/images/icons/dashboard.svg",
          "menuId": "dashboardMenu"
        }]
      })
    }]
  }
});
```

## Method 2: Using MyGeotab Configuration API

### Step 1: Prepare the Configuration

Edit `deployment/mygeotab-registration.json` and replace `{{URL_PLACEHOLDER}}` with your hosted URL:

```json
{
  "name": "Overview Builder",
  "supportEmail": "vincenthofmann@geotab.com",
  "version": "1.0.0",
  "isSigned": false,
  "items": [
    {
      "page": "overviewBuilder",
      "click": "OverviewBuilder.initialize",
      "menuName": {
        "en": "Create Dashboard"
      },
      "url": "https://YOUR-HOSTED-URL/overview-builder/",
      "icon": "https://cdn.geotab.com/resources/images/icons/dashboard.svg",
      "menuId": "dashboardMenu"
    }
  ]
}
```

### Step 2: Register via MyGeotab API

Use the MyGeotab API to add the configuration:

```bash
curl -X POST "https://my.geotab.com/apiv1" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "Add",
    "params": {
      "typeName": "AddInConfiguration",
      "entity": {
        "configuration": "<YOUR_JSON_CONFIG_HERE>"
      },
      "credentials": {
        "database": "your_database",
        "userName": "your_username",
        "sessionId": "your_session_id"
      }
    }
  }'
```

## Method 3: Manual Registration (MyGeotab Administration)

### Step 1: Access Add-In Management

1. Log into MyGeotab as Administrator
2. Go to **Administration** → **System** → **Add-Ins**
3. Click **"Add New Add-In"**

### Step 2: Fill in the Form

| Field | Value |
|-------|-------|
| **Name** | Overview Builder |
| **Page** | overviewBuilder |
| **Version** | 1.0.0 |
| **URL** | https://YOUR-HOSTED-URL/overview-builder/ |
| **Click Function** | OverviewBuilder.initialize |
| **Menu ID** | dashboardMenu |
| **Menu Name (EN)** | Create Dashboard |
| **Menu Name (FR)** | Créer un tableau de bord |
| **Menu Name (ES)** | Crear panel |
| **Menu Name (DE)** | Dashboard erstellen |
| **Support Email** | vincenthofmann@geotab.com |
| **Icon** | https://cdn.geotab.com/resources/images/icons/dashboard.svg |
| **Is Signed** | No (unchecked) |

### Step 3: Assign Permissions

After saving:
1. Click on the newly created add-in
2. Go to **"Users & Groups"** tab
3. Assign to specific users or groups
4. Save changes

## Method 4: For Geotab Internal Development

If you have access to the MyGeotab source code:

### Step 1: Copy Files to Add-In Directory

```bash
# Navigate to your MyGeotab development repo
cd ~/Development/MyGeotab

# Copy the add-in files
cp -r /path/to/Overview_Builder/deployment/OverviewBuilder ./checkmate/dev/addin/

# Or use the absolute path:
cp -r /Users/vincenthofmann/SecondBrain/1-Projects/Geotab/Overview_Builder/deployment/OverviewBuilder ./checkmate/dev/addin/
```

### Step 2: Update Configuration

Edit `checkmate/dev/addin/config.json` and add:

```json
{
  "addins": [
    {
      "name": "overview-builder",
      "path": "addin/OverviewBuilder/",
      "click": "OverviewBuilder.initialize",
      "menuName": {
        "en": "Create Dashboard"
      },
      "menuId": "dashboardMenu"
    }
  ]
}
```

### Step 3: Restart Development Server

```bash
# Restart your local MyGeotab server
npm run dev
# or
./start-server.sh
```

## Verification Steps

After registration, verify the add-in is working:

### 1. Check Menu Visibility

- Log into MyGeotab
- Look in the Dashboard section menu
- You should see **"Create Dashboard"**

### 2. Test Initialization

- Click "Create Dashboard"
- Open browser console (F12)
- You should see:
  ```
  Initializing Overview-Builder Add-In
  Initializing in standalone mode
  ```

### 3. Test Functionality

- Step 1: Should show 3 recipes (Safety, Maintenance, Compliance)
- Step 2: Module selector should work
- Step 3: Layout options should appear
- Step 4: Preview should render
- Step 5: Save dialog should appear

## Troubleshooting

### Add-in doesn't appear in menu

**Check:**
1. User has correct permissions
2. Add-in is enabled for the database
3. Clear browser cache (Ctrl+Shift+R)
4. Check browser console for errors

### CORS Errors

If you see CORS errors, your server needs these headers:

```
Access-Control-Allow-Origin: https://my.geotab.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Initialization fails

**Check:**
1. URL is correct and accessible
2. All files are uploaded (index.html and assets/)
3. Browser console shows what's failing
4. Network tab shows all files loading (200 OK)

### Blank page / No content

This should be fixed now, but if it happens:
1. Check that `index-2eb8f992.js` is loading (not the old version)
2. Verify browser console shows "Initializing in standalone mode"
3. Make sure container div exists: `document.getElementById('overview-builder-root')`

## Required Permissions

The add-in checks for these MyGeotab permissions:

### Safety Scorecard
- `ViewCollisionRisk`
- `ViewExceptions`
- `ViewDrivers`
- `ViewDevices`
- `ViewTrips`

### Maintenance Overview
- `ViewMaintenanceWorkOrders`
- `ViewMaintenanceWorkRequests`
- `ViewFaults`
- `ViewMaintenanceOverview`

### Compliance Dashboard
- `ViewHoSLogs`
- `ViewDutyStatusViolations`
- `ViewIftaMiles`

Users without these permissions won't see the corresponding recipes.

## Files Included

```
deployment/
├── OverviewBuilder/              # Main deployment package
│   ├── index.html               # Entry point
│   ├── addin.json               # Local manifest
│   └── assets/                  # Compiled bundles
├── mygeotab-registration.json   # API registration config
└── MYGEOTAB_SETUP.md           # This file
```

## Support

For questions or issues:
- **Email:** vincenthofmann@geotab.com
- **Project:** `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/Overview_Builder/`
- **Documentation:** See `CONTEXT.md`, `DEPLOYMENT.md`, `TROUBLESHOOTING.md`

---

**Quick Start Command:**

```bash
# Copy these commands and replace YOUR-SERVER-URL

# 1. Upload files to your server
cd /Users/vincenthofmann/SecondBrain/1-Projects/Geotab/Overview_Builder/deployment
scp -r OverviewBuilder/* user@your-server:/var/www/html/addins/overview-builder/

# 2. Test the URL is accessible
curl https://your-server.com/addins/overview-builder/index.html

# 3. Register in MyGeotab Administration
# Use the form in Administration → System → Add-Ins
# URL: https://your-server.com/addins/overview-builder/
# Click: OverviewBuilder.initialize
```

---

**Last Updated:** February 24, 2026
