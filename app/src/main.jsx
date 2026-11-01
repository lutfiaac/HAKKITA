import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import "./revision.css";
import "./homepage.css";
import "./program-catalog.css";
import "./program-detail.css";
import "./auth.css";
import "./profile.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
