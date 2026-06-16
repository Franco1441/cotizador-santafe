import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Campi from "./campi";
import Rbgroup from "./rbgroup";
import Fallabrino from "./Fallabrino";
import TriveroPablo from "./triveropablo";
import Puertonuevo from "./puertonuevo";
import Fz from "./fz";
import Ferrari from "./Ferrari.jsx";
import CarlosSerovich from "./CarlosSerovich";
import Dellasanta from "./Dellasanta";
import SilvinaRojas from "./SilvinaRojas";
import PuertoNuevoTagManager from "./PuertoNuevoTagManager";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PuertoNuevoTagManager />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/campi" element={<Campi />} />
        <Route path="/rbgroup" element={<Rbgroup />} />
        <Route path="/triveropablo" element={<TriveroPablo />} />
        <Route path="/puertonuevo" element={<Puertonuevo />} />
        <Route path="/fallabrino" element={<Fallabrino />} />
        <Route path="/fz" element={<Fz />} />
        <Route path="/ferrari-assenza" element={<Ferrari />} />
        <Route path="/carlosserovich" element={<CarlosSerovich />} />
        <Route path="/dellasanta" element={<Dellasanta />} />
        <Route path="/silvinarojas" element={<SilvinaRojas />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
