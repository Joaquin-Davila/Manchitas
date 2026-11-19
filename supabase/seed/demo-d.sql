-- Manchitas · datos de demostración (bloque D): personas de ejemplo, conversaciones y notificaciones.
-- Se ejecuta después de demo-c.sql. Reproducible: ids fijos; cada ejecución recrea las conversaciones
-- de demostración con fechas relativas a hoy. Todo es ficticio (es_demo = true).
--
-- Las "personas" de ejemplo son cuentas SIN contraseña: nadie puede iniciar sesión con ellas.

-- ---------------------------------------------------------------------------------------
-- Personas de ejemplo (5): la rescatista, el dueño de una veterinaria y tres tutores.
-- ---------------------------------------------------------------------------------------
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, email_change, email_change_token_new, recovery_token)
select '00000000-0000-0000-0000-000000000000', v.id::uuid, 'authenticated', 'authenticated', v.correo, '', now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       jsonb_build_object('nombre', v.nombre, 'apellido', v.apellido, 'tipo_usuario', v.tipo, 'ciudad', 'Hermosillo',
                          'acepto_privacidad', 'true', 'version_aviso', 'borrador-1'),
       now(), now(), '', '', '', ''
  from (values
    ('de000020-0000-4000-8000-000000000001', 'demo-rescate@manchitas.mx', 'Rescate Huellas del Desierto', '', 'rescatista'),
    ('de000020-0000-4000-8000-000000000002', 'demo-veterinaria@manchitas.mx', 'Veterinaria Patitas del Desierto', '', 'ciudadano'),
    ('de000020-0000-4000-8000-000000000003', 'demo-marco@manchitas.mx', 'Marco', 'Rodríguez', 'tutor'),
    ('de000020-0000-4000-8000-000000000004', 'demo-lucia@manchitas.mx', 'Lucía', 'Mora', 'tutor'),
    ('de000020-0000-4000-8000-000000000005', 'demo-paola@manchitas.mx', 'Paola', 'Ruiz', 'tutor')
  ) as v(id, correo, nombre, apellido, tipo)
on conflict (id) do nothing;

update public.perfiles set es_demo = true
 where id in ('de000020-0000-4000-8000-000000000001', 'de000020-0000-4000-8000-000000000002', 'de000020-0000-4000-8000-000000000003',
              'de000020-0000-4000-8000-000000000004', 'de000020-0000-4000-8000-000000000005');

-- Quién responde en cada contexto: la veterinaria, la persona que publica la adopción y los tutores.
update public.establecimientos set propietario_id = 'de000020-0000-4000-8000-000000000002' where id = 'de000002-0000-4000-8000-000000000002';
update public.adopciones set publicador_id = 'de000020-0000-4000-8000-000000000001' where es_demo and publicado_por = 'Rescate Huellas del Desierto';
update public.extraviados set tutor_id = 'de000020-0000-4000-8000-000000000003' where id = 'de00000f-0000-4000-8000-000000000001';
update public.extraviados set tutor_id = 'de000020-0000-4000-8000-000000000004' where id = 'de00000f-0000-4000-8000-000000000003';

-- ---------------------------------------------------------------------------------------
-- Conversaciones de la cuenta demo (5): veterinaria, adopción, extraviada, comunidad (archivada) y
-- una sobre su propio reporte de Oreo. Con mensajes entrantes y salientes y estados de lectura distintos.
-- ---------------------------------------------------------------------------------------
-- Se recrea TODO el chat de la cuenta demo: las conversaciones de ejemplo y también las que haya
-- abierto alguien al probar la app con esa cuenta.
delete from public.chat_conversaciones c
 where c.es_demo
    or exists (select 1 from public.chat_participantes p where p.conversacion_id = c.id and p.usuario_id = 'de000000-0000-4000-8000-000000000001');

