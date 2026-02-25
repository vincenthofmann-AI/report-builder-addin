# MyGeotab Add-In Registration

## Quick Setup

Your Overview Builder is live at:
**https://vincenthofmann-ai.github.io/report-builder-addin/**

## Register in MyGeotab (2 methods)

### Method 1: Administration UI (Easiest)

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

### Method 2: Copy/Paste JSON

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
