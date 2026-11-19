# Parte 1 — Cifras con discrepancias

Fuentes cruzadas: `guion-y-preguntas.md` (guion), `Metodología - Manchitas (1).pdf` (metodología, incluidas sus figuras: canvas, cronograma, diagramas, organigrama, FODA, PESTEL y propuesta de valor), `Formato_CBIT-04-presentacion_ejecutiva.pptx` (formato) y el producto real (`CLAUDE.md`, `docs/PLAN.md` y el código).

Convención: **[doc]** es lo que dice un documento. **[supuesto]** es algo que yo propongo y no está comprobado. Los cálculos son míos, a partir de las cifras de la metodología, y se pueden rehacer con la fórmula que indico.

---

## 0. Lo más urgente (resumen)

1. La nómina de $100–120 mil mensuales (y 4 laptops y mobiliario que probablemente ya tienen) infla el presupuesto. Sin ellas, el gasto mensual es de **$11–17 mil** en el piloto mínimo o **$23.5–29.5 mil** con espacio de trabajo.
2. Con esos gastos, el equilibrio pide **100 a 460 placas al mes** (escenarios sin nómina) o **1,100 a 2,300** (con nómina). Las metas de perros (100, 2,000 y 10,000) no llegan a esos ritmos ni vendiendo una placa a cada perro nuevo.
3. El margen de placas "superior al 65 %" **no se cumple** con precio $99 y costo $35: da 64.6 %.
4. La comisión por cupón dice cosas distintas en la Fase 2 (5–8 % o $15–30) y en el canvas (5–10 %).
5. El GPS sigue en 6 lugares de la metodología, aunque la decisión vigente es sin GPS.
6. Los diagramas piden iniciar sesión para reportar y para consultar una ficha, y muestran el teléfono. El producto hace lo contrario en los tres casos.
7. El diagrama 1 dice que la cartilla se comparte con las autoridades. En el producto la autoridad **nunca** ve cartillas.
8. El cronograma llama "Huellitas" al proyecto y pone el prototipo en las semanas 5–12. Hoy (semana 3) ya existe, pero las etapas de validación, trámites y acuerdos no avanzaron.

---

## 1. Inversión, capital de trabajo y gastos mensuales

Las sumas de las tablas de la metodología sí cuadran por dentro (revisé las cuatro). Lo que no cuadra es lo que se compara entre ellas y lo que incluyen.

