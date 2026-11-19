# Despliegue en Vercel (demostración)

La app es estática (Vite): Vercel solo sirve `dist/`. Todo lo demás (base de datos, autenticación, archivos,
tiempo real, automatización de foros) ya vive en Supabase. `vercel.json` ya está en el repositorio: reenvía
todas las rutas a `index.html` (para que `/m/<token>` y `/mensajes/...` abran al recargar o al escanear un
QR) y evita que el navegador guarde en caché el service worker.

## 1. Importar el proyecto (lo más fácil: con GitHub)

1. En vercel.com → **Add New… → Project** → elige el repositorio `Joaquin-Davila/Manchitas`.
2. Vercel detecta Vite. No cambies nada: `npm run build`, salida `dist`.
3. Antes de pulsar *Deploy*, abre **Environment Variables** y agrega (para *Production* y *Preview*):

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | la de tu proyecto (`https://snipemktxofpzveixmvm.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | la clave **anon/public** (nunca la `service_role`) |
| `VITE_DEMO_EMAIL` | `demo@manchitas.mx` |
| `VITE_DEMO_PASSWORD` | la contraseña de la cuenta demo (es pública a propósito) |
| `VITE_URL_PUBLICA` | el dominio final, p. ej. `https://manchitas.vercel.app` (sin diagonal al final) |

   Sin `VITE_SUPABASE_*` la app abre en modo local y no muestra nada de la comunidad. Sin `VITE_DEMO_*` no
   aparece el panel de acceso demo. Los valores que empiezan con `VITE_` quedan dentro del paquete público:
   por eso solo van la clave *anon* y la contraseña de la cuenta demo, nunca un secreto.
4. **Deploy**. Cada `git push` a `main` vuelve a desplegar solo.

> `VITE_URL_PUBLICA` es opcional: si la dejas vacía, el QR usa el dominio desde el que se abre la app (en
> producción, el correcto). Ponla si quieres fijar un dominio y que los QR impresos nunca dependan de la URL
> de una vista previa.

### Alternativa con la CLI
```
npx vercel login          # abre el navegador para iniciar sesión
npx vercel link           # une esta carpeta con un proyecto de Vercel
npx vercel env add VITE_SUPABASE_URL production      # repetir con cada variable de la tabla
npx vercel --prod
```

## 2. Configurar Supabase para el dominio nuevo (obligatorio para recuperar contraseña)

En Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://<tu-dominio>`
- **Redirect URLs**: agrega `https://<tu-dominio>/restablecer` (y `http://localhost:5173/restablecer` para desarrollo).

El resto funciona sin tocar nada (la API de Supabase acepta cualquier origen).

## 3. Que el QR llegue al celular de la persona que escanea

El QR codifica `https://<tu-dominio>/m/<token largo>`. Al escanearlo con la cámara del teléfono se abre la
ficha pública (sin cuenta, sin decir "perdido", sin mostrar el teléfono) y el botón de WhatsApp contacta al
tutor. Para que ese botón llegue a alguien durante la presentación:

1. En `.env` agrega `DEMO_WHATSAPP=` con **10 dígitos de un número que tengas a la mano** (sin lada
   internacional, p. ej. `6621234567`). No lleva `VITE_` porque no va en la app, solo en el seed.
2. Corre `node supabase/seed/demo.mjs --aplicar` (con tu confirmación, escribe en producción). Esto pone ese
   número como WhatsApp de la cuenta demo. El número aparece solo dentro del enlace del botón, nunca en pantalla.

Sin ese paso el botón abre WhatsApp con un número inexistente (`0000000000`).

## 4. Lista de comprobación el día de la presentación

- Abre la URL publicada en el celular y en la computadora; entra con **Acceso de demostración**.
- Corre el seed el día anterior: refresca las fechas (campañas, vacunas, foros de extraviadas) y deja los chats
  como al principio.
- Mascotas → una mascota → **Ver QR** → escanéalo con la cámara de otro teléfono.
- Si cambias algo en el código y vuelves a desplegar, el service worker se actualiza solo; si un navegador
  muestra la versión vieja, F12 → Application → Service Workers → *Unregister* y recarga.
- Offline: abre la app una vez con internet y prueba el modo avión; verás el aviso "Sin conexión".
