#!/usr/bin/env node
/**
 * Build Embedded MyGeotab Add-In Configuration
 *
 * Creates a single JSON file with all HTML/CSS/JS embedded.
 * This bypasses CORS issues by including all code inline.
 */

const fs = require('fs');
const path = require('path');

const deployDir = path.join(__dirname, '../deployment/OverviewBuilder');
const outputFile = path.join(__dirname, '../deployment/embedded-config.json');

// Read all asset files
const css = fs.readFileSync(path.join(deployDir, 'assets/index-25a7351c.css'), 'utf8');
const vendorJs = fs.readFileSync(path.join(deployDir, 'assets/vendor-b1791c80.js'), 'utf8');
const queryJs = fs.readFileSync(path.join(deployDir, 'assets/query-0b6e7572.js'), 'utf8');
const appJs = fs.readFileSync(path.join(deployDir, 'assets/index-01914cfa.js'), 'utf8');

// Create inline HTML with all assets embedded
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Overview Builder - MyGeotab Add-In</title>
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

// Create MyGeotab add-in configuration
const config = {
  name: "Overview Builder",
  supportEmail: "vincenthofmann@geotab.com",
  version: "1.0.0",
  items: [{
    page: "overviewBuilder",
    path: "ActivityLink/",
    menuName: {
      en: "Create Dashboard",
      fr: "Créer un tableau de bord",
      es: "Crear panel",
      de: "Dashboard erstellen"
    }
  }],
  files: {
    "page.html": html
  }
};

// Write to file
fs.writeFileSync(outputFile, JSON.stringify(config, null, 2));

console.log('✅ Embedded configuration created!');
console.log(`📁 File: ${outputFile}`);
console.log(`📊 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
console.log('');
console.log('To use:');
console.log('1. Go to MyGeotab → Administration → System → Add-Ins');
console.log('2. Click "New Add-In"');
console.log('3. Upload or paste embedded-config.json');
console.log('4. Look for "Create Dashboard" in Activities menu');
