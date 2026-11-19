-- Manchitas · bloque B · veterinarias (promociones y reseñas) y Manchitas Solidario (colectas).
--
-- Reglas de seguridad de este bloque:
--  * El cliente no escribe montos, estados ni verificaciones. Todo eso lo fijan funciones o
--    triggers del servidor.
--  * Nadie puede publicar promociones ni responder reseñas en nombre de otro establecimiento: se
--    comprueba que el establecimiento sea suyo (`propietario_id`).
--  * Una reseña solo la borra quien la escribió; la respuesta solo la escribe el dueño del
--    establecimiento (o un moderador, vía función).
--  * Aportaciones: SIN pasarela de pago. Una aportación hecha desde la app queda `pendiente` y
--    `simulada`; nunca suma al dinero recaudado. Solo cuentan las `confirmada`, que hoy únicamente
--    existen en los datos de demostración.

-- ---------------------------------------------------------------------------------------
-- Rol de moderador: valida colectas y verifica reseñas. Se asigna a mano (como autoridad).
-- ---------------------------------------------------------------------------------------
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol in ('tutor', 'autoridad', 'moderador'));

create function public.es_moderador() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = (select auth.uid()) and rol = 'moderador')
$$;
revoke execute on function public.es_moderador() from public, anon;
grant execute on function public.es_moderador() to authenticated;

-- ---------------------------------------------------------------------------------------
-- Establecimientos: galería y edición por su propietario (el panel llega después).
-- ---------------------------------------------------------------------------------------
alter table public.establecimientos
  add column fotos text[] not null default '{}' check (cardinality(fotos) <= 8);

create policy establecimientos_propietario_editar on public.establecimientos for update to authenticated
  using (propietario_id = (select auth.uid())) with check (propietario_id = (select auth.uid()));
grant update (descripcion, horario, servicios, foto, fotos) on public.establecimientos to authenticated;

-- ---------------------------------------------------------------------------------------
-- Promociones de establecimientos (descuentos y beneficios).
-- ---------------------------------------------------------------------------------------
create table public.promociones (
  id uuid primary key default gen_random_uuid(),
  establecimiento_id uuid not null references public.establecimientos (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 120),
  descripcion text not null default '' check (char_length(descripcion) <= 400),
  beneficio text not null default '' check (char_length(beneficio) <= 80),
  condiciones text not null default '' check (char_length(condiciones) <= 300),
  vigente_desde date not null default current_date,
  vigente_hasta date not null,
  activa boolean not null default true,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now(),
  check (vigente_hasta >= vigente_desde)
);
create index promociones_vigencia_idx on public.promociones (vigente_hasta) where activa;
create index promociones_establecimiento_idx on public.promociones (establecimiento_id);

alter table public.promociones enable row level security;
-- Se ven las vigentes; el propietario ve también las suyas vencidas o apagadas.
create policy promociones_leer on public.promociones for select to authenticated using (
  (activa and current_date between vigente_desde and vigente_hasta)
  or exists (select 1 from public.establecimientos e where e.id = establecimiento_id and e.propietario_id = (select auth.uid()))
);
create policy promociones_propietario_crear on public.promociones for insert to authenticated
  with check (exists (select 1 from public.establecimientos e where e.id = establecimiento_id and e.propietario_id = (select auth.uid())));
create policy promociones_propietario_editar on public.promociones for update to authenticated
  using (exists (select 1 from public.establecimientos e where e.id = establecimiento_id and e.propietario_id = (select auth.uid())))
  with check (exists (select 1 from public.establecimientos e where e.id = establecimiento_id and e.propietario_id = (select auth.uid())));
create policy promociones_propietario_borrar on public.promociones for delete to authenticated
  using (exists (select 1 from public.establecimientos e where e.id = establecimiento_id and e.propietario_id = (select auth.uid())));

