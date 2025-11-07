import React, { useState, useEffect } from "react";
import { calcularRetiro } from "./utils/calculos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";

export default function App() {
  const [sexo, setSexo] = useState("masculino");
  const [edad, setEdad] = useState(30);
  const [moneda, setMoneda] = useState("ARS");
  const [aporte, setAporte] = useState(30000);
  const [resultado, setResultado] = useState(null);
  const [sending, setSending] = useState(false);
  const [edadRetiro, setEdadRetiro] = useState(80);


  // === CONFIGURACIÓN GOOGLE SHEETS ===
  const SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbzgTPlGNgj_gH0A-Opq3nHd_1ELEPCYN3vKt0rTJDec7_df4c0RqndGdINZnry8vzMSiA/exec";
  const SECRET_TOKEN = "PrevencionRetiro123";

  const minAporte = moneda === "ARS" ? 30000 : 100;
  const maxAporte = moneda === "ARS" ? 400000 : 400;
  const maxEdad = 64; // misma para ambos
  const maxEdadRetiro = 80;


  useEffect(() => {
    setEdad(18);
    setAporte(minAporte);
    setResultado(null);
  }, [sexo]);

  useEffect(() => {
    setAporte(minAporte);
    setResultado(null);
  }, [moneda]);

  const handleCalcular = () => {
    const res = calcularRetiro({
      aporteMensual: Number(aporte),
      edadActual: Number(edad),
      edadRetiro: Number(edadRetiro),
      sexo,
      moneda,
    });
    setResultado(res);
  };
const handleEnviar = async (e) => {
  e.preventDefault();

  if (!resultado) {
    alert("Primero realizá el cálculo antes de enviar.");
    return;
  }

  setSending(true);

  const formData = new FormData(e.target);
  const data = {
    nombre: formData.get("nombre"),
    dni: formData.get("dni"),
    fecha_nacimiento: formData.get("fecha_nacimiento"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    sexo,
    edad,
    edadRetiro,
    moneda,
    aporte,
    FV_total: resultado.FV_total,
    rentaMensual: resultado.rentaMensual,
  };

  try {
    // === 1️⃣ Generar el PDF ===
    const doc = new jsPDF();
    // Usamos fetch para evitar errores en local
    const logoBlob = await fetch("/logo-magenta-retiro.png").then((res) => res.blob());
    const logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(logoBlob);
    });
    doc.addImage(logoBase64, "PNG", 80, 15, 48, 13);

    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 15, 40);

    autoTable(doc, {
      startY: 45,
      head: [["Dato", "Valor"]],
      body: [
        ["Nombre", data.nombre],
        ["DNI", data.dni],
        ["Fecha de nacimiento", data.fecha_nacimiento],
        ["Teléfono", data.telefono],
        ["Email", data.email],
        ["Sexo", data.sexo.toUpperCase()],
        ["Edad actual", data.edad],
        ["Edad de retiro elegida", data.edadRetiro],
        ["Moneda", data.moneda],
        ["Aporte mensual", `${data.moneda} ${data.aporte.toLocaleString()}`],
        ["Capital estimado al retiro", `${data.moneda} ${data.FV_total.toLocaleString()}`],
        ["Renta mensual proyectada", `${data.moneda} ${data.rentaMensual.toLocaleString()}`],
      ],
      styles: { fontSize: 9, halign: "left" },
      headStyles: { fillColor: [177, 22, 171] },
    });

    doc.setFontSize(8);
    doc.text(
      "La presente cotización ha sido efectuada con información brindada por el solicitante y no constituye Contrato que genere obligación alguna para la Aseguradora. Los valores obtenidos son referenciales y derivados de los datos otorgados, por lo tanto están sujetos a modificaciones si la realidad difiere de los mismos. La rentabilidad es fluctuante, siendo la Tasa Testigo establecida por la Superintendencia de Seguros de la Nación, existiendo la posibilidad de modificaciones regulares.",
      15,
      doc.lastAutoTable.finalY + 10,
      { maxWidth: 180 }
    );

    doc.text("© Prevención Retiro — Unidad Santa Fe", 15, doc.lastAutoTable.finalY + 25);

    // === 2️⃣ Convertir el PDF a base64 ===
    const pdfBase64 = doc.output("datauristring");

    // === 3️⃣ Enviar al backend (Netlify Function con Mailgun) ===
    const response = await fetch("/.netlify/functions/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: data.nombre,
        email: data.email,
        pdfBase64,
      }),
    });

    const text = await response.text();
    let result = {};
    try {
      result = JSON.parse(text);
    } catch {
      console.error("Respuesta no JSON:", text);
    }

    if (result.ok) {
      alert("✅ Cotización enviada correctamente por correo y descargada.");
    } else {
      alert("⚠️ El PDF se generó, pero hubo un problema al enviar el correo.");
      console.error("Error backend:", result);
    }

    // === 4️⃣ Descargar el PDF localmente también ===
    doc.save(`Cotizacion_PrevencionRetiro_${data.nombre}.pdf`);

    e.target.reset();
  } catch (err) {
    console.error("Error al generar o enviar el PDF:", err);
    alert("Ocurrió un error al procesar la solicitud ❌");
  } finally {
    setSending(false);
  }
};


  // === UI ===
  return (
    <div className="min-h-screen bg-white text-gray-800 px-4 py-8">
      <div className="max-w-xl mx-auto">
        <header className="mb-6 text-center">
          <img src="/logo-magenta-retiro.png" alt="Prevención Retiro" className="mx-auto h-12 mb-3" />
          
        </header>

        <motion.section
          className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-[#b116ab] mb-3">
            ¿Querés saber cuánto podrías ahorrar con tu seguro?
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            ¡Simulá el ahorro para tu retiro! Con solo 4 datos te brindamos una simulación aproximada.
          </p>

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-gray-700 mb-5">
  <strong className="text-yellow-800">Atención:</strong>{" "}
  Los cálculos se realizan considerando una edad de ingreso de hasta 64 años, con posibilidad de simular la edad de retiro hasta los 80. 
  Las tasas proyectadas son del 4% en dólares y 18% en pesos. No se consideran sellados provinciales.
</div>


          {/* FORM PRINCIPAL */}
          {/* Sexo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo te identificás?</label>
            <div className="flex gap-4">
              {["masculino", "femenino"].map((s) => (
                <label
                  key={s}
                  className={`px-3 py-2 rounded-lg border cursor-pointer ${
                    sexo === s ? "border-[#b116ab] bg-[#F3E5F5]" : "border-gray-200"
                  }`}
                >
                  <input type="radio" name="sexo" checked={sexo === s} onChange={() => setSexo(s)}  className="mr-2 accent-[#b116ab]" />
                  {s.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Edad */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué edad tenés?</label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-6">18</span>
              <input
                type="range"
                min="18"
                max={maxEdad}
                value={edad}
                onChange={(e) => setEdad(Number(e.target.value))}
                className="flex-1 accent-[#b116ab]"
              />
              <span className="text-sm text-gray-600 w-6">{maxEdad}</span>
              <div className="w-10 text-right font-medium">{edad}</div>
            </div>
          </div>

          {/* EDAD DE RETIRO */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    ¿A qué edad te gustaría retirarte?
  </label>
  <div className="flex items-center gap-4">
    <span className="text-sm text-gray-600 w-6">{edad + 1}</span>
<input
  type="range"
  min={edad + 1}
  max={maxEdadRetiro}
  value={edadRetiro}
  onChange={(e) => setEdadRetiro(Number(e.target.value))}
  className="flex-1 accent-[#b116ab]"
/>
<span className="text-sm text-gray-600 w-6">{maxEdadRetiro}</span>

    <div className="w-10 text-right font-medium">{edadRetiro}</div>
  </div>
</div>


          {/* Moneda */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">¿Con qué moneda querés ahorrar?</label>
            <div className="flex gap-4">
              {["ARS", "USD"].map((m) => (
                <label
                  key={m}
                  className={`px-3 py-2 rounded-lg border cursor-pointer ${
                    moneda === m ? "border-[#b116ab] bg-[#F3E5F5]" : "border-gray-200"
                  }`}
                >
                  <input type="radio" name="moneda" checked={moneda === m} onChange={() => setMoneda(m)}  className="mr-2 accent-[#b116ab]" />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {/* Aporte */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    ¿Cuánto podés ahorrar mensualmente?
  </label>
  <input
    type="range"
    min={minAporte}
    max={maxAporte}
    step="5000"             // 👈 salto de 5000
    value={aporte}
    onChange={(e) => setAporte(Number(e.target.value))}
    className="w-full accent-[#b116ab] mt-1"
  />
  <div className="text-right text-medium font-medium text-[#b116ab]">
    {moneda} {aporte.toLocaleString()}
  </div>
</div>

          <div className="text-center mt-4">
            <button onClick={handleCalcular} className="inline-block px-6 py-2 rounded-full bg-[#b116ab] text-white font-semibold hover:brightness-95">
              Calcular
            </button>
          </div>
        </motion.section>

        {resultado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Resultados</h3>
            <div className="bg-[#F3E5F5] p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Capital al retiro</div>
              <div className="text-2xl font-bold text-[#b116ab]">
                {moneda} {Number(resultado.FV_total).toLocaleString()}
              </div>
            </div>

            <div className="bg-[#F3E5F5] p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Renta mensual proyectada</div>
              <div className="text-2xl font-bold text-[#b116ab]">
                {moneda} {Number(resultado.rentaMensual).toLocaleString()}
              </div>
            </div>

            {/* FORMULARIO */}
<form onSubmit={handleEnviar} className="bg-white border rounded-2xl p-4 shadow-sm">
  <h4 className="font-semibold text-gray-700 mb-3">Solicitá tu cotización</h4>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Nombre y Apellido</label>
      <input name="nombre" className="border rounded-md p-2 w-full" required />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">DNI</label>
      <input name="dni" className="border rounded-md p-2 w-full" required />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
      <input
        name="fecha_nacimiento"
        type="date"
        className="border rounded-md p-2 w-full sm:w-auto text-gray-700 bg-white"
        required
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Teléfono</label>
      <input name="telefono" className="border rounded-md p-2 w-full" required />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
      <input name="email" type="email" className="border rounded-md p-2 w-full" required />
    </div>
  </div>

  <div className="mt-3 flex justify-end">
    <button
      type="submit"
      disabled={sending}
      className="px-5 py-2 bg-[#b116ab] text-white rounded-full"
    >
      {sending ? "Procesando..." : "Solicitar Cotización"}
    </button>
  </div>
</form>

          </motion.div>
        )}

        <footer className="mt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Prevención Retiro — Unidad Santa Fe
        </footer>
      </div>
    </div>
  );
}
