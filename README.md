# SmartStay — Landing page

Landing page de **SmartStay**, el producto de la startup **Movildev**: gestión hotelera + IoT para hoteles boutique, alojamientos alternativos y cadenas.

Cubre las historias de usuario de la épica EP-06 del informe:

| Historia | Qué incluye |
| --- | --- |
| US-24 Landing segmentada | Selector de perfil (administrador de hotel / huésped) con contenido específico y CTA para solicitar demo, contactar a ventas y descargar la app |
| US-26 Casos de éxito | Casos con métricas (costos, satisfacción, tiempo), filtro por tipo de alojamiento, espacio para video testimonial y botón "Solicitar más información" |
| US-27 Demo y contacto | Formulario validado que envía la solicitud a la API, confirmación inmediata, agenda en Cal.com con nombre y correo precargados, y contacto por teléfono, correo y WhatsApp |
| US-28 Información corporativa | Misión, visión, valores, historia, equipo fundador, sostenibilidad y certificaciones (como metas) |

## Stack

- HTML, CSS y JavaScript sin framework, como declara el informe.
- [Vite](https://vite.dev/) (plantilla vanilla) como bundler: módulos ES, assets con hash y variables de entorno en tiempo de build.
- [Tailwind CSS v4](https://tailwindcss.com/) compilado con `@tailwindcss/vite`. Reemplaza al Play CDN, que compila en el navegador y no está pensado para producción.
- [Lucide](https://lucide.dev/) con import por ícono, así el bundle solo incluye los íconos que usas.

¿Por qué Vite y no solo el CLI de Tailwind? Porque además de compilar el CSS necesitas empaquetar los módulos JS e inyectar la configuración por entorno (`import.meta.env`). Con el CLI de Tailwind tendrías que resolver esas dos cosas aparte.

## Requisitos

- Node.js 20.19 o superior (o 22.12+).

## Uso

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ localmente
```

## Configuración

Toda la configuración vive en `src/config.js` y se puede sobrescribir con variables de entorno `VITE_*` al momento del build. Copia `.env.example` como `.env.local` para desarrollo, o define las variables en Vercel.

| Variable | Uso | Valor por defecto |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base de la API; el formulario hace `POST ${VITE_API_BASE_URL}/demo-requests` | `http://localhost:5192/api/v1` (placeholder) |
| `VITE_CALCOM_URL` | Evento de Cal.com para agendar la demo | `https://cal.com/piero-sulca-sanchez-rhh1nt/demo-smartstay` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp de ventas, solo dígitos con código de país | `51900000000` (placeholder) |
| `VITE_SALES_EMAIL` | Correo de ventas | `ventas@smartstay.example` (placeholder) |
| `VITE_SALES_PHONE` | Teléfono de ventas | `+51 900 000 000` (placeholder) |
| `VITE_WEB_APP_URL` | App web para iniciar sesión y crear cuenta | `https://smartstay-3cffc.web.app` |
| `VITE_APP_DOWNLOAD_URL` | Enlace de descarga de la app; si está vacío se muestra "Próximamente" | vacío |
| `VITE_TESTIMONIAL_VIDEO_URL` | URL *embed* del video testimonial; si está vacía se muestra un espacio reservado | vacío |
| `VITE_PRODUCT_VIDEO_URL` | URL *embed* del video del producto; si está vacía la sección se oculta | vacío |

Si algún valor sigue siendo un placeholder, la consola del navegador lo indica al cargar la página.

### Contrato de la API (US-27)

`POST ${VITE_API_BASE_URL}/demo-requests`

```json
{
  "firstName": "Ana",
  "lastName": "Pérez",
  "hotelName": "Hotel Andes",
  "jobTitle": "Gerente general",
  "email": "ana@hotelandes.pe",
  "accommodationType": "boutique | alternative | chain",
  "roomsRange": "1-10 | 11-30 | 31-60 | 60+",
  "referralSource": "search | social | referral | event | other",
  "phone": "+51987654321",
  "message": "opcional",
  "profile": "admin | guest"
}
```

- `201`: `{ "id", "status": "Received", "message" }`. La landing muestra la confirmación y abre el calendario.
- `400`: ProblemDetails con `errors` por campo (en camelCase). Cada error aparece bajo su campo.
- `429`, `5xx` o sin conexión: mensaje para reintentar y enlaces directos a WhatsApp y correo. Los datos del formulario se conservan.

`phone` y `message` se omiten cuando están vacíos. El seguimiento automático (escenario 4 de US-27) lo hace el backend.

## Despliegue en Vercel

`vercel.json` ya define el comando de build (`npm run build`), la carpeta de salida (`dist`), caché inmutable para `/assets/*` y cabeceras de seguridad. Solo tienes que:

1. Importar el repositorio en Vercel (framework: Vite).
2. Definir las variables `VITE_*` en *Project Settings → Environment Variables*.
3. Desplegar. Cada push a `main` genera un despliegue de producción.

## Estructura

```text
index.html                    # marcado de todas las secciones
public/                       # favicon (se copia tal cual)
src/
  main.js                     # punto de entrada: inicializa cada módulo
  config.js                   # configuración y variables VITE_*
  domain.js                   # vocabulario compartido (perfiles, tipos de alojamiento...)
  styles/main.css             # Tailwind + tokens de marca
  i18n/                       # traducciones ES/EN y su aplicación al DOM
  lib/                        # íconos y almacenamiento local seguro
  features/
    navigation.js             # menú móvil y enlaces a la app web
    profile.js                # US-24: selector de perfil
    success-stories/          # US-26: datos, filtro y UI de casos de éxito
    demo-form/                # US-27: validación, cliente HTTP y formulario
    contact/                  # US-27: teléfono, correo, WhatsApp y enlace de Cal.com
  assets/                     # logo y fotos del equipo
```

### Traducciones

Los textos usan `data-i18n="clave"` (contenido) y `data-i18n-attr="atributo:clave"` (atributos como `aria-label` o `placeholder`). Cada clave nueva tiene que existir en `src/i18n/locales/es.js` y en `src/i18n/locales/en.js`. El español es el idioma por defecto y usa tuteo neutro.

## Contenido pendiente de validar

- **Casos de éxito**: son ilustrativos (hoteles tipo, sin nombres) y se muestran marcados como tales. Reemplázalos en `src/features/success-stories/stories.js` cuando existan casos reales autorizados.
- **Misión, visión, valores e historia**: redactados a partir del perfil de la startup del informe (capítulo 1); revísalos con el equipo.
- **Certificaciones**: todavía no hay certificaciones obtenidas; se presentan como metas o compromisos.
- **Datos de contacto y video testimonial**: define las variables de entorno correspondientes.
