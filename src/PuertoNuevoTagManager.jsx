import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PUERTO_NUEVO_GTM_ID = "GTM-KV7WWX83";

export default function PuertoNuevoTagManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isPuertoNuevoPath =
      pathname === "/puertonuevo" || pathname.startsWith("/puertonuevo/");

    if (!isPuertoNuevoPath || document.getElementById("gtm-puertonuevo")) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${PUERTO_NUEVO_GTM_ID}`;
    script.id = "gtm-puertonuevo";
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
