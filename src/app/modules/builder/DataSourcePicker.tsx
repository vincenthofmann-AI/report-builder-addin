/**
 * Data Source Picker - Step 1
 * ===========================
 *
 * Allows users to choose from available data sources.
 * Organizes sources by category with search functionality.
 */

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Search, Check, MapPin, Fuel, Shield, Wrench, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { SearchInput } from "../../services/zenith-adapter";
import { dataSources, type DataSourceDef } from "../../services/geotab-mock";

interface DataSourcePickerProps {
  selectedDataSource: string | null;
  onSelectDataSource: (dataSourceId: string) => void;
}

// Category grouping
const categories = {
  activity: {
    name: "Activity",
    sources: ["trips"],
  },
  events: {
    name: "Events",
    sources: ["behavior", "faults", "fuel", "maintenance"],
  },
};

const iconMap: Record<string, any> = {
  MapPin,
  Fuel,
  Shield,
  Wrench,
  AlertTriangle,
};

export function DataSourcePicker({
  selectedDataSource,
  onSelectDataSource,
}: DataSourcePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["activity", "events"]);

  // Filter data sources by search query
  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return dataSources;

    const query = searchQuery.toLowerCase();
    return dataSources.filter((source) => {
      const searchText = [
        source.name,
        source.description,
      ].join(" ").toLowerCase();

      return searchText.includes(query);
    });
  }, [searchQuery]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
      <div className="mb-6">
        <h2 className="text-[20px] text-[#003a63] mb-2" style={{ fontWeight: 600 }}>
          Choose Data Source
        </h2>
        <p className="text-[14px] text-[#64748b] mb-4">
          Select the data you want to include in your custom report
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search data sources..."
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Data Sources by Category */}
      <div className="space-y-6">
        {Object.entries(categories).map(([categoryId, categoryDef]) => {
          const categorySources = filteredSources.filter((source) =>
            categoryDef.sources.includes(source.id)
          );

          if (categorySources.length === 0 && searchQuery.trim()) {
            return null; // Hide empty categories when searching
          }

          const isExpanded = expandedCategories.includes(categoryId);

          return (
            <div key={categoryId}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="flex items-center justify-between w-full mb-3 text-left group"
              >
                <h3 className="text-[16px] text-[#1e293b]" style={{ fontWeight: 600 }}>
                  {categoryDef.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#94a3b8]">
                    {categorySources.length} source{categorySources.length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#94a3b8] transition-transform group-hover:text-[#003a63]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#94a3b8] transition-transform group-hover:text-[#003a63]" />
                  )}
                </div>
              </button>

              {/* Data Source Cards */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorySources.map((source) => {
                    const isSelected = selectedDataSource === source.id;
                    const Icon = iconMap[source.icon] || MapPin;

                    return (
                      <motion.button
                        key={source.id}
                        onClick={() => onSelectDataSource(source.id)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all flex gap-4
                          ${
                            isSelected
                              ? "border-[#003a63] bg-[#003a63]/[0.04] shadow-md"
                              : "border-[#e2e8f0] bg-white hover:border-[#003a63]/30 hover:shadow-sm"
                          }
                        `}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Radio Circle */}
                        <div
                          className={`
                            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1
                            ${
                              isSelected
                                ? "border-[#78be20] bg-[#78be20]"
                                : "border-[#cbd5e1] bg-white"
                            }
                          `}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Icon + Name */}
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-[#003a63] flex-shrink-0" />
                            <h4 className="text-[15px] text-[#1e293b] font-semibold truncate">
                              {source.name}
                            </h4>
                          </div>

                          {/* Description */}
                          <p className="text-[13px] text-[#64748b] leading-relaxed mb-3">
                            {source.description}
                          </p>

                          {/* Column Count */}
                          <div className="flex items-center gap-2 text-[12px] text-[#94a3b8]">
                            <span>{source.columns.length} columns</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredSources.length === 0 && searchQuery.trim() && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
          <p className="text-[15px] text-[#64748b]">
            No data sources match "{searchQuery}"
          </p>
          <p className="text-[13px] text-[#94a3b8] mt-2">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}
