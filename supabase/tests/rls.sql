-- Manchitas · prueba de seguridad (RLS, permisos y límites).
--
-- Cómo correrla: pégala completa en Supabase → SQL Editor y ejecútala, o con el CLI:
--   npx supabase db query --remote --file supabase/tests/rls.sql
-- Crea dos tutores falsos, simula sus sesiones y la de un visitante sin cuenta (`anon`), y
-- comprueba lo que cada uno puede y no puede hacer. TODO se revierte: la prueba termina a
-- propósito con un error cuyo mensaje es el resumen: cuántas comprobaciones pasaron y cuáles fallaron.
-- No deja usuarios, mascotas, reportes ni archivos.
do $do$
declare
  a uuid := gen_random_uuid();   -- tutor A
  b uuid := gen_random_uuid();   -- tutor B
  ma uuid; mb uuid;              -- mascotas de A y B
  ta text; fa text;              -- token y folio de la mascota de A
  folio_reporte text;
  v text;
  n int := 0;
  res text := '';
begin
  -- Ayudante: ejecuta una consulta (que devuelve un solo valor) con el rol y el usuario indicados,
  -- y devuelve ese valor como texto, o 'ERROR:<código>' si la base la rechazó.
  execute $f$
    create function pg_temp.como(p_rol text, p_uid uuid, p_sql text) returns text
    language plpgsql as $b$
    declare r text;
    begin
      perform set_config('request.jwt.claims',
        case when p_uid is null then '' else json_build_object('sub', p_uid, 'role', p_rol)::text end, true);
      execute 'set local role ' || quote_ident(p_rol);
      begin
        execute p_sql into r;
      exception when others then
        r := 'ERROR:' || sqlstate;
      end;
      execute 'reset role';
      return r;
    end $b$
  $f$;
  execute $f$
    create function pg_temp.fila(p_nombre text, p_ok boolean) returns text
    language sql as $b$
      select E'\n' || case when coalesce(p_ok, false) then 'OK     ' else 'FALLA  ' end || p_nombre
    $b$
  $f$;

  -- Datos de prueba: dos tutores (el trigger crea sus perfiles) y una mascota de cada uno.
  insert into auth.users (id, email, raw_user_meta_data) values
    (a, 'rls-a@prueba.invalid', '{"nombre":"Ana","apellido":"Lopez Ruiz","telefono":"6621112233"}'),
    (b, 'rls-b@prueba.invalid', '{"nombre":"Beto","apellido":"Mora","telefono":"6622223344"}');

  v := pg_temp.como('authenticated', a, $q$ with i as (insert into public.mascotas (nombre, raza, nacimiento)
        values ('Canela', 'Mestizo', '2022') returning 1) select count(*) from i $q$);
  res := res || pg_temp.fila('A registra su mascota', v = '1');
  v := pg_temp.como('authenticated', b, $q$ with i as (insert into public.mascotas (nombre, raza, nacimiento)
        values ('Rocky', 'Labrador', '2020') returning 1) select count(*) from i $q$);
  res := res || pg_temp.fila('B registra su mascota', v = '1');

  select id, token, folio into ma, ta, fa from public.mascotas where tutor_id = a;
  select id into mb from public.mascotas where tutor_id = b;

  -- Mascotas ---------------------------------------------------------------------------------
  res := res || pg_temp.fila('folio MCH-XXXXXX y token de 256 bits fijados por el servidor',
    fa ~ '^MCH-[A-HJ-NP-Z2-9]{6}$' and length(ta) = 43);
  res := res || pg_temp.fila('cada tutor ve solo sus mascotas',
    pg_temp.como('authenticated', a, 'select count(*) from public.mascotas') = '1'
    and pg_temp.como('authenticated', b, 'select count(*) from public.mascotas') = '1');
  res := res || pg_temp.fila('A no ve la mascota de B por id',
    pg_temp.como('authenticated', a, format('select count(*) from public.mascotas where id = %L', mb)) = '0');
  res := res || pg_temp.fila('A no puede editar la mascota de B',
    pg_temp.como('authenticated', a, format($q$ with u as (update public.mascotas set nombre = 'X'
      where id = %L returning 1) select count(*) from u $q$, mb)) = '0');
  res := res || pg_temp.fila('A no puede borrar la mascota de B',
    pg_temp.como('authenticated', a, format($q$ with d as (delete from public.mascotas
      where id = %L returning 1) select count(*) from d $q$, mb)) = '0');
  res := res || pg_temp.fila('no se puede elegir el dueño al crear una mascota',
    pg_temp.como('authenticated', a, format($q$ with i as (insert into public.mascotas (tutor_id, nombre, raza, nacimiento)
      values (%L, 'Intruso', 'X', '2020') returning 1) select count(*) from i $q$, b)) = 'ERROR:42501');
  res := res || pg_temp.fila('no se puede cambiar el folio ni el token',
    pg_temp.como('authenticated', a, format($q$ with u as (update public.mascotas set folio = 'MCH-AAAAAA'
      where id = %L returning 1) select count(*) from u $q$, ma)) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, format($q$ with u as (update public.mascotas set token = 'x'
      where id = %L returning 1) select count(*) from u $q$, ma)) = 'ERROR:42501');

  -- Perfiles ---------------------------------------------------------------------------------
  res := res || pg_temp.fila('cada tutor ve solo su perfil',
    pg_temp.como('authenticated', a, 'select count(*) from public.perfiles') = '1');
  res := res || pg_temp.fila('nadie puede subirse el rol a autoridad',
    pg_temp.como('authenticated', a, format($q$ with u as (update public.perfiles set rol = 'autoridad'
      where id = %L returning 1) select count(*) from u $q$, a)) = 'ERROR:42501');
  res := res || pg_temp.fila('el rol del perfil nuevo es siempre tutor',
    (select count(*) from public.perfiles where id in (a, b) and rol = 'tutor') = 2);

  -- Cartilla y vacunas -----------------------------------------------------------------------
  res := res || pg_temp.fila('la cartilla se crea sola y cada tutor ve la suya',
    pg_temp.como('authenticated', a, 'select count(*) from public.cartillas') = '1'
    and pg_temp.como('authenticated', b, format('select count(*) from public.cartillas where mascota_id = %L', ma)) = '0');
  res := res || pg_temp.fila('A no puede editar la cartilla de B',
    pg_temp.como('authenticated', a, format($q$ with u as (update public.cartillas set recordatorio = false
      where mascota_id = %L returning 1) select count(*) from u $q$, mb)) = '0');
  res := res || pg_temp.fila('A no puede registrar una vacuna en la mascota de B',
    pg_temp.como('authenticated', a, format($q$ with i as (insert into public.vacunas (mascota_id, nombre, fecha)
      values (%L, 'Rabia', current_date) returning 1) select count(*) from i $q$, mb)) = 'ERROR:42501');
  res := res || pg_temp.fila('A registra una vacuna propia',
    pg_temp.como('authenticated', a, format($q$ with i as (insert into public.vacunas (mascota_id, nombre, fecha)
      values (%L, 'Rabia', current_date) returning 1) select count(*) from i $q$, ma)) = '1');
  res := res || pg_temp.fila('B no ve las vacunas de A',
    pg_temp.como('authenticated', b, 'select count(*) from public.vacunas') = '0');

  -- Reportes ---------------------------------------------------------------------------------
  insert into public.reportes (tipo, descripcion, fecha_hechos)
    values ('otro', 'prueba rls', current_date) returning folio into folio_reporte;
  res := res || pg_temp.fila('el folio del reporte lo fija el servidor (REP-XXXXXX)',
    folio_reporte ~ '^REP-[A-HJ-NP-Z2-9]{6}$');
  res := res || pg_temp.fila('un tutor no ve los reportes',
    pg_temp.como('authenticated', a, 'select count(*) from public.reportes') = '0');
  res := res || pg_temp.fila('un tutor no puede insertar reportes por la API',
    pg_temp.como('authenticated', a, $q$ with i as (insert into public.reportes (tipo, descripcion, fecha_hechos)
      values ('otro', 'x', current_date) returning 1) select count(*) from i $q$) = 'ERROR:42501');
  res := res || pg_temp.fila('un tutor no puede editar reportes',
    pg_temp.como('authenticated', a, $q$ with u as (update public.reportes set estado = 'canalizado'
      returning 1) select count(*) from u $q$) in ('0', 'ERROR:42501'));

  -- Visitante sin cuenta (anon) ----------------------------------------------------------------
  res := res || pg_temp.fila('anon no puede leer ninguna tabla',
    (select bool_and(pg_temp.como('anon', null, 'select count(*) from public.' || t) = 'ERROR:42501')
       from unnest(array['mascotas', 'perfiles', 'cartillas', 'vacunas', 'reportes', 'intentos']) t));
  res := res || pg_temp.fila('anon no puede ejecutar la función de límites',
    pg_temp.como('anon', null, $q$ select public.limitar('x', 1, interval '1 hour') $q$) = 'ERROR:42501');
  res := res || pg_temp.fila('anon ve la ficha por token: un apellido y la base de WhatsApp, sin teléfono suelto',
    pg_temp.como('anon', null, format('select apellido_tutor from public.perfil_publico(%L)', ta)) = 'Lopez'
    and pg_temp.como('anon', null, format('select whatsapp_base from public.perfil_publico(%L)', ta))
        = 'https://wa.me/526621112233');
  res := res || pg_temp.fila('la ficha pública no devuelve folio, correo ni teléfono',
    not exists (select 1 from information_schema.parameters
      where specific_schema = 'public' and parameter_mode = 'OUT'
        and specific_name like 'perfil_publico%' and parameter_name in ('folio', 'correo', 'telefono', 'token')));
  res := res || pg_temp.fila('un token inválido o corto no devuelve nada',
    pg_temp.como('anon', null, $q$ select count(*) from public.perfil_publico('corto') $q$) = '0');
  res := res || pg_temp.fila('anon: el folio exacto (en minúsculas) devuelve el token',
    pg_temp.como('anon', null, format('select public.token_por_folio(%L)', lower(fa))) = ta);
  res := res || pg_temp.fila('anon: un folio que no existe devuelve null',
    pg_temp.como('anon', null, $q$ select public.token_por_folio('MCH-ZZZZZZ') $q$) is null);
  res := res || pg_temp.fila('anon consulta el seguimiento de un reporte por folio',
    pg_temp.como('anon', null, format('select count(*) from public.seguimiento_reporte(%L)', folio_reporte)) = '1');

  -- Límite de búsquedas por folio (20 cada 10 minutos por IP)
  loop
    v := pg_temp.como('anon', null, $q$ select public.token_por_folio('MCH-ZZZZZZ') $q$);
    n := n + 1;
    exit when v = 'ERROR:P0001' or n > 40;
  end loop;
  res := res || pg_temp.fila('el servidor frena la búsqueda por folio después de 20 consultas (frenó en la ' || n + 2 || ')',
    v = 'ERROR:P0001');

  -- Storage ----------------------------------------------------------------------------------
  res := res || pg_temp.fila('A sube una foto de mascota a su carpeta',
    pg_temp.como('authenticated', a, format($q$ with i as (insert into storage.objects (bucket_id, name)
      values ('mascotas-fotos', %L) returning 1) select count(*) from i $q$, a || '/foto.jpg')) = '1');
  res := res || pg_temp.fila('A no puede subir una foto a la carpeta de B',
    pg_temp.como('authenticated', a, format($q$ with i as (insert into storage.objects (bucket_id, name)
      values ('mascotas-fotos', %L) returning 1) select count(*) from i $q$, b || '/foto.jpg')) = 'ERROR:42501');
  v := pg_temp.como('authenticated', a, format($q$ with i as (insert into storage.objects (bucket_id, name)
      values ('cartillas-fotos', %L) returning 1) select count(*) from i $q$, a || '/cartilla.jpg'));
  res := res || pg_temp.fila('A sube la foto de su cartilla', v = '1');
  res := res || pg_temp.fila('B no ve la foto de cartilla de A',
    pg_temp.como('authenticated', b, $q$ select count(*) from storage.objects where bucket_id = 'cartillas-fotos' $q$) = '0');
  res := res || pg_temp.fila('anon no ve cartillas ni evidencia',
    pg_temp.como('anon', null, $q$ select count(*) from storage.objects
      where bucket_id in ('cartillas-fotos', 'reportes-evidencia') $q$) in ('0', 'ERROR:42501'));
  insert into storage.objects (bucket_id, name) values ('reportes-evidencia', 'prueba/1.jpg');
  res := res || pg_temp.fila('un tutor no ve la evidencia de los reportes',
    pg_temp.como('authenticated', a, $q$ select count(*) from storage.objects where bucket_id = 'reportes-evidencia' $q$) = '0');
  res := res || pg_temp.fila('los tres buckets tienen límite de 2 MB y solo JPEG',
    (select count(*) from storage.buckets where id in ('mascotas-fotos', 'cartillas-fotos', 'reportes-evidencia')
       and file_size_limit = 2097152 and allowed_mime_types = array['image/jpeg']) = 3);
  res := res || pg_temp.fila('solo el bucket de fotos de mascota es público',
    (select array_agg(id order by id) from storage.buckets where public and id in
      ('mascotas-fotos', 'cartillas-fotos', 'reportes-evidencia')) = array['mascotas-fotos']);

  -- Rol de autoridad (paso 11): lectura de reportes y evidencia
  update public.perfiles set rol = 'autoridad' where id = a;
  res := res || pg_temp.fila('una autoridad lee los reportes',
    pg_temp.como('authenticated', a, 'select count(*) from public.reportes') = (select count(*) from public.reportes)::text
    and (select count(*) from public.reportes) >= 1);
  res := res || pg_temp.fila('una autoridad ve la evidencia',
    pg_temp.como('authenticated', a, $q$ select count(*) from storage.objects where bucket_id = 'reportes-evidencia' $q$)
      = (select count(*) from storage.objects where bucket_id = 'reportes-evidencia')::text);
  res := res || pg_temp.fila('una autoridad NO ve las mascotas de otros tutores',
    pg_temp.como('authenticated', a, format('select count(*) from public.mascotas where id = %L', mb)) = '0');
  res := res || pg_temp.fila('una autoridad no puede editar reportes (solo lectura)',
    pg_temp.como('authenticated', a, $q$ with u as (update public.reportes set estado = 'canalizado'
      returning 1) select count(*) from u $q$) in ('0', 'ERROR:42501'));
  insert into public.vacunas (mascota_id, nombre, fecha) values (mb, 'Rabia', current_date);
  res := res || pg_temp.fila('una autoridad solo ve su propio perfil (no el de los tutores)',
    pg_temp.como('authenticated', a, 'select count(*) from public.perfiles') = '1');
  res := res || pg_temp.fila('una autoridad NO ve cartillas ni vacunas de otros tutores',
    pg_temp.como('authenticated', a, format('select count(*) from public.cartillas where mascota_id = %L', mb)) = '0'
    and pg_temp.como('authenticated', a, format('select count(*) from public.vacunas where mascota_id = %L', mb)) = '0');
  res := res || pg_temp.fila('una autoridad no puede insertar ni borrar reportes',
    pg_temp.como('authenticated', a, $q$ with i as (insert into public.reportes (tipo, descripcion, fecha_hechos)
      values ('otro', 'x', current_date) returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, $q$ with d as (delete from public.reportes returning 1)
      select count(*) from d $q$) = 'ERROR:42501');
  res := res || pg_temp.fila('una autoridad no puede cambiar el rol de otro perfil',
    pg_temp.como('authenticated', a, format($q$ with u as (update public.perfiles set rol = 'autoridad'
      where id = %L returning 1) select count(*) from u $q$, b)) in ('0', 'ERROR:42501'));
  res := res || pg_temp.fila('una autoridad no puede subir ni borrar evidencia (solo la lee)',
    pg_temp.como('authenticated', a, $q$ with i as (insert into storage.objects (bucket_id, name)
      values ('reportes-evidencia', 'x/1.jpg') returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, $q$ with d as (delete from storage.objects
      where bucket_id = 'reportes-evidencia' returning 1) select count(*) from d $q$) in ('0', 'ERROR:42501'));
  res := res || pg_temp.fila('un tutor sin rol sigue sin ver reportes ni evidencia',
    pg_temp.como('authenticated', b, 'select count(*) from public.reportes') = '0'
    and pg_temp.como('authenticated', b, $q$ select count(*) from storage.objects
      where bucket_id = 'reportes-evidencia' $q$) = '0');

  -- Bloque A: comunidad y perfil ampliado ------------------------------------------------------
  insert into public.establecimientos (id, nombre, tipo, es_demo)
    values ('00000000-0000-4000-8000-0000000000e1', 'RLS-vet', 'veterinaria', true);
  insert into public.anuncios (establecimiento_id, titulo, vigente_desde, vigente_hasta, activo) values
    ('00000000-0000-4000-8000-0000000000e1', 'RLS-vigente', current_date - 1, current_date + 5, true),
    ('00000000-0000-4000-8000-0000000000e1', 'RLS-vencido', current_date - 10, current_date - 1, true),
    ('00000000-0000-4000-8000-0000000000e1', 'RLS-apagado', current_date - 1, current_date + 5, false);
  insert into public.campanas (titulo, tipo, fecha) values ('RLS-campana', 'vacunacion', current_date + 3);
  insert into public.adopciones (nombre, especie, sexo, edad_meses, tamano) values ('RLS-adopta', 'gato', 'Hembra', 6, 'Chico');
  insert into public.publicaciones (autor_nombre, texto) values ('RLS', 'RLS-publicacion');

  res := res || pg_temp.fila('un tutor con sesión lee establecimientos, campañas, adopciones y publicaciones',
    pg_temp.como('authenticated', b, $q$ select count(*) from public.establecimientos where nombre = 'RLS-vet' $q$) = '1'
    and pg_temp.como('authenticated', b, $q$ select count(*) from public.campanas where titulo = 'RLS-campana' $q$) = '1'
    and pg_temp.como('authenticated', b, $q$ select count(*) from public.adopciones where nombre = 'RLS-adopta' $q$) = '1'
    and pg_temp.como('authenticated', b, $q$ select count(*) from public.publicaciones where texto = 'RLS-publicacion' $q$) = '1');
  res := res || pg_temp.fila('solo se ven los anuncios activos y vigentes (no vencidos ni apagados)',
    pg_temp.como('authenticated', b, $q$ select string_agg(titulo, ',') from public.anuncios where titulo like 'RLS-%' $q$) = 'RLS-vigente');
  res := res || pg_temp.fila('anon no lee ninguna de las tablas de comunidad',
    pg_temp.como('anon', null, 'select count(*) from public.establecimientos') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.anuncios') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.campanas') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.adopciones') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.publicaciones') = 'ERROR:42501');
  res := res || pg_temp.fila('un tutor no puede insertar en las tablas de comunidad',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.anuncios (establecimiento_id, titulo, vigente_hasta)
      values ('00000000-0000-4000-8000-0000000000e1', 'X', current_date + 1) returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, $q$ with i as (insert into public.publicaciones (autor_nombre, texto)
      values ('X', 'X') returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, $q$ with i as (insert into public.establecimientos (nombre, tipo)
      values ('X', 'tienda') returning 1) select count(*) from i $q$) = 'ERROR:42501');
  res := res || pg_temp.fila('un tutor no puede editar ni borrar publicaciones, anuncios ni adopciones',
    pg_temp.como('authenticated', b, $q$ with u as (update public.publicaciones set texto = 'X' returning 1) select count(*) from u $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, $q$ with d as (delete from public.anuncios returning 1) select count(*) from d $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, $q$ with u as (update public.adopciones set verificado = true returning 1) select count(*) from u $q$) = 'ERROR:42501');
  res := res || pg_temp.fila('indicadores_comunidad: solo con sesión, y solo devuelve conteos',
    pg_temp.como('authenticated', b, 'select (indicadores_comunidad()->>''establecimientos'')::int >= 1') = 'true'
    and pg_temp.como('anon', null, 'select indicadores_comunidad()::text') = 'ERROR:42501');

  res := res || pg_temp.fila('un tutor puede editar su ciudad, colonia y tipo de usuario',
    pg_temp.como('authenticated', b, format($q$ with u as (update public.perfiles set ciudad = 'Hermosillo', colonia = 'Pitic',
      tipo_usuario = 'rescatista' where id = %L returning 1) select count(*) from u $q$, b)) = '1');
  res := res || pg_temp.fila('un tutor NO puede cambiarse es_demo ni el rol',
    pg_temp.como('authenticated', b, format($q$ with u as (update public.perfiles set es_demo = true where id = %L returning 1)
      select count(*) from u $q$, b)) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, format($q$ with u as (update public.perfiles set rol = 'autoridad' where id = %L returning 1)
      select count(*) from u $q$, b)) = 'ERROR:42501');
  res := res || pg_temp.fila('el tipo de usuario no es un rol: no da acceso a reportes',
    pg_temp.como('authenticated', b, 'select count(*) from public.reportes') = '0');

  -- El perfil sale de los metadatos del registro: tipo inválido -> tutor; rol y es_demo se ignoran.
  insert into auth.users (id, email, raw_user_meta_data) values
    ('00000000-0000-4000-8000-0000000000c1', 'rls-c@prueba.invalid',
     '{"nombre":"Cris","tipo_usuario":"administrador","rol":"autoridad","es_demo":true,"ciudad":"Cajeme","colonia":"Centro"}'),
    ('00000000-0000-4000-8000-0000000000d1', 'rls-d@prueba.invalid', '{"nombre":"Dani","tipo_usuario":"rescatista"}');
  res := res || pg_temp.fila('registro: un tipo de usuario inválido cae a tutor y el rol/es_demo de los metadatos se ignoran',
    (select tipo_usuario = 'tutor' and rol = 'tutor' and not es_demo and ciudad = 'Cajeme' and colonia = 'Centro'
       from public.perfiles where id = '00000000-0000-4000-8000-0000000000c1'));
  res := res || pg_temp.fila('registro: tipo rescatista válido y ciudad por defecto Hermosillo',
    (select tipo_usuario = 'rescatista' and ciudad = 'Hermosillo' and colonia = ''
       from public.perfiles where id = '00000000-0000-4000-8000-0000000000d1'));

  -- Bloque B: reseñas, promociones, colectas y aportaciones -------------------------------------
  insert into public.establecimientos (id, nombre, tipo, propietario_id)
    values ('00000000-0000-4000-8000-0000000000e2', 'RLS-vet-b', 'veterinaria', b);
  create temp table _b (k text primary key, val text);

  -- Reseñas
  v := pg_temp.como('authenticated', a, $q$ with i as (insert into public.resenas (establecimiento_id, puntuacion, comentario)
        values ('00000000-0000-4000-8000-0000000000e1', 4, 'Buen servicio') returning 1) select count(*) from i $q$);
  res := res || pg_temp.fila('una persona con sesión puede reseñar un establecimiento', v = '1');
  res := res || pg_temp.fila('la reseña sale con autor y nombre fijados por el servidor, sin verificar y sin respuesta',
    (select autor_id = a and autor_nombre like 'Ana%' and not verificada and respuesta is null and not es_demo
       from public.resenas where establecimiento_id = '00000000-0000-4000-8000-0000000000e1' and autor_id = a));
  res := res || pg_temp.fila('una persona no puede reseñar dos veces el mismo establecimiento',
    pg_temp.como('authenticated', a, $q$ with i as (insert into public.resenas (establecimiento_id, puntuacion)
      values ('00000000-0000-4000-8000-0000000000e1', 5) returning 1) select count(*) from i $q$) = 'ERROR:23505');
  res := res || pg_temp.fila('la puntuación debe ser de 1 a 5',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.resenas (establecimiento_id, puntuacion)
      values ('00000000-0000-4000-8000-0000000000e1', 9) returning 1) select count(*) from i $q$) = 'ERROR:23514');
  res := res || pg_temp.fila('el autor no puede marcar su reseña como verificada ni escribir la respuesta',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.resenas (establecimiento_id, puntuacion, verificada)
      values ('00000000-0000-4000-8000-0000000000e1', 5, true) returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, $q$ with u as (update public.resenas set verificada = true where autor_id = (select auth.uid())
      returning 1) select count(*) from u $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, $q$ with u as (update public.resenas set respuesta = 'x' where autor_id = (select auth.uid())
      returning 1) select count(*) from u $q$) = 'ERROR:42501');
  v := pg_temp.como('authenticated', a, $q$ with u as (update public.resenas set puntuacion = 5 where autor_id = (select auth.uid())
      returning 1) select count(*) from u $q$);
  res := res || pg_temp.fila('el autor puede editar su reseña y queda marcada como editada',
    v = '1' and (select editada_en is not null and puntuacion = 5 from public.resenas where autor_id = a and establecimiento_id = '00000000-0000-4000-8000-0000000000e1'));
  res := res || pg_temp.fila('nadie más puede editar ni borrar la reseña de otra persona',
    pg_temp.como('authenticated', b, format($q$ with u as (update public.resenas set puntuacion = 1 where autor_id = %L returning 1)
      select count(*) from u $q$, a)) = '0'
    and pg_temp.como('authenticated', b, format($q$ with d as (delete from public.resenas where autor_id = %L returning 1)
      select count(*) from d $q$, a)) = '0');
  perform set_config('request.jwt.claims', '', true);  -- vuelve a ser administración: sin usuario simulado
  insert into public.resenas (id, establecimiento_id, autor_nombre, puntuacion, es_demo)
    values ('00000000-0000-4000-8000-0000000000f1', '00000000-0000-4000-8000-0000000000e2', 'Cliente', 3, true);
  v := pg_temp.como('authenticated', a, $q$ with x as (select public.responder_resena('00000000-0000-4000-8000-0000000000f1', 'Gracias')) select 'ok' from x $q$);
  insert into _b values ('resp_ajena', v);
  v := pg_temp.como('authenticated', b, $q$ with x as (select public.responder_resena('00000000-0000-4000-8000-0000000000f1', 'Gracias por venir')) select 'ok' from x $q$);
  res := res || pg_temp.fila('solo el dueño del establecimiento responde una reseña (otra persona no)',
    (select val from _b where k = 'resp_ajena') = 'ERROR:42501' and v = 'ok'
    and (select respuesta = 'Gracias por venir' and respuesta_en is not null from public.resenas where id = '00000000-0000-4000-8000-0000000000f1'));
  res := res || pg_temp.fila('un dueño no puede responder reseñas de otro establecimiento',
    pg_temp.como('authenticated', b, format($q$ with x as (select public.responder_resena(%L, 'x')) select 'ok' from x $q$,
      (select id from public.resenas where autor_id = a limit 1))) = 'ERROR:42501');
  update public.perfiles set rol = 'moderador' where id = '00000000-0000-4000-8000-0000000000d1';
  v := pg_temp.como('authenticated', b, $q$ with x as (select public.verificar_resena('00000000-0000-4000-8000-0000000000f1', true)) select 'ok' from x $q$);
  insert into _b values ('verif_dueno', v);
  v := pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000d1', $q$ with x as (select public.verificar_resena('00000000-0000-4000-8000-0000000000f1', true)) select 'ok' from x $q$);
  res := res || pg_temp.fila('solo un moderador verifica reseñas',
    (select val from _b where k = 'verif_dueno') = 'ERROR:42501' and v = 'ok'
    and (select verificada from public.resenas where id = '00000000-0000-4000-8000-0000000000f1'));
  res := res || pg_temp.fila('anon no lee reseñas ni ejecuta funciones de moderación',
    pg_temp.como('anon', null, 'select count(*) from public.resenas') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select public.es_moderador()::text') = 'ERROR:42501');
  res := res || pg_temp.fila('el resumen de calificaciones cuenta las reseñas',
    pg_temp.como('authenticated', b, $q$ select total_resenas::text from public.establecimientos_resumen where id = '00000000-0000-4000-8000-0000000000e1' $q$) = '1');

  -- Promociones y edición del establecimiento
  res := res || pg_temp.fila('el dueño publica promociones de su establecimiento',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.promociones (establecimiento_id, titulo, vigente_hasta)
      values ('00000000-0000-4000-8000-0000000000e2', 'Promo propia', current_date + 5) returning 1) select count(*) from i $q$) = '1');
  res := res || pg_temp.fila('nadie publica promociones en nombre de otro establecimiento',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.promociones (establecimiento_id, titulo, vigente_hasta)
      values ('00000000-0000-4000-8000-0000000000e1', 'Promo ajena', current_date + 5) returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, $q$ with i as (insert into public.promociones (establecimiento_id, titulo, vigente_hasta)
      values ('00000000-0000-4000-8000-0000000000e2', 'Promo ajena', current_date + 5) returning 1) select count(*) from i $q$) = 'ERROR:42501');
  res := res || pg_temp.fila('nadie edita ni borra promociones ajenas',
    pg_temp.como('authenticated', a, $q$ with u as (update public.promociones set titulo = 'X' returning 1) select count(*) from u $q$) = '0'
    and pg_temp.como('authenticated', a, $q$ with d as (delete from public.promociones returning 1) select count(*) from d $q$) = '0');
  perform set_config('request.jwt.claims', '', true);  -- vuelve a ser administración: sin usuario simulado
  insert into public.promociones (establecimiento_id, titulo, vigente_desde, vigente_hasta, activa) values
    ('00000000-0000-4000-8000-0000000000e2', 'RLS-vencida', current_date - 10, current_date - 1, true);
  res := res || pg_temp.fila('las promociones vencidas solo las ve su dueño',
    pg_temp.como('authenticated', a, $q$ select count(*) from public.promociones where titulo = 'RLS-vencida' $q$) = '0'
    and pg_temp.como('authenticated', b, $q$ select count(*) from public.promociones where titulo = 'RLS-vencida' $q$) = '1');
  res := res || pg_temp.fila('el dueño edita su establecimiento, pero no el de otro ni su nombre/propietario',
    pg_temp.como('authenticated', b, $q$ with u as (update public.establecimientos set descripcion = 'Nueva'
      where id = '00000000-0000-4000-8000-0000000000e2' returning 1) select count(*) from u $q$) = '1'
    and pg_temp.como('authenticated', b, $q$ with u as (update public.establecimientos set descripcion = 'X'
      where id = '00000000-0000-4000-8000-0000000000e1' returning 1) select count(*) from u $q$) = '0'
    and pg_temp.como('authenticated', b, $q$ with u as (update public.establecimientos set nombre = 'Otro'
      where id = '00000000-0000-4000-8000-0000000000e2' returning 1) select count(*) from u $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, format($q$ with u as (update public.establecimientos set propietario_id = %L
      where id = '00000000-0000-4000-8000-0000000000e2' returning 1) select count(*) from u $q$, a)) = 'ERROR:42501');

  -- Colectas (Manchitas Solidario)
  v := pg_temp.como('authenticated', a, $q$ select public.crear_colecta('{"titulo":"RLS campaña de prueba","resumen":"x",
    "historia":"Historia de prueba con más de veinte caracteres","beneficiario_tipo":"mascota","beneficiario_nombre":"Tobi",
    "meta_mxn":1000,"fecha_fin":"2099-01-01","foto_principal":"","fotos":[],
    "gastos":[{"concepto":"A","monto_mxn":600},{"concepto":"B","monto_mxn":400}]}'::jsonb)::text $q$);
  insert into _b values ('col', v);
  res := res || pg_temp.fila('crear una colecta devuelve su id y nace en revisión con el organizador de la sesión',
    (select estado = 'en_revision' and organizador_id = a and organizador_nombre like 'Ana%' and not es_demo
       from public.colectas where id = (select val::uuid from _b where k = 'col')));
  res := res || pg_temp.fila('el desglose debe sumar exactamente la meta',
    pg_temp.como('authenticated', a, $q$ select public.crear_colecta('{"titulo":"RLS desglose mal","historia":"Historia de prueba con más de veinte caracteres",
      "beneficiario_tipo":"mascota","beneficiario_nombre":"X","meta_mxn":1000,"fecha_fin":"2099-01-01",
      "gastos":[{"concepto":"A","monto_mxn":900}]}'::jsonb)::text $q$) = 'ERROR:P0001');
  res := res || pg_temp.fila('anon no puede crear colectas ni aportar',
    pg_temp.como('anon', null, $q$ select public.crear_colecta('{}'::jsonb)::text $q$) = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.colectas') = 'ERROR:42501');
  res := res || pg_temp.fila('el cliente no puede insertar colectas, gastos ni aportaciones directamente',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.colectas (organizador_nombre, titulo, historia, beneficiario_tipo,
      beneficiario_nombre, meta_mxn, fecha_fin) values ('X', 'Titulo largo', 'Historia de prueba con más de veinte caracteres', 'mascota', 'X', 1000,
      current_date + 5) returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, $q$ with i as (insert into public.aportaciones (colecta_id, donante_nombre, monto_mxn, estado)
      values (gen_random_uuid(), 'X', 100, 'confirmada') returning 1) select count(*) from i $q$) = 'ERROR:42501');
  res := res || pg_temp.fila('una colecta en revisión solo la ven su organizador y un moderador',
    pg_temp.como('authenticated', a, format('select count(*) from public.colectas where id = %L', (select val from _b where k = 'col'))) = '1'
    and pg_temp.como('authenticated', b, format('select count(*) from public.colectas where id = %L', (select val from _b where k = 'col'))) = '0'
    and pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000d1', format('select count(*) from public.colectas where id = %L', (select val from _b where k = 'col'))) = '1');
  res := res || pg_temp.fila('no se puede aportar a una colecta que no está publicada',
    pg_temp.como('authenticated', b, format($q$ select public.registrar_aportacion(%L, 100, '', false)::text $q$, (select val from _b where k = 'col'))) = 'ERROR:P0001');
  v := pg_temp.como('authenticated', b, format($q$ with x as (select public.moderar_colecta(%L, 'publicada')) select 'ok' from x $q$, (select val from _b where k = 'col')));
  insert into _b values ('mod_b', v);
  v := pg_temp.como('authenticated', a, format($q$ with x as (select public.moderar_colecta(%L, 'publicada')) select 'ok' from x $q$, (select val from _b where k = 'col')));
  insert into _b values ('mod_a', v);
  v := pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000d1', format($q$ with x as (select public.moderar_colecta(%L, 'publicada')) select 'ok' from x $q$, (select val from _b where k = 'col')));
  res := res || pg_temp.fila('solo un moderador publica o rechaza colectas',
    (select val from _b where k = 'mod_b') = 'ERROR:42501' and (select val from _b where k = 'mod_a') = 'ERROR:42501' and v = 'ok'
    and (select estado = 'publicada' and publicada_en is not null from public.colectas where id = (select val::uuid from _b where k = 'col')));
  res := res || pg_temp.fila('una colecta publicada la ve cualquier persona con sesión',
    pg_temp.como('authenticated', b, format('select count(*) from public.colectas where id = %L', (select val from _b where k = 'col'))) = '1');
  v := pg_temp.como('authenticated', b, format($q$ select public.registrar_aportacion(%L, 500, 'Ánimo', false)::text $q$, (select val from _b where k = 'col')));
  res := res || pg_temp.fila('aportar crea una aportación PENDIENTE y SIMULADA, con el nombre fijado por el servidor',
    coalesce(v, '') ~ '^[0-9a-f-]{36}$'
    and (select estado = 'pendiente' and simulada and monto_mxn = 500 and donante_id = b and donante_nombre like 'Beto%'
           from public.aportaciones where colecta_id = (select val::uuid from _b where k = 'col') and donante_id = b and not anonima));
  res := res || pg_temp.fila('una aportación pendiente NO suma a lo recaudado',
    (select recaudado_mxn = 0 and donantes = 0 from public.colectas_resumen where id = (select val::uuid from _b where k = 'col')));
  res := res || pg_temp.fila('el monto de una aportación debe estar entre $10 y $100,000',
    pg_temp.como('authenticated', b, format($q$ select public.registrar_aportacion(%L, 5, '', false)::text $q$, (select val from _b where k = 'col'))) = 'ERROR:23514');
  v := pg_temp.como('authenticated', b, format($q$ select public.registrar_aportacion(%L, 100, '', true)::text $q$, (select val from _b where k = 'col')));
  res := res || pg_temp.fila('una aportación anónima oculta el nombre',
    coalesce(v, '') ~ '^[0-9a-f-]{36}$'
    and exists (select 1 from public.aportaciones where donante_id = b and anonima and donante_nombre = 'Anónimo'));
  res := res || pg_temp.fila('las aportaciones no confirmadas solo las ven su autor y el organizador',
    pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', format('select count(*) from public.aportaciones where colecta_id = %L', (select val from _b where k = 'col'))) = '0'
    and pg_temp.como('authenticated', a, format('select count(*) from public.aportaciones where colecta_id = %L', (select val from _b where k = 'col'))) = '2'
    and pg_temp.como('authenticated', b, format('select count(*) from public.aportaciones where colecta_id = %L', (select val from _b where k = 'col'))) = '2');
  res := res || pg_temp.fila('nadie puede cambiar el estado ni el monto de una aportación ni borrarla',
    pg_temp.como('authenticated', b, $q$ with u as (update public.aportaciones set estado = 'confirmada', monto_mxn = 99999 returning 1) select count(*) from u $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, $q$ with d as (delete from public.aportaciones returning 1) select count(*) from d $q$) = 'ERROR:42501');
  perform set_config('request.jwt.claims', '', true);  -- vuelve a ser administración: sin usuario simulado
  insert into public.aportaciones (colecta_id, donante_nombre, monto_mxn, estado, simulada, es_demo)
    values ((select val::uuid from _b where k = 'col'), 'Demo', 300, 'confirmada', true, true);
  res := res || pg_temp.fila('solo las aportaciones confirmadas suman a lo recaudado y las ve todo el mundo',
    (select recaudado_mxn = 300 and donantes = 1 from public.colectas_resumen where id = (select val::uuid from _b where k = 'col'))
    and pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', format('select count(*) from public.aportaciones where colecta_id = %L', (select val from _b where k = 'col'))) = '1');
  res := res || pg_temp.fila('solo el organizador publica actualizaciones de su colecta publicada',
    pg_temp.como('authenticated', b, format($q$ select public.publicar_actualizacion(%L, 'Hola', 'Texto')::text $q$, (select val from _b where k = 'col'))) = 'ERROR:42501'
    and coalesce(pg_temp.como('authenticated', a, format($q$ select public.publicar_actualizacion(%L, 'Hola', 'Texto')::text $q$, (select val from _b where k = 'col'))), '') <> '');
  res := res || pg_temp.fila('el cliente no puede escribir actualizaciones directamente',
    pg_temp.como('authenticated', a, format($q$ with i as (insert into public.colecta_actualizaciones (colecta_id, titulo, texto)
      values (%L, 'X', 'X') returning 1) select count(*) from i $q$, (select val from _b where k = 'col'))) = 'ERROR:42501');
  res := res || pg_temp.fila('fotos de colectas: cada quien escribe solo en su carpeta',
    pg_temp.como('authenticated', a, format($q$ with i as (insert into storage.objects (bucket_id, name) values ('colectas-fotos', %L)
      returning 1) select count(*) from i $q$, a || '/prueba.jpg')) = '1'
    and pg_temp.como('authenticated', a, format($q$ with i as (insert into storage.objects (bucket_id, name) values ('colectas-fotos', %L)
      returning 1) select count(*) from i $q$, b || '/ajena.jpg')) = 'ERROR:42501');

  -- Bloque C: mascotas extraviadas, foros y notificaciones -------------------------------------
  -- Nota: cada llamada a una función volátil va en su propia sentencia; una subconsulta en la misma
  -- expresión usaría la foto de datos anterior a sus cambios.
  perform set_config('request.jwt.claims', '', true);

  v := pg_temp.como('authenticated', a, $q$ with i as (insert into public.extraviados (nombre, especie, zona, fecha_extravio)
        values ('RLS-Luna', 'gato', 'Colonia de prueba', public.hoy_hermosillo()) returning 1) select count(*) from i $q$);
  res := res || pg_temp.fila('una persona con sesión reporta a su mascota extraviada', v = '1');
  insert into _b select 'ext', id::text from public.extraviados where tutor_id = a;
  res := res || pg_temp.fila('el servidor fija tutor, nombre visible y estado activo del reporte',
    (select estado = 'activo' and tutor_nombre like 'Ana%' and not es_demo and aviso_previo_en is null and foro_creado_en is null
       from public.extraviados where id = (select val::uuid from _b where k = 'ext')));
  res := res || pg_temp.fila('el cliente no puede escribir el estado ni el tutor del reporte',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.extraviados (nombre, especie, zona, fecha_extravio, estado)
      values ('X', 'gato', 'Z', public.hoy_hermosillo(), 'localizado') returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, format($q$ with i as (insert into public.extraviados (nombre, especie, zona, fecha_extravio, tutor_id)
      values ('X', 'gato', 'Z', public.hoy_hermosillo(), %L) returning 1) select count(*) from i $q$, a)) = 'ERROR:42501');
  res := res || pg_temp.fila('la fecha del extravío no puede ser futura ni de hace más de 30 días',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.extraviados (nombre, especie, zona, fecha_extravio)
      values ('X', 'gato', 'Z', public.hoy_hermosillo() + 1) returning 1) select count(*) from i $q$) = 'ERROR:P0001'
    and pg_temp.como('authenticated', b, $q$ with i as (insert into public.extraviados (nombre, especie, zona, fecha_extravio)
      values ('X', 'gato', 'Z', public.hoy_hermosillo() - 40) returning 1) select count(*) from i $q$) = 'ERROR:P0001');
  res := res || pg_temp.fila('no se puede reportar con la mascota registrada de otra persona',
    pg_temp.como('authenticated', b, format($q$ with i as (insert into public.extraviados (mascota_id, nombre, especie, zona, fecha_extravio)
      values (%L, 'X', 'perro', 'Z', public.hoy_hermosillo()) returning 1) select count(*) from i $q$, ma)) = 'ERROR:42501');
  res := res || pg_temp.fila('el tutor corrige zona y descripción; el estado no lo puede tocar; otra persona no edita',
    pg_temp.como('authenticated', a, $q$ with u as (update public.extraviados set zona = 'Otra zona' where tutor_id = (select auth.uid()) returning 1) select count(*) from u $q$) = '1'
    and pg_temp.como('authenticated', a, $q$ with u as (update public.extraviados set estado = 'localizado' where tutor_id = (select auth.uid()) returning 1) select count(*) from u $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, format($q$ with u as (update public.extraviados set zona = 'X' where id = %L returning 1) select count(*) from u $q$, (select val from _b where k = 'ext'))) = '0');
  res := res || pg_temp.fila('anon no lee reportes, foros, mensajes ni notificaciones',
    pg_temp.como('anon', null, 'select count(*) from public.extraviados') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.foros') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.extravio_mensajes') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.notificaciones') = 'ERROR:42501');

  -- Avistamientos y comentarios
  v := pg_temp.como('authenticated', b, format($q$ with i as (insert into public.extravio_mensajes (extraviado_id, tipo, texto, zona)
        values (%L, 'avistamiento', 'La vi cerca del parque', 'Parque central') returning 1) select count(*) from i $q$, (select val from _b where k = 'ext')));
  res := res || pg_temp.fila('cualquier persona con sesión publica un avistamiento en un reporte activo', v = '1');
  res := res || pg_temp.fila('el avistamiento sale con el autor fijado por el servidor',
    (select autor_id = b and autor_nombre like 'Beto%' and not es_demo from public.extravio_mensajes
       where extraviado_id = (select val::uuid from _b where k = 'ext') and tipo = 'avistamiento'));
  res := res || pg_temp.fila('el avistamiento avisa al tutor con una notificación',
    (select count(*) = 1 from public.notificaciones where usuario_id = a and tipo = 'avistamiento'));
  v := pg_temp.como('authenticated', b, format($q$ with i as (insert into public.extravio_mensajes (extraviado_id, tipo, texto, zona)
        values (%L, 'comentario', 'Mucho ánimo', 'esta zona se ignora') returning 1) select count(*) from i $q$, (select val from _b where k = 'ext')));
  res := res || pg_temp.fila('un comentario no guarda zona (solo los avistamientos la llevan)',
    v = '1' and (select zona = '' from public.extravio_mensajes where texto = 'Mucho ánimo'));
  res := res || pg_temp.fila('nadie puede publicar como otra persona ni dejar mensajes vacíos',
    pg_temp.como('authenticated', b, format($q$ with i as (insert into public.extravio_mensajes (extraviado_id, tipo, texto)
      values (%L, 'comentario', '') returning 1) select count(*) from i $q$, (select val from _b where k = 'ext'))) = 'ERROR:23514'
    and pg_temp.como('authenticated', b, format($q$ with i as (insert into public.extravio_mensajes (extraviado_id, tipo, texto, autor_id)
      values (%L, 'comentario', 'x', %L) returning 1) select count(*) from i $q$, (select val from _b where k = 'ext'), a)) = 'ERROR:42501');
  res := res || pg_temp.fila('otra persona no borra mensajes ajenos, pero el tutor modera los de su reporte',
    pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', $q$ with d as (delete from public.extravio_mensajes where texto = 'Mucho ánimo' returning 1) select count(*) from d $q$) = '0'
    and pg_temp.como('authenticated', a, $q$ with d as (delete from public.extravio_mensajes where texto = 'Mucho ánimo' returning 1) select count(*) from d $q$) = '1');
  res := res || pg_temp.fila('el autor borra su propio mensaje',
    pg_temp.como('authenticated', b, $q$ with d as (delete from public.extravio_mensajes where texto = 'La vi cerca del parque' returning 1) select count(*) from d $q$) = '1');

  -- Notificaciones: solo las propias, solo marcar como leídas
  res := res || pg_temp.fila('cada quien ve solo sus notificaciones',
    pg_temp.como('authenticated', a, 'select count(*) from public.notificaciones') <> '0'
    and pg_temp.como('authenticated', b, 'select count(*) from public.notificaciones') = '0');
  res := res || pg_temp.fila('se puede marcar una notificación como leída, pero no cambiar su texto ni crear otras',
    pg_temp.como('authenticated', a, $q$ with u as (update public.notificaciones set leida = true returning 1) select (count(*) > 0)::text from u $q$) = 'true'
    and pg_temp.como('authenticated', a, $q$ with u as (update public.notificaciones set titulo = 'X' returning 1) select count(*) from u $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, format($q$ with i as (insert into public.notificaciones (usuario_id, tipo, titulo) values (%L, 'x', 'X') returning 1) select count(*) from i $q$, a)) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, format($q$ with u as (update public.notificaciones set leida = false where usuario_id = %L returning 1) select count(*) from u $q$, a)) = '0');

  -- Contacto protegido por WhatsApp
  perform set_config('request.jwt.claims', '', true);
  res := res || pg_temp.fila('sin autorización del tutor no se entrega ningún enlace de WhatsApp',
    coalesce(pg_temp.como('authenticated', b, format($q$ select public.extravio_whatsapp(%L) $q$, (select val from _b where k = 'ext'))), '') = '');
  update public.extraviados set contacto_whatsapp = true where id = (select val::uuid from _b where k = 'ext');
  res := res || pg_temp.fila('con autorización del tutor el enlace sale del servidor y solo con sesión',
    pg_temp.como('authenticated', b, format($q$ select public.extravio_whatsapp(%L) $q$, (select val from _b where k = 'ext'))) = 'https://wa.me/526621112233'
    and pg_temp.como('anon', null, format($q$ select public.extravio_whatsapp(%L) $q$, (select val from _b where k = 'ext'))) = 'ERROR:42501');

  -- Automatización: aviso del día 4 y foro del día 5 (idempotente)
  perform set_config('request.jwt.claims', '', true);
  insert into public.extraviados (id, tutor_id, tutor_nombre, nombre, especie, zona, fecha_extravio) values
    ('00000000-0000-4000-8000-0000000000a2', a, 'Ana L.', 'RLS-dia2', 'perro', 'Z', public.hoy_hermosillo() - 2),
    ('00000000-0000-4000-8000-0000000000a4', a, 'Ana L.', 'RLS-dia4', 'perro', 'Z', public.hoy_hermosillo() - 4),
    ('00000000-0000-4000-8000-0000000000a5', a, 'Ana L.', 'RLS-dia5', 'gato', 'Z', public.hoy_hermosillo() - 5),
    ('00000000-0000-4000-8000-0000000000a6', a, 'Ana L.', 'RLS-dia6', 'gato', 'Z', public.hoy_hermosillo() - 6);
  update public.extraviados set estado = 'cerrado' where id = '00000000-0000-4000-8000-0000000000a6';
  perform public.procesar_extraviados();
  res := res || pg_temp.fila('el día 4 se avisa al tutor y todavía no hay foro',
    (select aviso_previo_en is not null and foro_creado_en is null from public.extraviados where id = '00000000-0000-4000-8000-0000000000a4')
    and not exists (select 1 from public.foros where extraviado_id = '00000000-0000-4000-8000-0000000000a4')
    and (select count(*) = 1 from public.notificaciones where usuario_id = a and tipo = 'extravio_aviso_previo'));
  res := res || pg_temp.fila('el día 5 se abre un foro con su notificación',
    exists (select 1 from public.foros where extraviado_id = '00000000-0000-4000-8000-0000000000a5' and estado = 'abierto')
    and (select foro_creado_en is not null from public.extraviados where id = '00000000-0000-4000-8000-0000000000a5')
    and (select count(*) = 1 from public.notificaciones where usuario_id = a and tipo = 'foro_abierto'));
  res := res || pg_temp.fila('antes del día 4 no pasa nada y un reporte cerrado no genera foro',
    (select aviso_previo_en is null from public.extraviados where id = '00000000-0000-4000-8000-0000000000a2')
    and not exists (select 1 from public.foros where extraviado_id in ('00000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-0000000000a6')));
  perform public.procesar_extraviados();
  perform public.procesar_extraviados();
  res := res || pg_temp.fila('ejecutarla varias veces no duplica foros ni avisos (idempotente)',
    (select count(*) = 1 from public.foros where extraviado_id = '00000000-0000-4000-8000-0000000000a5')
    and (select count(*) = 1 from public.notificaciones where usuario_id = a and tipo = 'extravio_aviso_previo')
    and (select count(*) = 1 from public.notificaciones where usuario_id = a and tipo = 'foro_abierto'));
  res := res || pg_temp.fila('la automatización deja registro en su bitácora',
    (select count(*) >= 3 from public.automatizacion_log where tarea = 'procesar_extraviados'));
  v := 'sin error';
  begin
    insert into public.foros (extraviado_id) values ('00000000-0000-4000-8000-0000000000a5');
  exception when unique_violation then
    v := 'duplicado';
  end;
  res := res || pg_temp.fila('la base impide dos foros para el mismo reporte', v = 'duplicado');
  res := res || pg_temp.fila('la API no puede ejecutar la automatización',
    pg_temp.como('authenticated', a, $q$ select public.procesar_extraviados()::text $q$) = 'ERROR:42501'
    and pg_temp.como('anon', null, $q$ select public.procesar_extraviados()::text $q$) = 'ERROR:42501');
  res := res || pg_temp.fila('el resumen cuenta los días transcurridos y el foro',
    pg_temp.como('authenticated', b, $q$ select dias::text || '/' || coalesce(foro_estado, '-') from public.extraviados_resumen where id = '00000000-0000-4000-8000-0000000000a5' $q$) = '5/abierto');

  -- Cierre: localizada
  perform set_config('request.jwt.claims', '', true);
  insert into public.extravio_mensajes (extraviado_id, autor_id, autor_nombre, tipo, texto)
    values ('00000000-0000-4000-8000-0000000000a5', b, 'Beto M.', 'comentario', 'Sigo buscando');
  v := pg_temp.como('authenticated', b, $q$ with x as (select public.cerrar_extravio('00000000-0000-4000-8000-0000000000a5', true)) select 'ok' from x $q$);
  res := res || pg_temp.fila('solo el tutor puede cerrar su reporte', v = 'ERROR:42501');
  v := pg_temp.como('authenticated', a, $q$ with x as (select public.cerrar_extravio('00000000-0000-4000-8000-0000000000a5', true)) select 'ok' from x $q$);
  res := res || pg_temp.fila('al localizarla: cambia el estado, se cierra el foro y se conserva el historial',
    v = 'ok'
    and (select estado = 'localizado' and localizado_en is not null from public.extraviados where id = '00000000-0000-4000-8000-0000000000a5')
    and (select estado = 'cerrado' and cerrado_en is not null from public.foros where extraviado_id = '00000000-0000-4000-8000-0000000000a5')
    and (select count(*) = 1 from public.extravio_mensajes where extraviado_id = '00000000-0000-4000-8000-0000000000a5'));
  res := res || pg_temp.fila('al localizarla se avisa al tutor y a quienes participaron',
    exists (select 1 from public.notificaciones where usuario_id = a and tipo = 'extravio_localizado')
    and exists (select 1 from public.notificaciones where usuario_id = b and tipo = 'extravio_localizado'));
  res := res || pg_temp.fila('un reporte cerrado ya no recibe mensajes ni se puede cerrar otra vez',
    pg_temp.como('authenticated', b, $q$ with i as (insert into public.extravio_mensajes (extraviado_id, tipo, texto)
      values ('00000000-0000-4000-8000-0000000000a5', 'comentario', 'tarde') returning 1) select count(*) from i $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, $q$ with x as (select public.cerrar_extravio('00000000-0000-4000-8000-0000000000a5', true)) select 'ok' from x $q$) = 'ERROR:P0001');
  res := res || pg_temp.fila('un reporte cerrado deja de entregar el contacto por WhatsApp',
    coalesce(pg_temp.como('authenticated', b, $q$ select public.extravio_whatsapp('00000000-0000-4000-8000-0000000000a5') $q$), '') = '');

  -- Bloque D: chat y notificaciones --------------------------------------------------------------
  -- (una llamada a función volátil por sentencia; ver nota del bloque C)
  perform set_config('request.jwt.claims', '', true);
  v := pg_temp.como('authenticated', b, format($q$ select public.iniciar_conversacion('extraviado', %L, null)::text $q$, (select val from _b where k = 'ext')));
  insert into _b values ('conv', v);
  res := res || pg_temp.fila('una persona abre una conversación con el tutor de un reporte (el servidor elige al destinatario)',
    v ~ '^[0-9a-f-]{36}$'
    and (select count(*) = 2 from public.chat_participantes where conversacion_id = (select val::uuid from _b where k = 'conv'))
    and exists (select 1 from public.chat_participantes where conversacion_id = (select val::uuid from _b where k = 'conv') and usuario_id = a and nombre like 'Ana%')
    and exists (select 1 from public.chat_participantes where conversacion_id = (select val::uuid from _b where k = 'conv') and usuario_id = b and nombre like 'Beto%'));
  v := pg_temp.como('authenticated', b, format($q$ select public.iniciar_conversacion('extraviado', %L, null)::text $q$, (select val from _b where k = 'ext')));
  res := res || pg_temp.fila('abrir la misma conversación otra vez la reutiliza (sin duplicados)', v = (select val from _b where k = 'conv'));
  res := res || pg_temp.fila('no se puede abrir una conversación con uno mismo ni con un reporte sin tutor o cerrado',
    pg_temp.como('authenticated', a, format($q$ select public.iniciar_conversacion('extraviado', %L, null)::text $q$, (select val from _b where k = 'ext'))) = 'ERROR:P0001'
    and pg_temp.como('authenticated', b, $q$ select public.iniciar_conversacion('extraviado', '00000000-0000-4000-8000-0000000000a5', null)::text $q$) = 'ERROR:P0001'
    and pg_temp.como('authenticated', b, $q$ select public.iniciar_conversacion('comunidad', null, null)::text $q$) = 'ERROR:P0001');
  res := res || pg_temp.fila('quien no participa no ve la conversación, sus mensajes ni a sus participantes',
    pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', 'select count(*) from public.chat_conversaciones') = '0'
    and pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', 'select count(*) from public.chat_participantes') = '0'
    and pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', 'select count(*) from public.chat_bandeja') = '0'
    and pg_temp.como('authenticated', b, 'select count(*) from public.chat_conversaciones') = '1');
  res := res || pg_temp.fila('anon no lee nada del chat ni ejecuta sus funciones',
    pg_temp.como('anon', null, 'select count(*) from public.chat_mensajes') = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select count(*) from public.chat_bandeja') = 'ERROR:42501'
    and pg_temp.como('anon', null, $q$ select public.iniciar_conversacion('comunidad', null, null)::text $q$) = 'ERROR:42501'
    and pg_temp.como('anon', null, 'select public.chat_no_leidos()::text') = 'ERROR:42501');

  -- Mensajes
  v := pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto)
        values (%L, 'texto', '  Hola, vi a tu mascota  ') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv')));
  res := res || pg_temp.fila('un participante envía un mensaje; el servidor fija autor y limpia el texto', v = '1'
    and (select autor_id = b and texto = 'Hola, vi a tu mascota' and entregado_en is null and not es_demo
           from public.chat_mensajes where conversacion_id = (select val::uuid from _b where k = 'conv')));
  v := pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto)
        values (%L, 'texto', 'Estoy cerca de la avenida') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv')));
  res := res || pg_temp.fila('los mensajes nuevos avisan una sola vez (se agrupan en una notificación sin leer)',
    v = '1' and (select count(*) = 1 from public.notificaciones where usuario_id = a and tipo = 'mensaje' and not leida)
    and (select titulo like 'Nuevo mensaje de Beto%' and texto = 'Estoy cerca de la avenida' from public.notificaciones where usuario_id = a and tipo = 'mensaje'));
  v := pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, lat, lng, zona)
        values (%L, 'ubicacion', 29.0912345, -110.9512345, 'Colonia Modelo') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv')));
  res := res || pg_temp.fila('la ubicación compartida se redondea (~1 km)', v = '1'
    and (select lat = 29.09 and lng = -110.95 from public.chat_mensajes where tipo = 'ubicacion' and conversacion_id = (select val::uuid from _b where k = 'conv')));
  res := res || pg_temp.fila('no se puede escribir en una conversación ajena ni hacerse pasar por otra persona',
    pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto)
      values (%L, 'texto', 'intruso') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv'))) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto, autor_id)
      values (%L, 'texto', 'x', %L) returning 1) select count(*) from i $q$, (select val from _b where k = 'conv'), a)) = 'ERROR:42501');
  res := res || pg_temp.fila('un texto vacío o una foto sin archivo no son mensajes válidos',
    pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto) values (%L, 'texto', '   ') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv'))) = 'ERROR:23514'
    and pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo) values (%L, 'foto') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv'))) = 'ERROR:23514');
  res := res || pg_temp.fila('los mensajes no se editan ni se borran desde el cliente',
    pg_temp.como('authenticated', b, $q$ with u as (update public.chat_mensajes set texto = 'x' returning 1) select count(*) from u $q$) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, $q$ with d as (delete from public.chat_mensajes returning 1) select count(*) from d $q$) = 'ERROR:42501');

  -- Estados de lectura. En una transacción now() es constante: se retrasa la última lectura de a para
  -- que los mensajes de b cuenten como no leídos, como pasaría en el uso real.
  perform set_config('request.jwt.claims', '', true);
  update public.chat_participantes set ultimo_leido_en = now() - interval '1 hour'
   where conversacion_id = (select val::uuid from _b where k = 'conv') and usuario_id = a;
  res := res || pg_temp.fila('la bandeja cuenta los mensajes sin leer del destinatario',
    pg_temp.como('authenticated', a, format('select no_leidos::text from public.chat_bandeja where id = %L', (select val from _b where k = 'conv'))) = '3'
    and pg_temp.como('authenticated', a, 'select public.chat_no_leidos()::text') = '3');
  v := pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', format($q$ with x as (select public.marcar_leida(%L)) select 'ok' from x $q$, (select val from _b where k = 'conv')));
  res := res || pg_temp.fila('quien no participa no puede marcar una conversación como leída', v = 'ERROR:42501');
  v := pg_temp.como('authenticated', a, format($q$ with x as (select public.marcar_leida(%L)) select 'ok' from x $q$, (select val from _b where k = 'conv')));
  res := res || pg_temp.fila('al abrir la conversación quedan leídos y recibidos y se apaga el aviso', v = 'ok'
    and (select count(*) = 0 from public.chat_mensajes where conversacion_id = (select val::uuid from _b where k = 'conv') and autor_id = b and entregado_en is null)
    and (select leida from public.notificaciones where usuario_id = a and tipo = 'mensaje'));
  res := res || pg_temp.fila('quien escribió ve cuándo leyó la otra persona (leído)',
    pg_temp.como('authenticated', b, format($q$ select (otro_leido_en >= (select max(creado_en) from public.chat_mensajes where conversacion_id = %L))::text from public.chat_bandeja where id = %L $q$,
      (select val from _b where k = 'conv'), (select val from _b where k = 'conv'))) = 'true'
    and pg_temp.como('authenticated', a, format('select no_leidos::text from public.chat_bandeja where id = %L', (select val from _b where k = 'conv'))) = '0');

  -- Archivar
  v := pg_temp.como('authenticated', a, format($q$ with x as (select public.archivar_conversacion(%L, true)) select 'ok' from x $q$, (select val from _b where k = 'conv')));
  res := res || pg_temp.fila('archivar solo afecta a quien archiva', v = 'ok'
    and pg_temp.como('authenticated', a, format('select archivada::text from public.chat_bandeja where id = %L', (select val from _b where k = 'conv'))) = 'true'
    and pg_temp.como('authenticated', b, format('select archivada::text from public.chat_bandeja where id = %L', (select val from _b where k = 'conv'))) = 'false');
  v := pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto) values (%L, 'texto', 'Sigo aquí') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv')));
  res := res || pg_temp.fila('un mensaje nuevo saca la conversación del archivo', v = '1'
    and pg_temp.como('authenticated', a, format('select archivada::text from public.chat_bandeja where id = %L', (select val from _b where k = 'conv'))) = 'false');

  -- Bloqueo
  v := pg_temp.como('authenticated', a, format($q$ with x as (select public.bloquear_usuario(%L)) select 'ok' from x $q$, b));
  res := res || pg_temp.fila('bloquear impide escribir en ambos sentidos', v = 'ok'
    and pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto) values (%L, 'texto', 'hola') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv'))) = 'ERROR:P0001'
    and pg_temp.como('authenticated', a, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto) values (%L, 'texto', 'hola') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv'))) = 'ERROR:P0001');
  res := res || pg_temp.fila('quien fue bloqueado no puede abrir conversaciones nuevas con quien lo bloqueó',
    pg_temp.como('authenticated', b, format($q$ select public.iniciar_conversacion('comunidad', null, %L)::text $q$, a)) = 'ERROR:P0001');
  res := res || pg_temp.fila('quien bloquea ve su bloqueo; la persona bloqueada no se entera (solo recibe un error al escribir)',
    pg_temp.como('authenticated', a, format('select (bloqueado and not me_bloqueo)::text from public.chat_bandeja where id = %L', (select val from _b where k = 'conv'))) = 'true'
    and pg_temp.como('authenticated', b, format('select (not me_bloqueo and not bloqueado)::text from public.chat_bandeja where id = %L', (select val from _b where k = 'conv'))) = 'true'
    and pg_temp.como('authenticated', a, 'select count(*) from public.chat_bloqueos') = '1'
    and pg_temp.como('authenticated', b, 'select count(*) from public.chat_bloqueos') = '0');
  v := pg_temp.como('authenticated', a, format($q$ with x as (select public.desbloquear_usuario(%L)) select 'ok' from x $q$, b));
  res := res || pg_temp.fila('desbloquear restablece la conversación', v = 'ok'
    and pg_temp.como('authenticated', b, format($q$ with i as (insert into public.chat_mensajes (conversacion_id, tipo, texto) values (%L, 'texto', 'gracias') returning 1) select count(*) from i $q$, (select val from _b where k = 'conv'))) = '1');
  res := res || pg_temp.fila('nadie puede bloquearse a sí mismo ni escribir bloqueos directamente',
    pg_temp.como('authenticated', a, format($q$ with x as (select public.bloquear_usuario(%L)) select 'ok' from x $q$, a)) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, format($q$ with i as (insert into public.chat_bloqueos (bloqueador_id, bloqueado_id) values (%L, %L) returning 1) select count(*) from i $q$, a, b)) = 'ERROR:42501');

  -- Reportar conversaciones
  v := pg_temp.como('authenticated', b, format($q$ with x as (select public.reportar_conversacion(%L, 'spam', 'Mensajes repetidos')) select 'ok' from x $q$, (select val from _b where k = 'conv')));
  res := res || pg_temp.fila('un participante reporta la conversación', v = 'ok');
  res := res || pg_temp.fila('solo un moderador lee los reportes de chat',
    pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000d1', 'select count(*) from public.chat_reportes') = '1'
    and pg_temp.como('authenticated', a, 'select count(*) from public.chat_reportes') = '0'
    and pg_temp.como('authenticated', b, 'select count(*) from public.chat_reportes') = '0');
  res := res || pg_temp.fila('quien no participa no puede reportar; el motivo debe ser válido',
    pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', format($q$ with x as (select public.reportar_conversacion(%L, 'spam', '')) select 'ok' from x $q$, (select val from _b where k = 'conv'))) = 'ERROR:42501'
    and pg_temp.como('authenticated', b, format($q$ with x as (select public.reportar_conversacion(%L, 'inventado', '')) select 'ok' from x $q$, (select val from _b where k = 'conv'))) = 'ERROR:23514');

  -- Fotos privadas
  res := res || pg_temp.fila('las fotos del chat: solo quienes participan suben y leen (carpeta = conversación)',
    pg_temp.como('authenticated', b, format($q$ with i as (insert into storage.objects (bucket_id, name) values ('chat-fotos', %L) returning 1) select count(*) from i $q$, (select val from _b where k = 'conv') || '/foto.jpg')) = '1'
    and pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', format($q$ with i as (insert into storage.objects (bucket_id, name) values ('chat-fotos', %L) returning 1) select count(*) from i $q$, (select val from _b where k = 'conv') || '/intruso.jpg')) = 'ERROR:42501'
    and pg_temp.como('authenticated', a, $q$ select count(*) from storage.objects where bucket_id = 'chat-fotos' $q$) = '1'
    and pg_temp.como('authenticated', '00000000-0000-4000-8000-0000000000c1', $q$ select count(*) from storage.objects where bucket_id = 'chat-fotos' $q$) = '0');
  res := res || pg_temp.fila('el bucket de fotos del chat es privado',
    (select not public from storage.buckets where id = 'chat-fotos'));
  res := res || pg_temp.fila('Realtime publica los mensajes, las lecturas y las notificaciones',
    (select count(*) = 3 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public'
       and tablename in ('chat_mensajes', 'chat_participantes', 'notificaciones')));

  -- Notificaciones de otras funciones
  perform set_config('request.jwt.claims', '', true);
  insert into public.resenas (id, establecimiento_id, autor_id, autor_nombre, puntuacion)
    values ('00000000-0000-4000-8000-0000000000f2', '00000000-0000-4000-8000-0000000000e2', a, 'Ana L.', 5);
  v := pg_temp.como('authenticated', b, $q$ with x as (select public.responder_resena('00000000-0000-4000-8000-0000000000f2', 'Gracias por tu visita')) select 'ok' from x $q$);
  res := res || pg_temp.fila('responder una reseña avisa a quien la escribió', v = 'ok'
    and exists (select 1 from public.notificaciones where usuario_id = a and tipo = 'resena_respuesta'));
  res := res || pg_temp.fila('una aportación avisa al organizador y publicar su campaña también',
    exists (select 1 from public.notificaciones where usuario_id = a and tipo = 'donacion')
    and exists (select 1 from public.notificaciones where usuario_id = a and tipo = 'colecta_publicada'));

  -- Resultado: el error revierte todo lo creado arriba.
  -- Resumen corto (el CLI recorta mensajes largos): cuántas pasaron y, completas, las que fallaron.
  raise exception E'PRUEBA RLS (todo se revierte): % OK, % con FALLA.%',
    array_length(regexp_split_to_array(res, E'\nOK '), 1) - 1,
    array_length(regexp_split_to_array(res, E'\nFALLA '), 1) - 1,
    (select coalesce(E'\n' || string_agg(l, E'\n'), '') from unnest(string_to_array(res, E'\n')) l where l like 'FALLA%');
end $do$;
