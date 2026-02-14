# Installation Guide: MyGeotab Report Builder Add-In

## Understanding MyGeotab Add-In Installation

Based on Geotab's SDK documentation and examples, there are **two ways** to install add-ins:

### Option 1: Use MyGeotab's Add-In Registration (Recommended)

When you register your add-in through MyGeotab System Settings, you provide:
1. `configuration.json` - The add-in configuration
2. Your source files (HTML, CSS, JS) - **Uploaded separately to Geotab**

MyGeotab will then **host your files** on their servers.

### Option 2: External Hosting

Host your files on your own server (HTTPS + TLS 1.2+) and reference them via URLs in the configuration.

---

## Installation Steps (Option 1: Geotab Hosting)

### Step 1: Prepare Your Files

You have **4 files** to upload:

```
src/
├── configuration.json      # Add-in configuration
├── reportBuilder.html      # Main page (238 lines)
├── reportBuilder.css       # Styles (549 lines)
└── reportBuilder.js        # Logic (16KB)
```

### Step 2: Install in MyGeotab

1. **Log into MyGeotab** as administrator
2. Navigate to: **System** → **System Settings** → **Add-Ins**
3. Click **"Add New"** or **"Register Add-In"**

**IMPORTANT**: The exact upload process depends on your MyGeotab version. You may:

- **Option A**: Paste the `configuration.json` content, then upload HTML/CSS/JS files separately
- **Option B**: Upload all files together as a package
- **Option C**: Use the Add-In registration form to upload files

### Step 3: File Upload

When prompted to upload your source files:

1. Upload `reportBuilder.html` (main page)
2. Upload `reportBuilder.css` (styles)
3. Upload `reportBuilder.js` (application logic)

**MyGeotab will host these files** on their servers automatically.

### Step 4: Verify Installation

1. Refresh MyGeotab
2. Go to **Activity** menu
3. Click **"Report Builder"**
4. The add-in should load

---

## Configuration File Details

### Current configuration.json

```json
{
  "name": "Report Builder",
  "supportEmail": "support@geotab.com",
  "version": "0.1.0",
  "items": [{
    "page": "reportBuilder",
    "url": "reportBuilder.html",
    "path": "ActivityLink",
    "menuName": {
      "en": "Report Builder",
      "fr": "Générateur de Rapports",
      "es": "Generador de Informes",
      "de": "Berichtsgenerator"
    }
  }],
  "files": {
    "reportBuilder.html": "",
    "reportBuilder.css": "",
    "reportBuilder.js": ""
  },
  "isSigned": false
}
```

### Key Properties:

- **name**: Add-in display name
- **items[].url**: Reference to your main HTML file (MyGeotab will host this)
- **items[].path**: Where it appears in menu (`ActivityLink` = Activity menu)
- **files**: Declares which files MyGeotab should host (content uploaded separately)
- **isSigned**: Set to `false` for development (production requires signing)

---

## Alternative: External Hosting

If MyGeotab doesn't allow file uploads in your version, use external hosting:

### Step 1: Upload to Your Server

Upload files to an HTTPS server:
```
https://your-server.com/geotab/report-builder/
├── reportBuilder.html
├── reportBuilder.css
└── reportBuilder.js
```

### Step 2: Update Configuration

Edit `configuration.json`:

```json
{
  "name": "Report Builder",
  "supportEmail": "support@geotab.com",
  "version": "0.1.0",
  "items": [{
    "page": "reportBuilder",
    "url": "https://your-server.com/geotab/report-builder/reportBuilder.html",
    "path": "ActivityLink",
    "menuName": {
      "en": "Report Builder"
    }
  }],
  "files": {},
  "isSigned": false
}
```

### Step 3: Install

Paste the updated configuration into MyGeotab → System Settings → Add-Ins.

---

## Troubleshooting

### "Add-In Not Found"
- Verify `configuration.json` is valid JSON (use validator)
- Check that file names match exactly (`reportBuilder.html` not `report-builder.html`)

### "Files Not Loading"
- If using external hosting: Check HTTPS is enabled and TLS 1.2+
- Verify URLs are accessible in browser
- Check browser console for errors

### "Cannot Upload Files"
- Contact your MyGeotab administrator
- They may need to enable add-in registration permissions
- Some MyGeotab instances require admin approval

### "Add-In Appears But Doesn't Work"
- Open browser console (F12)
- Check for JavaScript errors
- Verify MyGeotab API is accessible
- Ensure you have data in your database to query

---

## Next Steps

Once installed:

1. **Test the workflow**: Try creating a simple Device report
2. **Verify exports**: Test CSV download functionality
3. **Check filters**: Ensure group filtering works
4. **Review permissions**: Confirm users can access the add-in

---

## Contact

**Project Location**: `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/report-builder-addin/`

**Files Ready For Upload**:
- `src/configuration.json`
- `src/reportBuilder.html`
- `src/reportBuilder.css`
- `src/reportBuilder.js`

**Documentation**:
- `README.md` - Project overview
- `MEMORY.md` - Development decisions
- `docs/QUICK_START.md` - User guide

---

**Version**: 0.1.0
**Last Updated**: 2026-02-13
