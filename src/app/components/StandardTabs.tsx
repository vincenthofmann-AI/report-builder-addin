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
 *
 * ZENITH-ONLY: Uses @geotab/zenith Tabs component
 */

import { Home, FileText, Sparkles } from "lucide-react";
import { Tabs } from "../services/zenith-adapter";

export type TabId = "home" | "myReports" | "templates";

interface StandardTabsProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "myReports", label: "My Reports", icon: FileText },
  { id: "templates", label: "Templates", icon: Sparkles },
];

export function StandardTabs({ activeTab, onTabChange }: StandardTabsProps) {
  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={onTabChange}
    />
  );
}