revoke all on public.promociones from anon, authenticated;
grant select on public.promociones to authenticated;
grant insert (establecimiento_id, titulo, descripcion, beneficio, condiciones, vigente_desde, vigente_hasta) on public.promociones to authenticated;
grant update (titulo, descripcion, beneficio, condiciones, vigente_desde, vigente_hasta, activa) on public.promociones to authenticated;
grant delete on public.promociones to authenticated;

-- ---------------------------------------------------------------------------------------
-- Reseñas. Una por persona y establecimiento. `verificada` y la respuesta no las escribe el autor.
-- ---------------------------------------------------------------------------------------
create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  establecimiento_id uuid not null references public.establecimientos (id) on delete cascade,
  autor_id uuid references public.perfiles (id) on delete set null,
  autor_nombre text not null check (char_length(autor_nombre) between 1 and 80),
  puntuacion int not null check (puntuacion between 1 and 5),
  comentario text not null default '' check (char_length(comentario) <= 800),
  verificada boolean not null default false,
  respuesta text check (char_length(respuesta) <= 600),
  respuesta_en timestamptz,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now(),
  editada_en timestamptz
);
create unique index resenas_una_por_persona on public.resenas (establecimiento_id, autor_id) where autor_id is not null;
create index resenas_establecimiento_idx on public.resenas (establecimiento_id, creado_en desc);

-- Con sesión real (auth.uid() no nulo) el servidor fija autor, nombre y estado. Sin sesión (seed
-- o administración) se respetan los valores dados.
create function public.preparar_resena() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  p record;
begin
  if tg_op = 'INSERT' and auth.uid() is not null then
    select nombre, apellido into p from public.perfiles where id = auth.uid();
    new.autor_id := auth.uid();
    new.autor_nombre := left(coalesce(p.nombre, 'Anónimo') || case when coalesce(p.apellido, '') <> '' then ' ' || left(p.apellido, 1) || '.' else '' end, 80);
    new.verificada := false;
    new.respuesta := null;
    new.respuesta_en := null;
    new.es_demo := false;
  elsif tg_op = 'UPDATE' and (new.puntuacion is distinct from old.puntuacion or new.comentario is distinct from old.comentario) then
    -- Solo cuenta como edición si cambió lo que escribió la persona (no al responder o verificar).
    new.editada_en := now();
  end if;
  return new;
end $$;
create trigger resenas_preparar before insert or update on public.resenas
  for each row execute function public.preparar_resena();

alter table public.resenas enable row level security;
create policy resenas_leer on public.resenas for select to authenticated using (true);
create policy resenas_crear on public.resenas for insert to authenticated with check (autor_id = (select auth.uid()));
create policy resenas_editar_propia on public.resenas for update to authenticated
  using (autor_id = (select auth.uid())) with check (autor_id = (select auth.uid()));
create policy resenas_borrar_propia on public.resenas for delete to authenticated using (autor_id = (select auth.uid()));

revoke all on public.resenas from anon, authenticated;
grant select on public.resenas to authenticated;
grant insert (establecimiento_id, puntuacion, comentario) on public.resenas to authenticated;
grant update (puntuacion, comentario) on public.resenas to authenticated;
grant delete on public.resenas to authenticated;

