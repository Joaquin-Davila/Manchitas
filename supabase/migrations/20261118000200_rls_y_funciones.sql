-- Manchitas · paso 10 · funciones, triggers, RLS y permisos.

-- ---------------------------------------------------------------------------------------
-- Generadores (folio y token) y triggers que los fijan en el servidor
-- ---------------------------------------------------------------------------------------
create function public.codigo_aleatorio() returns text
language plpgsql volatile set search_path = public, extensions as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sin 0, O, 1 ni I
  bytes bytea := gen_random_bytes(6);
  r text := '';
begin
  for i in 0..5 loop
    r := r || substr(alfabeto, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return r;
end $$;

create function public.preparar_mascota() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  new.tutor_id := auth.uid();
  new.especie := 'perro'; -- hoy solo se registran perros
  loop
    new.folio := 'MCH-' || public.codigo_aleatorio();
    exit when not exists (select 1 from public.mascotas where folio = new.folio);
  end loop;
  -- 256 bits en base64url
  new.token := translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');
  return new;
end $$;
create trigger mascotas_preparar before insert on public.mascotas
  for each row execute function public.preparar_mascota();

create function public.crear_cartilla() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.cartillas (mascota_id) values (new.id);
  return new;
end $$;
create trigger mascotas_cartilla after insert on public.mascotas
  for each row execute function public.crear_cartilla();

create function public.preparar_reporte() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  loop
    new.folio := 'REP-' || public.codigo_aleatorio();
    exit when not exists (select 1 from public.reportes where folio = new.folio);
  end loop;
  return new;
end $$;
create trigger reportes_preparar before insert on public.reportes
  for each row execute function public.preparar_reporte();

-- Al registrarse alguien en Auth se crea su perfil. El rol SIEMPRE es 'tutor': los metadatos
-- los controla el usuario, así que nunca se toma el rol de ahí.
create function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, jsonb_build_object());
begin
  insert into public.perfiles (id, nombre, apellido, telefono, acepto_privacidad_en, version_aviso)
  values (
    new.id,
    left(coalesce(nullif(trim(meta->>'nombre'), ''), 'Tutor'), 60),
    left(coalesce(trim(meta->>'apellido'), ''), 60),
    case when meta->>'telefono' ~ '^[0-9]{10}$' then meta->>'telefono' end,
    case when meta->>'acepto_privacidad' = 'true' then now() end,
    left(meta->>'version_aviso', 40)
  );
  return new;
end $$;
create trigger auth_usuario_nuevo after insert on auth.users
  for each row execute function public.crear_perfil();

-- ---------------------------------------------------------------------------------------
-- Rol de autoridad (paso 11): lectura de reportes
-- ---------------------------------------------------------------------------------------
create function public.es_autoridad() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = (select auth.uid()) and rol = 'autoridad')
$$;

-- ---------------------------------------------------------------------------------------
-- Límite de intentos por IP (hash). Solo la llaman otras funciones y la función de Edge.
-- ---------------------------------------------------------------------------------------
create function public.limitar(p_accion text, p_max int, p_ventana interval, p_ip text default null)
returns void language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  cabeceras text := nullif(current_setting('request.headers', true), '');
  ip text;
  h text;
  n int;
begin
  ip := coalesce(
    nullif(trim(p_ip), ''),
    nullif(trim(split_part(coalesce(cabeceras::json ->> 'x-forwarded-for', ''), ',', 1)), ''),
    'sin-ip'
  );
  h := encode(digest(ip || ':manchitas', 'sha256'), 'hex');

  select count(*) into n from public.intentos
   where accion = p_accion and ip_hash = h and creado_en > now() - p_ventana;
  if n >= p_max then
    raise exception 'limite_excedido' using errcode = 'P0001';
  end if;

  insert into public.intentos (accion, ip_hash) values (p_accion, h);
  if random() < 0.02 then
    delete from public.intentos where creado_en < now() - interval '2 days';
  end if;
end $$;

-- ---------------------------------------------------------------------------------------
-- Consultas públicas (sin cuenta). Son lo único que ve `anon`; no hay acceso a las tablas.
-- ---------------------------------------------------------------------------------------
-- Ficha mínima por token largo. No devuelve folio, correo ni teléfono suelto: solo la base del
-- enlace de WhatsApp (el cliente le agrega el mensaje).
create function public.perfil_publico(p_token text)
returns table (
  nombre text, raza text, nacimiento text, senas text, nota text,
  foto_path text, apellido_tutor text, whatsapp_base text
)
language sql stable security definer set search_path = public as $$
  select m.nombre, m.raza, m.nacimiento, m.senas, m.nota, m.foto_path,
         nullif(split_part(trim(p.apellido), ' ', 1), ''),
         case when p.telefono is not null then 'https://wa.me/52' || p.telefono end
    from public.mascotas m
    join public.perfiles p on p.id = m.tutor_id
   where m.token = p_token and char_length(p_token) between 20 and 64
   limit 1
