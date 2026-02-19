// Register the Geotab Add-In lifecycle bridge FIRST — this must execute
// before MyGeotab checks for geotab.addin.reportBuilder on the window.
import "./services/addin-lifecycle";

import { useState } from "react";
import { ReportBuilder } from "./components/ReportBuilder";
import { FleetMap } from "./components/FleetMap";
import { MyGeotabChrome } from "./components/MyGeotabChrome";
import { GeotabProvider } from "./services/geotab-context";
import { ToastProvider } from "./services/ToastProvider";

type ViewType = "home" | "map" | "reports" | "settings" | "help";

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>("reports");

  // Map view names to titles
  const viewTitles: Record<ViewType, string> = {
    home: "Home",
    map: "Fleet Map",
    reports: "Fleet Reports",
    settings: "Settings",
    help: "Help",
  };

  return (
    <GeotabProvider>
      <ToastProvider>
        <MyGeotabChrome
          title={viewTitles[activeView]}
          activeView={activeView}
          onViewChange={setActiveView}
        >
          {activeView === "map" && <FleetMap />}
          {activeView === "reports" && <ReportBuilder />}
          {activeView === "home" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#64748b]">Home view coming soon</p>
            </div>
          )}
          {activeView === "settings" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#64748b]">Settings view coming soon</p>
            </div>
          )}
          {activeView === "help" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#64748b]">Help view coming soon</p>
            </div>
          )}
        </MyGeotabChrome>
      </ToastProvider>
    </GeotabProvider>
  );
}
