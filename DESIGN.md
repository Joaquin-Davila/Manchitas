# Manchitas — guía de diseño

Dirección visual: **crema y marfil cálidos con acentos azul, turquesa y lavanda**, sobre la estructura inspirada en PeluCharm (encabezado, tarjetas, barra inferior flotante). Fondos y superficies claros y descansados; el azul marca la acción, el turquesa la identidad y la lavanda suave (`#d1cfe2`) acompaña en filtros, etiquetas y tarjetas secundarias. **Sin rosa.** Eslogan del encabezado: "Cuidamos cada paso de tu mejor amigo".
Pantalla de referencia original: **Inicio del tutor** (`reference/inicio.png`; la estructura sigue vigente, los colores no).

## Colores

> **Paleta crema + azul/turquesa + lavanda (noviembre 2026).** Los tokens de `src/styles/index.css` conservan sus nombres originales (`naranja`, `amarillo`, `crema`, `cafe`…); lee el nombre como un rol. `--color-white` está redefinido como marfil `#FFFDF8`.

### Base de la interfaz
| Uso | Token | Color |
|---|---|---|
| Fondo de pantalla (marfil cálido claro) | `crema` | `#F7F3EA` |
| Tarjetas, barra inferior y modales (marfil) | `white` | `#FFFDF8` |
| Navbar y encabezados (sin línea inferior; los separa una sombra difusa) | `amarillo` | `#FFFDF8` |
| Bordes de tarjetas y barra (arena definido) | `borde-calido`, `barra-borde` | `#E8DFCC` |
| Sombra de tarjeta | `tarjeta-sombra` | `0 3px 0 #EAE1CF` |
| Conectores de pasos, guiones, bordes de detalle | `amarillo-borde` | `#DCCFB4` (arena) |
| **Acción principal, pestaña activa, filtro activo, íconos** | `naranja` | `#386494` (es `#4d82bc` oscurecido: 6.0:1 con texto claro; `#4d82bc` solo da 4.0:1) |
| Sombra del botón, enlaces y foco | `naranja-sombra` | `#2C5582` |
| Títulos y texto principal (carbón cálido) | `cafe` | `#2D2A26` (12.9:1) |
| Texto secundario | `cafe-suave` | `#625B53` (6.0:1 sobre el fondo) |

### Crema y arena: áreas secundarias
| Uso | Token | Color |
|---|---|---|
| Panel de la mascota, "Cada huella cuenta", tarjeta "Beneficios" | `amarillo-suave` | `#F3EBD9` |
| Filas del resumen de cartilla ("Su cuidado importa") | `crema-clara` | `#F7F1E4` |
| Íconos de salud y recordatorios, franja con nombre de mascota | `salud-fondo`, `aviso-fondo`, `franja` | `#F0E6D2` (texto de la franja `#3D372F`) |
| Huellitas decorativas, hueco de foto sin imagen | `huella`, `foto-vacia` | `#E2D3B2`, `#EEE5D3` |

### Lavanda: complemento en todas las vistas
| Uso | Token | Color |
|---|---|---|
| Tarjeta "Cerca de ti", etiquetas "Esterilización" y "Reportes ciudadanos", ícono de "Su cuidado importa", acceso de reportes en Bienvenida | `coral-suave` | `#ECEBF4` |
| Filtros inactivos (Campañas, Adopción), avisos (Privacidad, Reglamento, formulario de mascota), badges secundarios (cupones, autoridad, "Pendiente de identificación"), ícono de recordatorio | `aviso-fondo` | `#ECEBF4` |
| Tarjetas de dato y etiquetas de cartilla y cupones | `rosa` | `#ECEBF4` |
| Acento sutil (corazón del contador de mascotas, ruta punteada de "Cerca de ti") | `coral-medio` | `#D1CFE2` |

Sobre `#ECEBF4`: texto 12:1, secundario 5.7:1, azul 5.2:1, turquesa 4.9:1, error 5.5:1. Usa la lavanda solo en superficies secundarias pequeñas: nunca en el fondo general, el encabezado ni el botón principal.

