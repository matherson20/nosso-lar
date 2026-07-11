import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./lib/useAuth.jsx";
import { DataProvider } from "./lib/useData.jsx";
import "./styles.css";

// HashRouter: funciona em GitHub Pages sem configuracao de servidor.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