| Dónde aparece | Qué dice | Por qué choca | Propuesta y supuesto |
|---|---|---|---|
| Metodología, Fase 6, Tabla 4 (gastos mensuales) | Total mensual **$123,500–$149,500**, con "apoyos o nómina del equipo" de $100,000–$120,000 | La Tabla 3 (capital de trabajo) usa solo **$22,500–$27,500** al mes. Son 5 veces menos. Dos tablas contiguas describen costos de operación distintos | Presentar **dos escenarios** (ver tabla de abajo). La nómina pasa a "techo futuro, condicionado a ingresos" **[supuesto: el equipo trabaja sin sueldo en el piloto; hay que confirmarlo entre los cuatro]** |
| Metodología, Fase 6, "Proyecciones financieras" | Capital de trabajo trimestral de $67,500–$82,500 "para cubrir gastos mensuales de $123,500–$149,500" | Tres meses de $123,500–$149,500 son **$370,500–$448,500**, no $67,500–$82,500. La frase se contradice con sus propias cifras | Corregir el texto: el capital de trabajo cubre la operación **sin nómina**. Es el mismo arreglo del punto anterior |
| Tabla 3 contra Tabla 4 | "Gastos operativos menores" $2,000–$3,000 (Tabla 3) y "otros gastos administrativos y licencias" $3,000–$5,000 (Tabla 4) | Es el mismo renglón con dos montos. Explica los $1,000–$2,000 de diferencia entre $22,500–$27,500 y $23,500–$29,500 | Usar uno solo: **$3,000–$5,000**. El total mensual sin nómina queda en **$23,500–$29,500** |
| Metodología, Tabla 2, "Equipo de cómputo y software especializado (4 laptops...)" | $110,000–$130,000 (≈ $27,500–$32,500 por laptop) | Es el renglón más grande (≈ 60 % de la inversión) y tú indicas que el equipo probablemente ya las tiene. Si ya existen, no es una inversión nueva | **Quitarlo de la inversión nueva** y, si se quiere, mostrarlo como aportación en especie de los socios **[supuesto: hay que confirmar que las 4 laptops existen y son del equipo]** |
| Metodología, Tabla 2, "Mobiliario y equipo de oficina (... decoración básica)" | $25,000–$30,000 | La propia Fase 7 dice que Manchitas "no requiere un local abierto al público". Además se paga renta de espacio de $12,500 al mes | Quitarlo del piloto **[supuesto: se trabaja en remoto o en espacios de la universidad; hay que confirmar si la universidad los presta]** |
| Metodología, Tabla 2 | La inversión no incluye el **inventario inicial de placas**, aunque el canvas lista "Stock de placas metálicas con QR" como recurso clave | Falta un costo que sí se necesita para vender placas | Agregar el inventario del piloto: 100 placas × $20–$35 = **$2,000–$3,500** (con el costo unitario del propio canvas) |
| Metodología, Fase 6 y Fase 4 (organigrama, Figura 3) | La Fase 4 habla de un equipo de 4 personas. El organigrama dibuja **14 puestos**: 4 directivos más 10 subordinados (desarrollador web, diseñador UX/UI, soporte, infraestructura, contabilidad, gestión de oficina, servicios generales, gestor de cuentas, marketing digital y atención a clientes) | Con 14 puestos, $100–$120 mil de nómina serían ≈ $7,000–$8,600 por persona. Con 4, serían $25,000–$30,000. Una cifra no puede justificar las dos plantillas. Además, el formato CBIT-04 pregunta cuántos empleos se generan | Decir una sola cosa: "4 socios hoy; los 10 puestos del organigrama son de crecimiento y se contratan cuando haya ingresos" **[supuesto]** |
| Metodología, Fase 6, Tabla 2 | Inversión total **$176,000–$218,000** | Todo depende de las tres filas anteriores | Inversión nueva realista en el piloto: **≈ $37,000–$57,000** (cálculo abajo) |

**Cálculo de la inversión nueva** (todo **[supuesto]** salvo lo que marco como [doc]):

| Concepto | Costo |
|---|---|
| Plataforma, licencias y hosting inicial [doc, se conserva] | $25,000–$35,000 |
| Registro de marca, trámites legales y constitución [doc, "por cotizar"] | $6,000–$9,000 |
| Dominio, hosting y certificado SSL [doc] | $2,500–$4,000 |
| Inventario inicial de 100 placas (nuevo) | $2,000–$3,500 |
| **Subtotal** | **$35,500–$51,500** |
| Contingencia del 5 % (mínimo) al 10 % (máximo) | +$1,775 a +$5,150 |
| **Inversión nueva** | **≈ $37,000–$57,000** |

Observaciones: el prototipo ya está construido, así que los $25,000–$35,000 de "desarrollo de la plataforma" pueden ser menores. No lo bajé porque no sé qué costos de producción tendrá la base de datos y el almacenamiento más allá del plan gratuito **[supuesto, por cotizar]**. Los $6,000–$9,000 de trámites legales también están "por cotizar".

**Dos escenarios de gasto mensual que propongo mostrar:**

| Escenario | Qué incluye | Gasto mensual |
|---|---|---|
| A. Piloto mínimo (0–6 meses) | Sin nómina, sin renta. Solo marketing ($8,000–$12,000) y administrativos y licencias ($3,000–$5,000) | **$11,000–$17,000** |
| B. Piloto con espacio | A más espacio de trabajo y servicios ($12,500) | **$23,500–$29,500** |
| C. Techo de la metodología | B más nómina de $100,000–$120,000 | **$123,500–$149,500** |

Capital de trabajo a 3 y 6 meses con esos gastos: A = $33,000–$51,000 y $66,000–$102,000. B = $70,500–$88,500 y $141,000–$177,000. La Tabla 3 de la metodología ($67,500–$82,500 y $135,000–$165,000) queda cerca del escenario B.

