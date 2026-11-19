-- Manchitas · bloque A · base de la comunidad.
-- Perfil ampliado (ciudad, colonia y tipo de usuario) y las tablas que alimentan el Inicio:
-- establecimientos (veterinarias y comercios), anuncios patrocinados, campañas, adopciones y
-- publicaciones de la comunidad. En este bloque el cliente solo LEE estas tablas; quien escribe
-- es la administración (seed o SQL). Las escrituras de tutores llegan en los bloques siguientes,
-- cada una con su propia política.
--
-- Todas las filas de demostración llevan es_demo = true y ids fijos (ver supabase/seed/).

-- ---------------------------------------------------------------------------------------
-- Perfil: ciudad, colonia y tipo de usuario.
-- `tipo_usuario` NO es un rol: no da ningún permiso. Los roles con privilegios (`rol`) siguen
-- asignándose solo por administración.
-- ---------------------------------------------------------------------------------------
alter table public.perfiles
  add column ciudad text not null default 'Hermosillo' check (char_length(ciudad) between 1 and 80),
  add column colonia text not null default '' check (char_length(colonia) <= 80),
  add column tipo_usuario text not null default 'tutor' check (tipo_usuario in ('tutor', 'rescatista', 'ciudadano')),
  add column es_demo boolean not null default false;

grant update (ciudad, colonia, tipo_usuario) on public.perfiles to authenticated;

-- El perfil se crea con los metadatos del registro. Ciudad, colonia y tipo se validan; el rol y
-- es_demo nunca salen de ahí (los metadatos los controla el usuario).
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, jsonb_build_object());
begin
  insert into public.perfiles
    (id, nombre, apellido, telefono, ciudad, colonia, tipo_usuario, acepto_privacidad_en, version_aviso)
  values (
    new.id,
    left(coalesce(nullif(trim(meta->>'nombre'), ''), 'Tutor'), 60),
    left(coalesce(trim(meta->>'apellido'), ''), 60),
    case when meta->>'telefono' ~ '^[0-9]{10}$' then meta->>'telefono' end,
    left(coalesce(nullif(trim(meta->>'ciudad'), ''), 'Hermosillo'), 80),
    left(coalesce(trim(meta->>'colonia'), ''), 80),
    case when meta->>'tipo_usuario' in ('tutor', 'rescatista', 'ciudadano') then meta->>'tipo_usuario' else 'tutor' end,
    case when meta->>'acepto_privacidad' = 'true' then now() end,
    left(meta->>'version_aviso', 40)
  );
  return new;
end $$;

-- ---------------------------------------------------------------------------------------
-- Establecimientos: veterinarias, clínicas, tiendas, estéticas, albergues y puntos de campañas.
-- `propietario_id` queda listo para el panel de veterinarias (bloque B); hoy siempre es null.
-- Las coordenadas son aproximadas por zona, no la dirección exacta.
-- ---------------------------------------------------------------------------------------
create table public.establecimientos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 120),
  tipo text not null check (tipo in ('veterinaria', 'clinica_24h', 'tienda', 'estetica', 'albergue', 'punto_campanas')),
  descripcion text not null default '' check (char_length(descripcion) <= 600),
  zona text not null default '' check (char_length(zona) <= 120),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  horario text not null default '' check (char_length(horario) <= 160),
  servicios text[] not null default '{}' check (cardinality(servicios) <= 12),
  abierto_24h boolean not null default false,
  foto text check (char_length(foto) <= 300),
  propietario_id uuid references public.perfiles (id) on delete set null,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);
create index establecimientos_tipo_idx on public.establecimientos (tipo);

-- ---------------------------------------------------------------------------------------
-- Anuncios patrocinados de establecimientos (la publicidad del Inicio). Se administra desde la
-- base: ningún texto publicitario vive en los componentes. La interfaz los rotula "Patrocinado".
-- ---------------------------------------------------------------------------------------
create table public.anuncios (
  id uuid primary key default gen_random_uuid(),
  establecimiento_id uuid not null references public.establecimientos (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 120),
  descripcion text not null default '' check (char_length(descripcion) <= 400),
  promocion text not null default '' check (char_length(promocion) <= 120),
  imagen text check (char_length(imagen) <= 300),
  vigente_desde date not null default current_date,
  vigente_hasta date not null,
  activo boolean not null default true,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now(),
  check (vigente_hasta >= vigente_desde)
);
create index anuncios_vigencia_idx on public.anuncios (vigente_hasta) where activo;

