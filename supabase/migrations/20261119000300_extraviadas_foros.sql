-- Manchitas · bloque C · mascotas extraviadas, avistamientos, foros automáticos y notificaciones.
--
-- Flujo:
--   Día 0     el tutor reporta la mascota extraviada (estado `activo`).
--   Días 1-4  el reporte recibe avistamientos y comentarios. El día 4 el tutor recibe un aviso.
--   Día 5     si sigue `activo`, `procesar_extraviados()` abre UN foro comunitario (único por reporte).
--   Localizada  `cerrar_extravio()` cambia el estado, cierra el foro, avisa y conserva el historial.
--
-- `procesar_extraviados()` la programa pg_cron cada 30 minutos. Es idempotente: reglas de
-- unicidad y marcas de tiempo impiden duplicar avisos o foros aunque corra muchas veces.
-- Los días se cuentan en la zona horaria de Hermosillo (UTC-7, sin horario de verano).
--
-- Privacidad: el reporte guarda una zona aproximada, nunca un domicilio. El teléfono no está en
-- estas tablas; si el tutor lo autoriza, `extravio_whatsapp()` entrega el enlace de WhatsApp.

create function public.hoy_hermosillo() returns date language sql stable as $$
  select (now() at time zone 'America/Hermosillo')::date
$$;

-- Los reportes ciudadanos de demostración se marcan igual que el resto de los datos demo.
alter table public.reportes add column es_demo boolean not null default false;

-- ---------------------------------------------------------------------------------------
-- Reportes de mascotas extraviadas
-- ---------------------------------------------------------------------------------------
create table public.extraviados (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references public.perfiles (id) on delete set null,
  -- Nombre visible (nombre e inicial del apellido), denormalizado: RLS impide leer perfiles ajenos.
  tutor_nombre text not null default 'Comunidad' check (char_length(tutor_nombre) between 1 and 80),
  mascota_id uuid references public.mascotas (id) on delete set null,
  nombre text not null check (char_length(nombre) between 1 and 60),
  especie text not null check (especie in ('perro', 'gato')),
  raza text not null default '' check (char_length(raza) <= 80),
  descripcion text not null default '' check (char_length(descripcion) <= 600),
  foto text check (char_length(foto) <= 300),
  fecha_extravio date not null,
  zona text not null check (char_length(zona) between 1 and 120),
  contacto_whatsapp boolean not null default false,
  estado text not null default 'activo' check (estado in ('activo', 'localizado', 'cerrado')),
  aviso_previo_en timestamptz,
  foro_creado_en timestamptz,
  localizado_en timestamptz,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);
create index extraviados_estado_idx on public.extraviados (estado, fecha_extravio desc);
create index extraviados_tutor_idx on public.extraviados (tutor_id);

-- Un foro por reporte (la restricción única impide duplicados).
create table public.foros (
  id uuid primary key default gen_random_uuid(),
  extraviado_id uuid not null unique references public.extraviados (id) on delete cascade,
  estado text not null default 'abierto' check (estado in ('abierto', 'cerrado')),
  creado_en timestamptz not null default now(),
  cerrado_en timestamptz,
  es_demo boolean not null default false
);

create table public.extravio_mensajes (
  id uuid primary key default gen_random_uuid(),
  extraviado_id uuid not null references public.extraviados (id) on delete cascade,
  autor_id uuid references public.perfiles (id) on delete set null,
  autor_nombre text not null check (char_length(autor_nombre) between 1 and 80),
  tipo text not null check (tipo in ('avistamiento', 'comentario')),
  texto text not null check (char_length(texto) between 1 and 600),
  zona text not null default '' check (char_length(zona) <= 120),
  foto text check (char_length(foto) <= 300),
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);
create index extravio_mensajes_idx on public.extravio_mensajes (extraviado_id, creado_en desc);

-- Notificaciones del usuario. Las crean funciones y triggers del servidor; el cliente solo lee y
-- marca como leídas. (El centro de notificaciones completo llega en el bloque D.)
create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  tipo text not null check (char_length(tipo) between 1 and 40),
  titulo text not null check (char_length(titulo) between 1 and 140),
  texto text not null default '' check (char_length(texto) <= 400),
  enlace text check (char_length(enlace) <= 200),
  leida boolean not null default false,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);
create index notificaciones_usuario_idx on public.notificaciones (usuario_id, creado_en desc);