$$;

-- ID exacto → token del QR. Con límite por IP para impedir recorrer los folios.
create function public.token_por_folio(p_folio text) returns text
language plpgsql volatile security definer set search_path = public as $$
declare
  limpio text := upper(regexp_replace(coalesce(p_folio, ''), '[\s-]', '', 'g'));
  r text;
begin
  perform public.limitar('folio', 20, interval '10 minutes');
  if limpio !~ '^MCH[A-HJ-NP-Z2-9]{6}$' then return null; end if;
  select token into r from public.mascotas where folio = 'MCH-' || substr(limpio, 4);
  return r;
end $$;

-- Seguimiento de un reporte por folio: nunca ubicación, evidencia ni contacto.
create function public.seguimiento_reporte(p_folio text)
returns table (folio text, tipo text, creado_en timestamptz, estado text)
language plpgsql volatile security definer set search_path = public as $$
declare
  limpio text := upper(regexp_replace(coalesce(p_folio, ''), '[\s-]', '', 'g'));
begin
  perform public.limitar('seguimiento', 20, interval '10 minutes');
  if limpio !~ '^REP[A-HJ-NP-Z2-9]{6}$' then return; end if;
  return query
    select r.folio, r.tipo, r.creado_en, r.estado
      from public.reportes r where r.folio = 'REP-' || substr(limpio, 4);
end $$;

-- ---------------------------------------------------------------------------------------
-- Permisos: se parte de cero y se concede solo lo necesario
-- ---------------------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

grant select on public.perfiles to authenticated;
grant update (nombre, apellido, telefono) on public.perfiles to authenticated;

grant select, delete on public.mascotas to authenticated;
grant insert (nombre, raza, nacimiento, senas, nota, foto_path) on public.mascotas to authenticated;
grant update (nombre, raza, nacimiento, senas, nota, foto_path) on public.mascotas to authenticated;

grant select on public.cartillas to authenticated;
grant update (proxima_nombre, proxima_fecha, foto_path, recordatorio) on public.cartillas to authenticated;

grant select, delete on public.vacunas to authenticated;
grant insert (mascota_id, nombre, fecha, veterinaria) on public.vacunas to authenticated;

grant select on public.reportes to authenticated; -- RLS: solo autoridad

grant execute on function public.es_autoridad() to authenticated;
grant execute on function public.perfil_publico(text) to anon, authenticated;
grant execute on function public.token_por_folio(text) to anon, authenticated;
grant execute on function public.seguimiento_reporte(text) to anon, authenticated;
grant execute on function public.limitar(text, int, interval, text) to service_role;

-- ---------------------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------------------
alter table public.perfiles enable row level security;
alter table public.mascotas enable row level security;
alter table public.cartillas enable row level security;
alter table public.vacunas enable row level security;
alter table public.reportes enable row level security;
alter table public.intentos enable row level security; -- sin políticas: nadie la toca por la API

create policy perfiles_propio_leer on public.perfiles for select to authenticated
  using (id = (select auth.uid()));
create policy perfiles_propio_editar on public.perfiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy mascotas_propias_leer on public.mascotas for select to authenticated
  using (tutor_id = (select auth.uid()));
create policy mascotas_propias_crear on public.mascotas for insert to authenticated
  with check (tutor_id = (select auth.uid()));
create policy mascotas_propias_editar on public.mascotas for update to authenticated
  using (tutor_id = (select auth.uid())) with check (tutor_id = (select auth.uid()));
create policy mascotas_propias_borrar on public.mascotas for delete to authenticated
  using (tutor_id = (select auth.uid()));

create policy cartillas_propias_leer on public.cartillas for select to authenticated
  using (exists (select 1 from public.mascotas m where m.id = mascota_id and m.tutor_id = (select auth.uid())));
create policy cartillas_propias_editar on public.cartillas for update to authenticated
  using (exists (select 1 from public.mascotas m where m.id = mascota_id and m.tutor_id = (select auth.uid())));

create policy vacunas_propias_leer on public.vacunas for select to authenticated
  using (exists (select 1 from public.mascotas m where m.id = mascota_id and m.tutor_id = (select auth.uid())));
create policy vacunas_propias_crear on public.vacunas for insert to authenticated
  with check (exists (select 1 from public.mascotas m where m.id = mascota_id and m.tutor_id = (select auth.uid())));
create policy vacunas_propias_borrar on public.vacunas for delete to authenticated
  using (exists (select 1 from public.mascotas m where m.id = mascota_id and m.tutor_id = (select auth.uid())));

-- Paso 11: la autoridad solo lee. Nadie inserta ni edita reportes por la API.
create policy reportes_autoridad_leer on public.reportes for select to authenticated
  using (public.es_autoridad());
