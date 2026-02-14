# Deployment Guide

## GitHub Pages Deployment (Current Setup)

The Report Builder add-in is automatically deployed via GitHub Pages from the `docs/` folder.

### Live URLs

**GitHub Pages Site:**
```
https://vincenthofmann-ai.github.io/report-builder-addin/
```

**MyGeotab Add-in Configuration:**
```
https://vincenthofmann-ai.github.io/report-builder-addin/configuration.json
```

### Deployment Workflow

**1. Make changes to source code**
```bash
# Edit files in src/
npm run dev  # Test locally
```

**2. Build and deploy**
```bash
npm run deploy
```

This script:
- Builds the React app to `docs/` folder
- Commits the build output
- Pushes to GitHub
- GitHub Pages auto-deploys within 1-2 minutes

**Manual deployment:**
```bash
npm run build              # Build to docs/
git add docs/             # Stage changes
git commit -m "Deploy: update build"
git push                  # Push to trigger deployment
```

### Build Configuration

**Vite Config** (`vite.config.ts`):
- `outDir: 'docs'` - Output to docs/ for GitHub Pages
- `base: './'` - Relative paths for flexible hosting
- Asset bundling optimized for MyGeotab iframe

**Package Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build production bundle to docs/
- `npm run build:addin` - Build with deployment message
- `npm run deploy` - Build, commit, and push in one command

## MyGeotab Integration

### Installing the Add-In

**Option 1: System Add-In (Admin)**
1. Login to MyGeotab as administrator
2. Navigate to **Administration > System > System Settings**
3. Click **Add-Ins** tab
4. Click **New** → **Add Add-In from URL**
5. Enter: `https://vincenthofmann-ai.github.io/report-builder-addin/configuration.json`
6. Click **Save**

**Option 2: Custom Registration (Development/Testing)**
1. Navigate to **Administration > System > Custom Registrations**
2. Click **New**
3. Enter configuration URL
4. Click **OK**

### Add-In Configuration

The add-in is configured in `docs/configuration.json`:

```json
{
  "name": "Report Builder",
  "supportEmail": "support@geotab.com",
  "version": "1.0.0",
  "items": [{
    "url": "index.html",
    "path": "ActivityLink/",
    "menuName": {
      "en": "Report Builder",
      "fr": "Constructeur de rapports",
      "es": "Constructor de informes",
      "de": "Berichtsgenerator"
    }
  }]
}
```

**Menu Locations:**
- `ActivityLink/` - Activity menu (current)
- `MapLink/` - Map menu
- `AdministrationLink/` - Administration menu

## Troubleshooting

### Add-In Not Loading

**Check GitHub Pages deployment:**
```bash
# Visit the configuration URL in browser
open https://vincenthofmann-ai.github.io/report-builder-addin/configuration.json
```

**Verify CORS headers:**
GitHub Pages automatically sets correct CORS headers for cross-origin requests from MyGeotab.

**Clear MyGeotab cache:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Re-add the add-in registration

### Build Issues

**Clean build:**
```bash
rm -rf docs/
npm run build
```

**Check build output:**
```bash
ls -la docs/
# Should contain: index.html, configuration.json, assets/
```

### GitHub Pages Not Updating

**Check Pages status:**
```bash
gh api repos/vincenthofmann-AI/report-builder-addin/pages
```

**Manually trigger rebuild:**
```bash
git commit --allow-empty -m "Trigger Pages rebuild"
git push
```

**Deployment typically takes 1-2 minutes**

## Alternative Hosting Options

If GitHub Pages has issues, the `docs/` folder can be deployed to:

### 1. Geotab CDN
Upload `docs/` contents to Geotab's internal CDN

### 2. Cloud Storage
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Blob Storage + CDN

### 3. Custom Server
Serve `docs/` folder via any HTTPS server:
- Nginx
- Apache
- Node.js (Express)

**Requirements:**
- HTTPS with TLS 1.2+
- CORS headers allowing MyGeotab origin
- Stable URL for configuration.json

## Version Management

**Updating the add-in version:**

1. Update version in `docs/configuration.json`
2. Update version in `package.json`
3. Deploy:
   ```bash
   npm run deploy
   ```

MyGeotab checks for updates periodically. Users may need to refresh to see new version.

## Security Notes

**HTTPS Required:**
MyGeotab only loads add-ins via HTTPS. GitHub Pages provides free SSL.

**API Access:**
The add-in inherits MyGeotab session credentials via `window.geotab.api`. No separate authentication needed.

**Content Security Policy:**
React app runs in MyGeotab iframe with restricted CSP. Avoid:
- Inline scripts (handled by Vite build)
- External script loading
- `eval()` usage

## Monitoring

**Check deployment status:**
```bash
# View latest commit on GitHub
gh browse

# Check Pages deployment
gh api repos/vincenthofmann-AI/report-builder-addin/pages/builds/latest
```

**Analytics:**
GitHub Pages doesn't provide built-in analytics. Consider adding:
- Google Analytics
- MyGeotab usage tracking via API
