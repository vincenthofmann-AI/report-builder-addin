
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  // Zenith design system styles
  import "@geotab/zenith/dist/index.css";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  