/**
 * Standard Tabs (Pattern A: Horizontal Tabs)
 * ============================================
 *
 * MYG Playbook: Pattern A - Default for apps with 2-6 primary views
 *
 * Behavior: Persistent tabs anchored to top of canvas below App Header
 * Best For: Apps where users frequently toggle between distinct but related views
 *
 * Uses Zenith Tabs component with correct API:
 * - tabs: Array<{ id: string, label: string }>
 * - activeTabId: string (NOT activeTab)
 * - onTabChange: (id: string) => void
 */

import { Tabs } from '../services/zenith-adapter';

export type TabId = "home" | "myReports" | "templates";

interface StandardTabsProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const tabs = [
  { id: "home", label: "Home" },
  { id: "myReports", label: "My Reports" },
  { id: "templates", label: "Templates" },
];

export function StandardTabs({ activeTab, onTabChange }: StandardTabsProps) {
  return (
    <Tabs
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={onTabChange}
    />
  );
}
