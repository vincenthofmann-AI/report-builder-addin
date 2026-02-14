// Register the Geotab Add-In lifecycle bridge FIRST — this must execute
// before MyGeotab checks for geotab.addin.reportBuilder on the window.
import "./services/addin-lifecycle";

import { ReportBuilder } from "./components/ReportBuilder";
import { GeotabProvider } from "./services/geotab-context";
import { Toaster } from "sonner";

export default function App() {
  return (
    <GeotabProvider>
      <ReportBuilder />
      <Toaster position="bottom-right" richColors />
    </GeotabProvider>
  );
}