-- Bitácora de la automatización (errores incluidos).
create table public.automatizacion_log (
  id bigint generated always as identity primary key,
  tarea text not null,
  ejecutado_en timestamptz not null default now(),
  procesados int not null default 0,
  errores int not null default 0,
  detalle text not null default ''
);
alter table public.automatizacion_log enable row level security;  -- sin políticas: nadie la lee por la API

-- ---------------------------------------------------------------------------------------
-- Triggers: el servidor fija autor, estado y límites
-- ---------------------------------------------------------------------------------------
create function public.preparar_extraviado() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  p record;
begin
  if auth.uid() is not null then
    select nombre, apellido into p from public.perfiles where id = auth.uid();
    new.tutor_id := auth.uid();
    new.tutor_nombre := left(coalesce(p.nombre, 'Comunidad') || case when coalesce(p.apellido, '') <> '' then ' ' || left(p.apellido, 1) || '.' else '' end, 80);
    new.estado := 'activo';
    new.aviso_previo_en := null;
    new.foro_creado_en := null;
    new.localizado_en := null;
    new.es_demo := false;
    if new.fecha_extravio > public.hoy_hermosillo() or new.fecha_extravio < public.hoy_hermosillo() - 30 then
      raise exception 'fecha_invalida' using errcode = 'P0001';
    end if;
    if new.mascota_id is not null
       and not exists (select 1 from public.mascotas m where m.id = new.mascota_id and m.tutor_id = auth.uid()) then
      raise exception 'mascota_ajena' using errcode = '42501';
    end if;
    perform public.limitar('extravio', 3, interval '1 day', auth.uid()::text);
  end if;
  return new;
end $$;
create trigger extraviados_preparar before insert on public.extraviados
  for each row execute function public.preparar_extraviado();

create function public.preparar_mensaje_extravio() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  p record;
begin
  if auth.uid() is not null then
    select nombre, apellido into p from public.perfiles where id = auth.uid();
    new.autor_id := auth.uid();
    new.autor_nombre := left(coalesce(p.nombre, 'Anónimo') || case when coalesce(p.apellido, '') <> '' then ' ' || left(p.apellido, 1) || '.' else '' end, 80);
    new.es_demo := false;
    if new.tipo = 'comentario' then new.zona := ''; end if;
    perform public.limitar('mensaje_extravio', 10, interval '1 hour', auth.uid()::text);
  end if;
  return new;
end $$;
create trigger extravio_mensajes_preparar before insert on public.extravio_mensajes
  for each row execute function public.preparar_mensaje_extravio();

-- Cada avistamiento o comentario avisa al tutor (salvo que sea él mismo).
create function public.avisar_mensaje_extravio() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  e record;
begin
  select id, tutor_id, nombre into e from public.extraviados where id = new.extraviado_id;
  if e.tutor_id is not null and e.tutor_id is distinct from new.autor_id then
    insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace, es_demo)
    values (
      e.tutor_id,
      case when new.tipo = 'avistamiento' then 'avistamiento' else 'comentario_foro' end,
      case when new.tipo = 'avistamiento' then 'Nuevo avistamiento de ' || e.nombre else 'Nuevo comentario sobre ' || e.nombre end,
      left(new.autor_nombre || ': ' || new.texto, 400),
      '/comunidad/extraviadas/' || e.id,
      new.es_demo
    );
  end if;
  return new;
end $$;
create trigger extravio_mensajes_avisar after insert on public.extravio_mensajes
  for each row execute function public.avisar_mensaje_extravio();

-- ---------------------------------------------------------------------------------------
-- RLS y permisos
-- ---------------------------------------------------------------------------------------
alter table public.extraviados enable row level security;
alter table public.foros enable row level security;
alter table public.extravio_mensajes enable row level security;
alter table public.notificaciones enable row level security;

create policy extraviados_leer on public.extraviados for select to authenticated using (true);
create policy extraviados_crear on public.extraviados for insert to authenticated with check (tutor_id = (select auth.uid()));
-- El tutor corrige los datos de su reporte mientras está activo; el estado solo cambia con cerrar_extravio().
create policy extraviados_editar on public.extraviados for update to authenticated
  using (tutor_id = (select auth.uid()) and estado = 'activo') with check (tutor_id = (select auth.uid()) and estado = 'activo');

create policy foros_leer on public.foros for select to authenticated using (true);