Necesidad total del piloto de 6 meses (inversión nueva + capital de trabajo): escenario A ≈ **$103,000–$159,000**; escenario B ≈ **$178,000–$234,000**.

---

## 2. Punto de equilibrio contra las metas

**Fórmula:** placas al mes = gasto mensual ÷ margen por placa. Canjes al mes = gasto mensual ÷ comisión por canje.
Margen por placa = precio − costo: **$64** (precio $99, costo $35, el peor caso), **$87** (precio medio $114.50, costo medio $27.50) o **$110** (precio $130, costo $20, el mejor caso). Comisión por canje: $15 a $30 (**$22.50** de punto medio) [doc, Fase 2].

Los costos de la placa son del canvas y de la Fase 2. La metodología marca al taller de placas como "**por cotizar**", así que el costo de $20–$35 no está confirmado. Tampoco incluyo comisiones de pago ni envíos **[supuesto: no hay datos]**.

| Escenario | Gasto mensual | Placas al mes (mejor / medio / peor margen) | Canjes de cupón al mes (mejor / medio / peor) |
|---|---|---|---|
| A. Piloto mínimo | $11,000–$17,000 | **100** / **161** / **266** | 367 / 622 / 1,133 |
| B. Piloto con espacio | $23,500–$29,500 | **214** / **305** / **461** | 783 / 1,178 / 1,967 |
| C. Techo con nómina | $123,500–$149,500 | **1,123** / **1,569** / **2,336** | 4,117 / 6,067 / 9,967 |

(Mejor = gasto bajo del escenario y margen o comisión alta. Medio = punto medio del gasto con margen $87 o comisión $22.50. Peor = gasto alto con margen $64 o comisión $15.)

**Contra las metas de perros** [doc, Fase 2 y CLAUDE.md]: 100 perros en el piloto (6 meses), 2,000 a 24 meses y 10,000 a 3–5 años.

| Tramo | Perros nuevos por mes que implica | Placas por mes si el **100 %** de los perros nuevos compra una | Placas por mes si compra el **30 %** **[supuesto de compra]** |
|---|---|---|---|
| Piloto (100 perros en 6 meses) | ≈ 17 | 17 | ≈ 5 |
| De los 6 a los 24 meses (a 2,000) | ≈ 106 | 106 | ≈ 32 |
| De los 24 a los 60 meses (a 10,000) | ≈ 222 | 222 | ≈ 67 |

**Lectura:** incluso si todos los perros nuevos compraran una placa, el escenario A (161 al mes en el caso medio) solo se alcanza después de los 2,000 perros (≈ 222 al mes), y el escenario B (305 al mes) no se alcanza ni en ese tramo. Con el 30 % de compra, que es solo una hipótesis, ni al ritmo de 10,000 perros se cubre el escenario B por placas. La nómina completa (escenario C) no se cubre con ninguna de estas metas. Los cupones aportan poco: a $22.50 por canje, cubrir el escenario B pide ≈ 1,178 canjes al mes, es decir, que ≈ 59 de cada 100 perros de una base de 2,000 canjeen un cupón cada mes.

**Propuesta:**
- Decir que la meta del piloto es **validar que la gente compra placas y los comercios canjean cupones**, no cubrir gastos. La metodología solo promete que los ingresos "podrían contribuir" a los gastos, y esa es la frase defendible.
- Presentar el equilibrio como **"operativo"** (hosting, marketing y servicios) en el escenario A, que pide **≈ 100–266 placas al mes**, y no como equilibrio con nómina.
- Fijar con el equipo **qué porcentaje de perros comprará placa** **[supuesto, sin datos: es la primera pregunta del piloto]**. Sin ese dato, el equilibrio es una cuenta abierta.
- Dejar los ingresos de patrocinio y del servicio a gobierno como "potencial" y no meterlos al equilibrio, porque no tienen cifra (ver sección 9).

---

## 3. Comisión por cupón