-- Responder: solo el dueño del establecimiento al que pertenece la reseña.
create function public.responder_resena(p_resena uuid, p_texto text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if char_length(coalesce(trim(p_texto), '')) not between 1 and 600 then
    raise exception 'respuesta_invalida' using errcode = 'P0001';
  end if;
  update public.resenas r set respuesta = trim(p_texto), respuesta_en = now()
   where r.id = p_resena
     and exists (select 1 from public.establecimientos e
                  where e.id = r.establecimiento_id and e.propietario_id = (select auth.uid()));
  if not found then raise exception 'sin_permiso' using errcode = '42501'; end if;
end $$;

-- Verificar: solo un moderador.
create function public.verificar_resena(p_resena uuid, p_valor boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_moderador() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  update public.resenas set verificada = p_valor where id = p_resena;
end $$;

revoke execute on function public.responder_resena(uuid, text), public.verificar_resena(uuid, boolean) from public, anon;
grant execute on function public.responder_resena(uuid, text), public.verificar_resena(uuid, boolean) to authenticated;

-- Calificación promedio por establecimiento (respeta RLS de quien consulta).
create view public.establecimientos_resumen with (security_invoker = true) as
  select e.*,
         coalesce(round(avg(r.puntuacion)::numeric, 1), 0) as calificacion,
         count(r.id)::int as total_resenas
    from public.establecimientos e
    left join public.resenas r on r.establecimiento_id = e.id
   group by e.id;
revoke all on public.establecimientos_resumen from anon, authenticated;
grant select on public.establecimientos_resumen to authenticated;

-- ---------------------------------------------------------------------------------------
-- Manchitas Solidario: colectas, desglose de gastos, actualizaciones y aportaciones.
-- ---------------------------------------------------------------------------------------
create table public.colectas (
  id uuid primary key default gen_random_uuid(),
  organizador_id uuid references public.perfiles (id) on delete set null,
  organizador_nombre text not null check (char_length(organizador_nombre) between 1 and 80),
  titulo text not null check (char_length(titulo) between 5 and 120),
  resumen text not null default '' check (char_length(resumen) <= 200),
  historia text not null check (char_length(historia) between 20 and 5000),
  beneficiario_tipo text not null check (beneficiario_tipo in ('mascota', 'albergue', 'rescatista', 'campana')),
  beneficiario_nombre text not null check (char_length(beneficiario_nombre) between 1 and 120),
  meta_mxn int not null check (meta_mxn between 500 and 1000000),
  foto_principal text check (char_length(foto_principal) <= 300),
  fotos text[] not null default '{}' check (cardinality(fotos) <= 6),
  estado text not null default 'en_revision' check (estado in ('borrador', 'en_revision', 'publicada', 'rechazada', 'finalizada')),
  motivo_rechazo text check (char_length(motivo_rechazo) <= 400),
  fecha_fin date not null,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now(),
  publicada_en timestamptz
);
create index colectas_estado_idx on public.colectas (estado, creado_en desc);

create table public.colecta_gastos (
  id uuid primary key default gen_random_uuid(),
  colecta_id uuid not null references public.colectas (id) on delete cascade,
  concepto text not null check (char_length(concepto) between 1 and 120),
  monto_mxn int not null check (monto_mxn > 0)
);
create index colecta_gastos_colecta_idx on public.colecta_gastos (colecta_id);

create table public.colecta_actualizaciones (
  id uuid primary key default gen_random_uuid(),
  colecta_id uuid not null references public.colectas (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 120),
  texto text not null check (char_length(texto) between 1 and 2000),
  creado_en timestamptz not null default now()
);
create index colecta_actualizaciones_colecta_idx on public.colecta_actualizaciones (colecta_id, creado_en desc);

create table public.aportaciones (
  id uuid primary key default gen_random_uuid(),
  colecta_id uuid not null references public.colectas (id) on delete cascade,
  donante_id uuid references public.perfiles (id) on delete set null,
  donante_nombre text not null check (char_length(donante_nombre) between 1 and 80),
  anonima boolean not null default false,
  monto_mxn int not null check (monto_mxn between 10 and 100000),
  mensaje text not null default '' check (char_length(mensaje) <= 300),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'fallida', 'reembolsada')),
  -- true mientras no exista pasarela de pago: nada de lo hecho desde la app cuenta como dinero real.
  simulada boolean not null default true,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);
create index aportaciones_colecta_idx on public.aportaciones (colecta_id, creado_en desc);
create index aportaciones_donante_idx on public.aportaciones (donante_id);

-- Visibilidad: lo publicado o finalizado lo ve cualquiera con sesión; el organizador ve las suyas
-- en cualquier estado; un moderador ve todas.
alter table public.colectas enable row level security;
alter table public.colecta_gastos enable row level security;
alter table public.colecta_actualizaciones enable row level security;
alter table public.aportaciones enable row level security;

