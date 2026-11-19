# Manchitas — contexto del proyecto

Lee este archivo y `DESIGN.md` antes de escribir código. Todo el texto visible para el usuario va **en español de México**.

## Qué es
Manchitas es una PWA comunitaria de tenencia responsable de mascotas para **Hermosillo, Sonora**. Identifica a cada perro con un ID de collar y un QR, conecta a tutores, veterinarias, comercios, rescatistas y autoridades, y facilita la vacunación, la adopción y la denuncia de maltrato. Eslogan: "Deja huella, mancha y protege."

Es un **emprendimiento social** del equipo 2ISI (Universidad de Sonora) para el Certamen Búho Innova-T 2026, categoría Emprendimiento Social. El producto es un cambio de conducta social; la tecnología es el medio.

## Problema que resolvemos
- Muy pocos dueños identifican a su mascota: quien encuentra un perro no sabe a quién avisar.
- La información de vacunación y esterilización está dispersa en redes.
- La gente desconoce el Reglamento de Protección y Bienestar Animal y no sabe cómo denunciar.
- La adopción es informal; no hay incentivos para mantener registros al día.
- Existe el programa municipal "Huellita Segura" (QR + registro). **Manchitas lo complementa, no compite con él.**

## Usuarios
- **Tutores de perros** (18–45 años, con smartphone): gratis. Son el usuario principal.
- **Rescatistas y albergues:** publican perros en adopción. Gratis.
- **Comercios y veterinarias:** ofrecen cupones. Pagan comisión solo cuando se canjea un cupón.
- **Autoridades** (Instituto Municipal de Protección y Bienestar Animal): reciben reportes ordenados.

## Los 3 flujos centrales (prioridad del prototipo)
1. **Registro de la mascota:** el tutor crea cuenta, captura los datos del perro, sube la cartilla de vacunación y recibe su **ID de collar (folio, ej. MCH-02841)**, su QR y una etiqueta imprimible.
2. **Reencuentro:** quien encuentra al perro escanea el QR o escribe el ID exacto. Ve una ficha pública mínima y un botón para **contactar al dueño por WhatsApp**. No requiere registro.
3. **Reporte ciudadano:** 4 pasos (tipo de reporte, ubicación, evidencia, revisar y enviar). Se canaliza a las autoridades y el ciudadano recibe confirmación.

## Pantallas
1. **Inicio del tutor** (ya diseñada, ver `DESIGN.md`): saludo, foto y folio de la mascota, resumen (vacunas, pendiente, cupones, estado), próximo recordatorio, próxima campaña, acceso a cupones.
2. **Perfil público QR:** foto, nombre, raza/edad aproximada, señas, nota del tutor y botón "Contactar a mi dueño por WhatsApp". Ver reglas de privacidad.
3. **Cartilla y cupones:** pestañas "Cartilla digital" y "Billetera de cupones". Lista de vacunas con fecha y estado (completada o próxima), botón "Subir foto de cartilla", recordatorio.
4. **Campañas y aliados:** búsqueda, filtros (Vacunación, Esterilización, Clínicas 24 h), mapa de aliados y lista de próximas campañas con fecha, lugar y horario.
5. **Adopción responsable:** búsqueda, filtros (perros, gatos, cachorros, tamaño) y tarjetas con foto, nombre, edad, tamaño y sello "Verificado".
6. **Reportes y educación cívica:** flujo de 4 pasos y acceso al Reglamento de Protección Animal (obligaciones, prevención, sanciones).
7. **Bienvenida, inicio de sesión y registro por pasos** (estilo PeluCharm: pantalla con foto, formularios con encabezado curvo y pasos numerados).

## Reglas de privacidad y producto (no negociables)
- La pantalla pública del QR **no dice "perdido"** ni "me perdí". Solo muestra la información del perro y el botón de WhatsApp.
- Los datos de contacto del dueño solo se muestran al introducir el **ID exacto**. Mostrar el nombre del perro y, como máximo, un apellido del dueño. **No mostrar el teléfono completo en pantalla**; el contacto se hace con el botón de WhatsApp.
- Los IDs públicos no deben ser adivinables ni enumerables.
- Cumplir con la LFPDPPP: aviso de privacidad visible desde el registro, datos cifrados, control de acceso por fila en la base de datos.
- La plataforma **no sustituye a la autoridad**: los reportes de maltrato se canalizan a ella.
- El registro y el QR digital son gratuitos. No agregar suscripciones.

## Stack propuesto (puede cambiarse si hay una razón)
- **Vite + React + TypeScript**, **Tailwind CSS**, **React Router**.
- **PWA** con `vite-plugin-pwa` (instalable, manifest, caché básica sin conexión).
- **Supabase** para autenticación, base de datos Postgres (con Row Level Security) y almacenamiento de fotos y cartillas.
- Mapas: empezar con una solución simple y sin costo; evaluar antes de agregar una librería pesada.
- Generación de QR en el cliente con una librería ligera.