### Turquesa: identidad
| Uso | Color |
|---|---|
| Folio, badges de estado ("Registrada", "Identificado"), verificación, eslogan del encabezado | trazo `salud-trazo` `#2C6E78` (es `#7ec4cf` oscurecido) sobre `menta-suave` `#E3F1F3` (5.0:1) |
| Turquesa de superficie (tarjeta "Adopciones", río del mapa ilustrado) | `menta` `#7EC4CF` |

### Otros apoyos
| Uso | Fondo |
|---|---|
| `durazno` (arena), `lima`, `celeste` | `#F2E8D5`, `#E3F1F3`, `#E3EDFA` |
| Recuadro de la foto de Bienvenida | `petroleo` `#2C4A6E` (azul profundo) al 85 % |

### Paleta oficial de marca (se conserva para logo y acentos)
Azul profundo `#1E3A8A`, azul acción `#0284C7`, celeste `#38BDF8`, turquesa `#0D9488`, coral `#EF4444`.
- **Coral `#EF4444` se reserva para alertas y reportes** de maltrato o urgencias. Si se usa como fondo de botón, el texto debe ser blanco y grueso, y verificar el contraste.
- El azul se usa como acento secundario (por ejemplo, el mapa o la información de salud), no como color de botones principales.

## Tipografía
- **Títulos y números destacados:** Poppins 600 y 700.
- **Texto, etiquetas y botones:** Inter 400, 500 y 600.
- Escala usada: título de pantalla 24 px, saludo 18 px, nombre de mascota 22 px, número en tarjeta 20 px, texto de tarjeta 13–14 px, etiqueta 11 px.

## Formas y espacio
- Tarjetas grandes: radio 20–22 px. Tarjetas de dato: radio 16 px.
- Botón principal: píldora (radio 25 px), alto 50 px, texto blanco 15 px peso 600, sombra inferior sólida de 4 px.
- Encabezado: esquinas inferiores redondeadas a 28 px.
- Barra inferior: píldora de 36 px de radio.
- Márgenes laterales de pantalla: 20 px. Separación entre bloques: 10–12 px.
- Sin gradientes, sin bordes laterales de color en tarjetas, sin emojis como imágenes.

## Componentes

### Encabezado
Fondo marfil `#FFFDF8`, **sin línea inferior** (lo separa del contenido una sombra difusa) y esquinas inferiores redondeadas. A la izquierda el **logo sin título** (`logo-manchitas-sin-titulo.png`, recortado a la cabeza del perro y la lupa, aprox. 84 × 66 px, con `mix-blend-mode: multiply` para fundirse con el fondo, sin caja blanca). Junto al logo, una línea pequeña con la marca **"Manchitas"** en carbón cálido y, desde `md`, el eslogan "Cuidamos cada paso de tu mejor amigo" en el acento turquesa; debajo, el **nombre de la pantalla** (Inicio, Salud, Campañas, Adopción, Reportes) en Poppins 700 de 24 px. A la derecha un botón circular de 44 px con el ícono de ajustes sobre el fondo base.
No poner el eslogan debajo del título.

### Barra de navegación inferior
Recuadro blanco **flotante** con borde `#E8DFCC` y sombra `0 4px 0 #EAE1CF`, margen lateral 14 px. 5 íconos de trazo azul `#386494`: Mascotas, Comunidad, **Inicio** (centro), Salud, Avisos. El ítem activo es un **círculo azul `#386494` de 68 px** con ícono blanco, borde blanco de 4 px y desplazado hacia arriba unos 18 px. Cada ícono tiene `aria-label`.

### Tarjeta de mascota
Foto grande arriba (150 px de alto) y franja celeste debajo con el nombre a la izquierda y el folio (ej. `Folio MCH-02841`) a la derecha. Si no hay foto, mostrar el hueco `#F3DDB0` con una huella.

### Tarjetas de dato (4 en fila)
Fondo de color de apoyo, etiqueta de 11 px peso 600 y valor en Poppins 700. Rosa, durazno, lima y celeste, en ese orden.