create policy extravio_mensajes_leer on public.extravio_mensajes for select to authenticated using (true);
create policy extravio_mensajes_crear on public.extravio_mensajes for insert to authenticated
  with check (
    autor_id = (select auth.uid())
    and exists (select 1 from public.extraviados e where e.id = extraviado_id and e.estado = 'activo')
  );
-- Borra su propio mensaje o, el tutor, cualquier mensaje de su reporte (moderación básica).
create policy extravio_mensajes_borrar on public.extravio_mensajes for delete to authenticated
  using (
    autor_id = (select auth.uid())
    or exists (select 1 from public.extraviados e where e.id = extraviado_id and e.tutor_id = (select auth.uid()))
  );

create policy notificaciones_propias_leer on public.notificaciones for select to authenticated using (usuario_id = (select auth.uid()));
create policy notificaciones_propias_editar on public.notificaciones for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy notificaciones_propias_borrar on public.notificaciones for delete to authenticated using (usuario_id = (select auth.uid()));

revoke all on public.extraviados, public.foros, public.extravio_mensajes, public.notificaciones from anon, authenticated;
grant select on public.extraviados, public.foros, public.extravio_mensajes, public.notificaciones to authenticated;
grant insert (mascota_id, nombre, especie, raza, descripcion, foto, fecha_extravio, zona, contacto_whatsapp) on public.extraviados to authenticated;
grant update (descripcion, zona, foto, contacto_whatsapp) on public.extraviados to authenticated;
grant insert (extraviado_id, tipo, texto, zona, foto) on public.extravio_mensajes to authenticated;
grant delete on public.extravio_mensajes to authenticated;
grant update (leida) on public.notificaciones to authenticated;
grant delete on public.notificaciones to authenticated;

-- Resumen con los días transcurridos, el foro y el número de mensajes (respeta RLS de quien consulta).
create view public.extraviados_resumen with (security_invoker = true) as
  select e.*,
         (public.hoy_hermosillo() - e.fecha_extravio) as dias,
         f.id as foro_id,
         f.estado as foro_estado,
         f.creado_en as foro_abierto_en,
         (select count(*) from public.extravio_mensajes m where m.extraviado_id = e.id)::int as total_mensajes
    from public.extraviados e
    left join public.foros f on f.extraviado_id = e.id;
revoke all on public.extraviados_resumen from anon, authenticated;
grant select on public.extraviados_resumen to authenticated;

-- ---------------------------------------------------------------------------------------
-- Funciones del cliente
-- ---------------------------------------------------------------------------------------
-- Localizada o cerrada: solo el tutor. Cierra el foro, avisa al tutor y a quienes participaron y
-- conserva el historial.
create function public.cerrar_extravio(p_id uuid, p_localizado boolean) returns void
language plpgsql security definer set search_path = public as $$
declare
  e record;
  r record;
begin
  select * into e from public.extraviados where id = p_id and tutor_id = (select auth.uid()) for update;
  if not found then raise exception 'sin_permiso' using errcode = '42501'; end if;
  if e.estado <> 'activo' then raise exception 'ya_cerrado' using errcode = 'P0001'; end if;

  update public.extraviados
     set estado = case when p_localizado then 'localizado' else 'cerrado' end,
         localizado_en = case when p_localizado then now() else null end
   where id = p_id;
  update public.foros set estado = 'cerrado', cerrado_en = now() where extraviado_id = p_id and estado = 'abierto';

  insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace)
  values (
    e.tutor_id, case when p_localizado then 'extravio_localizado' else 'extravio_cerrado' end,
    case when p_localizado then e.nombre || ' fue localizada' else 'Cerraste el reporte de ' || e.nombre end,
    'El reporte y su foro se cerraron. El historial se conserva.', '/comunidad/extraviadas/' || p_id
  );
  for r in select distinct autor_id from public.extravio_mensajes where extraviado_id = p_id and autor_id is not null and autor_id <> e.tutor_id loop
    insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace)
    values (
      r.autor_id, case when p_localizado then 'extravio_localizado' else 'extravio_cerrado' end,
      case when p_localizado then 'Buenas noticias: ' || e.nombre || ' fue localizada' else 'Se cerró la búsqueda de ' || e.nombre end,
      'Gracias por participar. El foro se cerró.', '/comunidad/extraviadas/' || p_id
    );
  end loop;
