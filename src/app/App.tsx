// Register the Geotab Add-In lifecycle bridge FIRST — this must execute
// before MyGeotab checks for geotab.addin.reportBuilder on the window.
import "./services/addin-lifecycle";

import { ReportBuilder } from "./components/ReportBuilder";
import { MyGeotabChrome } from "./components/MyGeotabChrome";
import { GeotabProvider } from "./services/geotab-context";
import { ToastProvider } from "./services/ToastProvider";

export default function App() {
  return (
    <GeotabProvider>
      <ToastProvider>
        <MyGeotabChrome title="Fleet Reports">
          <ReportBuilder />
        </MyGeotabChrome>
      </ToastProvider>
    </GeotabProvider>
  );
}