insert into public.chat_conversaciones (id, tipo, contexto_id, contexto_titulo, contexto_foto, clave, creado_por, es_demo, creado_en) values
  ('de000012-0000-4000-8000-000000000001', 'veterinaria', 'de000002-0000-4000-8000-000000000002', 'Veterinaria Patitas del Desierto', '/images/aliados/veterinaria-patitas.webp', 'demo:veterinaria', 'de000000-0000-4000-8000-000000000001', true, now() - interval '2 days'),
  ('de000012-0000-4000-8000-000000000002', 'adopcion', 'de000005-0000-4000-8000-000000000001', 'Canela', '/img/adopcion-canela.webp', 'demo:adopcion', 'de000000-0000-4000-8000-000000000001', true, now() - interval '1 day'),
  ('de000012-0000-4000-8000-000000000003', 'extraviado', 'de00000f-0000-4000-8000-000000000001', 'Max', '/img/adopcion-bruno.webp', 'demo:max', 'de000000-0000-4000-8000-000000000001', true, now() - interval '3 hours'),
  ('de000012-0000-4000-8000-000000000004', 'comunidad', null, '', null, 'demo:comunidad', 'de000000-0000-4000-8000-000000000001', true, now() - interval '3 days'),
  ('de000012-0000-4000-8000-000000000005', 'extraviado', 'de00000f-0000-4000-8000-000000000002', 'Oreo', 'de000000-0000-4000-8000-000000000001/demo-oreo.jpg', 'demo:oreo', 'de000020-0000-4000-8000-000000000005', true, now() - interval '5 hours');

insert into public.chat_participantes (conversacion_id, usuario_id, nombre)
select c.id::uuid, u.id::uuid, public.nombre_visible(u.id::uuid)
  from (values
    ('de000012-0000-4000-8000-000000000001', 'de000000-0000-4000-8000-000000000001'), ('de000012-0000-4000-8000-000000000001', 'de000020-0000-4000-8000-000000000002'),
    ('de000012-0000-4000-8000-000000000002', 'de000000-0000-4000-8000-000000000001'), ('de000012-0000-4000-8000-000000000002', 'de000020-0000-4000-8000-000000000001'),
    ('de000012-0000-4000-8000-000000000003', 'de000000-0000-4000-8000-000000000001'), ('de000012-0000-4000-8000-000000000003', 'de000020-0000-4000-8000-000000000003'),
    ('de000012-0000-4000-8000-000000000004', 'de000000-0000-4000-8000-000000000001'), ('de000012-0000-4000-8000-000000000004', 'de000020-0000-4000-8000-000000000004'),
    ('de000012-0000-4000-8000-000000000005', 'de000000-0000-4000-8000-000000000001'), ('de000012-0000-4000-8000-000000000005', 'de000020-0000-4000-8000-000000000005')
  ) as c(id, uid) cross join lateral (select c.uid as id) u;

-- La clave de cada conversación debe ser la que calcula iniciar_conversacion(), para que "Escribir"
-- desde una ficha REUTILICE estas conversaciones en lugar de crear duplicadas.
update public.chat_conversaciones c
   set clave = c.tipo || ':' || coalesce(c.contexto_id::text, '-') || ':' ||
               (select least(min(p.usuario_id::text), max(p.usuario_id::text)) from public.chat_participantes p where p.conversacion_id = c.id) || ':' ||
               (select greatest(min(p.usuario_id::text), max(p.usuario_id::text)) from public.chat_participantes p where p.conversacion_id = c.id)
 where c.es_demo;