| Dónde aparece | Qué dice | Por qué choca | Propuesta y supuesto |
|---|---|---|---|
| Metodología, Fase 2, estrategia 2 | CPA de **$15 a $30 MXN (o 5 %–8 %)** | Dos formas de cobrar en una sola frase | Unificar |
| Metodología, Fase 10, canvas, "Fuente de ingresos" | "Comisión por redención (B2B): **5 % a 10 %** sobre la venta del cupón canjeado **en clínica**" | 10 % no coincide con el 8 % máximo de la Fase 2. Además "en clínica" deja fuera a tiendas y estéticas, que la Fase 2 sí incluye. La propuesta de valor dice "microcomisión" | Corregir el canvas a **5 %–8 %** |
| Metodología, Fase 2 | $15–$30 equivale al 5 %–8 % solo si el ticket del cupón ronda **$190–$600** ($15 ÷ 8 % ≈ $188; $30 ÷ 5 % = $600) | Si el ticket es de $150, el 5 % son $7.50, fuera del rango en pesos | **[supuesto: ticket promedio de $190–$600, sin datos]**. Recomiendo quedarse con **5 %–8 % del cupón canjeado, con un mínimo de $15 y un máximo de $30**. Así los dos números de la Fase 2 dejan de chocar |
| Guion, pregunta 1 y bloque de modelo de negocio | "entre $15 y $30 pesos" | Es consistente con la Fase 2, pero omite el porcentaje | Usar la versión unificada |
| Producto (`CLAUDE.md`, `cuponesEjemplo.ts`) | Los cupones son datos de ejemplo; el canje y la comisión no existen | La comisión no se puede demostrar | Decirlo así en las preguntas |

---

## 4. Margen de las placas ("superior al 65 %")

| Dónde aparece | Qué dice | Por qué choca | Propuesta y supuesto |
|---|---|---|---|
| Metodología, Fase 2, estrategia 1 y "Proyecciones financieras" | Precio $99–$130, costo $20–$35, "margen bruto superior al 65 %" | Con precio $99 y costo $35, el margen es (99 − 35) ÷ 99 = **64.6 %**, que **no es superior a 65 %** | Decir **"entre 65 % y 85 %"**: el mínimo es 64.6 % (≈ 65 %) y el máximo es (130 − 20) ÷ 130 = **84.6 %**. Con el punto medio ($114.50 y $27.50): **76 %** |
| Guion (bloque modelo de negocio y tabla de cifras) | "margen mayor al 65 %" | Repite el error | Corregir con el rango anterior |
| Canvas | Las placas son "**metálicas grabadas con láser**" ($20–$35) | La Fase 5 habla de "etiquetas o placas impresas" e "imprimir por demanda" (Fase 7). Metal grabado y papel impreso no cuestan lo mismo | Decidir qué se vende (placa metálica) y qué es gratis (la etiqueta imprimible del registro) y decirlo igual en todos lados |
| Metodología, Fase 5, Proveedores | Imprenta o taller local: **"por cotizar"** | El costo de $20–$35 no tiene cotización | Marcar el costo como **[supuesto por cotizar]** y cotizar antes de la fecha |
| Todos los documentos | "Margen **bruto**" | No incluye comisiones de pago, empaque, envío ni merma | Decirlo: "margen bruto antes de costos de venta" **[supuesto: no hay datos de esos costos]** |

---

## 5. Residuos del GPS (la decisión vigente es sin GPS)

| # | Dónde aparece | Qué dice | Propuesta |
|---|---|---|---|
| 1 | Metodología, Fase 1, "Competencia directa" | Manchitas integra "…cupones y **rastreo opcional**" | Quitar "y rastreo opcional" |
| 2 | Fase 2, Objetivos, mediano plazo (6–24 meses) | "…iniciar el **piloto de GPS**" | Quitar. Sustituir por una meta sin GPS, por ejemplo la venta de placas |
| 3 | Fase 5, Producción (introducción) | "etiquetas de identificación y, de forma opcional, **collares con GPS**" | Dejar solo etiquetas y placas |
| 4 | Fase 5, Recursos físicos y técnicos | "servicios de mapas, **GPS** y notificaciones" y "etiquetas o placas impresas y **collares GPS (solo para el piloto)**" | Quitar "GPS" y los collares. El mapa real es Leaflet con OpenStreetMap |
| 5 | Fase 5, Proveedores | Filas "Servicios de mapas y **GPS**" y "**Distribuidor de collares GPS**: dispositivos para el piloto" | Quitar la segunda fila. Reescribir la primera como "Mapas (OpenStreetMap, sin costo)" |
| 6 | Anexo 2, Propuesta de valor | "**Rastreo GPS opcional**" (productos y servicios) y "**GPS opcional**, sin obligar a comprar un dispositivo" (aliviadores) | Quitar ambos |

