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
 */

import { Search, Plus, Filter, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
    <div className="bg-white border-b border-[#e2e8f0] shrink-0">
      <div className="h-14 px-4 lg:px-6 flex items-center gap-4">
        {/* Search Bar (Left) */}
        {searchEnabled && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003a63]/20 focus:border-[#003a63] transition-all"
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Global Filters (Optional) */}
        <AnimatePresence>
          {filtersEnabled && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>Filters</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Primary Create Action */}
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#003a63] hover:bg-[#002d4e] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Report</span>
        </button>
      </div>
    </div>
  );
}
