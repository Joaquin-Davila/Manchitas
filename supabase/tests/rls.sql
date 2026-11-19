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

  -- Resultado: el error revierte todo lo creado arriba.
  -- Resumen corto (el CLI recorta mensajes largos): cuántas pasaron y, completas, las que fallaron.
  raise exception E'PRUEBA RLS (todo se revierte): % OK, % con FALLA.%',
    array_length(regexp_split_to_array(res, E'\nOK '), 1) - 1,
    array_length(regexp_split_to_array(res, E'\nFALLA '), 1) - 1,
    (select coalesce(E'\n' || string_agg(l, E'\n'), '') from unnest(string_to_array(res, E'\n')) l where l like 'FALLA%');
end $do$;