-- ---------------------------------------------------------------------------------------
-- Campañas y jornadas (vacunación, esterilización, adopción, comunitarias).
-- ---------------------------------------------------------------------------------------
create table public.campanas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 1 and 140),
  tipo text not null check (tipo in ('vacunacion', 'esterilizacion', 'adopcion', 'jornada')),
  descripcion text not null default '' check (char_length(descripcion) <= 600),
  fecha date not null,
  horario text not null default '' check (char_length(horario) <= 80),
  lugar text not null default '' check (char_length(lugar) <= 160),
  zona text not null default '' check (char_length(zona) <= 120),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  organizador text not null default '' check (char_length(organizador) <= 120),
  establecimiento_id uuid references public.establecimientos (id) on delete set null,
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);
create index campanas_fecha_idx on public.campanas (fecha);

-- ---------------------------------------------------------------------------------------
-- Adopciones: animales publicados por rescatistas y albergues.
-- `verificado` solo debe ser true cuando lo valide el Instituto o un veterinario.
-- ---------------------------------------------------------------------------------------
create table public.adopciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 60),
  especie text not null check (especie in ('perro', 'gato')),
  sexo text not null check (sexo in ('Macho', 'Hembra')),
  edad_meses int not null check (edad_meses between 0 and 360),
  tamano text not null check (tamano in ('Chico', 'Mediano', 'Grande')),
  descripcion text not null default '' check (char_length(descripcion) <= 500),
  publicado_por text not null default '' check (char_length(publicado_por) <= 120),
  foto text check (char_length(foto) <= 300),
  verificado boolean not null default false,
  estado text not null default 'disponible' check (estado in ('disponible', 'en_proceso', 'adoptado')),
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);
create index adopciones_estado_idx on public.adopciones (estado, creado_en desc);

-- ---------------------------------------------------------------------------------------
-- Publicaciones de la comunidad (actividad del Inicio). `autor_nombre` va denormalizado: RLS
-- impide leer perfiles ajenos, y aquí solo se muestra nombre e inicial.
-- ---------------------------------------------------------------------------------------
create table public.publicaciones (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references public.perfiles (id) on delete set null,
  autor_nombre text not null check (char_length(autor_nombre) between 1 and 80),
  autor_tipo text not null default 'ciudadano' check (autor_tipo in ('tutor', 'rescatista', 'ciudadano', 'establecimiento')),
  tipo text not null default 'comunidad' check (tipo in ('comunidad', 'consejo', 'adopcion', 'campana', 'extraviada', 'logro')),
  texto text not null check (char_length(texto) between 1 and 1000),
  foto text check (char_length(foto) <= 300),
  es_demo boolean not null default false,
  creado_en timestamptz not null default now()
);
create index publicaciones_creado_idx on public.publicaciones (creado_en desc);

-- ---------------------------------------------------------------------------------------
-- Indicadores de la comunidad: solo conteos agregados, sin datos de nadie.
-- ---------------------------------------------------------------------------------------
create function public.indicadores_comunidad() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'mascotas', (select count(*) from public.mascotas),
    'tutores', (select count(*) from public.perfiles where tipo_usuario = 'tutor'),
    'adopciones_disponibles', (select count(*) from public.adopciones where estado = 'disponible'),
    'campanas_proximas', (select count(*) from public.campanas where fecha >= current_date),
    'establecimientos', (select count(*) from public.establecimientos),
    'reportes', (select count(*) from public.reportes)
  )
$$;

-- ---------------------------------------------------------------------------------------
-- RLS y permisos: solo lectura para quien tiene sesión; nadie anónimo.
-- ---------------------------------------------------------------------------------------
alter table public.establecimientos enable row level security;
alter table public.anuncios enable row level security;
alter table public.campanas enable row level security;
alter table public.adopciones enable row level security;
alter table public.publicaciones enable row level security;

create policy establecimientos_leer on public.establecimientos for select to authenticated using (true);
create policy anuncios_leer_vigentes on public.anuncios for select to authenticated
  using (activo and current_date between vigente_desde and vigente_hasta);
create policy campanas_leer on public.campanas for select to authenticated using (true);
create policy adopciones_leer on public.adopciones for select to authenticated using (true);
create policy publicaciones_leer on public.publicaciones for select to authenticated using (true);

revoke all on public.establecimientos, public.anuncios, public.campanas, public.adopciones, public.publicaciones
  from anon, authenticated;
grant select on public.establecimientos, public.anuncios, public.campanas, public.adopciones, public.publicaciones
  to authenticated;

revoke execute on function public.indicadores_comunidad() from public, anon;
grant execute on function public.indicadores_comunidad() to authenticated;
