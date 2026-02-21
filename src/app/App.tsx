// Register the Geotab Add-In lifecycle bridge FIRST — this must execute
// before MyGeotab checks for geotab.addin.reportBuilder on the window.
import "./services/addin-lifecycle";

import { ReportBuilderV5 } from "./components/ReportBuilderV5";
import { GeotabProvider } from "./services/geotab-context";
import { ToastProvider } from "./services/ToastProvider";

export default function App() {
  return (
    <GeotabProvider>
      <ToastProvider>
        <ReportBuilderV5 />
      </ToastProvider>
    </GeotabProvider>
  );
}
