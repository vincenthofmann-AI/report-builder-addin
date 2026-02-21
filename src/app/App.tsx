// Register the Geotab Add-In lifecycle bridge FIRST — this must execute
// before MyGeotab checks for geotab.addin.reportBuilder on the window.
import "./services/addin-lifecycle";

import { ReportBuilderV8 } from "./components/ReportBuilderV8";
import { GeotabProvider } from "./services/geotab-context";
import { FeedbackProvider } from "@geotab/zenith";

export default function App() {
  return (
    <GeotabProvider>
      <FeedbackProvider>
        <ReportBuilderV8 />
      </FeedbackProvider>
    </GeotabProvider>
  );
}
