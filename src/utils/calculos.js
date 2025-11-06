export function calcularRetiro({ aporteMensual, edadActual, sexo, moneda, edadRetiro }) {
  const edadMinima = 18;
  const edadMaximaContratacion = 64; // igual para ambos
  const edadMaximaRetiro = 80;       // nuevo límite

  // --- Validaciones básicas ---
  if (!edadRetiro) edadRetiro = edadMaximaRetiro;
  if (edadActual < edadMinima) edadActual = edadMinima;
  if (edadActual > edadMaximaContratacion) edadActual = edadMaximaContratacion;
  if (edadRetiro > edadMaximaRetiro) edadRetiro = edadMaximaRetiro;
  if (edadRetiro <= edadActual) return { FV_total: 0, rentaMensual: 0, factorRenta: 0 };

  // --- CÁLCULOS ---
  const plazoAnios = edadRetiro - edadActual;
  let tasaAnual;

  // Tasas diferenciadas por sexo, moneda y plazo
  if (moneda === "ARS") {
    if (sexo === "femenino") {
      if (plazoAnios > 35) {
        tasaAnual = 0.1758;
      } else if (plazoAnios > 15) {
        tasaAnual = 0.1751;
      } else {
        tasaAnual = 0.1602;
      }
    } else {
      if (plazoAnios > 40) {
        tasaAnual = 0.1770;
      } else if (plazoAnios > 15) {
        tasaAnual = 0.17477;
      } else {
        tasaAnual = 0.1602;
      }
    }
  } else {
    tasaAnual = sexo === "femenino" ? 0.0355 : 0.027;
  }

  const tasaMensual = Math.pow(1 + tasaAnual, 1 / 12) - 1;
  const mesesAporte = plazoAnios * 12;

  // --- Valor futuro ---
  const i = tasaMensual;
  const n = mesesAporte;
  const pmt = aporteMensual;
  const FV_total = pmt * (((1 + i) ** n - 1) / i) * (1 + i);

  // --- Factor de renta ajustado según edad de retiro ---
  let factorRenta;
  if (moneda === "ARS") {
    factorRenta = sexo === "femenino"
      ? 188.96 * (edadRetiro / 60)
      : 149.78 * (edadRetiro / 65);
  } else {
    factorRenta = sexo === "femenino"
      ? 274.25 * (edadRetiro / 60)
      : 200.28 * (edadRetiro / 65);
  }

  let rentaMensual = FV_total / factorRenta;

  // ✅ Redondear ambos resultados al múltiplo de 5 más cercano
  const redondear5 = (valor) => Math.round(valor / 5) * 5;

  return {
    FV_total: redondear5(FV_total),
    rentaMensual: redondear5(rentaMensual),
    factorRenta,
    plazoAnios,
  };
}