No son residuos y se pueden conservar: la competencia con GPS en el análisis de competencia, el FODA (amenaza: "dispositivos GPS ya consolidados") y la fila de "Carencias" ("los dispositivos GPS son costosos...").
Detalle relacionado: la Fase 5 menciona "notificaciones por correo, SMS y navegador" y la fila de mapas dice "alertas". El producto no envía SMS ni alertas.

---

## 6. Diagramas de procesos y texto de los procesos contra el producto

| Dónde aparece | Qué dice | Por qué choca con el producto | Propuesta |
|---|---|---|---|
| Cronograma (título) | "**HUELLITAS** · 2ISI" | El proyecto se llama Manchitas. "Huellita Segura" es el programa municipal | Cambiar a Manchitas |
| Figura 5 (reencuentro), 2.º paso | "**Entra a Huellitas e inicia sesión**" | El nombre es otro y, además, **no se pide sesión**: quien encuentra al perro escanea el QR o escribe el ID exacto sin cuenta | "Escanea el QR o escribe el ID, sin registro" |
| Figura 5, texto del Proceso 2 | La ficha muestra "nombre del perro, un apellido del dueño y **su teléfono**" | El producto **no muestra el teléfono**. Solo muestra nombre, raza, edad, señas, nota y el botón de WhatsApp | "Nombre del perro, un apellido del dueño y botón de WhatsApp" |
| Figura 5, penúltimo paso | "Enviar mensaje **o llamar** al dueño" | El contacto es solo por WhatsApp | "Escribir por WhatsApp" |
| Figura 6 (reporte), 1.er paso | "**Iniciar sesión**" | El reporte ciudadano es **sin cuenta**, con folio de seguimiento (`CLAUDE.md`; y el propio canvas dice "sin crear cuentas") | Quitar el paso |
| Figura 6, 2.º paso y texto del Proceso 3 | Llenar el reporte con el "**dueño (si se conoce)**", ubicación y razón | El producto no pide el dueño: pide tipo de reporte, ubicación, evidencia (fotos y descripción) y revisar y enviar | "Tipo, ubicación, evidencia y revisión" |
| Figura 6, 5.º paso | "**Autoridad revisa y da seguimiento** al caso" y "atención y, en su caso, sanción" | El panel de autoridad es de **solo lectura**. El estado "canalizado" todavía no se puede marcar (pendiente en `PLAN.md`). El ciudadano sí puede consultar su folio | "La autoridad recibe el reporte en un panel. El ciudadano consulta su folio" y marcar el seguimiento como fase posterior |
| Figura 4 (registro), paso "**Compartir cartilla con autoridades** para verificar vacunas" y Proceso 1 | "...que se comparte con las autoridades para verificar las vacunas" | Regla de privacidad del producto: la autoridad **nunca ve** mascotas, cartillas ni perfiles. Además la verificación de vacunas es de un veterinario y todavía no existe | Quitar el paso. Decir "la cartilla queda guardada y privada; la validación por un veterinario es una fase posterior" |
| Figura 4, orden | Crear cuenta → datos → subir cartilla → generar ID | En el producto el registro de la mascota tiene dos pasos ("Tu perro" y "Señas y foto") y **genera el ID al final**. La cartilla se sube **después**, desde la pantalla Salud | Reordenar: cuenta → datos → ID, QR y etiqueta → (opcional) subir cartilla |
| Figura 4, último paso | "Notificación de bienvenida **y cupón**" | Hoy no se entrega ningún cupón al registrarse: los cupones son datos de ejemplo | Quitar "y cupón" o marcarlo como fase posterior |
| Fase 5, Proceso 1 | "Al finalizar recibe su ID y la etiqueta para imprimir" | Es correcto. La **placa metálica** que se vende (canvas) no aparece en el producto: no hay tienda ni flujo de compra | Decir que la venta de placas es la siguiente fase |

