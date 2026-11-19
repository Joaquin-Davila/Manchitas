-- Manchitas · datos de demostración (bloque A).
-- Reproducible: ids fijos y `on conflict`, así que se puede ejecutar varias veces sin duplicar.
-- Cada ejecución también REFRESCA las fechas relativas (campañas, anuncios, próximas vacunas) para
-- que la demo siempre se vea vigente.
-- Todo lo de aquí es ficticio y lleva es_demo = true. No son certificados ni establecimientos reales.
--
-- NO se ejecuta a mano: lo aplica `node supabase/seed/demo.mjs --aplicar`, que sustituye
-- __DEMO_PASSWORD__ por la contraseña de .env (DEMO_PASSWORD). Esa contraseña NO está en el repo.

-- ---------------------------------------------------------------------------------------
-- Cuenta demo: demo@manchitas.mx (tutor). Contraseña = DEMO_PASSWORD de .env.
-- ---------------------------------------------------------------------------------------
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, email_change, email_change_token_new, recovery_token)
values
  ('00000000-0000-0000-0000-000000000000', 'de000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'demo@manchitas.mx', extensions.crypt('__DEMO_PASSWORD__', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"nombre":"Adriana","apellido":"Demo","telefono":"__DEMO_TELEFONO__","ciudad":"Hermosillo","colonia":"Pitic","tipo_usuario":"tutor","acepto_privacidad":"true","version_aviso":"borrador-1"}'::jsonb,
   now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'de000000-0000-4000-8000-000000000001', 'de000000-0000-4000-8000-000000000001', 'email',
        jsonb_build_object('sub', 'de000000-0000-4000-8000-000000000001', 'email', 'demo@manchitas.mx', 'email_verified', true),
        now(), now(), now())
on conflict (provider_id, provider) do nothing;

-- Restablecer: volver a ejecutar el seed deja la misma contraseña de .env.
update auth.users set encrypted_password = extensions.crypt('__DEMO_PASSWORD__', extensions.gen_salt('bf')),
       email_confirmed_at = coalesce(email_confirmed_at, now())
 where id = 'de000000-0000-4000-8000-000000000001';

update public.perfiles set es_demo = true, nombre = 'Adriana', apellido = 'Demo', telefono = '__DEMO_TELEFONO__',
       ciudad = 'Hermosillo', colonia = 'Pitic', tipo_usuario = 'tutor', rol = 'tutor'
 where id = 'de000000-0000-4000-8000-000000000001';

-- ---------------------------------------------------------------------------------------
-- Mascotas de la cuenta demo: Pony, Chapito, Lupe y Emo (perros) y Coco, Cenizas, Félix, Oreo y Luna (gatos).
-- Los años de Coco, Pony, Chapito, Lupe, Emo y Félix son aproximados (los dio el equipo). La raza, las señas y la
-- edad de Cenizas, Oreo y Luna son PROVISIONALES (de demostración).
-- El trigger fija dueño, folio y token, así que se simula la sesión de la cuenta demo.
-- ---------------------------------------------------------------------------------------
-- Las mascotas de la primera versión de la demo (Mochi, Duque y Manchas) ya no existen; el
-- borrado en cascada se lleva su cartilla y sus vacunas.
delete from public.mascotas
 where id in ('de000001-0000-4000-8000-000000000001',
              'de000001-0000-4000-8000-000000000002',
              'de000001-0000-4000-8000-000000000003')
   and tutor_id = 'de000000-0000-4000-8000-000000000001';

select set_config('request.jwt.claims',
  json_build_object('sub', 'de000000-0000-4000-8000-000000000001', 'role', 'authenticated')::text, false);

