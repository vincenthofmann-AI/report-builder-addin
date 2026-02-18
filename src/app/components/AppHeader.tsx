/**
 * App Header Component
 * =====================
 *
 * MYG Playbook Requirement: App Header Zone
 * Provides search, global filters, and primary "Create" actions.
 *
 * Uses Zenith components:
 * - SearchInput for search bar
 * - Button with ButtonType.Primary for create action
 * - Button with ButtonType.Secondary for filters
 */

import { Plus, Sliders } from "lucide-react";
import { Button, ButtonType, SearchInput } from '../services/zenith-adapter';

interface AppHeaderProps {
  onCreateNew: () => void;
  searchEnabled?: boolean;
  filtersEnabled?: boolean;
}

export function AppHeader({
  onCreateNew,
  searchEnabled = true,
  filtersEnabled = false,
}: AppHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 24px', height: '56px', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
      {/* Search Bar (Left) */}
      {searchEnabled && (
        <div style={{ flex: '1', maxWidth: '400px' }}>
          <SearchInput
            placeholder="Search reports..."
            value=""
            onChange={() => {}}
          />
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: '1' }} />

      {/* Global Filters (Optional) */}
      {filtersEnabled && (
        <Button type={ButtonType.Secondary}>
          <Sliders style={{ width: '16px', height: '16px' }} />
          Filters
        </Button>
      )}

      {/* Primary Create Action */}
      <Button type={ButtonType.Primary} onClick={onCreateNew}>
        <Plus style={{ width: '16px', height: '16px' }} />
        Create Report
      </Button>
    </div>
  );
}