create policy colectas_leer on public.colectas for select to authenticated using (
  estado in ('publicada', 'finalizada') or organizador_id = (select auth.uid()) or public.es_moderador()
);
create policy colecta_gastos_leer on public.colecta_gastos for select to authenticated using (
  exists (select 1 from public.colectas c where c.id = colecta_id)  -- hereda la visibilidad de la colecta
);
create policy colecta_actualizaciones_leer on public.colecta_actualizaciones for select to authenticated using (
  exists (select 1 from public.colectas c where c.id = colecta_id)
);
-- Las aportaciones confirmadas de colectas visibles son públicas (el nombre ya viene anonimizado
-- si la persona lo pidió); cada quien ve las suyas y el organizador las de su colecta.
create policy aportaciones_leer on public.aportaciones for select to authenticated using (
  donante_id = (select auth.uid())
  or public.es_moderador()
  or exists (select 1 from public.colectas c where c.id = colecta_id and c.organizador_id = (select auth.uid()))
  or (estado = 'confirmada' and exists (select 1 from public.colectas c where c.id = colecta_id))
);

revoke all on public.colectas, public.colecta_gastos, public.colecta_actualizaciones, public.aportaciones from anon, authenticated;
grant select on public.colectas, public.colecta_gastos, public.colecta_actualizaciones, public.aportaciones to authenticated;

-- Resumen con el dinero RECAUDADO: solo suma aportaciones confirmadas.
create view public.colectas_resumen with (security_invoker = true) as
  select c.*,
         coalesce(sum(a.monto_mxn) filter (where a.estado = 'confirmada'), 0)::int as recaudado_mxn,
         count(a.id) filter (where a.estado = 'confirmada')::int as donantes
    from public.colectas c
    left join public.aportaciones a on a.colecta_id = c.id
   group by c.id;
revoke all on public.colectas_resumen from anon, authenticated;
grant select on public.colectas_resumen to authenticated;