-- Mensajes, en orden cronológico. entregado_en queda vacío en los que la cuenta demo aún no ha visto.
insert into public.chat_mensajes (id, conversacion_id, autor_id, tipo, texto, foto, lat, lng, zona, entregado_en, es_demo, creado_en) values
  -- 1) Veterinaria: la última respuesta está sin leer.
  ('de000013-0000-4000-8000-000000000001', 'de000012-0000-4000-8000-000000000001', 'de000000-0000-4000-8000-000000000001', 'texto', 'Hola, ¿tienen cita disponible esta semana para vacunar a Pony?', null, null, null, '', now() - interval '2 days' + interval '1 minute', true, now() - interval '2 days'),
  ('de000013-0000-4000-8000-000000000002', 'de000012-0000-4000-8000-000000000001', 'de000020-0000-4000-8000-000000000002', 'texto', 'Hola Adriana, sí: tenemos lugar el jueves a las 11:00 h.', null, null, null, '', now() - interval '2 days' + interval '1 hour', true, now() - interval '2 days' + interval '45 minutes'),
  ('de000013-0000-4000-8000-000000000003', 'de000012-0000-4000-8000-000000000001', 'de000000-0000-4000-8000-000000000001', 'texto', 'Perfecto, ¿qué debo llevar?', null, null, null, '', now() - interval '1 day' + interval '1 minute', true, now() - interval '1 day'),
  ('de000013-0000-4000-8000-000000000004', 'de000012-0000-4000-8000-000000000001', 'de000020-0000-4000-8000-000000000002', 'texto', 'Su cartilla y a Pony con correa. Si muestras tu folio de Manchitas, aplica el 20 % en consulta.', null, null, null, '', null, true, now() - interval '3 hours'),
  -- 2) Adopción: una foto y un mensaje sin leer.
  ('de000013-0000-4000-8000-000000000005', 'de000012-0000-4000-8000-000000000002', 'de000000-0000-4000-8000-000000000001', 'texto', 'Hola, me interesa Canela. ¿Sigue disponible?', null, null, null, '', now() - interval '1 day' + interval '1 minute', true, now() - interval '1 day'),
  ('de000013-0000-4000-8000-000000000006', 'de000012-0000-4000-8000-000000000002', 'de000020-0000-4000-8000-000000000001', 'foto', 'Sí, aquí está en su paseo de hoy.', '/img/adopcion-canela.webp', null, null, '', now() - interval '23 hours', true, now() - interval '23 hours'),
  ('de000013-0000-4000-8000-000000000007', 'de000012-0000-4000-8000-000000000002', 'de000020-0000-4000-8000-000000000001', 'texto', 'Si quieres conocerla, podemos agendar una visita esta semana.', null, null, null, '', null, true, now() - interval '22 hours'),
  -- 3) Mascota extraviada (Max): la cuenta demo comparte un avistamiento y una ubicación aproximada.
  ('de000013-0000-4000-8000-000000000008', 'de000012-0000-4000-8000-000000000003', 'de000000-0000-4000-8000-000000000001', 'texto', 'Vi un perro parecido a Max cerca de la avenida, con collar rojo.', null, null, null, '', now() - interval '3 hours' + interval '2 minutes', true, now() - interval '3 hours'),
  ('de000013-0000-4000-8000-000000000009', 'de000012-0000-4000-8000-000000000003', 'de000000-0000-4000-8000-000000000001', 'ubicacion', '', null, 29.09, -110.95, 'Colonia Modelo (ubicación aproximada)', now() - interval '3 hours' + interval '2 minutes', true, now() - interval '3 hours' + interval '1 minute'),
  ('de000013-0000-4000-8000-000000000010', 'de000012-0000-4000-8000-000000000003', 'de000020-0000-4000-8000-000000000003', 'texto', '¡Muchas gracias! Voy para allá ahora mismo.', null, null, null, '', now() - interval '150 minutes', true, now() - interval '150 minutes'),
  -- 4) Comunidad (archivada por la cuenta demo).
  ('de000013-0000-4000-8000-000000000011', 'de000012-0000-4000-8000-000000000004', 'de000000-0000-4000-8000-000000000001', 'texto', 'Hola Lucía, ¿conoces una buena estética canina por Villa de Seris?', null, null, null, '', now() - interval '3 days' + interval '1 minute', true, now() - interval '3 days'),
  ('de000013-0000-4000-8000-000000000012', 'de000012-0000-4000-8000-000000000004', 'de000020-0000-4000-8000-000000000004', 'texto', 'Sí: Estética Canina Pelo Dorado, en la colonia Modelo. Mi perra va ahí.', null, null, null, '', now() - interval '3 days' + interval '1 hour', true, now() - interval '3 days' + interval '50 minutes'),
  -- 5) Sobre el reporte de Oreo: dos mensajes sin leer de una vecina.
  ('de000013-0000-4000-8000-000000000013', 'de000012-0000-4000-8000-000000000005', 'de000020-0000-4000-8000-000000000005', 'texto', 'Hola Adriana, soy Paola. Revisé mi patio y la zona de enfrente, sin suerte.', null, null, null, '', null, true, now() - interval '5 hours'),
  ('de000013-0000-4000-8000-000000000014', 'de000012-0000-4000-8000-000000000005', 'de000020-0000-4000-8000-000000000005', 'texto', 'Si quieres, te ayudo a pegar carteles en mi colonia.', null, null, null, '', null, true, now() - interval '4 hours');

-- Estados de lectura: lo que cada persona ya vio (el trigger marca al autor; aquí se afina).
update public.chat_participantes set ultimo_leido_en = now() - interval '25 hours'
 where conversacion_id = 'de000012-0000-4000-8000-000000000001' and usuario_id = 'de000000-0000-4000-8000-000000000001';
update public.chat_participantes set ultimo_leido_en = now() - interval '12 hours'
 where conversacion_id = 'de000012-0000-4000-8000-000000000001' and usuario_id = 'de000020-0000-4000-8000-000000000002';
