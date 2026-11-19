-- Manchitas · bloque D · chat y notificaciones.
--
-- Chat 1 a 1 con contexto (comunidad, mascota extraviada, adopción o veterinaria).
--  * Solo participan quienes tienen fila en chat_participantes; RLS lo exige en la base, no en el cliente.
--  * El cliente solo inserta mensajes; todo lo demás (iniciar, leer, archivar, bloquear, reportar)
--    pasa por funciones del servidor.
--  * No hay teléfonos: el contacto es el propio chat. Las ubicaciones se redondean (~1 km).
--  * Antispam: límites por persona, bloqueo en ambos sentidos y reportes de conversaciones.
--  * Las fotos van a un bucket privado y se ven con URLs firmadas, solo para quienes participan.
--  * Realtime: chat_mensajes y chat_participantes se publican; Realtime aplica las mismas políticas RLS.

alter table public.adopciones add column publicador_id uuid references public.perfiles (id) on delete set null;

create function public.es_participante(p_conv uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.chat_participantes where conversacion_id = p_conv and usuario_id = (select auth.uid()))
$$;

create table public.chat_conversaciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('comunidad', 'extraviado', 'adopcion', 'veterinaria')),
  contexto_id uuid,
  contexto_titulo text not null default '' check (char_length(contexto_titulo) <= 120),
  contexto_foto text check (char_length(contexto_foto) <= 300),
  -- Evita conversaciones duplicadas entre las mismas dos personas sobre lo mismo.
  clave text not null unique,
  creado_por uuid references public.perfiles (id) on delete set null,
  ultimo_mensaje_en timestamptz not null default now(),
  ultimo_mensaje_texto text not null default '' check (char_length(ultimo_mensaje_texto) <= 160),
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);

create table public.chat_participantes (
  conversacion_id uuid not null references public.chat_conversaciones (id) on delete cascade,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  -- Nombre visible (nombre e inicial del apellido): RLS impide leer perfiles ajenos.
  nombre text not null check (char_length(nombre) between 1 and 80),
  archivada boolean not null default false,
  ultimo_leido_en timestamptz not null default now(),
  unido_en timestamptz not null default now(),
  primary key (conversacion_id, usuario_id)
);
create index chat_participantes_usuario_idx on public.chat_participantes (usuario_id);

create table public.chat_mensajes (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.chat_conversaciones (id) on delete cascade,
  autor_id uuid references public.perfiles (id) on delete set null,
  tipo text not null default 'texto' check (tipo in ('texto', 'foto', 'ubicacion')),
  texto text not null default '' check (char_length(texto) <= 1000),
  foto text check (char_length(foto) <= 300),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  zona text not null default '' check (char_length(zona) <= 120),
  -- Cuando el destinatario lo recibió (abrió la bandeja o la conversación). "Leído" sale de
  -- chat_participantes.ultimo_leido_en de la otra persona.
  entregado_en timestamptz,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now(),
  check (tipo <> 'texto' or char_length(btrim(texto)) > 0),
  check (tipo <> 'foto' or foto is not null),
  check (tipo <> 'ubicacion' or (lat is not null and lng is not null))
);
create index chat_mensajes_conversacion_idx on public.chat_mensajes (conversacion_id, creado_en);

