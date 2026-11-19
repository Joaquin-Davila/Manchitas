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
| 11 | Panel de autoridad de solo lectura en `/autoridad` (sin barra inferior, fuera de la navegación de tutores): lista paginada con filtro por estado, detalle con contacto, enlace al mapa y evidencia con URLs firmadas de 5 minutos. Solo entra quien tiene `perfiles.rol = 'autoridad'`; sin Supabase (modo local) redirige al inicio. El rol se da a mano (ver abajo). `rls.sql`: 48/48. Probado en navegador a 390 px. "Marcar como canalizado" queda para después (función `marcar_canalizado(folio)` solo para autoridad, sin abrir `UPDATE` en la tabla) | ✅ |
| 12 | Pulido, en 6 sub-pasos (ver abajo) | ⏳ |

### Paso 12: sub-pasos
Un commit por sub-paso, probados en navegador a 390, 768 y 1280 px.

| Sub-paso | Qué | Estado |
|---|---|---|
| 12a | **Escritorio.** El diseño de móvil (390 px) no cambia. Con `md` (768 px) y `lg` (1024 px): contenedores fluidos, **barra de navegación superior** en `lg` (misma estética, ítem activo naranja), rejillas (Inicio en 2 columnas; Mascotas y Adopción en 3–4; Campañas con mapa junto a la lista), Bienvenida dividida (foto y acciones), formularios y ficha del QR en tarjeta centrada, panel de autoridad con lista y detalle lado a lado. Sección "Escritorio" en `DESIGN.md` | ✅ |
| 12b | **Imágenes** en lugar de los placeholders: portada de Bienvenida (perro y gato) y 9 fotos de adopción de ejemplo, de bancos gratuitos (Unsplash/Pexels), con atribución en `docs/ATRIBUCION-IMAGENES.md` y letrero visible "Ejemplo". WebP de ~400 px (<60 KB), con `width`/`height`, carga diferida y texto alternativo. Se conserva el ícono en los estados reales sin foto (mascota sin foto, mapa que no carga) | ✅ |
| 12c | **Accesibilidad:** axe-core en Playwright (todas las pantallas, 3 anchos), contraste 4.5:1 de cada combinación de color, áreas de 44 px, foco visible, etiquetas, encabezados y `prefers-reduced-motion`. **Resultado:** axe-core en 18 pantallas, 4 estados (ajustes, ficha de adopción, pasos 2 a 4 del reporte) y 3 anchos: de 20 hallazgos a 0. El naranja de acción pasó de `#C75F08` (4.14:1 con blanco) a `#B85506` (4.84:1); etiqueta de maltrato en `#991B1B` sobre rosa; encabezados de Salud en orden; enlaces "Regístrate" e "Inicia sesión" con 44 px; mapa con zoom de 44 px y en español; foco visible global y movimiento reducido. Foco con Tab comprobado en 12 pantallas. Pendiente: el panel de autoridad con datos reales no se auditó con axe (solo su estado vacío) | ✅ |
| 12d | **PWA sin conexión:** navegación sin red, caché de la estructura, fotos públicas de mascotas y mosaicos de OpenStreetMap (con límite de tamaño y edad), aviso "Sin conexión". **No se guarda en caché** nada privado (auth, API de tutores, cartillas, evidencia, URLs firmadas). División del paquete de ~614 KB con rutas diferidas | ⬜ |
| 12e | **Fotos huérfanas:** el cliente borra el archivo anterior al borrar una mascota o reemplazar su foto o la de la cartilla; script manual `supabase/scripts/huerfanas.sql` que lista las huérfanas de los 3 buckets para borrarlas con el CLI y confirmación. Sin función programada (queda para el piloto) | ⬜ |
| 12f | **Privacidad (LFPDPPP):** revisar el aviso contra los elementos legales (responsable, finalidades, datos, derechos ARCO, transferencias, cambios), minimización de datos, terceros (los mosaicos de OpenStreetMap ven la IP) y limpieza local al cerrar sesión. Resultado en `docs/PRIVACIDAD.md`. **No es validación legal:** el aviso sigue en borrador hasta que lo revise un abogado | ⬜ |

### Cómo dar el rol de autoridad (manual)
La persona primero crea su cuenta normal. Después, con el CLI vinculado y tu confirmación (`--yes`):

```
npx supabase db query --remote --yes "update public.perfiles set rol = 'autoridad' where id = (select id from auth.users where email = '<correo>')"
```

Para quitarlo, el mismo `UPDATE` con `'tutor'`. La cuenta de pruebas `manchitas@pruebas.com` tiene el rol; antes del piloto, quitárselo o borrarla y dar el rol a la cuenta real del Instituto.

### Pendientes que dejó el paso 10 (para antes del piloto)
- **Reactivar "Confirm email"** en Supabase (se desactivó para desarrollo) y configurar un correo propio (SMTP), porque el integrado envía muy pocos mensajes por hora.
- **Recuperación de contraseña** (no está).
- **Fotos huérfanas:** el paso 12e las limpia al borrar o reemplazar desde la app; falta una limpieza automática y borrar las de una cuenta eliminada.
- **Límite de reportes:** un error del servidor también gasta uno de los 3 intentos. Valorar no contarlo.
- **Sal del hash de IP** fija en el código (`limitar`); pasarla a un secreto si se quiere más protección.
- **Teléfono en el enlace de WhatsApp:** viaja dentro del `href` (inevitable con `wa.me`, no se muestra en pantalla). Valorar una redirección desde una función.
- **Datos de prueba:** se limpiaron en el paso 11 (reportes y evidencia). Queda la cuenta `manchitas@pruebas.com`.

## Lo que falta después del prototipo
- **Revisión legal** del aviso de privacidad y del resumen del Reglamento (cotejar con el texto oficial).
- Los pendientes del paso 10 de arriba (confirmar correo con SMTP propio, recuperar contraseña, límite de reportes, sal del hash de IP, `href` de WhatsApp).
- **Autoridad:** "marcar como canalizado" y cuenta real del Instituto.
- **Datos reales** de campañas, aliados y adopción (hoy son de ejemplo, con fotos de banco y sello "Verificado" de ejemplo), con verificación del Instituto o de un veterinario.
- **Cupones:** lógica de canje y cobro de comisión (fase posterior).
- Esquema de vacunación validado por un veterinario (hoy solo vacunas aplicadas y la próxima).
- Limpieza automática de fotos huérfanas y eliminación de cuenta (derechos ARCO).

## Metas del piloto
100 perros registrados · 2 comercios aliados · 1 reunión con el Instituto de Bienestar Animal.
