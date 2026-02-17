/**
 * App Home (Landing State)
 * ==========================
 *
 * MYG Playbook Requirement: Every app must have a default landing state
 * that provides immediate situational awareness.
 *
 * The Three Questions:
 * 1. Where am I? → Report Builder
 * 2. What requires attention? → Recent reports, unfinished drafts
 * 3. Where do I go next? → Quick actions (New, Browse, Templates)
 */

import { motion } from "motion/react";
import {
  FileText,
  Plus,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { InsightCategory } from "../../services/report-templates";

interface AppHomeProps {
  onCreateNew: () => void;
  onBrowseTemplates: () => void;
  onSelectCategory: (category: InsightCategory) => void;
}

export function AppHome({
  onCreateNew,
  onBrowseTemplates,
  onSelectCategory,
}: AppHomeProps) {
  // Mock data - replace with real saved reports
  const recentReports = [
    { id: "1", name: "Fleet Safety Scorecard", lastModified: "2 hours ago", category: "safety-compliance" },
    { id: "2", name: "Idling Violations Q1", lastModified: "Yesterday", category: "cost-savings" },
    { id: "3", name: "Maintenance Overview", lastModified: "3 days ago", category: "fleet-health" },
  ];

  const quickStats = [
    { label: "Total Reports", value: "12", icon: FileText, trend: "+3 this month" },
    { label: "Templates Used", value: "5", icon: Sparkles, trend: "Most popular" },
    { label: "Scheduled", value: "4", icon: Clock, trend: "Auto-delivery" },
  ];

  const quickActions = [
    {
      title: "Create New Report",
      description: "Start from scratch with full control",
      icon: Plus,
      color: "bg-[#003a63]",
      hoverColor: "hover:bg-[#002d4e]",
      action: onCreateNew,
    },
    {
      title: "Browse Templates",
      description: "Pre-configured reports from top fleets",
      icon: BarChart3,
      color: "bg-[#78be20]",
      hoverColor: "hover:bg-[#6aab1a]",
      action: onBrowseTemplates,
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-[#f8fafc] p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header - Answers "Where am I?" */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold text-[#0f172a] mb-1">
              Report Builder
            </h1>
            <p className="text-sm text-[#64748b]">
              Create, manage, and schedule fleet reports
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            {quickStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-lg px-4 py-3 border border-[#e2e8f0] min-w-[140px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-[#64748b]" />
                  <span className="text-xs text-[#94a3b8] uppercase tracking-wide font-medium">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-[#0f172a]">{stat.value}</p>
                <p className="text-xs text-[#78be20] mt-0.5">{stat.trend}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions - Answers "Where do I go next?" */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className={`${action.color} ${action.hoverColor} text-white rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group`}
            >
              <div className="flex items-start justify-between mb-3">
                <action.icon className="w-8 h-8" />
                <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
              <p className="text-sm text-white/80">{action.description}</p>
            </button>
          ))}
        </motion.div>

        {/* Recent Reports - Answers "What requires attention?" */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#0f172a]">Recent Reports</h2>
            <button className="text-sm text-[#003a63] hover:text-[#002d4e] font-medium">
              View all →
            </button>
          </div>

          <div className="bg-white rounded-lg border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
            {recentReports.map((report, i) => (
              <motion.button
                key={report.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors text-left group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#64748b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0f172a] truncate">
                      {report.name}
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Modified {report.lastModified}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#003a63] group-hover:translate-x-1 transition-all shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Popular Categories - Quick nav to templates */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-base font-semibold text-[#0f172a] mb-3">
            Popular Report Categories
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "safety-compliance", label: "Safety & Compliance", icon: Users, color: "text-red-600" },
              { id: "cost-savings", label: "Cost Savings", icon: TrendingUp, color: "text-green-600" },
              { id: "fleet-health", label: "Fleet Health", icon: Zap, color: "text-blue-600" },
            ].map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => onSelectCategory(cat.id as InsightCategory)}
                className="bg-white rounded-lg border border-[#e2e8f0] p-4 hover:border-[#003a63]/30 hover:shadow-md transition-all text-left group"
              >
                <cat.icon className={`w-6 h-6 ${cat.color} mb-2`} />
                <p className="text-sm font-medium text-[#0f172a] group-hover:text-[#003a63]">
                  {cat.label}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
