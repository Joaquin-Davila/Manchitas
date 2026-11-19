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
- 10 establecimientos, 4 anuncios patrocinados, 10 promociones, 20 reseñas (10 verificadas y 10 no; 5 con respuesta del establecimiento), 5 campañas, 8 adopciones y 12 publicaciones de la comunidad.
- Manchitas Solidario: 3 campañas publicadas con avance distinto (18 %, 62 % y 91 %), su desglose de gastos, actualizaciones y aportaciones **de demostración** (confirmadas, y una pendiente, una fallida y una reembolsada), más una campaña de la cuenta demo en revisión. **Ningún pago es real**: no hay pasarela y lo que se aporta desde la app queda pendiente y no suma al avance.
- Todo lo ficticio lleva `es_demo = true` y la interfaz lo rotula "Ejemplo". **No son certificados veterinarios, establecimientos reales ni personas reales.**

- Mascotas extraviadas de demostración, cada una en una etapa: **Max** (día 2, recibiendo avistamientos), **Oreo** (de la cuenta demo, día 4: ya tiene el aviso previo), **Nina** (día 6, con foro abierto que crea la propia automatización) y **Rocco** (localizado, con foro cerrado e historial). Más 4 reportes ciudadanos de ejemplo que ve el panel de autoridad.

- Chat: 5 personas de ejemplo (la rescatista, el dueño de la veterinaria y tres tutores) **sin contraseña, nadie puede iniciar sesión con ellas**, y 5 conversaciones de la cuenta demo: veterinaria, adopción (con foto), mascota extraviada (con ubicación aproximada), comunidad (archivada) y una sobre el reporte de Oreo, con mensajes sin leer y estados de lectura distintos. Más 8 notificaciones variadas.

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

## Moderación y propietarios (administración)

Estas operaciones se hacen a mano con SQL, igual que el rol de autoridad (ver `PLAN.md`). Con el CLI vinculado y tu confirmación (`--yes`):

```
-- Publicar (o rechazar) una campaña en revisión
npx supabase db query --remote --yes "update public.colectas set estado = 'publicada', publicada_en = now() where id = '<id>'"
npx supabase db query --remote --yes "update public.colectas set estado = 'rechazada', motivo_rechazo = '<motivo>' where id = '<id>'"

-- Dar el rol de moderador (puede llamar a moderar_colecta y verificar_resena desde la app)
npx supabase db query --remote --yes "update public.perfiles set rol = 'moderador' where id = (select id from auth.users where email = '<correo>')"

-- Hacer propietaria de un establecimiento a una persona (puede publicar promociones y responder reseñas)
npx supabase db query --remote --yes "update public.establecimientos set propietario_id = (select id from auth.users where email = '<correo>') where id = '<id>'"
```

La campaña "Un hogar temporal para gatitos rescatados" de la cuenta demo queda en revisión a propósito, para mostrar ese estado.

## Foros automáticos de mascotas extraviadas

- La función `public.procesar_extraviados()` la ejecuta `pg_cron` cada 30 minutos (trabajo `procesar-extraviados`). El día 4 de un reporte activo avisa al tutor y el día 5 abre el foro. No duplica nada aunque corra muchas veces, registra cada ejecución en `automatizacion_log` y captura los errores por reporte.
- Es una función SQL dentro de la base (no una Edge Function): no usa HTTP ni secretos y es atómica.
- Ver el trabajo y sus ejecuciones: `npx supabase db query --remote --read-only "select * from cron.job"` y `"select * from cron.job_run_details order by start_time desc limit 10"`.
- Ejecutarla a mano (con tu confirmación): `npx supabase db query --remote --yes "select public.procesar_extraviados()"`.
- Si por alguna razón `pg_cron` no estuviera activo: `create extension pg_cron with schema pg_catalog;` y `select cron.schedule('procesar-extraviados', '*/30 * * * *', 'select public.procesar_extraviados()');`.
- Volver a correr el seed **reinicia** solo los extraviados de demostración con fechas relativas a hoy, para que las etapas sigan vigentes.

## Chat y notificaciones

- Para probar el tiempo real con una sola cuenta, inserta un mensaje como una de las personas de ejemplo mientras tienes abierto Mensajes: `npx supabase db query --remote --yes "insert into public.chat_mensajes (conversacion_id, autor_id, tipo, texto, es_demo) values ('de000012-0000-4000-8000-000000000001', 'de000020-0000-4000-8000-000000000002', 'texto', 'Hola desde el servidor', true)"`. Debe aparecer sin recargar y subir el contador del encabezado.
- Volver a correr el seed recrea las conversaciones y las notificaciones de demostración (y deja los chats como al principio).
- Reportes de chat: los lee un moderador (`select * from chat_reportes where estado = 'abierto'`; para cerrar uno, `update chat_reportes set estado = 'revisado' where id = '<id>'`).
- La persona bloqueada no ve que la bloquearon: solo recibe un error al intentar escribir.
- Las ubicaciones que se comparten se redondean en el servidor a 2 decimales (~1 km) y no se guarda la posición exacta.
