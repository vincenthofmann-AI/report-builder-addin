# MyGeotab Add-In Registration

## Quick Setup

Your Overview Builder is live at:
**https://vincenthofmann-ai.github.io/report-builder-addin/**

## ⚠️ CORS Issue with GitHub Pages

GitHub Pages doesn't send the required `Access-Control-Allow-Origin` header, so MyGeotab cannot load the add-in directly from the hosted URL. Use the **Embedded Configuration** method below instead.

## Register in MyGeotab

**Use the file: `deployment/correct-addin-config.json` (250 KB)**

1. Log into MyGeotab as **Administrator**
2. Go to **Administration** → **System** → **Add-Ins**
3. Click **"Add"** or **"Add New Add-In"**
4. **Upload or paste the contents** of `correct-addin-config.json`
5. **Save** and assign to users/groups
6. Look for **"Create Dashboard"** in the Activities menu

**What this does:**
- Creates a custom page in MyGeotab Activities menu
- All code is embedded in the configuration file
- MyGeotab serves the HTML from the "files" object
- No external URLs, no CORS issues
- File size: 250 KB (well within MyGeotab limits)

**Configuration format:**
- `items[0].url = "index.html"` (references file in "files" object)
- `items[0].path = "ActivityLink/"` (menu location)
- `files["index.html"] = embedded HTML` (all CSS/JS inline)

### Method 2: Administration UI (GitHub Pages - Has CORS Issues)

1. Log into MyGeotab as **Administrator**
2. Go to **Administration** → **System** → **Add-Ins**
3. Click **"Add"** or **"Add New Add-In"**
4. Fill in the form:

| Field | Value |
|-------|-------|
| Name | Overview Builder |
| Page | overviewBuilder |
| Version | 1.0.0 |
| URL | https://vincenthofmann-ai.github.io/report-builder-addin/ |
| Click Function | OverviewBuilder.initialize |
| Menu ID | dashboardMenu |
| Menu Name (English) | Create Dashboard |
| Support Email | vincenthofmann@geotab.com |
| Is Signed | No |

5. **Save** and assign to users/groups
6. Look for **"Create Dashboard"** in your Dashboard menu

### Method 3: Copy/Paste JSON (GitHub Pages - Has CORS Issues)

Use the file: `deployment/mygeotab-registration.json`

```json
{
  "name": "Overview Builder",
  "supportEmail": "vincenthofmann@geotab.com",
  "version": "1.0.0",
  "items": [{
    "url": "https://vincenthofmann-ai.github.io/report-builder-addin/",
    "path": "ActivityLink/",
    "menuName": {
      "en": "Create Dashboard",
      "fr": "Créer un tableau de bord",
      "es": "Crear panel",
      "de": "Dashboard erstellen"
    },
    "svgIcon": "https://www.geotab.com/geoimages/home/icon-solutions.svg"
  }],
  "files": {}
}
```

## Verify

1. **Refresh MyGeotab** (clear cache: Ctrl+Shift+R / Cmd+Shift+R)
2. **Find menu item**: Look for "Create Dashboard" in Dashboard menu
3. **Test**: Click it and the wizard should load
4. **Check console**: Should show "Initializing Overview-Builder Add-In"

## Deployment URLs

- **Live Demo:** https://vincenthofmann-ai.github.io/report-builder-addin/
- **GitHub Repo:** https://github.com/vincenthofmann-AI/report-builder-addin

## Updates

When you update the code:
```bash
npm run deploy
```

Changes go live automatically in 1-2 minutes.

## Troubleshooting

See `MYGEOTAB_SETUP.md` for detailed troubleshooting.

**Common issues:**
- Add-in not appearing → Check user permissions
- CORS errors → Contact IT (should work with GitHub Pages)
- Blank page → Clear browser cache completely
