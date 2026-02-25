/**
 * Dashboard Preview Component
 * Step 4: Preview dashboard with placeholder or live data
 */

import { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { StepNavigation } from '../common/StepNavigation';
import { GridLayout } from '../layout/GridLayout';
import { TwoColumnLayout } from '../layout/TwoColumnLayout';
import { SingleColumnLayout } from '../layout/SingleColumnLayout';
import { shouldUseMockData, setUseMockData } from '../../utils/mockData';

export function DashboardPreview() {
  const { state, dispatch } = useDashboardContext();
  const { selectedModules, selectedLayout, selectedRecipe } = state;
  const [useLiveData, setUseLiveData] = useState(!shouldUseMockData());
  const [dateRange, setDateRange] = useState('30d');
  const [groupFilter, setGroupFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState('5m');

  const handleToggleLiveData = (checked: boolean) => {
    setUseLiveData(checked);
    setUseMockData(!checked);
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const renderLayout = () => {
    const layoutProps = {
      modules: selectedModules,
      useLiveData
    };

    switch (selectedLayout) {
      case 'grid':
        return <GridLayout {...layoutProps} />;
      case 'two-column':
        return <TwoColumnLayout {...layoutProps} />;
      case 'single-column':
        return <SingleColumnLayout {...layoutProps} />;
      default:
        return <GridLayout {...layoutProps} />;
    }
  };

  return (
    <div className="dashboard-preview">
      <div className="dashboard-preview__header">
        <h2 className="dashboard-preview__title">Preview your dashboard</h2>
        <p className="dashboard-preview__subtitle">
          {selectedRecipe?.name || 'Custom Dashboard'}
        </p>
      </div>

      <div className="dashboard-preview__preview">
        <div className="dashboard-preview__toolbar">
          <div className="dashboard-preview__filters">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="dashboard-preview__filter"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom</option>
            </select>

            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="dashboard-preview__filter"
            >
              <option value="all">All groups</option>
              <option value="fleet1">Fleet 1</option>
              <option value="fleet2">Fleet 2</option>
            </select>
          </div>
        </div>

        <div className="dashboard-preview__content">
          {renderLayout()}
        </div>

        <div className="dashboard-preview__notice">
          {!useLiveData ? (
            <div className="dashboard-preview__warning">
              ⚠ Showing placeholder data for preview
            </div>
          ) : (
            <div className="dashboard-preview__info">
              ✓ Showing live data
            </div>
          )}
          <label className="dashboard-preview__checkbox">
            <input
              type="checkbox"
              checked={useLiveData}
              onChange={(e) => handleToggleLiveData(e.target.checked)}
            />
            <span>Show live data (this may take a moment)</span>
          </label>
        </div>
      </div>

      <div className="dashboard-preview__settings">
        <h3 className="dashboard-preview__settings-title">
          Global Settings (Optional)
        </h3>
        <div className="dashboard-preview__settings-grid">
          <div className="dashboard-preview__setting">
            <label>Default Date Range:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div className="dashboard-preview__setting">
            <label>Default Groups:</label>
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
              <option value="all">All groups</option>
            </select>
          </div>

          <div className="dashboard-preview__setting">
            <label>Auto-Refresh:</label>
            <select value={autoRefresh} onChange={(e) => setAutoRefresh(e.target.value)}>
              <option value="0">Manual only</option>
              <option value="5m">Every 5 minutes</option>
              <option value="15m">Every 15 minutes</option>
              <option value="30m">Every 30 minutes</option>
            </select>
          </div>

          <div className="dashboard-preview__setting">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Allow users to change date range</span>
            </label>
          </div>
        </div>
      </div>

      <StepNavigation
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Save"
        backLabel="Edit"
      />
    </div>
  );
}