insert into public.mascotas (id, especie, nombre, raza, nacimiento, senas, nota) values
  ('de000001-0000-4000-8000-000000000011', 'gato',  'Coco',    'Doméstico', '2020', '', 'Dato de demostración.'),
  ('de000001-0000-4000-8000-000000000012', 'perro', 'Pony',    'Mestizo',   '2017', '', 'Dato de demostración.'),
  ('de000001-0000-4000-8000-000000000013', 'gato',  'Cenizas', 'Doméstico', '2022', '', 'Dato de demostración.'),
  ('de000001-0000-4000-8000-000000000014', 'gato',  'Félix',   'Doméstico', '2024', '', 'Dato de demostración.'),
  ('de000001-0000-4000-8000-000000000015', 'gato',  'Oreo',    'Doméstico', '2023', '', 'Dato de demostración.'),
  ('de000001-0000-4000-8000-000000000016', 'gato',  'Luna',    'Doméstico', '2021', '', 'Dato de demostración.'),
  ('de000001-0000-4000-8000-000000000017', 'perro', 'Chapito', 'Mestizo',   '2020', '', 'Dato de demostración.'),
  ('de000001-0000-4000-8000-000000000018', 'perro', 'Lupe',    'Mestizo',   '2018', '', 'Dato de demostración.'),
  ('de000001-0000-4000-8000-000000000019', 'perro', 'Emo',     'Mestizo',   '2020', '', 'Dato de demostración.')
on conflict (id) do nothing;

select set_config('request.jwt.claims', '', false);

-- Cartillas (la fila se crea sola con cada mascota). Las fechas de "próxima" son relativas a hoy y
-- se refrescan en cada ejecución: varias próximas, una vencida y una lejana, para ver estados
-- distintos.
update public.cartillas set proxima_nombre = 'Refuerzo antirrábica',      proxima_fecha = current_date + 12, recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000011';
update public.cartillas set proxima_nombre = 'Séxtuple (refuerzo anual)', proxima_fecha = current_date - 9,  recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000012';
update public.cartillas set proxima_nombre = 'Triple felina (refuerzo)',  proxima_fecha = current_date + 40, recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000013';
update public.cartillas set proxima_nombre = 'Antirrábica (refuerzo)',    proxima_fecha = current_date + 25, recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000014';
update public.cartillas set proxima_nombre = 'Triple felina (refuerzo)',  proxima_fecha = current_date + 75, recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000015';
update public.cartillas set proxima_nombre = 'Antirrábica (refuerzo)',    proxima_fecha = current_date + 5,  recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000016';
update public.cartillas set proxima_nombre = 'Séxtuple (refuerzo anual)', proxima_fecha = current_date + 18, recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000017';
update public.cartillas set proxima_nombre = 'Refuerzo antirrábica',      proxima_fecha = current_date + 60, recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000018';
update public.cartillas set proxima_nombre = 'Séxtuple (refuerzo anual)', proxima_fecha = current_date - 3,  recordatorio = true where mascota_id = 'de000001-0000-4000-8000-000000000019';

insert into public.vacunas (id, mascota_id, nombre, fecha, veterinaria) values
  ('de000009-0000-4000-8000-000000000011', 'de000001-0000-4000-8000-000000000011', 'Antirrábica',   '2026-03-20', 'Veterinaria Patitas del Desierto (demo)'),
  ('de000009-0000-4000-8000-000000000012', 'de000001-0000-4000-8000-000000000011', 'Triple felina', '2026-03-20', 'Veterinaria Patitas del Desierto (demo)'),
  ('de000009-0000-4000-8000-000000000013', 'de000001-0000-4000-8000-000000000012', 'Antirrábica',   '2025-11-05', 'Clínica Colita Feliz (demo)'),
  ('de000009-0000-4000-8000-000000000014', 'de000001-0000-4000-8000-000000000012', 'Séxtuple',      '2025-11-05', 'Clínica Colita Feliz (demo)'),
  ('de000009-0000-4000-8000-000000000015', 'de000001-0000-4000-8000-000000000013', 'Triple felina', '2026-05-10', 'Veterinaria Cerro de la Campana (demo)'),
  ('de000009-0000-4000-8000-000000000016', 'de000001-0000-4000-8000-000000000013', 'Antirrábica',   '2026-05-10', 'Veterinaria Cerro de la Campana (demo)'),
  ('de000009-0000-4000-8000-000000000017', 'de000001-0000-4000-8000-000000000014', 'Triple felina', '2025-12-02', 'Clínica Colita Feliz (demo)'),
  ('de000009-0000-4000-8000-000000000018', 'de000001-0000-4000-8000-000000000014', 'Antirrábica',   '2025-12-02', 'Clínica Colita Feliz (demo)'),
  ('de000009-0000-4000-8000-000000000019', 'de000001-0000-4000-8000-000000000015', 'Triple felina', '2026-08-14', 'Veterinaria Patitas del Desierto (demo)'),
  ('de000009-0000-4000-8000-000000000020', 'de000001-0000-4000-8000-000000000016', 'Triple felina', '2026-02-18', 'Veterinaria Cerro de la Campana (demo)'),
  ('de000009-0000-4000-8000-000000000021', 'de000001-0000-4000-8000-000000000016', 'Antirrábica',   '2026-02-18', 'Veterinaria Cerro de la Campana (demo)'),
  ('de000009-0000-4000-8000-000000000022', 'de000001-0000-4000-8000-000000000017', 'Antirrábica',   '2025-12-10', 'Veterinaria Patitas del Desierto (demo)'),
  ('de000009-0000-4000-8000-000000000023', 'de000001-0000-4000-8000-000000000017', 'Séxtuple',      '2025-12-10', 'Veterinaria Patitas del Desierto (demo)'),
  ('de000009-0000-4000-8000-000000000024', 'de000001-0000-4000-8000-000000000018', 'Séxtuple',      '2026-06-01', 'Clínica Colita Feliz (demo)'),
  ('de000009-0000-4000-8000-000000000025', 'de000001-0000-4000-8000-000000000019', 'Antirrábica',   '2025-11-20', 'Veterinaria Cerro de la Campana (demo)'),
  ('de000009-0000-4000-8000-000000000026', 'de000001-0000-4000-8000-000000000019', 'Séxtuple',      '2025-11-20', 'Veterinaria Cerro de la Campana (demo)')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------------------