create table public.chat_bloqueos (
  bloqueador_id uuid not null references public.perfiles (id) on delete cascade,
  bloqueado_id uuid not null references public.perfiles (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (bloqueador_id, bloqueado_id),
  check (bloqueador_id <> bloqueado_id)
);

create table public.chat_reportes (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.chat_conversaciones (id) on delete cascade,
  reportante_id uuid references public.perfiles (id) on delete set null,
  motivo text not null check (motivo in ('spam', 'acoso', 'estafa', 'contenido_inapropiado', 'otro')),
  detalle text not null default '' check (char_length(detalle) <= 500),
  estado text not null default 'abierto' check (estado in ('abierto', 'revisado')),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------
-- Triggers de mensajes
-- ---------------------------------------------------------------------------------------
create function public.preparar_chat_mensaje() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  otro uuid;
begin
  if auth.uid() is not null then
    new.autor_id := auth.uid();
    new.entregado_en := null;
    new.es_demo := false;
    new.texto := btrim(new.texto);
    if new.lat is not null then new.lat := round(new.lat::numeric, 2); end if;
    if new.lng is not null then new.lng := round(new.lng::numeric, 2); end if;
    select usuario_id into otro from public.chat_participantes where conversacion_id = new.conversacion_id and usuario_id <> auth.uid() limit 1;
    if otro is not null and exists (
      select 1 from public.chat_bloqueos
       where (bloqueador_id = otro and bloqueado_id = auth.uid()) or (bloqueador_id = auth.uid() and bloqueado_id = otro)
    ) then
      raise exception 'bloqueado' using errcode = 'P0001';
    end if;
    perform public.limitar('mensaje_chat', 40, interval '1 hour', auth.uid()::text);
  end if;
  return new;
end $$;
create trigger chat_mensajes_preparar before insert on public.chat_mensajes
  for each row execute function public.preparar_chat_mensaje();

-- Actualiza la conversación y avisa a la otra persona (una sola notificación sin leer por conversación).
create function public.avisar_chat_mensaje() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  yo record;
  r record;
  vista text;
  v_enlace text := '/mensajes/' || new.conversacion_id;
begin
  vista := case new.tipo when 'foto' then 'Te envió una foto' when 'ubicacion' then 'Te compartió una ubicación' else left(new.texto, 120) end;
  update public.chat_conversaciones set ultimo_mensaje_en = new.creado_en, ultimo_mensaje_texto = left(vista, 160) where id = new.conversacion_id;
  update public.chat_participantes set ultimo_leido_en = greatest(ultimo_leido_en, new.creado_en)
   where conversacion_id = new.conversacion_id and usuario_id = new.autor_id;
  select nombre into yo from public.chat_participantes where conversacion_id = new.conversacion_id and usuario_id = new.autor_id;
  for r in select usuario_id from public.chat_participantes where conversacion_id = new.conversacion_id and usuario_id is distinct from new.autor_id loop
    -- Una conversación archivada vuelve a la bandeja cuando llega un mensaje.
    update public.chat_participantes set archivada = false where conversacion_id = new.conversacion_id and usuario_id = r.usuario_id;
    update public.notificaciones set texto = left(vista, 400), titulo = 'Nuevo mensaje de ' || coalesce(yo.nombre, 'alguien'), creado_en = now()
     where usuario_id = r.usuario_id and tipo = 'mensaje' and enlace = v_enlace and not leida;
    if not found then
      insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace, es_demo)
      values (r.usuario_id, 'mensaje', 'Nuevo mensaje de ' || coalesce(yo.nombre, 'alguien'), left(vista, 400), v_enlace, new.es_demo);
    end if;
  end loop;
  return new;
end $$;
create trigger chat_mensajes_avisar after insert on public.chat_mensajes
  for each row execute function public.avisar_chat_mensaje();

-- ---------------------------------------------------------------------------------------
-- RLS y permisos
-- ---------------------------------------------------------------------------------------
alter table public.chat_conversaciones enable row level security;
alter table public.chat_participantes enable row level security;
alter table public.chat_mensajes enable row level security;
alter table public.chat_bloqueos enable row level security;
alter table public.chat_reportes enable row level security;

create policy chat_conversaciones_leer on public.chat_conversaciones for select to authenticated using (public.es_participante(id));
create policy chat_participantes_leer on public.chat_participantes for select to authenticated using (public.es_participante(conversacion_id));
create policy chat_mensajes_leer on public.chat_mensajes for select to authenticated using (public.es_participante(conversacion_id));
create policy chat_mensajes_crear on public.chat_mensajes for insert to authenticated
  with check (autor_id = (select auth.uid()) and public.es_participante(conversacion_id));
create policy chat_bloqueos_leer on public.chat_bloqueos for select to authenticated using (bloqueador_id = (select auth.uid()));
create policy chat_reportes_moderador on public.chat_reportes for select to authenticated using (public.es_moderador());

revoke all on public.chat_conversaciones, public.chat_participantes, public.chat_mensajes, public.chat_bloqueos, public.chat_reportes
  from anon, authenticated;
grant select on public.chat_conversaciones, public.chat_participantes, public.chat_mensajes, public.chat_bloqueos, public.chat_reportes to authenticated;
grant insert (conversacion_id, tipo, texto, foto, lat, lng, zona) on public.chat_mensajes to authenticated;

-- Bandeja: una fila por conversación de quien consulta, con la otra persona y los no leídos.
create view public.chat_bandeja with (security_invoker = true) as
  select c.id, c.tipo, c.contexto_id, c.contexto_titulo, c.contexto_foto, c.ultimo_mensaje_en, c.ultimo_mensaje_texto, c.es_demo,
         p.archivada, p.ultimo_leido_en,
         o.usuario_id as otro_id, o.nombre as otro_nombre, o.ultimo_leido_en as otro_leido_en,
         (select count(*) from public.chat_mensajes m
           where m.conversacion_id = c.id and m.autor_id is distinct from p.usuario_id and m.creado_en > p.ultimo_leido_en)::int as no_leidos,
         exists (select 1 from public.chat_bloqueos b where b.bloqueador_id = p.usuario_id and b.bloqueado_id = o.usuario_id) as bloqueado,
         exists (select 1 from public.chat_bloqueos b where b.bloqueador_id = o.usuario_id and b.bloqueado_id = p.usuario_id) as me_bloqueo
    from public.chat_conversaciones c
    join public.chat_participantes p on p.conversacion_id = c.id and p.usuario_id = (select auth.uid())
    join public.chat_participantes o on o.conversacion_id = c.id and o.usuario_id <> p.usuario_id;
revoke all on public.chat_bandeja from anon, authenticated;
grant select on public.chat_bandeja to authenticated;

-- ---------------------------------------------------------------------------------------
-- Funciones del cliente
-- ---------------------------------------------------------------------------------------
create function public.nombre_visible(p_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select left(coalesce(nombre, 'Anónimo') || case when coalesce(apellido, '') <> '' then ' ' || left(apellido, 1) || '.' else '' end, 80)
    from public.perfiles where id = p_id
$$;
revoke execute on function public.nombre_visible(uuid) from public, anon, authenticated;

-- Abre (o reutiliza) la conversación con quien corresponde según el contexto.
create function public.iniciar_conversacion(p_tipo text, p_contexto uuid, p_con uuid default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  yo uuid := auth.uid();
  dest uuid;
  v_titulo text := '';
  v_foto text;
  v_clave text;
  v_id uuid;
begin
  if yo is null then raise exception 'sin_sesion' using errcode = '42501'; end if;
  perform public.limitar('iniciar_chat', 10, interval '1 day', yo::text);

  if p_tipo = 'extraviado' then
    select e.tutor_id, e.nombre, e.foto into dest, v_titulo, v_foto from public.extraviados e where e.id = p_contexto and e.estado = 'activo';
  elsif p_tipo = 'adopcion' then
    select a.publicador_id, a.nombre, a.foto into dest, v_titulo, v_foto from public.adopciones a where a.id = p_contexto and a.estado = 'disponible';
  elsif p_tipo = 'veterinaria' then
    select s.propietario_id, s.nombre, s.foto into dest, v_titulo, v_foto from public.establecimientos s where s.id = p_contexto;
  elsif p_tipo = 'comunidad' then
    dest := p_con; p_contexto := null;
  else
    raise exception 'tipo_invalido' using errcode = 'P0001';
  end if;

  if dest is null or dest = yo or not exists (select 1 from public.perfiles where id = dest) then
    raise exception 'sin_destinatario' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.chat_bloqueos where (bloqueador_id = dest and bloqueado_id = yo) or (bloqueador_id = yo and bloqueado_id = dest)) then
    raise exception 'no_disponible' using errcode = 'P0001';
  end if;

  v_clave := p_tipo || ':' || coalesce(p_contexto::text, '-') || ':' || least(yo, dest)::text || ':' || greatest(yo, dest)::text;
  select c.id into v_id from public.chat_conversaciones c where c.clave = v_clave;
  if v_id is null then
    insert into public.chat_conversaciones (tipo, contexto_id, contexto_titulo, contexto_foto, clave, creado_por)
    values (p_tipo, p_contexto, left(coalesce(v_titulo, ''), 120), v_foto, v_clave, yo) returning chat_conversaciones.id into v_id;
    insert into public.chat_participantes (conversacion_id, usuario_id, nombre)
    values (v_id, yo, public.nombre_visible(yo)), (v_id, dest, public.nombre_visible(dest));
  else
    update public.chat_participantes set archivada = false where conversacion_id = v_id and usuario_id = yo;
  end if;
  return v_id;
end $$;

-- Abrir la conversación: marca como recibidos y leídos los mensajes de la otra persona y apaga su aviso.
create function public.marcar_leida(p_conv uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_participante(p_conv) then raise exception 'sin_permiso' using errcode = '42501'; end if;
  update public.chat_participantes set ultimo_leido_en = now() where conversacion_id = p_conv and usuario_id = auth.uid();
  update public.chat_mensajes set entregado_en = coalesce(entregado_en, now())
   where conversacion_id = p_conv and autor_id is distinct from auth.uid() and entregado_en is null;
  update public.notificaciones set leida = true where usuario_id = auth.uid() and tipo = 'mensaje' and enlace = '/mensajes/' || p_conv and not leida;
end $$;

-- Abrir la bandeja: marca como recibidos los mensajes pendientes de todas las conversaciones.
create function public.marcar_entregados() returns void
language sql security definer set search_path = public as $$
  update public.chat_mensajes m set entregado_en = now()
   where m.entregado_en is null and m.autor_id is distinct from (select auth.uid())
     and exists (select 1 from public.chat_participantes p where p.conversacion_id = m.conversacion_id and p.usuario_id = (select auth.uid()))
$$;

create function public.archivar_conversacion(p_conv uuid, p_valor boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.chat_participantes set archivada = p_valor where conversacion_id = p_conv and usuario_id = auth.uid();
  if not found then raise exception 'sin_permiso' using errcode = '42501'; end if;
end $$;

create function public.bloquear_usuario(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or p_id = auth.uid() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  insert into public.chat_bloqueos (bloqueador_id, bloqueado_id) values (auth.uid(), p_id) on conflict do nothing;
end $$;

create function public.desbloquear_usuario(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.chat_bloqueos where bloqueador_id = auth.uid() and bloqueado_id = p_id;
end $$;

create function public.reportar_conversacion(p_conv uuid, p_motivo text, p_detalle text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_participante(p_conv) then raise exception 'sin_permiso' using errcode = '42501'; end if;
  perform public.limitar('reportar_chat', 5, interval '1 day', auth.uid()::text);
  insert into public.chat_reportes (conversacion_id, reportante_id, motivo, detalle)
  values (p_conv, auth.uid(), p_motivo, left(coalesce(p_detalle, ''), 500));
end $$;

create function public.chat_no_leidos() returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.chat_mensajes m
    join public.chat_participantes p on p.conversacion_id = m.conversacion_id and p.usuario_id = (select auth.uid())
   where m.autor_id is distinct from p.usuario_id and m.creado_en > p.ultimo_leido_en and not p.archivada
$$;

revoke execute on function public.es_participante(uuid), public.iniciar_conversacion(text, uuid, uuid), public.marcar_leida(uuid),
  public.marcar_entregados(), public.archivar_conversacion(uuid, boolean), public.bloquear_usuario(uuid), public.desbloquear_usuario(uuid),
  public.reportar_conversacion(uuid, text, text), public.chat_no_leidos() from public, anon;
grant execute on function public.es_participante(uuid), public.iniciar_conversacion(text, uuid, uuid), public.marcar_leida(uuid),
  public.marcar_entregados(), public.archivar_conversacion(uuid, boolean), public.bloquear_usuario(uuid), public.desbloquear_usuario(uuid),
  public.reportar_conversacion(uuid, text, text), public.chat_no_leidos() to authenticated;

-- ---------------------------------------------------------------------------------------
-- Fotos del chat: bucket privado; solo quienes participan en la conversación (carpeta = id de la conversación).
-- ---------------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('chat-fotos', 'chat-fotos', false, 2097152, array['image/jpeg'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy chat_fotos_leer on storage.objects for select to authenticated
  using (bucket_id = 'chat-fotos' and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
         and public.es_participante(((storage.foldername(name))[1])::uuid));
create policy chat_fotos_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-fotos' and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
              and public.es_participante(((storage.foldername(name))[1])::uuid));

-- ---------------------------------------------------------------------------------------
-- Realtime: los cambios llegan solo a quienes las políticas RLS les dejan ver.
-- ---------------------------------------------------------------------------------------
do $do$
begin
  alter publication supabase_realtime add table public.chat_mensajes;
  alter publication supabase_realtime add table public.chat_participantes;
  alter publication supabase_realtime add table public.notificaciones;
exception when others then
  raise warning 'No se pudo publicar en Realtime: %', sqlerrm;
end $do$;

-- ---------------------------------------------------------------------------------------
-- Más notificaciones del servidor
-- ---------------------------------------------------------------------------------------
-- Respuesta a una reseña: avisa a quien la escribió.
create or replace function public.responder_resena(p_resena uuid, p_texto text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v record;
begin
  if char_length(coalesce(trim(p_texto), '')) not between 1 and 600 then
    raise exception 'respuesta_invalida' using errcode = 'P0001';
  end if;
  update public.resenas x set respuesta = trim(p_texto), respuesta_en = now()
   where x.id = p_resena
     and exists (select 1 from public.establecimientos e
                  where e.id = x.establecimiento_id and e.propietario_id = (select auth.uid()));
  if not found then raise exception 'sin_permiso' using errcode = '42501'; end if;
  select re.autor_id, e.nombre, e.id as est into v from public.resenas re join public.establecimientos e on e.id = re.establecimiento_id where re.id = p_resena;
  if v.autor_id is not null then
    insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace)
    values (v.autor_id, 'resena_respuesta', v.nombre || ' respondió tu reseña', left(trim(p_texto), 400), '/comunidad/veterinarias/' || v.est);
  end if;
end $$;

-- Aportación: avisa al organizador de la campaña (sigue siendo pendiente y simulada).
create or replace function public.registrar_aportacion(p_colecta uuid, p_monto int, p_mensaje text, p_anonima boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  yo uuid := auth.uid();
  p record;
  c record;
  nuevo uuid;
begin
  if yo is null then raise exception 'sin_sesion' using errcode = '42501'; end if;
  perform public.limitar('aportacion', 10, interval '1 hour');
  select id, titulo, organizador_id into c from public.colectas where id = p_colecta and estado = 'publicada';
  if not found then raise exception 'colecta_no_disponible' using errcode = 'P0001'; end if;
  select nombre, apellido into p from public.perfiles where id = yo;
  insert into public.aportaciones (colecta_id, donante_id, donante_nombre, anonima, monto_mxn, mensaje, estado, simulada)
  values (
    p_colecta, yo,
    case when p_anonima then 'Anónimo' else left(coalesce(p.nombre, 'Anónimo') || case when coalesce(p.apellido, '') <> '' then ' ' || left(p.apellido, 1) || '.' else '' end, 80) end,
    coalesce(p_anonima, false), p_monto, left(coalesce(p_mensaje, ''), 300), 'pendiente', true
  ) returning id into nuevo;
  if c.organizador_id is not null and c.organizador_id <> yo then
    insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace)
    values (c.organizador_id, 'donacion', 'Nueva aportación de demostración en tu campaña',
            'Alguien registró una aportación pendiente en «' || c.titulo || '». Aún no se procesan pagos reales.', '/comunidad/solidario/' || c.id);
  end if;
  return nuevo;
end $$;

-- Moderación: avisa al organizador cuando su campaña se publica o se rechaza.
create or replace function public.moderar_colecta(p_colecta uuid, p_estado text, p_motivo text default null) returns void
language plpgsql security definer set search_path = public as $$
declare
  c record;
begin
  if not public.es_moderador() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  if p_estado not in ('publicada', 'rechazada', 'finalizada') then raise exception 'estado_invalido' using errcode = 'P0001'; end if;
  update public.colectas
     set estado = p_estado,
         motivo_rechazo = case when p_estado = 'rechazada' then left(p_motivo, 400) else null end,
         publicada_en = case when p_estado = 'publicada' and publicada_en is null then now() else publicada_en end
   where id = p_colecta returning id, titulo, organizador_id into c;
  if c.organizador_id is not null and p_estado in ('publicada', 'rechazada') then
    insert into public.notificaciones (usuario_id, tipo, titulo, texto, enlace)
    values (c.organizador_id, case when p_estado = 'publicada' then 'colecta_publicada' else 'colecta_rechazada' end,
            case when p_estado = 'publicada' then 'Tu campaña ya está publicada' else 'Tu campaña no fue aprobada' end,
            '«' || c.titulo || '»' || case when p_estado = 'rechazada' and p_motivo is not null then ': ' || left(p_motivo, 300) else '' end,
            '/comunidad/solidario/' || c.id);
  end if;
end $$;
