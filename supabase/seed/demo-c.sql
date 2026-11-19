-- Manchitas · datos de demostración (bloque C): reportes ciudadanos y mascotas extraviadas.
-- Se ejecuta después de demo.sql y demo-b.sql. Reproducible: ids fijos; cada ejecución REINICIA los
-- extraviados de demostración para que las etapas (día 2, día 4, día 6, localizada) sigan vigentes.
-- Todo es ficticio (es_demo = true).

-- ---------------------------------------------------------------------------------------
-- Reportes ciudadanos (4): los que verá el panel de la autoridad, marcados como ejemplo.
-- ---------------------------------------------------------------------------------------
insert into public.reportes
  (id, tipo, colonia, calle, referencias, descripcion, fecha_hechos, estado, es_demo, creado_en) values
  ('de00000e-0000-4000-8000-000000000001', 'maltrato', 'Colonia Modelo', '', 'Cerca de un parque.',
   'Un perro permanece amarrado todo el día bajo el sol, sin agua ni sombra. Es un caso de demostración.',
   current_date - 3, 'recibido', true, now() - interval '3 days'),
  ('de00000e-0000-4000-8000-000000000002', 'abandono', 'Villa de Seris', '', 'Terreno baldío junto a una tienda.',
   'Una camada de cachorros fue dejada en una caja. Es un caso de demostración.',
   current_date - 6, 'canalizado', true, now() - interval '6 days'),
  ('de00000e-0000-4000-8000-000000000003', 'herido', 'Zona centro', 'Bulevar principal', 'Frente a una farmacia.',
   'Perro herido tras ser atropellado, necesita atención veterinaria. Es un caso de demostración.',
   current_date - 1, 'recibido', true, now() - interval '1 day'),
  ('de00000e-0000-4000-8000-000000000004', 'suelto', 'Colonia Pitic', '', 'Cerca de una escuela.',
   'Perros sueltos sin identificación que siguen a los niños. Es un caso de demostración.',
   current_date - 9, 'canalizado', true, now() - interval '9 days')
on conflict (id) do update set creado_en = excluded.creado_en, fecha_hechos = excluded.fecha_hechos, estado = excluded.estado, es_demo = true;

-- ---------------------------------------------------------------------------------------
-- Mascotas extraviadas (4), cada una en una etapa distinta. Se reinician en cada ejecución.
-- ---------------------------------------------------------------------------------------
delete from public.foros where es_demo;
delete from public.extravio_mensajes where es_demo;
delete from public.notificaciones where es_demo;

insert into public.extraviados
  (id, tutor_id, tutor_nombre, mascota_id, nombre, especie, raza, descripcion, foto, fecha_extravio, zona,
   contacto_whatsapp, estado, aviso_previo_en, foro_creado_en, localizado_en, es_demo, creado_en) values
  -- Día 2: activo, recibiendo avistamientos.
  ('de00000f-0000-4000-8000-000000000001', null, 'Marco R.', null, 'Max', 'perro', 'Pastor alemán',
   'Pelo café con negro, collar rojo. Es tímido pero no muerde. Responde a su nombre.',
   '/img/adopcion-bruno.webp', public.hoy_hermosillo() - 2, 'Colonia Modelo', false, 'activo', null, null, null, true, now() - interval '2 days'),
  -- Día 4: la cuenta demo reportó a su gato Oreo; recibe el aviso previo.
  ('de00000f-0000-4000-8000-000000000002', 'de000000-0000-4000-8000-000000000001', 'Adriana D.', 'de000001-0000-4000-8000-000000000015',
   'Oreo', 'gato', 'Doméstico',
   'Gato blanco con manchas negras, muy sociable. Se escapó por una ventana. Datos de demostración.',
   'de000000-0000-4000-8000-000000000001/demo-oreo.jpg', public.hoy_hermosillo() - 4, 'Colonia Pitic', false, 'activo', null, null, null, true, now() - interval '4 days'),
  -- Día 6: activo con foro abierto (lo crea procesar_extraviados al final).
  ('de00000f-0000-4000-8000-000000000003', null, 'Lucía M.', null, 'Nina', 'gato', 'Atigrada',
   'Gata atigrada gris, ojos cafés, muy cariñosa. Tiene una pequeña mancha blanca en el pecho.',
   '/img/adopcion-luna.webp', public.hoy_hermosillo() - 6, 'Villa de Seris', false, 'activo', null, null, null, true, now() - interval '6 days'),
  -- Localizado: foro cerrado con su historial.
  ('de00000f-0000-4000-8000-000000000004', null, 'Fernanda L.', null, 'Rocco', 'perro', 'Criollo',
   'Perro color miel, mediano, orejas caídas. Llevaba un collar azul.',
   '/img/adopcion-canela.webp', public.hoy_hermosillo() - 9, 'Zona norte', false, 'localizado', null, null, now() - interval '3 days', true, now() - interval '9 days')