---

## 7. Cronograma y avance real

**El cronograma** [doc, Fase 9, Figura]: 26 semanas, del 3 de nov de 2026 al 30 de abril de 2027. **Hoy es el 18 de noviembre, semana 3.**

| Etapa del cronograma | Semanas planeadas | Estado real hoy (con evidencia) |
|---|---|---|
| Planeación y organización | S1–S2 | Hecha |
| Validación del problema y **encuestas** | S1–S4 | **No iniciada**: no hay encuestas. Se apoya en datos públicos (Hermosillo ¿Cómo Vamos?, Instituto, INEGI) |
| Diseño del sistema y prototipo visual | S3–S6 | **Adelantada**: diseño y componentes base hechos (`DESIGN.md`, pasos 1–3) |
| Trámites: constitución y marca (IMPI) | S3–S12 | **No iniciada** |
| Prototipo funcional: registro, ID de collar y consulta | S5–S12 | **Adelantado**: los tres flujos centrales funcionan de punta a punta (pasos 4, 5 y 7), con base de datos real y seguridad por fila (paso 10) |
| Acuerdos con aliados (comercios, veterinarias, Instituto) | S5–S16 | **No iniciados**: no hay cartas de intención ni convenios |
| Módulos de campañas, adopción y reporte ciudadano | S11–S18 | **Adelantados, con matices**: el reporte es real; campañas, adopción, aliados y cupones tienen **datos de ejemplo** (pasos 7, 8 y 9) |
| Pruebas internas y seguridad de datos | S13–S15 | **Parcial**: pruebas de aislamiento entre usuarios y límites (48 comprobaciones), accesibilidad con 0 hallazgos y modo sin conexión (pasos 10, 11, 12c y 12d). Falta una revisión legal del aviso de privacidad |
| Piloto en la comunidad Unison (100 perros) | S15–S22 | **No iniciado** |
| Mejoras con base en el piloto, evaluación | S21–S26 | No iniciadas |

**Cómo decirlo con honestidad** (para la diapositiva y la voz):
> "Vamos adelantados en lo técnico: en la tercera semana ya tenemos un prototipo funcional. Todavía no hay evidencia de mercado: no hemos hecho encuestas, ni tenemos convenios con comercios o el Instituto, ni trámites legales. Eso es lo que sigue, y el piloto lo va a medir."

Observaciones: el historial del repositorio empieza el 17 de nov de 2026, es decir, el prototipo se construyó en 2 días de trabajo registrado en el repositorio. Esa cifra no la usaría en la presentación sin hablarlo con el equipo, porque puede generar preguntas sobre cómo se hizo. Si pueden aplicar una **encuesta corta** antes de la fecha de presentación (el cronograma ya la planeaba en S1–S4), sería la forma más barata de cerrar el hueco de "sin evidencia de mercado". Es una decisión de ustedes y yo no inventaría resultados.

---

## 8. Metas y mercado entre documentos

