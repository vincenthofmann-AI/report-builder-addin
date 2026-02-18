/**
 * App Header Component
 * =====================
 *
 * MYG Playbook Requirement: App Header Zone
 * Provides search, global filters, and primary "Create" actions.
 *
 * Rules:
 * - Stability: Controls must remain in persistent location for muscle memory
 * - Universal Actions: Search and filters accessible regardless of app state
 * - Primary Action: "Create" button for starting new reports
 *
 * ZENITH-ONLY: Uses @geotab/zenith SearchInput and Button components
 */

import { Plus, Sliders } from "lucide-react";
import { SearchInput, Button } from "../services/zenith-adapter";

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
    <div style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      flexShrink: 0,
      height: '56px',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      {/* Search Bar (Left) */}
      {searchEnabled && (
        <div style={{ flex: 1, maxWidth: '448px' }}>
          <SearchInput
            placeholder="Search reports..."
            onChange={(e) => {
              // Search handler will be implemented
            }}
          />
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Global Filters (Optional) */}
      {filtersEnabled && (
        <Button
          variant="secondary"
          size="medium"
          icon={<Sliders />}
        >
          Filters
        </Button>
      )}

      {/* Primary Create Action */}
      <Button
        variant="primary"
        size="medium"
        icon={<Plus />}
        onClick={onCreateNew}
      >
        Create Report
      </Button>
    </div>
  );
}