-- Establecimientos (10). Coordenadas aproximadas por zona; no son negocios reales.
-- ---------------------------------------------------------------------------------------
insert into public.establecimientos
  (id, nombre, tipo, descripcion, zona, lat, lng, horario, servicios, abierto_24h, foto, es_demo) values
  ('de000002-0000-4000-8000-000000000001', 'Clínica Veterinaria Mezquite 24 h', 'clinica_24h',
   'Urgencias, cirugía y hospitalización para perros y gatos.', 'Zona centro', 29.09, -110.96,
   'Abierto las 24 horas', array['Urgencias', 'Vacunación', 'Esterilización', 'Cirugía'], true, '/images/aliados/clinica-mezquite.webp', true),
  ('de000002-0000-4000-8000-000000000002', 'Veterinaria Patitas del Desierto', 'veterinaria',
   'Consulta general, vacunación y medicina preventiva.', 'Colonia Pitic', 29.083, -110.975,
   'Lun a sáb, 9:00 a 19:00 h', array['Consulta general', 'Vacunación', 'Desparasitación'], false, '/images/aliados/veterinaria-patitas.webp', true),
  ('de000002-0000-4000-8000-000000000003', 'Hospital Veterinario Saguaro 24 h', 'clinica_24h',
   'Hospital con diagnóstico por imagen y atención de urgencias.', 'Zona norte', 29.12, -110.98,
   'Abierto las 24 horas', array['Urgencias', 'Vacunación', 'Esterilización', 'Ultrasonido'], true, '/images/aliados/hospital-saguaro.webp', true),
  ('de000002-0000-4000-8000-000000000004', 'Clínica Colita Feliz', 'veterinaria',
   'Vacunación y esterilización con atención cálida para cachorros.', 'Villa de Seris', 29.07, -110.93,
   'Lun a vie, 10:00 a 18:00 h', array['Vacunación', 'Esterilización', 'Consulta general'], false, '/images/aliados/clinica-colita-feliz.webp', true),
  ('de000002-0000-4000-8000-000000000005', 'Centro de Jornadas Sonora Pet', 'punto_campanas',
   'Sede de jornadas comunitarias de vacunación y esterilización.', 'Zona oriente', 29.1, -110.92,
   'Solo en días de jornada', array['Vacunación', 'Esterilización'], false, '/images/aliados/jornadas-sonora-pet.webp', true),
  ('de000002-0000-4000-8000-000000000006', 'Veterinaria Cerro de la Campana', 'veterinaria',
   'Vacunación y consulta para perros y gatos.', 'Zona poniente', 29.075, -111.0,
   'Lun a sáb, 9:00 a 17:00 h', array['Consulta general', 'Vacunación'], false, '/images/aliados/veterinaria-cerro-campana.webp', true),
  ('de000002-0000-4000-8000-000000000007', 'Estética Canina Pelo Dorado', 'estetica',
   'Baño, corte y cepillado con productos hipoalergénicos.', 'Colonia Modelo', 29.095, -110.95,
   'Mar a dom, 10:00 a 18:00 h', array['Baño y corte', 'Cepillado'], false, null, true),
  ('de000002-0000-4000-8000-000000000008', 'Alimentos y Accesorios El Arca', 'tienda',
   'Alimento, camas, correas y juguetes para perros y gatos.', 'Colonia Centenario', 29.085, -110.97,
   'Lun a sáb, 9:00 a 20:00 h', array['Alimento', 'Accesorios'], false, null, true),
  ('de000002-0000-4000-8000-000000000009', 'Refugio Huellas del Desierto', 'albergue',
   'Rescate y adopción responsable de perros y gatos.', 'Zona sur', 29.05, -110.96,
   'Visitas con cita', array['Adopción', 'Acogida temporal'], false, null, true),
  ('de000002-0000-4000-8000-000000000010', 'Veterinaria Mascota Feliz Norte', 'veterinaria',
   'Consulta, vacunación y farmacia veterinaria.', 'Zona norte', 29.135, -110.99,
   'Lun a sáb, 9:00 a 19:00 h', array['Consulta general', 'Vacunación', 'Farmacia'], false, null, true)
