import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import "./revision.css";
import "./homepage.css";
import "./program-catalog.css";
import "./program-detail.css";
import "./service-detail.css";
import "./auth.css";
import "./profile.css";
import "./service-catalog.css";
import "./menu-layout.css";
import "./plans.css";
import "./program-finder.css";
import "./assistant.css";
import "./admin.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
