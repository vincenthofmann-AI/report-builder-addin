#!/usr/bin/env node
/**
 * Build Page-Based MyGeotab Add-In Configuration
 *
 * Creates a page-based add-in that MyGeotab will serve directly
 */

const fs = require('fs');
const path = require('path');

const deployDir = path.join(__dirname, '../deployment/OverviewBuilder');
const outputFile = path.join(__dirname, '../deployment/page-addin-config.json');

// Read all asset files
const css = fs.readFileSync(path.join(deployDir, 'assets/index-25a7351c.css'), 'utf8');
const vendorJs = fs.readFileSync(path.join(deployDir, 'assets/vendor-b1791c80.js'), 'utf8');
const queryJs = fs.readFileSync(path.join(deployDir, 'assets/query-0b6e7572.js'), 'utf8');
const appJs = fs.readFileSync(path.join(deployDir, 'assets/index-2eb8f992.js'), 'utf8');

// Create the page HTML - this is what MyGeotab will display when navigating to the page
const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Overview Builder</title>
  <style>
${css}
  </style>
</head>
<body>
  <div id="overview-builder-root"></div>
  <script>
// Vendor dependencies (React, ReactDOM, React Query)
${vendorJs}

// React Query
${queryJs}

// Application code
${appJs}
  </script>
</body>
</html>`;

// Create MyGeotab page-based add-in configuration
const config = {
  "name": "Overview Builder",
  "supportEmail": "vincenthofmann@geotab.com",
  "version": "1.0.0",
  "items": [{
    "page": "overviewBuilder",
    "menuName": {
      "en": "Create Dashboard",
      "fr": "Créer un tableau de bord",
      "es": "Crear panel",
      "de": "Dashboard erstellen"
    }
  }],
  "files": {
    "overviewBuilder.html": pageHtml
  }
};

// Write to file
fs.writeFileSync(outputFile, JSON.stringify(config, null, 2));

console.log('✅ Page-based add-in configuration created!');
console.log(`📁 File: ${outputFile}`);
console.log(`📊 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
console.log('');
console.log('To use:');
console.log('1. Go to MyGeotab → Administration → System → Add-Ins');
console.log('2. Click "New Add-In"');
console.log('3. Upload or paste page-addin-config.json');
console.log('4. MyGeotab will create a custom page accessible from the menu');
console.log('5. Look for "Create Dashboard" in your menu');
