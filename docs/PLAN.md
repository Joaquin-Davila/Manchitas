# Manchitas — plan de trabajo

Resumen por pasos. El detalle de producto está en `CLAUDE.md` y el de diseño en `DESIGN.md`.
Estados: ✅ hecho · ⏳ siguiente · ⬜ pendiente.

> Los pasos 3 en adelante son una **propuesta** basada en las prioridades de `CLAUDE.md`; el orden se puede ajustar.

## Hecho

| Paso | Qué | Estado |
|---|---|---|
| 1 | Andamiaje: Vite, React, TypeScript, Tailwind y PWA | ✅ |
| 2 | Componentes base (Encabezado, BarraInferior, Tarjeta, TarjetaDato, BotonPrincipal) y pantalla de Inicio con datos de ejemplo | ✅ |
| 3 | Bienvenida, inicio de sesión (correo y contraseña) y registro por pasos, con aviso de privacidad visible. Sesión simulada (sin Supabase) y aviso de privacidad en borrador pendiente de revisión legal | ✅ |

## Prioridad alta (funcional de punta a punta)

| Paso | Qué | Estado |
|---|---|---|
| 4 | Registro de la mascota: folio aleatorio (`MCH-XXXXXX`), QR con token largo y etiqueta imprimible. Datos en `localStorage` mediante `src/lib/mascotas.ts` (se cambia por Supabase en el paso 10) | ✅ |
| 5 | Perfil público del QR (`/m/:token`): búsqueda por ID exacto, ficha mínima y botón de WhatsApp (sin barra inferior, sin "perdido", sin teléfono en pantalla) | ✅ |
| 6 | Cartilla digital (solo vacunas aplicadas y la próxima pendiente) y subida de foto de la cartilla; billetera de cupones con datos de ejemplo | ✅ |
| 7 | Reporte ciudadano en 4 pasos, sin cuenta, con folio de seguimiento y límite de envíos; acceso al Reglamento (resumen en borrador pendiente de cotejar con el texto oficial; el límite de envíos real va en el paso 10) | ✅ |

## Prioridad media

| Paso | Qué | Estado |
|---|---|---|
| 8 | Campañas y aliados: búsqueda, filtros y mapa con Leaflet y OpenStreetMap (datos de ejemplo). Pestaña Campañas dentro de Comunidad; Leaflet carga solo en esa pantalla | ✅ |
| 9 | Adopción responsable: filtros y tarjetas con sello "Verificado" (perros y gatos, datos de ejemplo); en la pestaña Adopción de Comunidad; el sello es de ejemplo | ✅ |

## Cierre

| Paso | Qué | Estado |
|---|---|---|
| 10 | Conectar Supabase: autenticación (correo y contraseña), Postgres con RLS, Storage de fotos y cartillas, perfil público por token, reportes con límite real (función de Edge). Los datos de mascotas, cartillas y reportes ya son reales; campañas, adopción y cupones siguen de ejemplo. Sin `.env` la app funciona en modo local. Probado en navegador (390 px) y con `supabase/tests/rls.sql` (42/42) | ✅ |
| 11 | Panel de autoridad de solo lectura. Ya queda listo en la base: rol `autoridad`, `es_autoridad()` y lectura de `reportes` y `reportes-evidencia`; falta la pantalla y la forma de dar el rol. Antes, borrar los reportes de prueba | ⏳ |
| 12 | Pulido: PWA sin conexión, accesibilidad (contraste 4.5:1, áreas de 44 px) y revisión de privacidad (LFPDPPP) | ⬜ |

### Pendientes que dejó el paso 10 (para antes del piloto)
- **Reactivar "Confirm email"** en Supabase (se desactivó para desarrollo) y configurar un correo propio (SMTP), porque el integrado envía muy pocos mensajes por hora.
- **Recuperación de contraseña** (no está).
- **Fotos huérfanas:** al borrar una cuenta o una mascota las fotos quedan en Storage; falta una limpieza.
- **Límite de reportes:** un error del servidor también gasta uno de los 3 intentos. Valorar no contarlo.
- **Sal del hash de IP** fija en el código (`limitar`); pasarla a un secreto si se quiere más protección.
- **Teléfono en el enlace de WhatsApp:** viaja dentro del `href` (inevitable con `wa.me`, no se muestra en pantalla). Valorar una redirección desde una función.
- **Datos de prueba** en el proyecto (usuarios `…@mailinator.com`, mascotas, 4 reportes y sus fotos): limpiar antes del piloto.

## Fuera del prototipo
Lógica de canje de cupones y cobro de comisión (fase posterior).

## Metas del piloto
100 perros registrados · 2 comercios aliados · 1 reunión con el Instituto de Bienestar Animal.
