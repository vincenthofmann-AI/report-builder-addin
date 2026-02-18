/**
 * Standard Tabs (Pattern A: Horizontal Tabs)
 * ============================================
 *
 * MYG Playbook: Pattern A - Default for apps with 2-6 primary views
 *
 * Behavior: Persistent tabs anchored to top of canvas below App Header
 * Best For: Apps where users frequently toggle between distinct but related views
 *
 * Rules:
 * - Tabs must be labeled with clear, concise nouns
 * - Icons are optional but must be used consistently
 * - Maximum 6 tabs to prevent crowding
 */

import { Home, FileText, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export type TabId = "home" | "myReports" | "templates";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

interface StandardTabsProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const tabs: Tab[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "myReports", label: "My Reports", icon: FileText },
  { id: "templates", label: "Templates", icon: Sparkles },
];

export function StandardTabs({ activeTab, onTabChange }: StandardTabsProps) {
  return (
    <div className="bg-white border-b border-[#e2e8f0]">
      <div className="flex items-center gap-1 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-4 py-3 flex items-center gap-2 transition-colors"
            >
              <tab.icon
                className={`w-4 h-4 ${
                  isActive ? "text-[#003a63]" : "text-[#94a3b8]"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-[#003a63]" : "text-[#64748b]"
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003a63]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
