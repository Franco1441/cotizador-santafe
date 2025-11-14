function formatNumber(value) {
  // Convierte 175220.649 → "175.220,64"
  return value
    .toFixed(2)                 // 2 decimales
    .replace(".", ",")          // cambia el punto decimal por coma
    .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // separador miles en "."
}

export function calcularRetiro({ aporteMensual, edadActual, sexo, moneda, edadRetiro }) {
  // --- Normalización sexo ---
  let s = (sexo + "").trim().toLowerCase();
  if (s === "f" || s === "femenino") s = "F";
  else s = "M";

  // --- Normalización moneda ---
  let m = (moneda + "").trim().toUpperCase() === "USD" ? "USD" : "ARS";

  // --- Límites ---
  const edadMinima = 18;
  const edadMaximaContratacion = 64;
  const edadMaximaRetiro = 80;

  edadActual = Math.max(edadMinima, Math.min(edadActual, edadMaximaContratacion));

  if (!edadRetiro) edadRetiro = (s === "F") ? 60 : 65;
  edadRetiro = Math.min(edadRetiro, edadMaximaRetiro);

  if (edadRetiro <= edadActual) {
    return {
      FV_total: "0,00",
      rentaMensual: "0,00"
    };
  }

  // --- Parámetros del Excel ---
  const cargosAdministrativos = 0.10;
  const tasaAnual_USD = 0.04;
  const tasaAnual_ARS = 0.18;
  const divisorPrimaTarifa = 1.006;

  const premio = aporteMensual;

  const primaTarifaMensual = premio / divisorPrimaTarifa;
  const primaPuraMensual = primaTarifaMensual * (1 - cargosAdministrativos);

  const tasaAnual = m === "USD" ? tasaAnual_USD : tasaAnual_ARS;
  const tasaMensual = Math.pow(1 + tasaAnual, 1 / 12) - 1;

  const mesesHastaRetiro = 12 * (edadRetiro - edadActual);

  const i = tasaMensual;
  const n = mesesHastaRetiro;

  let factorFV;
  if (Math.abs(i) < 1e-12) factorFV = n;
  else {
    factorFV =
      Math.pow(1 + i, n) *
      (1 - Math.pow(1 + i, -n)) /
      (1 - Math.pow(1 + i, -1));
  }

  const FV_total = factorFV * primaPuraMensual;

  const factoresRenta = {
    "F-USD": 274.012872158694,
    "F-ARS": 188.958970551237,
    "M-USD": 200.555902482334,
    "M-ARS": 149.781885986579
  };

  const factorRenta = factoresRenta[`${s}-${m}`];
  const rentaMensual = FV_total / factorRenta;

  // --- Devolver formateados ---
  return {
    FV_total: formatNumber(FV_total),
    rentaMensual: formatNumber(rentaMensual),

    // Y también devolvemos valores sin formatear por si los necesitás
    FV_total_raw: FV_total,
    rentaMensual_raw: rentaMensual,
  };
}