| Dónde aparece | Qué dice | Por qué choca | Propuesta y supuesto |
|---|---|---|---|
| Metodología, Fase 3 (tamaño de mercado) y Fase 2 (metas) | Meta de **10,000 perros ≈ 5.7 % del SAM** (≈ 177 mil hogares) | Compara **perros** con **hogares**. Un hogar puede tener varios perros, y el 68.3 % de hogares con mascota (ENBIARE) incluye **gatos** y otras. Además el producto registra solo perros. La proporción de hogares con perro no está en los documentos | Decir **"10,000 registros equivalen a ≈ 5.7 % de los hogares con mascota y celular"**, que sí es cierto. No decir "5.7 % del mercado de perros" **[supuesto: no se conoce la proporción de hogares con perro]** |
| Metodología, Fase 3 | SAM: 31.8 % de las 876,333 viviendas de Sonora ≈ 279 mil. Las cuentas cuadran (279 mil × 68.3 % ≈ 190 mil; × 92.8 % ≈ 177 mil) | La proporción "31.8 %" se toma de la población, no de las viviendas de Hermosillo. La propia metodología lo llama "aproximación propia" | Mantener la cifra y decir "estimación propia con datos de INEGI" |
| Metodología (Fase 3 "Segmentos") y `CLAUDE.md` contra Fase 3 "Perfil de clientes y nicho" y guion | Tutores de **18 a 45** años (segmentos y `CLAUDE.md`) y **18 a 40** (early adopters, nicho y guion) | Dos rangos. Son compatibles si el de 18–40 es el nicho de arranque | Aclarar: usuarios de 18 a 45 y early adopters de 18 a 40 |
| Metodología, Fase 2 y guion | Metas del piloto (100 perros, 2 comercios aliados, 1 reunión con el Instituto), 2,000 / 15 / 5 a 24 meses y 10,000 perros a 5 años | Los tres documentos coinciden en estos números. Pero 2 comercios a 6 meses sin ninguna carta de intención es una meta, no una evidencia | Mantener y decir "meta" |
| Metodología, Fase 3 "Segmentos" | **Patrocinadores** como segmento que "paga" | No hay ninguna cifra de patrocinio en Fase 2, canvas ni proyecciones. Solo aparece como fuente de financiamiento (Fase 6) | Tratar el patrocinio como potencial, no como ingreso |
| Metodología, Fase 2, estrategia 4 | "Inteligencia de datos cívicos (**B2G**, futuro)" | No está en el canvas ni en la Fase 3 como segmento que paga | Dejarlo como "a futuro", sin cifra |
| Metodología, Fase 1 y competencia directa | Huellita Segura "lanzado en **agosto de 2025**" y con "más de mil animales registrados" | La nota citada (El Imparcial, 7 de sep de 2025) se titula "Lanzan 'Huellita Segura'", y su dirección dice "registro obligatorio de mascotas con QR". Hay que verificar la fecha. Si el registro fuera obligatorio, cambia cómo se explica la complementariedad | **[verificar con la nota original]** antes de afirmar la fecha o el carácter obligatorio |
| Guion (mío), tabla de cifras | "Margen > 65 %"; "Instituto... casi 10 mil esterilizaciones" | El primero es el error de la sección 4. El segundo es el dato de la metodología y está bien | Corregir el margen en la Parte 2 |
| Guion (mío), pregunta 4 y bloque de modelo de negocio | La placa como producto vendido | No está construida en el producto ni cotizada (sección 4 y sección 6) | Presentarla como fase siguiente |

---

## 9. Decisiones que necesito de ustedes antes de la Parte 2

1. **Escenario de gastos** que mostraremos: ¿A (piloto mínimo, $11–17 mil), B ($23.5–29.5 mil) o ambos? Mi recomendación: **mostrar A y B, y el C como techo futuro**.
2. **Nómina:** ¿confirman que el equipo trabaja sin sueldo en el piloto?
3. **Laptops y mobiliario:** ¿las 4 laptops ya las tienen y el mobiliario no se compra?
4. **Espacio:** ¿la universidad les presta un espacio o trabajan en remoto?
5. **Comisión:** ¿5 %–8 % con mínimo $15 y máximo $30?
6. **Placas:** ¿confirman que lo que venden es una placa metálica y que la etiqueta imprimible del registro sigue siendo gratis?
7. **Hipótesis de compra de placas** (¿30 %?, ¿10 %?). Hoy no hay dato; propongo presentarla como pregunta que mide el piloto.
8. **Verificación de Huellita Segura** (fecha y si el registro es obligatorio).

La metodología (PDF) y el formato (PPTX) no se modifican. Si deciden corregir el PDF, esta lista sirve de guía de cambios: secciones 1, 3, 4, 5 y 6.
