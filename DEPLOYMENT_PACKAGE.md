# Deployment Package: MyGeotab Report Builder Add-In

## Files for Geotab Hosting

To deploy this add-in, you need to upload the following files to your Geotab hosting location:

### Required Files (from `/src` directory)

1. **report-builder.html** - Main page (17KB)
2. **report-builder.css** - Styling (9KB)
3. **report-builder.js** - Application logic (16KB)
4. **configuration.json** - Add-In configuration (500 bytes)

### Total Package Size
Approximately 42KB (uncompressed)

## Deployment Steps

### 1. Prepare Hosting Location

Determine your Geotab hosting URL structure. Example formats:

**Option A: Geotab CDN** (if available)
```
https://cdn.geotab.com/addins/report-builder/
```

**Option B: Internal Server**
```
https://apps.geotab.com/report-builder/
```

**Option C: Cloud Storage** (GCP, S3, Azure)
```
https://storage.googleapis.com/geotab-addins/report-builder/
```

**Requirements**:
- HTTPS enabled
- TLS 1.2 or higher
- Publicly accessible
- No dashes in domain before path (e.g., ❌ `my-server.com`, ✅ `myserver.com`)

### 2. Update Configuration

Before uploading, edit `src/configuration.json`:

**Find this line:**
```json
"url": "https://[YOUR-SERVER]/report-builder/report-builder.html",
```

**Replace with your actual URL:**
```json
"url": "https://cdn.geotab.com/addins/report-builder/report-builder.html",
```

**Also update icon path** (if using custom icon):
```json
"icon": "https://cdn.geotab.com/addins/report-builder/assets/icon.svg"
```

Or remove the icon line to use default.

### 3. Upload Files

Upload all 4 files to your hosting location:

```
https://[YOUR-URL]/report-builder/
├── report-builder.html
├── report-builder.css
├── report-builder.js
└── (configuration.json - keep local for installation)
```

**Verify accessibility**: Open `https://[YOUR-URL]/report-builder/report-builder.html` in browser to confirm hosting works.

### 4. Install in MyGeotab

#### Via System Settings (Recommended)

1. Log into MyGeotab as administrator
2. Navigate to **System** → **System Settings** → **Add-Ins**
3. Click **"Add New"**
4. Copy the entire contents of `configuration.json`
5. Paste into the text area
6. Click **"OK"**

#### Via JSON Import

Some MyGeotab instances allow JSON file upload:
1. Navigate to **System** → **System Settings** → **Add-Ins**
2. Click **"Import"** or **"Upload JSON"**
3. Select `configuration.json`
4. Confirm installation

### 5. Verify Installation

1. Refresh MyGeotab page
2. Navigate to **Activity** in main menu
3. Look for **"Report Builder"** in submenu
4. Click to launch add-in
5. Verify all 4 workflow steps load correctly

## File Checklist

Before deployment, verify:

- [ ] `report-builder.html` - Complete HTML structure
- [ ] `report-builder.css` - All styles present
- [ ] `report-builder.js` - No syntax errors (validate in IDE)
- [ ] `configuration.json` - Updated with correct URLs
- [ ] All files uploaded to hosting location
- [ ] Files accessible via HTTPS
- [ ] Configuration installed in MyGeotab
- [ ] Add-in appears in Activity menu
- [ ] All workflow steps functional

## Manual Zip Creation

If you need to create a zip file manually:

### macOS/Linux Terminal
```bash
cd /Users/vincenthofmann/SecondBrain/1-Projects/Geotab/report-builder-addin
zip -r report-builder-addin.zip src/ docs/ README.md MEMORY.md
```

### Windows PowerShell
```powershell
cd C:\Path\To\report-builder-addin
Compress-Archive -Path src\*,docs\*,README.md,MEMORY.md -DestinationPath report-builder-addin.zip
```

### macOS Finder
1. Navigate to `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/report-builder-addin`
2. Select: `src`, `docs`, `README.md`, `MEMORY.md`
3. Right-click → "Compress 4 Items"
4. Rename to `report-builder-addin.zip`

## Signing (Production Only)

For production deployments, you'll need to sign the configuration:

1. Generate private/public key pair
2. Sign the JSON configuration
3. Add signature to `signature` field
4. Set `isSigned: true`

Contact Geotab support for signing procedures.

## Troubleshooting Deployment

### Files Won't Upload
- Check file permissions
- Verify hosting service supports HTML/CSS/JS
- Confirm HTTPS is enabled

### Add-In Not Appearing
- Verify `configuration.json` is valid JSON (use validator)
- Check URLs in configuration match hosted files
- Clear browser cache and refresh MyGeotab
- Check browser console for errors

### CORS Errors
- Add CORS headers to hosting server:
  ```
  Access-Control-Allow-Origin: *.geotab.com
  Access-Control-Allow-Methods: GET, OPTIONS
  ```

### TLS/SSL Errors
- Verify server supports TLS 1.2 or higher
- Check SSL certificate is valid
- Test with: `curl -v https://your-url/report-builder.html`

## Next Steps After Deployment

1. **Test with Real Data**: Run reports against your MyGeotab database
2. **User Training**: Share Quick Start guide with users
3. **Monitor Usage**: Check for errors or performance issues
4. **Gather Feedback**: Collect user requests for improvements
5. **Iterate**: Add custom patterns and data sources as needed

## Support

**Files Location**: `/Users/vincenthofmann/SecondBrain/1-Projects/Geotab/report-builder-addin/`

**Documentation**:
- README.md - Project overview
- docs/QUICK_START.md - User guide
- MEMORY.md - Development decisions

**Issues**: Report bugs to your support email configured in `configuration.json`

---

**Version**: 0.1.0
**Last Updated**: 2026-02-13
**Package Created By**: Claude Code
