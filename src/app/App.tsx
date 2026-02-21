// Register the Geotab Add-In lifecycle bridge FIRST — this must execute
// before MyGeotab checks for geotab.addin.reportBuilder on the window.
import "./services/addin-lifecycle";

import { ReportBuilderV9 } from "./components/ReportBuilderV9";
import { GeotabProvider } from "./services/geotab-context";
import { FeedbackProvider } from "@geotab/zenith";

export default function App() {
  return (
    <GeotabProvider>
      <FeedbackProvider>
        <ReportBuilderV9 />
      </FeedbackProvider>
    </GeotabProvider>
  );
}