on conflict (id) do update set
  fecha_extravio = excluded.fecha_extravio, estado = excluded.estado, localizado_en = excluded.localizado_en,
  aviso_previo_en = null, foro_creado_en = null, descripcion = excluded.descripcion, foto = excluded.foto,
  creado_en = excluded.creado_en, es_demo = true;

-- Foro cerrado de Rocco (el único que no genera la automatización, porque ya no está activo).
insert into public.foros (id, extraviado_id, estado, creado_en, cerrado_en, es_demo) values
  ('de000010-0000-4000-8000-000000000004', 'de00000f-0000-4000-8000-000000000004', 'cerrado', now() - interval '4 days', now() - interval '3 days', true);
update public.extraviados set foro_creado_en = now() - interval '4 days' where id = 'de00000f-0000-4000-8000-000000000004';

-- Avistamientos y comentarios (se insertan sin sesión, así que el trigger respeta autor y fecha).
insert into public.extravio_mensajes (id, extraviado_id, autor_nombre, tipo, texto, zona, es_demo, creado_en) values
  ('de000011-0000-4000-8000-000000000001', 'de00000f-0000-4000-8000-000000000001', 'Sofía V.', 'avistamiento', 'Vi a un perro igual a Max caminando cerca del parque, con el collar rojo.', 'Colonia Modelo, cerca del parque', true, now() - interval '20 hours'),
  ('de000011-0000-4000-8000-000000000002', 'de00000f-0000-4000-8000-000000000001', 'Diego A.', 'avistamiento', 'Creo que lo vi pasar por la avenida, iba solo y asustado.', 'Avenida principal de la colonia', true, now() - interval '9 hours'),
  ('de000011-0000-4000-8000-000000000003', 'de00000f-0000-4000-8000-000000000001', 'Carlos P.', 'comentario', 'Ánimo, ojalá aparezca pronto. Comparto el reporte con mis vecinos.', '', true, now() - interval '3 hours'),
  ('de000011-0000-4000-8000-000000000004', 'de00000f-0000-4000-8000-000000000002', 'Paola R.', 'comentario', 'Revisé mi patio y la zona de enfrente, sin suerte. Sigo pendiente.', '', true, now() - interval '5 hours'),
  ('de000011-0000-4000-8000-000000000005', 'de00000f-0000-4000-8000-000000000003', 'Marco R.', 'avistamiento', 'Una gata parecida a Nina estuvo en el techo de una casa azul.', 'Villa de Seris, calle principal', true, now() - interval '5 days'),
  ('de000011-0000-4000-8000-000000000006', 'de00000f-0000-4000-8000-000000000003', 'Iván T.', 'comentario', 'Pregunté en las tiendas de la zona y nadie la ha visto.', '', true, now() - interval '4 days'),
  ('de000011-0000-4000-8000-000000000007', 'de00000f-0000-4000-8000-000000000003', 'Rosa E.', 'avistamiento', 'La vi anoche cerca de los contenedores de la esquina, parecía hambrienta.', 'Villa de Seris, junto a la tienda', true, now() - interval '2 days'),
  ('de000011-0000-4000-8000-000000000008', 'de00000f-0000-4000-8000-000000000003', 'Daniela S.', 'comentario', 'Dejé agua y comida en la esquina por si regresa.', '', true, now() - interval '1 day'),
  ('de000011-0000-4000-8000-000000000009', 'de00000f-0000-4000-8000-000000000004', 'Héctor G.', 'avistamiento', 'Un perro color miel con collar azul estaba en la gasolinera.', 'Zona norte, gasolinera', true, now() - interval '8 days'),
  ('de000011-0000-4000-8000-000000000010', 'de00000f-0000-4000-8000-000000000004', 'Elena B.', 'avistamiento', 'Lo vieron en un terreno baldío, lo alimentamos y lo mantuvimos cerca.', 'Zona norte, terreno baldío', true, now() - interval '5 days'),
  ('de000011-0000-4000-8000-000000000011', 'de00000f-0000-4000-8000-000000000004', 'Fernanda L.', 'comentario', 'Gracias a todas y todos: ¡Rocco ya está en casa!', '', true, now() - interval '3 days')
on conflict (id) do nothing;

-- Corre la automatización (la misma que programa pg_cron): crea el aviso del día 4 de Oreo y el foro
-- de Nina. Después se ajustan las fechas del foro a un momento realista (día 5 a media mañana).
select public.procesar_extraviados();

update public.foros f
   set creado_en = ((e.fecha_extravio + 5)::timestamp + interval '9 hours') at time zone 'America/Hermosillo'
  from public.extraviados e
 where e.id = f.extraviado_id and e.es_demo and f.estado = 'abierto';
update public.extraviados e
   set foro_creado_en = f.creado_en
  from public.foros f
 where f.extraviado_id = e.id and e.es_demo and f.estado = 'abierto';
