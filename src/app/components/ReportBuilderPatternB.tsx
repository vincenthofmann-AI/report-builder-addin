/**
 * Report Builder (MYG Pattern B: Collection)
 * ============================================
 *
 * MYG Playbook Compliance:
 * - App Header: Search, filters, Create button (persistent)
 * - Standard Tabs: Home, My Reports, Templates (Pattern A)
 * - Pattern B Sidebar: Saved reports list (Collection)
 * - Canvas: Report display (Report State visual treatment)
 */

import { useState } from "react";
import type { InsightCategory } from "../services/report-templates";
import { AppHome } from "../modules/home";
import { SavedReportsList } from "../modules/configuration";
import { AppHeader } from "./AppHeader";
import { StandardTabs, type TabId } from "./StandardTabs";
import { motion, AnimatePresence } from "motion/react";

export function ReportBuilderPatternB() {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<TabId>("home");

  // Pattern B: Selected report from sidebar
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Home module state
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | null>(null);

  // Handlers
  const handleCreateNew = () => {
    setActiveTab("templates");
  };

  const handleBrowseTemplates = () => {
    setActiveTab("templates");
  };

  const handleSelectCategory = (category: InsightCategory) => {
    setSelectedCategory(category);
    setActiveTab("templates");
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {/* App Header - MYG Required Zone */}
      <AppHeader
        onCreateNew={handleCreateNew}
        searchEnabled={activeTab !== "home"}
        filtersEnabled={activeTab === "myReports"}
      />

      {/* Standard Tabs - Pattern A Navigation */}
      <StandardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Layout - Pattern B when on My Reports tab */}
      <div className="flex flex-1 overflow-hidden">
        {/* Pattern B: Collection Sidebar (only on My Reports tab) */}
        <AnimatePresence>
          {activeTab === "myReports" && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="w-[280px] h-full">
                <SavedReportsList
                  selectedReportId={selectedReportId}
                  onSelectReport={handleSelectReport}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Canvas - Primary content area */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AppHome
                  onCreateNew={handleCreateNew}
                  onBrowseTemplates={handleBrowseTemplates}
                  onSelectCategory={handleSelectCategory}
                />
              </motion.div>
            )}

            {activeTab === "myReports" && (
              <motion.div
                key="myReports"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                {selectedReportId ? (
                  <div>
                    <h2 className="text-xl font-semibold text-[#0f172a] mb-4">
                      Report: {selectedReportId}
                    </h2>
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
                      <p className="text-sm text-[#64748b]">
                        Report content will load here from saved configuration.
                      </p>
                      {/* Future: <ReportCanvas reportId={selectedReportId} /> */}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-sm text-[#94a3b8]">
                        Select a report from the sidebar to view
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "templates" && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <h2 className="text-xl font-semibold text-[#0f172a] mb-4">
                  Browse Templates
                </h2>
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
                  <p className="text-sm text-[#64748b]">
                    Template gallery will load here.
                  </p>
                  {/* Future: <TemplateGallery category={selectedCategory} /> */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