update public.chat_participantes set ultimo_leido_en = now() - interval '22 hours' - interval '30 minutes'
 where conversacion_id = 'de000012-0000-4000-8000-000000000002' and usuario_id = 'de000000-0000-4000-8000-000000000001';
update public.chat_participantes set ultimo_leido_en = now() - interval '12 hours'
 where conversacion_id = 'de000012-0000-4000-8000-000000000002' and usuario_id = 'de000020-0000-4000-8000-000000000001';
update public.chat_participantes set ultimo_leido_en = now() - interval '100 minutes'
 where conversacion_id = 'de000012-0000-4000-8000-000000000003' and usuario_id = 'de000000-0000-4000-8000-000000000001';
update public.chat_participantes set ultimo_leido_en = now() - interval '2 hours'
 where conversacion_id = 'de000012-0000-4000-8000-000000000003' and usuario_id = 'de000020-0000-4000-8000-000000000003';
update public.chat_participantes set ultimo_leido_en = now() - interval '2 days', archivada = true
 where conversacion_id = 'de000012-0000-4000-8000-000000000004' and usuario_id = 'de000000-0000-4000-8000-000000000001';
update public.chat_participantes set ultimo_leido_en = now() - interval '6 hours'
 where conversacion_id = 'de000012-0000-4000-8000-000000000005' and usuario_id = 'de000000-0000-4000-8000-000000000001';

-- Las conversaciones ya leídas por la cuenta demo no dejan aviso sin leer.
update public.notificaciones set leida = true
 where es_demo and tipo = 'mensaje'
   and enlace in ('/mensajes/de000012-0000-4000-8000-000000000003', '/mensajes/de000012-0000-4000-8000-000000000004');

-- ---------------------------------------------------------------------------------------
-- Otras notificaciones de la cuenta demo (8): promociones, campañas, donaciones, adopción...
-- ---------------------------------------------------------------------------------------
insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace, leida, es_demo, creado_en) values
  ('de000000-0000-4000-8000-000000000001', 'promocion', 'Promoción: 20 % en consulta general', 'Veterinaria Patitas del Desierto tiene un descuento vigente para tu mascota. Promoción de demostración.', '/comunidad/veterinarias/de000002-0000-4000-8000-000000000002#titulo-promos', false, true, now() - interval '1 day'),
  ('de000000-0000-4000-8000-000000000001', 'campana', 'Jornada de vacunación antirrábica en 4 días', 'Centro de Jornadas Sonora Pet · 9:00 a 13:00 h. Lleva a tu mascota con correa.', '/comunidad', false, true, now() - interval '20 hours'),
  ('de000000-0000-4000-8000-000000000001', 'colecta_revision', 'Tu campaña está en revisión', '«Un hogar temporal para gatitos rescatados» será validada por un moderador antes de publicarse.', '/comunidad/solidario/de00000a-0000-4000-8000-000000000004', false, true, now() - interval '1 day'),
  ('de000000-0000-4000-8000-000000000001', 'donacion', 'Nueva aportación de demostración', 'Alguien registró una aportación pendiente en una de las campañas de la comunidad. Aún no se procesan pagos reales.', '/comunidad?tab=solidario', true, true, now() - interval '2 days'),
  ('de000000-0000-4000-8000-000000000001', 'resena_respuesta', 'Veterinaria Patitas del Desierto respondió tu reseña', 'Gracias por tu confianza. Aquí te esperamos.', '/comunidad/veterinarias/de000002-0000-4000-8000-000000000002', true, true, now() - interval '3 days'),
  ('de000000-0000-4000-8000-000000000001', 'solicitud_adopcion', 'Recibimos tu interés en Canela', 'Rescate Huellas del Desierto te respondió en el chat. Revisa los requisitos de adopción responsable.', '/mensajes/de000012-0000-4000-8000-000000000002', false, true, now() - interval '22 hours'),
  ('de000000-0000-4000-8000-000000000001', 'recordatorio', 'Recordatorio: actualiza la cartilla de Pony', 'La fecha de su refuerzo ya pasó. Registra la dosis cuando se la apliquen.', '/salud', false, true, now() - interval '9 days' + interval '8 days'),
  ('de000000-0000-4000-8000-000000000001', 'campana', 'Esterilización a bajo costo próximamente', 'Clínica Colita Feliz abrirá cupo en unas semanas. Registra a tu mascota con anticipación.', '/comunidad', true, true, now() - interval '4 days');