on conflict (id) do update set nombre = excluded.nombre, descripcion = excluded.descripcion, horario = excluded.horario,
  servicios = excluded.servicios, foto = excluded.foto, es_demo = true;

-- ---------------------------------------------------------------------------------------
-- Anuncios patrocinados (4). La vigencia es relativa a hoy y se refresca al volver a ejecutar.
-- ---------------------------------------------------------------------------------------
insert into public.anuncios
  (id, establecimiento_id, titulo, descripcion, promocion, imagen, vigente_desde, vigente_hasta, es_demo) values
  ('de000003-0000-4000-8000-000000000001', 'de000002-0000-4000-8000-000000000002',
   'Consulta general con descuento', 'Revisión completa de tu mascota con vacunas al día y consejos de prevención.',
   '20 % en consulta general', '/images/aliados/veterinaria-patitas.webp', current_date - 5, current_date + 55, true),
  ('de000003-0000-4000-8000-000000000002', 'de000002-0000-4000-8000-000000000004',
   'Esterilización a bajo costo', 'Programa tu cita en jornada con atención veterinaria profesional.',
   'Paquete con descuento', '/images/aliados/clinica-colita-feliz.webp', current_date - 2, current_date + 40, true),
  ('de000003-0000-4000-8000-000000000003', 'de000002-0000-4000-8000-000000000003',
   'Urgencias las 24 horas', 'Atención de urgencias y hospitalización para perros y gatos, todos los días.',
   'Primera revisión con beneficio', '/images/aliados/hospital-saguaro.webp', current_date - 10, current_date + 90, true),
  ('de000003-0000-4000-8000-000000000004', 'de000002-0000-4000-8000-000000000006',
   'Vacunación de refuerzo', 'Mantén al día la cartilla de tu perro o gato con tu folio Manchitas.',
   '15 % en vacunas', '/images/aliados/veterinaria-cerro-campana.webp', current_date - 1, current_date + 30, true)
on conflict (id) do update set vigente_desde = excluded.vigente_desde, vigente_hasta = excluded.vigente_hasta,
  titulo = excluded.titulo, descripcion = excluded.descripcion, promocion = excluded.promocion, activo = true, es_demo = true;

