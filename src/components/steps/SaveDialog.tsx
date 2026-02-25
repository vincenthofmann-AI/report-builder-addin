/**
 * Save Dialog Component
 * Step 5: Save dashboard with name, description, and sharing settings
 */

import { useState } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { useAddInContext } from '../../context/AddInContext';
import { validateDashboardName } from '../../utils/validation';
import dashboardService from '../../services/dashboardService';
import { LoadingState } from '../common/LoadingState';

export function SaveDialog() {
  const { state } = useDashboardContext();
  const { credentials } = useAddInContext();
  const { selectedRecipe, selectedModules, selectedLayout } = state;

  const [name, setName] = useState(selectedRecipe?.name || '');
  const [description, setDescription] = useState(selectedRecipe?.description || '');
  const [isShared, setIsShared] = useState(false);
  const [shareOption, setShareOption] = useState<'private' | 'team' | 'custom'>('private');
  const [addToMenu, setAddToMenu] = useState(true);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validation = validateDashboardName(name);

  const handleSave = async () => {
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Create dashboard configuration
      const config = dashboardService.createFromRecipe(
        selectedRecipe!,
        selectedModules,
        selectedLayout,
        credentials.userName
      );

      // Update with user inputs
      config.name = name;
      config.description = description;
      config.isShared = isShared;

      // Save dashboard
      const dashboardId = await dashboardService.saveDashboard(null, config);

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        // TODO: Navigate to dashboard
        console.log('Navigate to dashboard:', dashboardId);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure? Your changes will be lost.')) {
      // TODO: Return to recipe picker or close add-in
      console.log('Cancelled');
    }
  };

  if (isSaving) {
    return <LoadingState message="Saving your dashboard..." />;
  }

  if (success) {
    return (
      <div className="save-dialog__success">
        <div className="save-dialog__success-icon">✓</div>
        <h2 className="save-dialog__success-title">
          Dashboard created successfully!
        </h2>
        <p className="save-dialog__success-message">
          Your {name} is ready to use
        </p>
        <div className="save-dialog__success-actions">
          <button className="save-dialog__button save-dialog__button--primary">
            View Dashboard
          </button>
          <button className="save-dialog__button">
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="save-dialog">
      <div className="save-dialog__header">
        <h2 className="save-dialog__title">Save Dashboard</h2>
        <p className="save-dialog__subtitle">Give your dashboard a name</p>
      </div>

      <div className="save-dialog__form">
        <div className="save-dialog__field">
          <label htmlFor="name" className="save-dialog__label">
            Dashboard Name *
          </label>
          <input
            id="name"
            type="text"
            className={`save-dialog__input ${error ? 'save-dialog__input--error' : ''}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="e.g., Safety Scorecard - Fleet Operations"
            maxLength={50}
          />
          {error && <div className="save-dialog__error">{error}</div>}
          <div className="save-dialog__hint">
            {name.length}/50 characters
          </div>
        </div>

        <div className="save-dialog__field">
          <label htmlFor="description" className="save-dialog__label">
            Description (optional)
          </label>
          <textarea
            id="description"
            className="save-dialog__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this dashboard tracks..."
            rows={3}
            maxLength={200}
          />
          <div className="save-dialog__hint">
            {description.length}/200 characters
          </div>
        </div>

        <div className="save-dialog__field">
          <label className="save-dialog__label">Sharing & Visibility</label>
          <div className="save-dialog__options">
            <label className="save-dialog__radio">
              <input
                type="radio"
                name="sharing"
                value="private"
                checked={shareOption === 'private'}
                onChange={() => {
                  setShareOption('private');
                  setIsShared(false);
                }}
              />
              <span>Private (only me)</span>
            </label>
            <label className="save-dialog__radio">
              <input
                type="radio"
                name="sharing"
                value="team"
                checked={shareOption === 'team'}
                onChange={() => {
                  setShareOption('team');
                  setIsShared(true);
                }}
              />
              <span>Shared with my team</span>
            </label>
            <label className="save-dialog__radio">
              <input
                type="radio"
                name="sharing"
                value="custom"
                checked={shareOption === 'custom'}
                onChange={() => {
                  setShareOption('custom');
                  setIsShared(true);
                }}
              />
              <span>Shared with specific users/groups</span>
            </label>
          </div>
        </div>

        <div className="save-dialog__field">
          <label className="save-dialog__label">Menu Settings</label>
          <div className="save-dialog__checkboxes">
            <label className="save-dialog__checkbox">
              <input
                type="checkbox"
                checked={addToMenu}
                onChange={(e) => setAddToMenu(e.target.checked)}
              />
              <span>Add to MyGeotab navigation menu</span>
            </label>
            {addToMenu && (
              <div className="save-dialog__indent">
                <label htmlFor="menu-location">Location:</label>
                <select id="menu-location" className="save-dialog__select">
                  <option value="dashboards">Dashboards</option>
                  <option value="reports">Reports</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}
            <label className="save-dialog__checkbox">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
              />
              <span>Set as my default dashboard</span>
            </label>
            {setAsDefault && (
              <div className="save-dialog__hint">
                Opens automatically when you launch MyGeotab
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="save-dialog__actions">
        <button
          className="save-dialog__button"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="save-dialog__button save-dialog__button--primary"
          onClick={handleSave}
          disabled={!validation.isValid}
        >
          Save & Open
        </button>
      </div>
    </div>
  );
}
