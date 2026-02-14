# Quick Start Guide: MyGeotab Report Builder Add-In

## Overview

This guide will help you deploy and test the Report Builder Add-In in your MyGeotab environment.

## Prerequisites

1. **MyGeotab Account** with administrator access
2. **Web Server** with HTTPS and TLS 1.2+ support
3. **Files to Host**:
   - `report-builder.html`
   - `report-builder.css`
   - `report-builder.js`

## Installation Steps

### 1. Host Your Files

Upload the three files from `/src` to a publicly accessible HTTPS server:

```
https://your-server.com/report-builder/
├── report-builder.html
├── report-builder.css
└── report-builder.js
```

**Important**: URLs cannot contain dashes in the domain or path before the filename.

✅ Good: `https://myserver.com/reportbuilder/report-builder.html`
❌ Bad: `https://my-server.com/report-builder/report-builder.html`

### 2. Update Configuration

Edit `src/configuration.json` and replace `[YOUR-SERVER]` with your actual server URL:

```json
{
  "name": "MyGeotab Report Builder",
  "supportEmail": "support@geotab.com",
  "version": "0.1.0",
  "items": [
    {
      "page": "reportBuilder",
      "url": "https://myserver.com/reportbuilder/report-builder.html",
      "path": "ActivityLink",
      "menuName": {
        "en": "Report Builder"
      },
      "version": "0.1.0"
    }
  ],
  "files": {},
  "isSigned": false
}
```

### 3. Install Add-In in MyGeotab

1. Log into your MyGeotab account as an administrator
2. Navigate to **System** → **System Settings** → **Add-Ins**
3. Click **"Add New"**
4. Paste the contents of your updated `configuration.json`
5. Click **"OK"**

### 4. Access the Add-In

1. Navigate to **Activity** in the main menu
2. You should see **"Report Builder"** in the submenu
3. Click to open the Report Builder

## Using the Report Builder

### Workflow

The Report Builder follows a 4-step workflow:

#### Step 1: Select Data Source
- Choose from available MyGeotab entities (Devices, Trips, Exceptions, etc.)
- Click on a card to select

#### Step 2: Configure Filters
- **Date Range**: Select a preset (Today, This Week, This Month) or custom range
- **Groups**: Select organization groups to filter
- **Custom Filters**: Add additional field-level filters
- Click **"Next: Choose Pattern"**

#### Step 3: Choose Report Pattern
- **Fleet Summary Dashboard**: Overview metrics and status
- **Compliance Report**: Safety and regulatory tracking
- **Operational Efficiency**: Fuel, idle, and utilization metrics
- **Data Table**: Simple filtered table
- Click on a pattern card to select

#### Step 4: Preview & Export
- Review report configuration
- View data preview (first 10 rows)
- Export in your preferred format:
  - **PDF**: Print-ready document
  - **Excel/CSV**: Data file for analysis
  - **Email**: Send report to stakeholders

## Testing

### Test Data Source: Devices

1. **Select** "Devices" as data source
2. **Filter** by "This Month" date range
3. **Choose** "Data Table" pattern
4. **Export** as CSV to verify data

### Expected Results

- Data preview shows vehicle list with ID, name, serial number, VIN, etc.
- CSV download contains all filtered devices
- Preview limited to 10 rows, full export includes all records

## Troubleshooting

### Add-In Not Appearing in Menu

**Check**:
- Configuration JSON is valid (use JSON validator)
- Server URLs are correct and accessible
- Files are hosted on HTTPS with TLS 1.2+
- No dashes in domain or path before filename

### "Error loading groups"

**Solution**:
- Verify API access is working
- Check browser console for errors
- Ensure MyGeotab session is active

### Data Preview Not Loading

**Check**:
- Selected data source has data in your database
- Date range includes data
- Group filters are not too restrictive
- Browser console for API errors

### Export Not Working

**CSV/Excel**:
- Check browser allows downloads
- Verify data loaded in preview

**PDF**:
- Check browser print functionality
- May need to allow pop-ups

**Email**:
- Currently shows confirmation only (server integration required for production)

## Browser Compatibility

Tested and supported:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Next Steps

### Production Deployment

1. **Sign Configuration**: Generate signature for production use
2. **Setup Hosting**: Use reliable CDN or server
3. **Enable Email**: Integrate with email service
4. **Add Custom Patterns**: Create organization-specific templates
5. **Security**: Configure `securityIds` for role-based access

### Customization

- **Add Data Sources**: Extend `dataSources` array in JavaScript
- **Custom Filters**: Add filter types in `renderFilters()`
- **Report Patterns**: Create new pattern templates
- **Styling**: Modify CSS to match branding

### Integration with Zenith Components

Currently using vanilla HTML/CSS/JS. To integrate Zenith design system:

1. Import Zenith component library
2. Replace form controls with Zenith equivalents:
   - `<select>` → Zenith Dropdown
   - `<input type="date">` → Zenith DatePicker
   - Tables → Zenith DataGrid
3. Update styling to use Zenith design tokens

## Support

**Documentation**: See `/docs` directory for detailed guides

**Issues**: Report bugs and feature requests to your support email

**Contributing**: See project README for development guidelines

## Advanced Configuration

### Custom Data Sources

Add custom API calls in JavaScript:

```javascript
{
    id: 'custom-query',
    name: 'Custom Query',
    icon: '🔍',
    description: 'Your custom data source',
    typeName: 'YourCustomType',
    filters: ['dateRange', 'groups']
}
```

### Saved Reports

Enable report configuration saving:

```javascript
// Save to MyGeotab Storage API
api.call('Set', {
    typeName: 'AddInData',
    entity: {
        addInId: 'reportBuilder',
        data: JSON.stringify(reportConfig)
    }
});
```

### Scheduled Reports

Requires backend service for cron-like execution. See Phase 2 roadmap.

---

**Version**: 0.1.0
**Last Updated**: 2026-02-13
**Maintainer**: Vincent Hofmann