## Alcance del prototipo (concurso)
Prioridad alta, funcional de punta a punta: **registro de mascota, ID y QR, perfil público, cartilla, reporte ciudadano**.
Prioridad media: campañas y mapa, adopción (pueden iniciar con datos de ejemplo).
Cupones: pantalla navegable con datos de ejemplo; la lógica de canje y comisión queda para una fase posterior.
Metas del piloto: 100 perros registrados, 2 comercios aliados, 1 reunión con el Instituto de Bienestar Animal.

## Paso 12 (pulido, en curso)
Sub-pasos 12a–12f en `docs/PLAN.md` (12a a 12d hechos): escritorio, imágenes, accesibilidad, PWA sin conexión, fotos huérfanas y privacidad. Decisiones: navegación superior en escritorio; imágenes de bancos gratuitos (Unsplash/Pexels) con atribución y letrero "Ejemplo"; sin caché de datos privados; el aviso de privacidad sigue en borrador hasta la revisión legal. Lo que queda después del prototipo está en "Lo que falta después del prototipo" de `docs/PLAN.md`.

## Cómo trabajar
- Mobile-first, diseño base de **390 px** de ancho. En escritorio (paso 12a) se adapta con `md` (768 px) y `lg` (1024 px): barra de navegación superior en `lg`, rejillas y paneles lado a lado. No rompas la vista de móvil. Prueba a 390, 768 y 1280 px.
- Antes de empezar una pantalla, revisa `DESIGN.md` y reutiliza componentes (tarjeta, botón, encabezado, barra inferior, etiqueta de color).
- Usa los skills instalados: `frontend-design` para la interfaz y `modern-web-guidance` para código web moderno y accesible.
- Con `modern-web-guidance`: **no agregues scripts de terceros por CDN ni polyfills para navegadores viejos** a menos que sea necesario y lo avises.
- Accesibilidad: botones y enlaces reales (`<button>`, `<a>`), etiquetas en inputs, `aria-label` en íconos, contraste de texto mínimo 4.5:1, áreas táctiles de al menos 44 px.
- No uses emojis como imágenes ni íconos. Usa SVG en línea o una librería de íconos.
- Datos de ejemplo realistas, sin texto de relleno tipo "lorem ipsum".
- Haz cambios pequeños y explícalos. Antes de borrar archivos o cambiar la estructura, pregunta.
- No guardes claves ni secretos en el repositorio: usa variables de entorno (`.env`, fuera de git).

