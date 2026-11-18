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
| 7 | Reporte ciudadano en 4 pasos, sin cuenta, con folio de seguimiento y límite de envíos; acceso al Reglamento | ⏳ |

## Prioridad media

| Paso | Qué | Estado |
|---|---|---|
| 8 | Campañas y aliados: búsqueda, filtros y mapa con Leaflet y OpenStreetMap (datos de ejemplo) | ⬜ |
| 9 | Adopción responsable: filtros y tarjetas con sello "Verificado" (perros y gatos, datos de ejemplo) | ⬜ |

## Cierre

| Paso | Qué | Estado |
|---|---|---|
| 10 | Conectar Supabase: autenticación, Postgres con RLS y almacenamiento de fotos y cartillas; reemplazar los datos de ejemplo | ⬜ |
| 11 | Panel de autoridad de solo lectura | ⬜ |
| 12 | Pulido: PWA sin conexión, accesibilidad (contraste 4.5:1, áreas de 44 px) y revisión de privacidad (LFPDPPP) | ⬜ |

## Fuera del prototipo
Lógica de canje de cupones y cobro de comisión (fase posterior).

## Metas del piloto
100 perros registrados · 2 comercios aliados · 1 reunión con el Instituto de Bienestar Animal.
