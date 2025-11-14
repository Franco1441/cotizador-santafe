export function calcularRetiro({ aporteMensual, edadActual, sexo, moneda, edadRetiro }) {
  // --- Normalización de sexo ---
  let s = (sexo + "").trim().toLowerCase();
  if (s === "f" || s === "femenino") s = "F";
  else s = "M";

  // --- Normalización de moneda ---
  let m = (moneda + "").trim().toUpperCase() === "USD" ? "USD" : "ARS";

  // --- Límites ---
  const edadMinima = 18;
  const edadMaximaContratacion = 64;
  const edadMaximaRetiro = 80;

  edadActual = Math.max(edadMinima, Math.min(edadActual, edadMaximaContratacion));

  // Edad de retiro por defecto según sexo, igual al Excel:
  if (!edadRetiro) edadRetiro = (s === "F") ? 60 : 65;

  edadRetiro = Math.min(edadRetiro, edadMaximaRetiro);

  if (edadRetiro <= edadActual) {
    return {
      FV_total: 0,
      rentaMensual: 0,
      factorRenta: 0,
      aporteNeto: 0,
      primaTarifaMensual: 0,
      tasaMensual: 0,
      mesesHastaRetiro: 0,
      factorFV: 0
    };
  }

  // --- Parámetros fijos (tomados del Excel) ---
  const cargosAdministrativos = 0.10; 
  const tasaAnual_USD = 0.04;
  const tasaAnual_ARS = 0.18;
  const divisorPrimaTarifa = 1.006;

  // --- Cálculos principales ---
  const premio = aporteMensual;

  const primaTarifaMensual = premio / divisorPrimaTarifa;
  const primaPuraMensual = primaTarifaMensual * (1 - cargosAdministrativos);

  const tasaAnual = m === "USD" ? tasaAnual_USD : tasaAnual_ARS;
  const tasaMensual = Math.pow(1 + tasaAnual, 1 / 12) - 1;

  const mesesHastaRetiro = 12 * (edadRetiro - edadActual);

  const i = tasaMensual;
  const n = mesesHastaRetiro;

  let factorFV;
  if (Math.abs(i) < 1e-12) {
    factorFV = n;
  } else {
    factorFV =
      Math.pow(1 + i, n) *
      (1 - Math.pow(1 + i, -n)) /
      (1 - Math.pow(1 + i, -1));
  }

  const FV_total = factorFV * primaPuraMensual;

  // --- Factores de renta del Excel ---
  const factoresRenta = {
    "F-USD": 274.012872158694,
    "F-ARS": 188.958970551237,
    "M-USD": 200.555902482334,
    "M-ARS": 149.781885986579
  };

  const factorRenta = factoresRenta[`${s}-${m}`];

  const rentaMensual = FV_total / factorRenta;

  return {
    FV_total,
    rentaMensual,
    factorRenta,
    aporteNeto: primaPuraMensual,
    primaTarifaMensual,
    tasaMensual,
    mesesHastaRetiro,
    factorFV
  };
}
