import Mailgun from "mailgun.js";
import FormData from "form-data";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { nombre, email, pdfBase64 } = data || {};

    if (!nombre || !email || !pdfBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Missing required fields" }),
      };
    }

    const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY, // ✅ variable de entorno
  url: "https://api.mailgun.net",
});

    // convertimos base64 → buffer
    const base64Data = pdfBase64.split(",")[1];
    const pdfBuffer = Buffer.from(base64Data, "base64");

    // reemplazá este dominio por el tuyo en Mailgun:
    const MAILGUN_DOMAIN = "mg.prevencionretirounsantafe.com";

    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: "Prevención Retiro <no-reply@prevencionretirounsantafe.com>",
      to: ["Paula Pizarra <mpizarra@sancorseguros.com>"],
      subject: "Nueva cotización recibida",
      text: `El cliente ${nombre} generó una nueva cotización.`,
      html: `<p>El cliente <strong>${nombre}</strong> generó una nueva cotización.</p>
             <p>Se adjunta el PDF correspondiente.</p>`,
      attachment: [
        {
          filename: `Cotizacion_${nombre}.pdf`,
          data: pdfBuffer,
        },
      ],
    });

    console.log("✅ Mailgun response:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, message: "Email sent", response: result }),
    };
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
}
