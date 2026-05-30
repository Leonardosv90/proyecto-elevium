# Proyecto Elevium

Carpeta principal de desarrollo del sitio web de Elevium dentro de Codex.

Esta carpeta es la base editable para seguir construyendo el proyecto. La copia en `outputs/elevium-publicable` queda como export/entregable; este directorio es el lugar donde haremos los cambios nuevos.

## Proposito

Elevium se posiciona como una firma de autoridad digital que integra estrategia, contenido, diseno, inteligencia artificial y automatizacion para marcas personales profesionales y negocios de servicios.

El objetivo comercial principal del sitio es llevar al visitante a solicitar un diagnostico estrategico.

## Estructura

- `docs/`: notas estrategicas, auditorias y decisiones del proyecto.
  - `docs/vision-plataforma-elevium.md`: vision completa de evolucion hacia plataforma, panel, recursos, analitica, membership y merch corporativo.
- `backups/`: respaldos manuales si hace falta antes de cambios grandes.
- `index.html`: pagina de inicio y promesa principal.
- `metodo-elevar.html`: metodo ELEVAR.
- `servicios.html`: soluciones principales.
- `marca-personal-profesional.html`: pagina para profesionales expertos.
- `ia-para-negocios.html`: IA aplicada a procesos y marketing.
- `casos.html`: casos/proyectos.
- `recursos.html`: recurso descargable y articulos iniciales.
- `sobre-elevium.html`: historia, vision y posicionamiento.
- `diagnostico.html`: formulario principal de captacion.
- `contacto.html`: contacto general.
- `gracias-diagnostico.html`: confirmacion de solicitud.
- `gracias-recurso.html`: confirmacion de recurso.
- `assets/elevium.css`: estilos globales.
- `assets/elevium.js`: menu, formularios, filtros, fondos y animaciones.

## Como abrirlo

Abre `index.html` directamente en el navegador. No requiere servidor ni instalacion para funcionar como sitio estatico.

Ruta de entrada:

```text
proyecto-elevium/index.html
```

## Deploy en GitHub + Vercel

Este proyecto es un sitio estatico. Para publicarlo:

1. Crear un repositorio vacio en GitHub.
2. Subir esta carpeta con Git.
3. En Vercel, elegir `Add New Project` e importar el repositorio.
4. Usar la configuracion por defecto:
   - Framework Preset: Other
   - Build Command: vacio
   - Output Directory: vacio o `.`
5. Deploy.

La pagina principal es `index.html`.

## Formularios

Los formularios usan el atributo `data-lead-form` y estan preparados para conectarse a un endpoint externo.

Ejemplo:

```html
<form class="form-card" data-lead-form="diagnostico" data-endpoint="https://tu-endpoint.com/leads" data-success="gracias-diagnostico.html">
```

Si `data-endpoint` no existe, el sitio guarda el envio en `localStorage` bajo la clave `elevium_leads`. Esto sirve solo para pruebas locales.

Opciones recomendadas para conectar:

- Google Apps Script + Google Sheets.
- Formspree.
- Make/Zapier webhook.
- Backend propio.
- CRM con endpoint de leads.

## Assets

Esta version publicable conserva solo los assets referenciados por HTML, CSS y JS. Las imagenes grandes usadas en el sitio fueron convertidas de PNG a WebP para reducir peso.

El paquete original tenia alrededor de 200 MB. Esta version queda mucho mas ligera y lista para subir a hosting estatico.

## Siguiente sprint recomendado

1. Conectar formularios a un destino real.
2. Revisar homepage y diagnostico en movil.
3. Crear 2-3 casos reales o semi-reales con evidencia.
4. Definir politica de privacidad y terminos.
5. Preparar deploy en Netlify, Vercel, Cloudflare Pages o hosting tradicional.

## Flujo de trabajo recomendado

1. Trabajar cambios en esta carpeta.
2. Probar el sitio desde `index.html`.
3. Cuando una version quede estable, exportarla nuevamente a `outputs`.
4. Mantener `work/elevium` como referencia del paquete original.