## Decisiones tomadas
- **Folio aleatorio** (ej. `MCH-7K3P9Q`), no consecutivo. El QR apunta a un token largo distinto.
- **Registro de perros y gatos** (antes solo perros): el tutor elige la especie al registrar o editar. La migración `20261118000500_especie_gatos.sql` quita el `especie := 'perro'` forzado del trigger y permite al cliente escribir `especie`; la columna solo acepta `perro` o `gato`. La ficha pública del QR no recibe la especie, así que usa textos neutros ("Ficha de la mascota"). Adopción muestra perros y gatos.
- **Reporte ciudadano sin cuenta**, con folio de seguimiento y límite de envíos.
- **Autoridad:** panel sencillo de solo lectura, como último paso.
- **Barra inferior:** Mascotas, Comunidad (Campañas y Adopción), Inicio, Salud, Avisos. **Avisos** (`src/features/avisos/`) es un centro de avisos **calculados**: no hay tabla de notificaciones; `src/lib/avisos.ts` los deriva de las mascotas, cartillas y sesión del usuario (y de las campañas de ejemplo), con id estable, así que no se duplican. Lo leído y lo eliminado se guarda por cuenta en localStorage (`manchitas.avisos.<correo>`). Debajo sigue el centro de reportes ciudadanos (`CentroReportes`), sin cambios. Avisos persistentes entre dispositivos requerirían una tabla con RLS.
- **Mapa:** Leaflet con OpenStreetMap.
- **Cartilla:** mostrar solo vacunas aplicadas y la próxima pendiente. Sin "4/5" ni "Al día" hasta que un veterinario valide el esquema.
- **Supabase (paso 10, conectado):** proyecto propio, sin claves en el repo (`.env` fuera de git, `.env.example` sin valores; en el cliente solo la clave anon, nunca la `service_role`). Sin `.env` la app sigue en **modo local** (localStorage y sesión simulada); cada repositorio de `src/lib` (mascotas, cartillas, reportes) y `ProveedorSesion` elige el modo con `haySupabase`.
  - **Esquema y seguridad** en `supabase/migrations/` (se aplican con `npx supabase db push`). RLS en todas las tablas; permisos por columna para que el cliente no pueda elegir dueño, folio, token ni rol. Folio, token y dueño de la mascota los fija un trigger del servidor. `service_role` necesita permisos de tabla explícitos (en proyectos nuevos no se conceden solos).
  - **Público sin cuenta:** solo las funciones `perfil_publico(token)`, `token_por_folio(folio)` y `seguimiento_reporte(folio)`; `anon` no lee ninguna tabla. Las búsquedas por folio tienen límite por IP (20 cada 10 minutos, hash de la IP en `intentos`).
  - **Reportes:** los envía la función de Edge `supabase/functions/enviar-reporte` (valida, aplica el límite de 3 por IP cada 24 horas, sube la evidencia y guarda con la clave de servicio). Se despliega con `npx supabase functions deploy enviar-reporte`.
  - **Fotos:** `mascotas-fotos` (lectura pública con nombres aleatorios, para la ficha del QR), `cartillas-fotos` (privado, URL firmada de 1 hora) y `reportes-evidencia` (privado, solo lo lee la autoridad). 2 MB y solo JPEG; ruta `<usuario>/<nombre aleatorio>.jpg`.
  - **Autoridad (paso 11):** `perfiles.rol = 'autoridad'` (se asigna a mano con un UPDATE, ver `docs/PLAN.md`) y `es_autoridad()`; solo lectura de reportes y su evidencia. Nunca ve mascotas, cartillas ni perfiles de tutores. Pantalla en `/autoridad` (`src/features/autoridad/`), fuera de la barra inferior; el enlace aparece en Ajustes solo con el rol. La evidencia se abre con URLs firmadas de 5 minutos. Sin Supabase, `/autoridad` redirige al inicio. Sin botones de editar ni borrar.
  - **Pruebas:** `supabase/tests/rls.sql` (48 comprobaciones de aislamiento entre usuarios, permisos de `anon`, límites y buckets; se revierte sola). Correrla tras cada cambio de migraciones.
  - Los datos de localStorage del prototipo se descartaron (eran de prueba). Campañas, aliados, adopción y cupones siguen siendo datos de ejemplo estáticos.
- **Inicio de sesión:** correo y contraseña.
- **Comunidad (`/comunidad`):** pestañas "Campañas" y "Adopción". Campañas trae búsqueda, filtros (Todos, Vacunación, Esterilización, Clínicas 24 h), mapa y dos desplegables cerrados al inicio, "Próximas campañas" y "Aliados", para no alargar la pantalla. Cada aliado lleva enlace "Cómo llegar" a OpenStreetMap, sin clave.
- **Mapa:** Leaflet se carga solo en esa pantalla (`React.lazy`, chunk aparte de unos 45 KB con gzip). Atribución de OpenStreetMap siempre visible, marcadores SVG propios y sin scripts por CDN. Los aliados y las campañas son datos de ejemplo en `src/lib/campanasEjemplo.ts`, con coordenadas aproximadas por zona (no son ubicaciones reales). Las campañas pasadas no se listan y la tarjeta de Inicio toma la próxima de esos datos.
- **Adopción (pestaña de Comunidad):** perros y gatos de ejemplo en `src/lib/adopcionEjemplo.ts`, con búsqueda y filtros (especie, cachorros, tamaño). Las fotos son de banco (Pexels, `public/img/`, créditos en `docs/ATRIBUCION-IMAGENES.md`) y cada una lleva el letrero "Foto de ejemplo": no son los animales reales. El sello "Verificado" es de ejemplo y no debe presentarse como validación real hasta que el Instituto o un veterinario la haga. "Quiero conocerlo" abre una ficha con requisitos de adopción responsable; el contacto real llega con Supabase.
- **PWA sin conexión (12d):** `vite-plugin-pwa` con `generateSW`. Pre-caché de la estructura, chunks, imágenes de `public/img` y fuentes latinas; `navigateFallback` a `index.html`. Solo hay dos cachés de ejecución, `mosaicos-osm` y `fotos-mascotas` (bucket público). **Regla: no se guarda en caché nada privado** (auth, REST, cartillas, evidencia, URLs firmadas, `enviar-reporte`); lo que no está en la lista va siempre a la red, así que al agregar una regla en `vite.config.ts` hay que cuidar que su patrón no alcance esas rutas. Al cerrar sesión se borra `fotos-mascotas`. Sin red se ve el aviso "Sin conexión" (`AvisoSinConexion`) y no se ven las mascotas (aceptado). Las pantallas son diferidas con `React.lazy` en `App.tsx`; Leaflet sigue en su propio chunk. Para probar el service worker usar `npm run build` + `vite preview`, no `dev`.