-- ---------------------------------------------------------------------------------------
-- Campañas (5), siempre a futuro: fechas relativas a hoy.
-- ---------------------------------------------------------------------------------------
insert into public.campanas
  (id, titulo, tipo, descripcion, fecha, horario, lugar, zona, lat, lng, organizador, establecimiento_id, es_demo) values
  ('de000004-0000-4000-8000-000000000001', 'Jornada de vacunación antirrábica', 'vacunacion',
   'Vacunación antirrábica para perros y gatos. Lleva a tu mascota con correa o transportadora.',
   current_date + 4, '9:00 a 13:00 h', 'Centro de Jornadas Sonora Pet', 'Zona oriente', 29.1, -110.92,
   'Centro de Jornadas Sonora Pet', 'de000002-0000-4000-8000-000000000005', true),
  ('de000004-0000-4000-8000-000000000002', 'Jornada de esterilización', 'esterilizacion',
   'Cirugías con cita previa. Ayuno de 8 horas para tu mascota.',
   current_date + 11, '8:00 a 14:00 h', 'Clínica Veterinaria Mezquite 24 h', 'Zona centro', 29.09, -110.96,
   'Clínica Veterinaria Mezquite 24 h', 'de000002-0000-4000-8000-000000000001', true),
  ('de000004-0000-4000-8000-000000000003', 'Vacunación en tu colonia', 'vacunacion',
   'Módulo de vacunación en la explanada de la colonia.',
   current_date + 18, '10:00 a 14:00 h', 'Explanada de la colonia Pitic', 'Colonia Pitic', 29.083, -110.975,
   'Veterinaria Patitas del Desierto', 'de000002-0000-4000-8000-000000000002', true),
  ('de000004-0000-4000-8000-000000000004', 'Feria de adopción responsable', 'adopcion',
   'Conoce perros y gatos en busca de hogar y resuelve tus dudas con rescatistas.',
   current_date + 25, '10:00 a 15:00 h', 'Refugio Huellas del Desierto', 'Zona sur', 29.05, -110.96,
   'Refugio Huellas del Desierto', 'de000002-0000-4000-8000-000000000009', true),
  ('de000004-0000-4000-8000-000000000005', 'Esterilización a bajo costo', 'esterilizacion',
   'Cupo limitado. Registra a tu mascota con anticipación.',
   current_date + 33, '8:00 a 13:00 h', 'Clínica Colita Feliz', 'Villa de Seris', 29.07, -110.93,
   'Clínica Colita Feliz', 'de000002-0000-4000-8000-000000000004', true)
on conflict (id) do update set fecha = excluded.fecha, titulo = excluded.titulo, descripcion = excluded.descripcion, es_demo = true;

-- ---------------------------------------------------------------------------------------
-- Adopciones (8): los mismos animales de ejemplo de la pantalla de Adopción. Fotos de banco; el
-- sello "Verificado" es de demostración.
-- ---------------------------------------------------------------------------------------
insert into public.adopciones
  (id, nombre, especie, sexo, edad_meses, tamano, descripcion, publicado_por, foto, verificado, es_demo) values
  ('de000005-0000-4000-8000-000000000001', 'Canela', 'perro', 'Hembra', 8, 'Mediano', 'Juguetona y sociable. Ya aprendió a caminar con correa.', 'Rescate Huellas del Desierto', '/img/adopcion-canela.webp', true, true),
  ('de000005-0000-4000-8000-000000000002', 'Toto', 'perro', 'Macho', 36, 'Grande', 'Tranquilo y cariñoso. Se lleva bien con niños y con otros perros.', 'Albergue Segunda Oportunidad', '/img/adopcion-toto.webp', true, true),
  ('de000005-0000-4000-8000-000000000003', 'Pelusa', 'perro', 'Hembra', 5, 'Chico', 'Cachorra curiosa. Necesita un hogar con paciencia para educarla.', 'Rescate Huellas del Desierto', '/img/adopcion-pelusa.webp', true, true),
  ('de000005-0000-4000-8000-000000000004', 'Bruno', 'perro', 'Macho', 60, 'Grande', 'Adulto sereno que busca un hogar con patio. Esterilizado y vacunado.', 'Albergue Segunda Oportunidad', '/img/adopcion-bruno.webp', false, true),
  ('de000005-0000-4000-8000-000000000005', 'Lola', 'perro', 'Hembra', 24, 'Chico', 'Dócil y buena compañera de departamento. Poco ladradora.', 'Patitas Rescatistas Hermosillo', '/img/adopcion-lola.webp', true, true),
  ('de000005-0000-4000-8000-000000000006', 'Misho', 'gato', 'Macho', 4, 'Chico', 'Gatito atigrado, activo y muy curioso. Usa su arenero.', 'Patitas Rescatistas Hermosillo', '/img/adopcion-misho.webp', true, true),
  ('de000005-0000-4000-8000-000000000007', 'Luna', 'gato', 'Hembra', 30, 'Mediano', 'Gata tranquila y cariñosa. Esterilizada y desparasitada.', 'Albergue Segunda Oportunidad', '/img/adopcion-luna.webp', true, true),
  ('de000005-0000-4000-8000-000000000008', 'Tigre', 'gato', 'Macho', 72, 'Mediano', 'Adulto independiente. Prefiere casas sin otros gatos.', 'Rescate Huellas del Desierto', '/img/adopcion-tigre.webp', false, true)
