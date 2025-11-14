import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Campi from "./campi";
import Rbgroup from "./rbgroup";
import TriveroPablo from "./triveropablo";
import Puertonuevo from "./puertonuevo";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/campi" element={<Campi />} />
        <Route path="/rbgroup" element={<Rbgroup />} />
        <Route path="/triveropablo" element={<TriveroPablo />} />
        <Route path="/puertonuevo" element={<Puertonuevo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
