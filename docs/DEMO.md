# Cuenta y datos de demostración

Para que el jurado (o cualquier persona) explore Manchitas con datos completos sin tocar los de nadie.

## La cuenta

| | |
|---|---|
| Correo | `demo@manchitas.mx` |
| Contraseña | la de `VITE_DEMO_PASSWORD` en `.env` |
| Nombre | Adriana Demo (tutor, Hermosillo, Sonora) |

La contraseña es **pública a propósito**: se muestra en la pantalla de inicio de sesión (sección "Acceso de demostración", con un botón que entra con un clic). Por eso la cuenta **solo tiene datos de ejemplo**, y por RLS no puede ver nada de otras personas (solo lo suyo y los catálogos de la comunidad, que son de solo lectura).

No uses esta contraseña para nada más. Para cambiarla, edita `VITE_DEMO_PASSWORD` en `.env` y vuelve a correr el seed (abajo).

## Qué trae

- 9 mascotas: 4 perros (Pony, Chapito, Lupe, Emo) y 5 gatos (Coco, Cenizas, Félix, Oreo, Luna), con folio y QR, cartilla y vacunas con estados distintos (próximas, una vencida y una lejana). Los años de nacimiento de Coco, Pony, Chapito, Lupe, Emo y Félix son aproximados; raza y señas de las 9, y la edad de Cenizas, Oreo y Luna, son provisionales hasta confirmar los datos reales.
- Las fotos van en `supabase/seed/fotos/` como `coco.jpg`, `pony.jpg`, `chapito.jpg`, `lupe.jpg`, `emo.jpg`, `cenizas.jpg`, `felix.jpg`, `oreo.jpg` y `luna.jpg` (JPEG, máx. 2 MB). Sin archivo, la mascota se muestra sin foto.
- 10 establecimientos, 4 anuncios patrocinados, 5 campañas, 8 adopciones y 12 publicaciones de la comunidad.
- Todo lo ficticio lleva `es_demo = true` y la interfaz lo rotula "Ejemplo". **No son certificados veterinarios, establecimientos reales ni personas reales.**

Pendiente en los bloques siguientes: reseñas, donaciones, chat, notificaciones, extraviadas y foros.

## Crear o restablecer la cuenta y los datos

Requisitos: el CLI de Supabase vinculado al proyecto (`npx supabase link`) y estas variables en `.env` (fuera de git): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_EMAIL=demo@manchitas.mx` y `VITE_DEMO_PASSWORD` (mínimo 8 caracteres).

```
node supabase/seed/demo.mjs              # simulacro: no escribe nada
node supabase/seed/demo.mjs --aplicar    # escribe en el proyecto remoto
```

- Es **repetible**: usa ids fijos y `on conflict`, así que no duplica nada.
- Cada ejecución **refresca las fechas relativas** (campañas, anuncios, próximas vacunas), para que la demo siempre se vea vigente. Conviene correrlo el día antes de la presentación.
- Volver a correrlo **restablece la contraseña** de la cuenta demo a la de `.env`.
- No usa la clave `service_role`: el SQL lo ejecuta el CLI vinculado y las fotos las sube la propia cuenta demo.
- La contraseña se sustituye en un archivo temporal que se borra al terminar; no queda en el repositorio.

## En el sitio publicado

Las variables `VITE_DEMO_EMAIL` y `VITE_DEMO_PASSWORD` deben existir también en la configuración de despliegue (variables de entorno del hosting) para que el panel de acceso demo aparezca. Sin ellas, el panel no se muestra y la cuenta sigue existiendo.

## Configuración externa necesaria (Supabase)

- **Recuperar contraseña:** en el panel de Supabase, Authentication → URL Configuration, agrega la URL del sitio y `https://<tu-dominio>/restablecer` (y `http://localhost:5173/restablecer` para desarrollo) a las *Redirect URLs*. Sin eso el enlace del correo no vuelve a la app.
- **Correos:** el servicio integrado de Supabase envía muy pocos mensajes por hora. Para un piloto, configura un SMTP propio (ver pendientes del paso 10 en `PLAN.md`).

## Separación entre demo y datos reales

Las filas de demostración están en las mismas tablas que las reales, marcadas con `es_demo = true`. Todas las personas con sesión las ven (decisión del equipo). Cuando haya usuarios reales de verdad, se pueden ocultar o borrar con una sola consulta (`delete from ... where es_demo`), o filtrar en las políticas de lectura.
