# Cotizador Santa Fe

Aplicacion web para simulacion de retiro con calculo financiero, generacion de PDF y envio de cotizacion por email.

## Repositorio
- Repo: https://github.com/Franco1441/cotizador-santafe

## Stack
- React 19 + Vite
- React Router
- Tailwind CSS
- Framer Motion
- jsPDF + jspdf-autotable
- Netlify Functions (Node)
- Mailgun API (envio de correo)

## Funcionalidades principales
- Simulador de retiro con parametros por sexo, edad, moneda y aporte mensual
- Calculo de capital proyectado y renta mensual
- Generacion automatica de PDF de cotizacion
- Envio de cotizacion por email mediante funcion serverless
- Rutas personalizadas para distintos productores/unidades:
  - `/`
  - `/campi`
  - `/rbgroup`
  - `/triveropablo`
  - `/puertonuevo`
  - `/fz`
  - `/carlosserovich`

## Estructura relevante
- `src/App.jsx` - flujo principal de simulacion y envio
- `src/utils/calculos.js` - motor de calculo
- `netlify/functions/sendEmail.js` - envio de correos con Mailgun
- `src/*.jsx` - variantes de landing por ruta

## Ejecutar en local
```bash
git clone https://github.com/Franco1441/cotizador-santafe.git
cd cotizador-santafe
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Variables de entorno
Para envio de correo en Netlify Functions:

- `MAILGUN_API_KEY`

Nota: hoy existen valores hardcodeados en el cliente para integracion con Google Sheets y token interno. Como mejora de seguridad, conviene moverlos a variables de entorno o backend.

## Estado actual
Proyecto funcional para simulacion y contacto comercial, con enfoque en experiencia guiada y entrega inmediata de cotizacion en PDF.

## Autor
Desarrollado por Franco Rotta.