-- Crear una colecta: atómica (colecta + desglose). Siempre nace `en_revision`; el organizador y su
-- nombre salen de la sesión, no del cliente. El desglose debe sumar exactamente la meta.
create function public.crear_colecta(p_datos jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  yo uuid := auth.uid();
  p record;
  nuevo uuid;
  suma int;
  g jsonb;
begin
  if yo is null then raise exception 'sin_sesion' using errcode = '42501'; end if;
  perform public.limitar('crear_colecta', 3, interval '1 day');

  select nombre, apellido into p from public.perfiles where id = yo;
  select coalesce(sum((x->>'monto_mxn')::int), 0) into suma from jsonb_array_elements(coalesce(p_datos->'gastos', '[]'::jsonb)) x;
  if suma <> (p_datos->>'meta_mxn')::int then raise exception 'desglose_no_suma_meta' using errcode = 'P0001'; end if;

  insert into public.colectas
    (organizador_id, organizador_nombre, titulo, resumen, historia, beneficiario_tipo, beneficiario_nombre,
     meta_mxn, foto_principal, fotos, fecha_fin, estado)
  values (
    yo,
    left(coalesce(p.nombre, 'Anónimo') || case when coalesce(p.apellido, '') <> '' then ' ' || left(p.apellido, 1) || '.' else '' end, 80),
    p_datos->>'titulo', coalesce(p_datos->>'resumen', ''), p_datos->>'historia',
    p_datos->>'beneficiario_tipo', p_datos->>'beneficiario_nombre',
    (p_datos->>'meta_mxn')::int,
    nullif(p_datos->>'foto_principal', ''),
    coalesce(array(select jsonb_array_elements_text(coalesce(p_datos->'fotos', '[]'::jsonb))), '{}'),
    (p_datos->>'fecha_fin')::date,
    'en_revision'
  ) returning id into nuevo;

  for g in select * from jsonb_array_elements(coalesce(p_datos->'gastos', '[]'::jsonb)) loop
    insert into public.colecta_gastos (colecta_id, concepto, monto_mxn) values (nuevo, g->>'concepto', (g->>'monto_mxn')::int);
  end loop;
  return nuevo;
end $$;

-- Aportar: SIN pasarela. Queda `pendiente` y `simulada`; nunca suma a lo recaudado.
create function public.registrar_aportacion(p_colecta uuid, p_monto int, p_mensaje text, p_anonima boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  yo uuid := auth.uid();
  p record;
  nuevo uuid;
begin
  if yo is null then raise exception 'sin_sesion' using errcode = '42501'; end if;
  perform public.limitar('aportacion', 10, interval '1 hour');
  if not exists (select 1 from public.colectas where id = p_colecta and estado = 'publicada') then
    raise exception 'colecta_no_disponible' using errcode = 'P0001';
  end if;
  select nombre, apellido into p from public.perfiles where id = yo;
  insert into public.aportaciones (colecta_id, donante_id, donante_nombre, anonima, monto_mxn, mensaje, estado, simulada)
  values (
    p_colecta, yo,
    case when p_anonima then 'Anónimo' else left(coalesce(p.nombre, 'Anónimo') || case when coalesce(p.apellido, '') <> '' then ' ' || left(p.apellido, 1) || '.' else '' end, 80) end,
    coalesce(p_anonima, false), p_monto, left(coalesce(p_mensaje, ''), 300), 'pendiente', true
  ) returning id into nuevo;
  return nuevo;
end $$;

-- Actualizaciones: solo el organizador de una colecta publicada.
create function public.publicar_actualizacion(p_colecta uuid, p_titulo text, p_texto text) returns uuid
language plpgsql security definer set search_path = public as $$
declare nuevo uuid;
begin
  if not exists (select 1 from public.colectas where id = p_colecta and organizador_id = (select auth.uid()) and estado in ('publicada', 'finalizada')) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  insert into public.colecta_actualizaciones (colecta_id, titulo, texto) values (p_colecta, trim(p_titulo), trim(p_texto)) returning id into nuevo;
  return nuevo;
end $$;

-- Moderar: publicar, rechazar o finalizar. Solo un moderador.
create function public.moderar_colecta(p_colecta uuid, p_estado text, p_motivo text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_moderador() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  if p_estado not in ('publicada', 'rechazada', 'finalizada') then raise exception 'estado_invalido' using errcode = 'P0001'; end if;
  update public.colectas
     set estado = p_estado,
         motivo_rechazo = case when p_estado = 'rechazada' then left(p_motivo, 400) else null end,
         publicada_en = case when p_estado = 'publicada' and publicada_en is null then now() else publicada_en end
   where id = p_colecta;
end $$;

revoke execute on function public.crear_colecta(jsonb), public.registrar_aportacion(uuid, int, text, boolean),
  public.publicar_actualizacion(uuid, text, text), public.moderar_colecta(uuid, text, text) from public, anon;
grant execute on function public.crear_colecta(jsonb), public.registrar_aportacion(uuid, int, text, boolean),
  public.publicar_actualizacion(uuid, text, text), public.moderar_colecta(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------------------
-- Fotos de colectas: lectura pública (nombres aleatorios), escritura solo en la carpeta propia.
-- ---------------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('colectas-fotos', 'colectas-fotos', true, 2097152, array['image/jpeg'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy colectas_fotos_propias on storage.objects for all to authenticated
  using (bucket_id = 'colectas-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'colectas-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- El resumen de indicadores incluye ahora las colectas publicadas.
create or replace function public.indicadores_comunidad() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'mascotas', (select count(*) from public.mascotas),
    'tutores', (select count(*) from public.perfiles where tipo_usuario = 'tutor'),
    'adopciones_disponibles', (select count(*) from public.adopciones where estado = 'disponible'),
    'campanas_proximas', (select count(*) from public.campanas where fecha >= current_date),
    'establecimientos', (select count(*) from public.establecimientos),
    'reportes', (select count(*) from public.reportes),
    'colectas_activas', (select count(*) from public.colectas where estado = 'publicada')
  )
$$;
