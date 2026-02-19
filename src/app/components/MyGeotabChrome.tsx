/**
 * MyGeotab Chrome Component
 * ==========================
 *
 * Full MyGeotab add-in chrome structure with:
 * - Geotab-branded header
 * - Collapsible left sidebar navigation
 * - Main content area
 * - Geotab color scheme and styling
 *
 * This chrome wraps the Report Builder to provide the standard
 * MyGeotab add-in experience.
 */

import { useState } from "react";
import { Menu, X, BarChart3, Home, Settings, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MyGeotabChromeProps {
  children: React.ReactNode;
  title?: string;
}

export function MyGeotabChrome({ children, title = "Reports" }: MyGeotabChromeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("reports");

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-[280px] bg-[#003a63] text-white flex-shrink-0 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
              <img
                src="/logo-expanded.png"
                alt="Geotab"
                className="h-8"
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-[#78be20] text-white shadow-lg"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[14px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="text-[12px] text-white/40">
                <p>MyGeotab Add-In</p>
                <p className="mt-1">v1.0.0</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center px-6 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {/* Sidebar Toggle */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-[#f0f4f8] transition-colors"
              >
                <Menu className="w-5 h-5 text-[#003a63]" />
              </button>
            )}

            {/* Collapsed Logo (when sidebar is closed) */}
            {!sidebarOpen && (
              <img
                src="/logo-collapsed.png"
                alt="Geotab"
                className="h-8"
              />
            )}

            {/* Page Title */}
            <h1 className="text-[18px] text-[#003a63] font-semibold">
              {title}
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <div className="text-[12px] text-[#64748b]">
              <p>Connected to MyGeotab</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