on conflict (id) do update set descripcion = excluded.descripcion, publicado_por = excluded.publicado_por, foto = excluded.foto, es_demo = true;

-- ---------------------------------------------------------------------------------------
-- Publicaciones de la comunidad (12). Autores ficticios: sin teléfonos ni datos reales.
-- `creado_en` es relativo a hoy y se refresca.
-- ---------------------------------------------------------------------------------------
insert into public.publicaciones (id, autor_nombre, autor_tipo, tipo, texto, creado_en, es_demo) values
  ('de000006-0000-4000-8000-000000000001', 'Refugio Huellas del Desierto', 'establecimiento', 'adopcion', 'Canela ya aprendió a caminar con correa y busca hogar. Si quieres conocerla, escríbenos desde su ficha de adopción.', now() - interval '2 hours', true),
  ('de000006-0000-4000-8000-000000000002', 'Veterinaria Patitas del Desierto', 'establecimiento', 'campana', 'Este sábado habrá módulo de vacunación en la explanada de la colonia Pitic. Lleva a tu mascota con correa.', now() - interval '5 hours', true),
  ('de000006-0000-4000-8000-000000000003', 'Lucía M.', 'tutor', 'consejo', 'Mi veterinaria me recomendó pasear a mi perro temprano o al atardecer: el pavimento a mediodía quema las almohadillas.', now() - interval '9 hours', true),
  ('de000006-0000-4000-8000-000000000004', 'Marco R.', 'ciudadano', 'comunidad', 'Gracias a quien encontró a una perrita en la colonia Modelo y la regresó a su casa con el ID del collar. Así sí funciona.', now() - interval '1 day', true),
  ('de000006-0000-4000-8000-000000000005', 'Patitas Rescatistas Hermosillo', 'rescatista', 'adopcion', 'Misho, un gatito atigrado de 4 meses, ya usa su arenero. Buscamos un hogar con paciencia y mucho cariño.', now() - interval '1 day 4 hours', true),
  ('de000006-0000-4000-8000-000000000006', 'Fernanda L.', 'tutor', 'logro', 'Hoy registré a mi perro en Manchitas y ya imprimí su etiqueta con QR. ¡Se la puso a su collar!', now() - interval '2 days', true),
  ('de000006-0000-4000-8000-000000000007', 'Clínica Colita Feliz', 'establecimiento', 'campana', 'Abrimos cupo para esterilización a bajo costo. Registra a tu mascota con anticipación.', now() - interval '2 days 6 hours', true),
  ('de000006-0000-4000-8000-000000000008', 'Diego A.', 'ciudadano', 'consejo', 'Recordatorio de verano: agua fresca y sombra siempre. Si ves un animal sin agua con este calor, avisa.', now() - interval '3 days', true),
  ('de000006-0000-4000-8000-000000000009', 'Albergue Segunda Oportunidad', 'rescatista', 'adopcion', 'Toto es tranquilo y se lleva bien con niños y con otros perros. Está esperando una familia.', now() - interval '3 days 8 hours', true),
  ('de000006-0000-4000-8000-000000000010', 'Sofía V.', 'tutor', 'comunidad', '¿Alguien conoce una buena estética canina cerca de Villa de Seris? Mi perra es muy nerviosa.', now() - interval '4 days', true),
  ('de000006-0000-4000-8000-000000000011', 'Centro de Jornadas Sonora Pet', 'establecimiento', 'campana', 'Próxima jornada de vacunación antirrábica en la zona oriente. Revisa el horario en Campañas.', now() - interval '5 days', true),
  ('de000006-0000-4000-8000-000000000012', 'Carlos P.', 'tutor', 'logro', 'Mi gata tiene su cartilla al día. Ya llegó el recordatorio de su próximo refuerzo.', now() - interval '6 days', true)
on conflict (id) do update set creado_en = excluded.creado_en, texto = excluded.texto, es_demo = true;
