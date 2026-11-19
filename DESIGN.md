# Manchitas — guía de diseño

Dirección visual: **cálida y cercana, inspirada en PeluCharm** (naranja y crema, encabezado amarillo, tarjetas de colores, barra inferior flotante). Debe sentirse como una app de mascotas, no como un trámite.
Pantalla de referencia ya diseñada: **Inicio del tutor** (`reference/inicio.png`). Las demás pantallas deben seguir el mismo lenguaje.

## Colores

### Base de la interfaz
| Uso | Color |
|---|---|
| Fondo de pantalla (crema) | `#FFF4DC` |
| Encabezado (amarillo) | `#FBD66E` |
| Borde/sombra inferior del encabezado | `#F2C24E` |
| Acción principal (naranja) | `#B85506` |
| Sombra del botón naranja | `#8F4304` |
| Texto principal (café oscuro) | `#3B2A12` |
| Texto secundario | `#5A4217` |
| Tarjeta | `#FFFFFF` con sombra `0 3px 0 #EBD9AE` |
| Borde de barra inferior | `#F2E2B8` |

El naranja `#B85506` da **4.84:1** con texto blanco (WCAG AA pide 4.5:1). Antes era `#C75F08`, que daba 4.14:1 y no cumplía; se oscureció en el paso 12c. No lo aclares.

### Colores de apoyo (tarjetas y etiquetas)
| Uso | Fondo |
|---|---|
| Rosa (vacunas) | `#F8C4C8` |
| Durazno (pendiente) | `#FFB985` |
| Lima (cupones) | `#D6E86B` |
| Celeste (estado) | `#A9E3EE` |
| Franja con nombre de mascota | `#BDEAF2` con texto `#24505B` |
| Ícono salud/campañas | fondo `#D4F0EC`, trazo `#0B6F66` |
| Ícono recordatorios | fondo `#FFE6C7`, trazo `#B85506` |
| Hueco de foto sin imagen | `#F3DDB0`, huella `#D9A441` |

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
Fondo amarillo con esquinas inferiores redondeadas. A la izquierda el **logo sin título** (`logo-manchitas-sin-titulo.png`, recortado a la cabeza del perro y la lupa, aprox. 84 × 66 px, con `mix-blend-mode: multiply` para fundirse con el amarillo, sin caja blanca). Junto al logo, el **nombre de la pantalla** (Inicio, Salud, Campañas, Adopción, Reportes) en Poppins 700 de 24 px. A la derecha un botón circular de 44 px con el ícono de ajustes sobre fondo crema.
No poner el eslogan debajo del título.

### Barra de navegación inferior
Recuadro blanco **flotante** con borde `#F2E2B8` y sombra `0 4px 0 #EBD9AE`, margen lateral 14 px. 5 íconos de trazo naranja: Mascotas, Comunidad, **Inicio** (centro), Salud, Avisos. El ítem activo es un **círculo naranja de 68 px** con ícono blanco, borde blanco de 4 px y desplazado hacia arriba unos 18 px. Cada ícono tiene `aria-label`.

### Tarjeta de mascota
Foto grande arriba (150 px de alto) y franja celeste debajo con el nombre a la izquierda y el folio (ej. `Folio MCH-02841`) a la derecha. Si no hay foto, mostrar el hueco `#F3DDB0` con una huella.

### Tarjetas de dato (4 en fila)
Fondo de color de apoyo, etiqueta de 11 px peso 600 y valor en Poppins 700. Rosa, durazno, lima y celeste, en ese orden.

### Tarjeta de aviso
Tarjeta blanca con ícono en cuadro de 44 px de colores suaves, título en peso 600 y detalle en texto secundario. Se usa para recordatorios y campañas.

### Etiquetas y filtros
Píldoras con fondo de color de apoyo, texto oscuro, 11–13 px. El filtro activo cambia a naranja con texto blanco.

## Logo
- Archivo con título y eslogan: para pantalla de bienvenida e inicio de sesión (tamaño grande).
- Archivo sin título: para el encabezado de las pantallas internas.
- El logo es de línea azul oscuro sobre blanco. En fondos de color usar `mix-blend-mode: multiply`, nunca una caja blanca alrededor.

## Pantalla de bienvenida, inicio de sesión y registro (estilo PeluCharm)
- Bienvenida: foto de un perro y un gato, logo grande, botón naranja "Iniciar sesión" y botón blanco "Regístrate".
- Formularios con **encabezado curvo** con patrón de huellas y huesos en tono claro, título centrado, campos de línea, botón naranja "Siguiente", registro en pasos numerados con el número dentro de un círculo.

## Reglas para pantallas nuevas
- Cada pantalla: encabezado amarillo con logo y título, contenido sobre crema, barra inferior flotante.
- Máximo un botón naranja principal por pantalla. Las alertas usan coral.
- Mantener los textos cortos y en español. Datos de ejemplo realistas.
- Pantalla pública del QR: mismo estilo, sin la barra inferior (la ve un desconocido), sin la palabra "perdido".
- Contraste mínimo 4.5:1 en texto y 44 px de área táctil.
- Texto de error: `#B91C1C` sobre crema o blanco; sobre fondo rosa (etiquetas) usar `#991B1B` (5.4:1). El coral `#EF4444` es solo para íconos y detalles, nunca para texto ni como fondo con texto blanco (3.76:1).
- Foco visible: contorno de 2 px en `#8F4304` con separación de 2 px en todo lo interactivo (regla global en `index.css`).
- Con `prefers-reduced-motion` las transiciones se anulan (regla global).
- Excepción documentada: los dos enlaces de atribución del mapa (OpenStreetMap y Leaflet) miden 36 px de alto; son texto en línea y superan los 24 px de WCAG 2.2.

## Escritorio (paso 12a)
El diseño de móvil (390 px) no cambia. Se adapta con dos puntos de quiebre de Tailwind: `md` (768 px) y `lg` (1024 px).
- **Encabezado:** el fondo amarillo ocupa todo el ancho; su contenido se alinea con el del cuerpo (390 px en móvil, 720 px desde `md`, 1120 px desde `lg`).
- **Navegación:** hasta 1023 px, la barra flotante inferior. Desde `lg`, una **barra superior** dentro del encabezado (Inicio, Mascotas, Comunidad, Salud, Avisos): píldoras con ícono y texto; la activa va en naranja con texto blanco. La barra inferior se oculta.
- **Anchos del cuerpo:** una columna de 720 px para lectura y formularios. Las pantallas con rejillas (Inicio, Mascotas, Comunidad) usan hasta 1120 px desde `lg`.
- **Rejillas:** Inicio en 2 columnas (mascota y datos a la izquierda; avisos y botón a la derecha); Mascotas en 2 y 3 columnas; Adopción en 3 y 4; Campañas con el mapa junto a las listas.
- **Pantallas sin barra** (bienvenida, sesión, registro, QR público, reportes): tarjeta centrada de 480 px desde `md`, con esquinas de 32 px. La bienvenida se abre en dos columnas (foto y acciones) desde `lg`.
- **Panel de autoridad:** desde `lg`, lista a la izquierda y detalle fijo a la derecha; en pantallas menores, el detalle va en un modal.
- Las áreas táctiles de 44 px y el contraste de 4.5:1 aplican igual en escritorio.

## Aviso "Sin conexión"
Franja fija arriba (`sticky`, fondo `#3B2A12`, texto crema 13 px peso 600, ícono de wifi tachado) que solo aparece sin red. Ícono y texto, nunca solo color. `role="status"` y oculta al imprimir.
