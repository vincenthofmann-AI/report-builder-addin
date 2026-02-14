/**
 * MyGeotab Report Builder Add-In
 * Version: 0.1.0
 *
 * A workflow-based report builder for MyGeotab
 */

// Namespace for the add-in
geotab.addin.reportBuilder = function() {
    'use strict';

    // State management
    let api;
    let state;
    let currentStep = 1;
    let reportConfig = {
        dataSource: null,
        filters: {
            dateRange: { preset: 'this-month' },
            groups: [],
            customFilters: []
        },
        pattern: null,
        data: null
    };

    // Data source definitions
    const dataSources = [
        {
            id: 'devices',
            name: 'Devices',
            icon: '🚗',
            description: 'Vehicle and asset information',
            typeName: 'Device',
            filters: ['groups', 'deviceType', 'status']
        },
        {
            id: 'trips',
            name: 'Trips',
            icon: '🛣️',
            description: 'Trip history and route data',
            typeName: 'Trip',
            filters: ['groups', 'device', 'dateRange']
        },
        {
            id: 'exceptions',
            name: 'Exceptions',
            icon: '⚠️',
            description: 'Alerts and exception events',
            typeName: 'ExceptionEvent',
            filters: ['groups', 'rule', 'severity', 'dateRange']
        },
        {
            id: 'fuel',
            name: 'Fuel Transactions',
            icon: '⛽',
            description: 'Fuel usage and transactions',
            typeName: 'FuelTransaction',
            filters: ['groups', 'device', 'dateRange']
        },
        {
            id: 'statusData',
            name: 'Status Data',
            icon: '📊',
            description: 'Diagnostic and sensor data',
            typeName: 'StatusData',
            filters: ['groups', 'device', 'diagnostic', 'dateRange']
        },
        {
            id: 'drivers',
            name: 'Drivers',
            icon: '👤',
            description: 'Driver information and assignments',
            typeName: 'User',
            filters: ['groups', 'isDriver']
        }
    ];

    /**
     * Initialize lifecycle - called once when page first loads
     */
    function initialize(freshApi, freshState, initializeCallback) {
        api = freshApi;
        state = freshState;

        // Setup event listeners
        setupEventListeners();

        // Render initial step
        renderDataSources();

        initializeCallback();
    }

    /**
     * Focus lifecycle - called when user navigates to page
     */
    function focus(freshApi, freshState) {
        api = freshApi;
        state = freshState;

        // Restore any saved state
        const savedState = state.getState();
        if (savedState && savedState.reportConfig) {
            reportConfig = savedState.reportConfig;
            restoreUIState();
        }
    }

    /**
     * Blur lifecycle - called when user navigates away
     */
    function blur(freshApi, freshState) {
        api = freshApi;
        state = freshState;

        // Save current state
        state.setState({ reportConfig: reportConfig });
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Step navigation
        document.getElementById('step1Next').addEventListener('click', () => navigateToStep(2));
        document.getElementById('step2Back').addEventListener('click', () => navigateToStep(1));
        document.getElementById('step2Next').addEventListener('click', () => navigateToStep(3));
        document.getElementById('step3Back').addEventListener('click', () => navigateToStep(2));
        document.getElementById('step3Next').addEventListener('click', () => navigateToStep(4));
        document.getElementById('step4Back').addEventListener('click', () => navigateToStep(3));
        document.getElementById('step4Restart').addEventListener('click', resetBuilder);

        // Date preset selector
        document.getElementById('datePreset').addEventListener('change', handleDatePresetChange);

        // Add filter button
        document.getElementById('addFilterBtn').addEventListener('click', addCustomFilter);

        // Export buttons
        document.getElementById('exportPdfBtn').addEventListener('click', () => exportReport('pdf'));
        document.getElementById('exportExcelBtn').addEventListener('click', () => exportReport('excel'));
        document.getElementById('exportCsvBtn').addEventListener('click', () => exportReport('csv'));
        document.getElementById('emailReportBtn').addEventListener('click', showEmailModal);

        // Email modal
        document.querySelector('.close').addEventListener('click', hideEmailModal);
        document.getElementById('cancelEmail').addEventListener('click', hideEmailModal);
        document.getElementById('emailForm').addEventListener('submit', handleEmailSubmit);
    }

    /**
     * Render data source cards
     */
    function renderDataSources() {
        const grid = document.getElementById('dataSourceGrid');
        grid.innerHTML = '';

        dataSources.forEach(source => {
            const card = document.createElement('div');
            card.className = 'data-source-card';
            card.dataset.sourceId = source.id;
            card.innerHTML = `
                <div class="data-source-icon">${source.icon}</div>
                <h3>${source.name}</h3>
                <p>${source.description}</p>
                <span class="data-source-badge">${source.typeName}</span>
            `;
            card.addEventListener('click', () => selectDataSource(source));
            grid.appendChild(card);
        });
    }

    /**
     * Select a data source
     */
    function selectDataSource(source) {
        reportConfig.dataSource = source;

        // Update UI
        document.querySelectorAll('.data-source-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-source-id="${source.id}"]`).classList.add('selected');

        // Enable next button
        document.getElementById('step1Next').disabled = false;
    }

    /**
     * Navigate to a specific step
     */
    function navigateToStep(stepNumber) {
        // Hide current step
        document.querySelectorAll('.rb-step').forEach(step => step.classList.remove('active'));
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active', 'completed'));

        // Show new step
        document.getElementById(`step${stepNumber}`).classList.add('active');
        document.querySelector(`[data-step="${stepNumber}"]`).classList.add('active');

        // Mark previous steps as completed
        for (let i = 1; i < stepNumber; i++) {
            document.querySelector(`[data-step="${i}"]`).classList.add('completed');
        }

        currentStep = stepNumber;

        // Handle step-specific logic
        if (stepNumber === 2) {
            renderFilters();
        } else if (stepNumber === 3) {
            setupPatternSelection();
        } else if (stepNumber === 4) {
            loadPreview();
        }
    }

    /**
     * Render filter options based on selected data source
     */
    function renderFilters() {
        const filtersList = document.getElementById('filtersList');
        filtersList.innerHTML = '';

        if (!reportConfig.dataSource) return;

        // Get available filters for this data source
        const availableFilters = reportConfig.dataSource.filters || [];

        // Render filter suggestions
        if (availableFilters.includes('groups')) {
            renderGroupFilter();
        }
    }

    /**
     * Render group filter
     */
    function renderGroupFilter() {
        const container = document.getElementById('groupFilter');
        container.innerHTML = '<div class="loading">Loading groups...</div>';

        // Fetch groups from MyGeotab API
        api.call('Get', {
            typeName: 'Group'
        }, function(groups) {
            container.innerHTML = `
                <select id="groupSelect" class="form-control" multiple size="6">
                    ${groups.map(group => `
                        <option value="${group.id}">${group.name}</option>
                    `).join('')}
                </select>
                <p style="margin-top: 8px; font-size: 12px; color: #657786;">
                    Hold Ctrl/Cmd to select multiple groups
                </p>
            `;

            document.getElementById('groupSelect').addEventListener('change', function(e) {
                const selected = Array.from(e.target.selectedOptions).map(opt => ({
                    id: opt.value,
                    name: opt.textContent
                }));
                reportConfig.filters.groups = selected;
            });
        }, function(error) {
            container.innerHTML = `<div class="error">Error loading groups: ${error.message}</div>`;
        });
    }

    /**
     * Handle date preset change
     */
    function handleDatePresetChange(e) {
        const preset = e.target.value;
        const customRange = document.getElementById('customDateRange');

        if (preset === 'custom') {
            customRange.style.display = 'block';
        } else {
            customRange.style.display = 'none';
            reportConfig.filters.dateRange = { preset: preset };
        }
    }

    /**
     * Add custom filter row
     */
    function addCustomFilter() {
        const filtersList = document.getElementById('filtersList');
        const filterId = `filter_${Date.now()}`;

        const filterRow = document.createElement('div');
        filterRow.className = 'filter-row';
        filterRow.id = filterId;
        filterRow.innerHTML = `
            <select class="form-control filter-field">
                <option value="">Select field...</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
                <option value="type">Type</option>
            </select>
            <select class="form-control filter-operator">
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="startsWith">Starts with</option>
            </select>
            <input type="text" class="form-control filter-value" placeholder="Value">
            <button class="btn btn-secondary" onclick="geotab.addin.reportBuilder.removeFilter('${filterId}')">Remove</button>
        `;

        filtersList.appendChild(filterRow);
    }

    /**
     * Remove custom filter
     */
    function removeFilter(filterId) {
        const filterRow = document.getElementById(filterId);
        if (filterRow) {
            filterRow.remove();
        }
    }

    /**
     * Setup pattern selection
     */
    function setupPatternSelection() {
        document.querySelectorAll('.pattern-card').forEach(card => {
            if (!card.querySelector('.pattern-badge').textContent.includes('Coming Soon')) {
                card.addEventListener('click', function() {
                    selectPattern(this.dataset.pattern);
                });
            }
        });
    }

    /**
     * Select a report pattern
     */
    function selectPattern(patternId) {
        reportConfig.pattern = patternId;

        // Update UI
        document.querySelectorAll('.pattern-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-pattern="${patternId}"]`).classList.add('selected');

        // Enable next button
        document.getElementById('step3Next').disabled = false;
    }

    /**
     * Load data preview
     */
    function loadPreview() {
        // Render summary
        renderReportSummary();

        // Load data
        const container = document.getElementById('dataPreviewContainer');
        container.innerHTML = '<div class="loading">Loading data...</div>';

        // Build API query
        const query = {
            typeName: reportConfig.dataSource.typeName
        };

        // Add date range if applicable
        if (reportConfig.filters.dateRange.preset !== 'all') {
            const dateRange = calculateDateRange(reportConfig.filters.dateRange.preset);
            query.fromDate = dateRange.from;
            query.toDate = dateRange.to;
        }

        // Fetch data
        api.call('Get', query, function(results) {
            reportConfig.data = results;
            renderDataPreview(results);
        }, function(error) {
            container.innerHTML = `<div class="error">Error loading data: ${error.message}</div>`;
        });
    }

    /**
     * Render report summary
     */
    function renderReportSummary() {
        const summary = document.getElementById('reportSummary');
        summary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Data Source:</span>
                <span class="summary-value">${reportConfig.dataSource.name}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Date Range:</span>
                <span class="summary-value">${reportConfig.filters.dateRange.preset}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Report Pattern:</span>
                <span class="summary-value">${formatPatternName(reportConfig.pattern)}</span>
            </div>
            ${reportConfig.filters.groups.length > 0 ? `
                <div class="summary-item">
                    <span class="summary-label">Groups:</span>
                    <span class="summary-value">${reportConfig.filters.groups.map(g => g.name).join(', ')}</span>
                </div>
            ` : ''}
        `;
    }

    /**
     * Render data preview table
     */
    function renderDataPreview(data) {
        const container = document.getElementById('dataPreviewContainer');

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">No data found for selected filters</div>';
            return;
        }

        // Simple table preview (limit to 10 rows)
        const preview = data.slice(0, 10);
        const keys = Object.keys(preview[0]).slice(0, 5); // Show first 5 columns

        let table = '<table style="width: 100%; border-collapse: collapse;">';
        table += '<thead><tr>';
        keys.forEach(key => {
            table += `<th style="padding: 8px; border: 1px solid #e1e8ed; background: #f5f7fa; text-align: left;">${key}</th>`;
        });
        table += '</tr></thead><tbody>';

        preview.forEach(row => {
            table += '<tr>';
            keys.forEach(key => {
                const value = row[key];
                const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
                table += `<td style="padding: 8px; border: 1px solid #e1e8ed;">${displayValue || '-'}</td>`;
            });
            table += '</tr>';
        });

        table += '</tbody></table>';
        table += `<p style="margin-top: 12px; color: #657786; font-size: 14px;">Showing ${preview.length} of ${data.length} records</p>`;

        container.innerHTML = table;
    }

    /**
     * Calculate date range from preset
     */
    function calculateDateRange(preset) {
        const now = new Date();
        let from, to = now;

        switch (preset) {
            case 'today':
                from = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'yesterday':
                from = new Date(now.setDate(now.getDate() - 1));
                from.setHours(0, 0, 0, 0);
                to = new Date(from);
                to.setHours(23, 59, 59, 999);
                break;
            case 'this-week':
                from = new Date(now.setDate(now.getDate() - now.getDay()));
                from.setHours(0, 0, 0, 0);
                break;
            case 'last-week':
                from = new Date(now.setDate(now.getDate() - now.getDay() - 7));
                from.setHours(0, 0, 0, 0);
                to = new Date(from);
                to.setDate(to.getDate() + 6);
                to.setHours(23, 59, 59, 999);
                break;
            case 'this-month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last-month':
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                to = new Date(now.getFullYear(), now.getMonth(), 0);
                to.setHours(23, 59, 59, 999);
                break;
            default:
                from = new Date(now.getFullYear(), 0, 1);
        }

        return {
            from: from.toISOString(),
            to: to.toISOString()
        };
    }

    /**
     * Format pattern name
     */
    function formatPatternName(patternId) {
        const names = {
            'fleet-summary': 'Fleet Summary Dashboard',
            'compliance': 'Compliance Report',
            'operational': 'Operational Efficiency',
            'data-table': 'Data Table'
        };
        return names[patternId] || patternId;
    }

    /**
     * Export report
     */
    function exportReport(format) {
        if (!reportConfig.data) {
            alert('No data to export');
            return;
        }

        switch (format) {
            case 'csv':
                exportToCsv();
                break;
            case 'excel':
                exportToExcel();
                break;
            case 'pdf':
                exportToPdf();
                break;
        }
    }

    /**
     * Export to CSV
     */
    function exportToCsv() {
        const data = reportConfig.data;
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csv += values.join(',') + '\n';
        });

        downloadFile(csv, `report_${Date.now()}.csv`, 'text/csv');
    }

    /**
     * Export to Excel (simplified - would need library for true Excel format)
     */
    function exportToExcel() {
        // For now, export as CSV with .xls extension
        // In production, use a library like SheetJS
        exportToCsv();
    }

    /**
     * Export to PDF
     */
    function exportToPdf() {
        // Use browser print dialog
        window.print();
    }

    /**
     * Download file helper
     */
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Show email modal
     */
    function showEmailModal() {
        document.getElementById('emailModal').style.display = 'flex';
    }

    /**
     * Hide email modal
     */
    function hideEmailModal() {
        document.getElementById('emailModal').style.display = 'none';
    }

    /**
     * Handle email form submission
     */
    function handleEmailSubmit(e) {
        e.preventDefault();

        const recipients = document.getElementById('emailRecipients').value;
        const subject = document.getElementById('emailSubject').value;
        const message = document.getElementById('emailMessage').value;
        const format = document.getElementById('emailFormat').value;

        // In production, this would call a server endpoint to send email
        // For now, just show confirmation
        alert(`Email would be sent to: ${recipients}\nSubject: ${subject}\nFormat: ${format}`);
        hideEmailModal();
    }

    /**
     * Reset builder to start
     */
    function resetBuilder() {
        reportConfig = {
            dataSource: null,
            filters: {
                dateRange: { preset: 'this-month' },
                groups: [],
                customFilters: []
            },
            pattern: null,
            data: null
        };

        navigateToStep(1);
        document.getElementById('step1Next').disabled = true;
        document.querySelectorAll('.data-source-card').forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.pattern-card').forEach(card => card.classList.remove('selected'));
    }

    /**
     * Restore UI state from saved config
     */
    function restoreUIState() {
        if (reportConfig.dataSource) {
            const card = document.querySelector(`[data-source-id="${reportConfig.dataSource.id}"]`);
            if (card) card.classList.add('selected');
            document.getElementById('step1Next').disabled = false;
        }
    }

    // Public API
    return {
        initialize: initialize,
        focus: focus,
        blur: blur,
        removeFilter: removeFilter // Expose for onclick handler
    };
}();
