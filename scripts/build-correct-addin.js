#!/usr/bin/env node
/**
 * Build Correct MyGeotab Add-In Configuration
 * Following official Geotab documentation format
 */

const fs = require('fs');
const path = require('path');

const deployDir = path.join(__dirname, '../deployment/OverviewBuilder');
const outputFile = path.join(__dirname, '../deployment/correct-addin-config.json');

// Read all asset files
const css = fs.readFileSync(path.join(deployDir, 'assets/index-25a7351c.css'), 'utf8');
const vendorJs = fs.readFileSync(path.join(deployDir, 'assets/vendor-b1791c80.js'), 'utf8');
const queryJs = fs.readFileSync(path.join(deployDir, 'assets/query-0b6e7572.js'), 'utf8');
const appJs = fs.readFileSync(path.join(deployDir, 'assets/index-2eb8f992.js'), 'utf8');

// Create the HTML page
const html = `<!DOCTYPE html>
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
${vendorJs}
${queryJs}
${appJs}
  </script>
</body>
</html>`;

// Create MyGeotab add-in configuration following official format
const config = {
  "name": "Overview Builder",
  "supportEmail": "vincenthofmann@geotab.com",
  "version": "1.0",
  "items": [{
    "url": "index.html",
    "path": "ActivityLink/",
    "menuName": {
      "en": "Create Dashboard",
      "fr": "Créer un tableau de bord",
      "es": "Crear panel",
      "de": "Dashboard erstellen"
    }
  }],
  "files": {
    "index.html": html
  }
};

// Write to file
fs.writeFileSync(outputFile, JSON.stringify(config, null, 2));

console.log('✅ Correct add-in configuration created!');
console.log(`📁 File: ${outputFile}`);
console.log(`📊 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
console.log('');
console.log('Configuration format:');
console.log('- items[0].url = "index.html" (references file in "files" object)');
console.log('- items[0].path = "ActivityLink/" (menu location)');
console.log('- files["index.html"] = embedded HTML with all code');
console.log('');
console.log('To use:');
console.log('1. Go to MyGeotab → Administration → System → Add-Ins');
console.log('2. Click "New Add-In"');
console.log('3. Upload or paste correct-addin-config.json');
console.log('4. Look for "Create Dashboard" in Activities menu');