### Tarjeta de aviso
Tarjeta blanca con ícono en cuadro de 44 px de colores suaves, título en peso 600 y detalle en texto secundario. Se usa para recordatorios y campañas.

### Etiquetas y filtros
Píldoras con fondo de color de apoyo, texto oscuro, 11–13 px. El filtro activo cambia a azul `#386494` con texto claro.

## Logo
- Archivo con título y eslogan: para pantalla de bienvenida e inicio de sesión (tamaño grande).
- Archivo sin título: para el encabezado de las pantallas internas.
- El logo es de línea azul oscuro sobre blanco. En fondos de color usar `mix-blend-mode: multiply`, nunca una caja blanca alrededor.

## Pantalla de bienvenida, inicio de sesión y registro (estilo PeluCharm)
- Bienvenida: foto de un perro y un gato, logo grande, botón azul "Iniciar sesión" y botón blanco "Regístrate".
- Formularios con **encabezado curvo** con patrón de huellas y huesos en tono claro, título centrado, campos de línea, botón azul "Siguiente", registro en pasos numerados con el número dentro de un círculo.

## Reglas para pantallas nuevas
- Cada pantalla: encabezado claro con logo, marca y título, contenido sobre el fondo base, barra inferior flotante.
- Máximo un botón principal (azul) por pantalla. Las alertas usan coral.
- Mantener los textos cortos y en español. Datos de ejemplo realistas.
- Pantalla pública del QR: mismo estilo, sin la barra inferior (la ve un desconocido), sin la palabra "perdido".
- Contraste mínimo 4.5:1 en texto y 44 px de área táctil.
- Texto de error: `#B91C1C` sobre el fondo base o blanco; sobre fondo rosa (etiquetas) usar `#991B1B` (5.4:1). El coral `#EF4444` es solo para íconos y detalles, nunca para texto ni como fondo con texto blanco (3.76:1).
- Foco visible: contorno de 2 px en `#2C5582` con separación de 2 px en todo lo interactivo (regla global en `index.css`).
- Con `prefers-reduced-motion` las transiciones se anulan (regla global).
- Excepción documentada: los dos enlaces de atribución del mapa (OpenStreetMap y Leaflet) miden 36 px de alto; son texto en línea y superan los 24 px de WCAG 2.2.

## Escritorio (paso 12a)
El diseño de móvil (390 px) no cambia. Se adapta con dos puntos de quiebre de Tailwind: `md` (768 px) y `lg` (1024 px).
- **Encabezado:** el fondo del encabezado ocupa todo el ancho; su contenido se alinea con el del cuerpo (390 px en móvil, 720 px desde `md`, 1120 px desde `lg`).
- **Navegación:** hasta 1023 px, la barra flotante inferior. Desde `lg`, una **barra superior** dentro del encabezado (Inicio, Mascotas, Comunidad, Salud, Avisos): píldoras con ícono y texto; la activa va en azul `#386494` con texto claro. La barra inferior se oculta.
- **Anchos del cuerpo:** una columna de 720 px para lectura y formularios. Las pantallas con rejillas (Inicio, Mascotas, Comunidad) usan hasta 1120 px desde `lg`.
- **Rejillas:** Inicio en 2 columnas (mascota y datos a la izquierda; avisos y botón a la derecha); Mascotas en 2 y 3 columnas; Adopción en 3 y 4; Campañas con el mapa junto a las listas.
- **Pantallas sin barra** (bienvenida, sesión, registro, QR público, reportes): tarjeta centrada de 480 px desde `md`, con esquinas de 32 px. La bienvenida se abre en dos columnas (foto y acciones) desde `lg`.
- **Panel de autoridad:** desde `lg`, lista a la izquierda y detalle fijo a la derecha; en pantallas menores, el detalle va en un modal.
- Las áreas táctiles de 44 px y el contraste de 4.5:1 aplican igual en escritorio.

## Aviso "Sin conexión"
Franja fija arriba (`sticky`, fondo `#2D2A26`, texto claro 13 px peso 600, ícono de wifi tachado) que solo aparece sin red. Ícono y texto, nunca solo color. `role="status"` y oculta al imprimir.