end $$;

-- Enlace de WhatsApp del tutor, solo si autorizó el contacto en ese reporte y sigue activo.
create function public.extravio_whatsapp(p_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select case when e.contacto_whatsapp and e.estado = 'activo' and p.telefono is not null
              then 'https://wa.me/52' || p.telefono end
    from public.extraviados e
    join public.perfiles p on p.id = e.tutor_id
   where e.id = p_id and (select auth.uid()) is not null
$$;

revoke execute on function public.cerrar_extravio(uuid, boolean), public.extravio_whatsapp(uuid), public.hoy_hermosillo() from public, anon;
grant execute on function public.cerrar_extravio(uuid, boolean), public.extravio_whatsapp(uuid), public.hoy_hermosillo() to authenticated;

-- ---------------------------------------------------------------------------------------
-- Automatización: aviso del día 4 y foro del día 5
-- ---------------------------------------------------------------------------------------
create function public.procesar_extraviados() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  hoy date := public.hoy_hermosillo();
  r record;
  avisos int := 0;
  foros int := 0;
  errores int := 0;
  detalle text := '';
begin
  -- 1) Aviso previo: el reporte llegó al día 4 y todavía no tiene foro ni aviso.
  for r in
    select id, tutor_id, nombre, es_demo from public.extraviados
     where estado = 'activo' and aviso_previo_en is null
       and fecha_extravio <= hoy - 4 and fecha_extravio > hoy - 5
       and not exists (select 1 from public.foros f where f.extraviado_id = extraviados.id)
     for update skip locked
  loop
    begin
      update public.extraviados set aviso_previo_en = now() where id = r.id;
      if r.tutor_id is not null then
        insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace, es_demo)
        values (r.tutor_id, 'extravio_aviso_previo', 'Mañana se abrirá el foro de ' || r.nombre,
                'Tu reporte cumple 5 días. Si ya la encontraste, marca el reporte como localizado; si no, actualiza los datos para ayudar a la comunidad.',
                '/comunidad/extraviadas/' || r.id, r.es_demo);
      end if;
      avisos := avisos + 1;
    exception when others then
      errores := errores + 1;
      detalle := detalle || 'aviso ' || r.id || ': ' || sqlerrm || '; ';
    end;
  end loop;

  -- 2) Foro: el reporte cumplió 5 días, sigue activo y todavía no tiene foro.
  for r in
    select id, tutor_id, nombre, es_demo from public.extraviados
     where estado = 'activo' and fecha_extravio <= hoy - 5
       and not exists (select 1 from public.foros f where f.extraviado_id = extraviados.id)
     for update skip locked
  loop
    begin
      insert into public.foros (extraviado_id, es_demo) values (r.id, r.es_demo) on conflict (extraviado_id) do nothing;
      if found then
        update public.extraviados set foro_creado_en = now() where id = r.id;
        if r.tutor_id is not null then
          insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace, es_demo)
          values (r.tutor_id, 'foro_abierto', 'Se abrió el foro de ' || r.nombre,
                  'La comunidad ya puede compartir avistamientos y fotos en el foro de tu reporte.',
                  '/comunidad/extraviadas/' || r.id, r.es_demo);
        end if;
        foros := foros + 1;
      end if;
    exception when others then
      errores := errores + 1;
      detalle := detalle || 'foro ' || r.id || ': ' || sqlerrm || '; ';
    end;
  end loop;

  insert into public.automatizacion_log (tarea, procesados, errores, detalle)
  values ('procesar_extraviados', avisos + foros, errores, left(detalle, 2000));
  return jsonb_build_object('avisos', avisos, 'foros', foros, 'errores', errores);
end $$;
-- Solo la ejecuta el programador (pg_cron) o la administración; nadie desde la API.
revoke execute on function public.procesar_extraviados() from public, anon, authenticated;

-- Programación con pg_cron (cada 30 minutos). Si la extensión no se puede activar aquí, se avisa y
-- se puede programar a mano (ver docs/DEMO.md); la función sigue funcionando al llamarla.
do $do$
begin
  create extension if not exists pg_cron with schema pg_catalog;
  perform cron.schedule('procesar-extraviados', '*/30 * * * *', 'select public.procesar_extraviados()');
exception when others then
  raise warning 'No se pudo programar pg_cron: %', sqlerrm;
end $do$;
