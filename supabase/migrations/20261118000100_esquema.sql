-- Manchitas · paso 10 · esquema base.
-- Todas las tablas tienen RLS activo (ver la migración siguiente). Folio, token y dueño de una
-- mascota los fija el servidor con triggers: el cliente no puede elegirlos.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------------------
-- Perfiles: datos del tutor (o de la autoridad). 1 a 1 con auth.users.
-- ---------------------------------------------------------------------------------------
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 60),
  apellido text not null default '' check (char_length(apellido) <= 60),
  telefono text check (telefono ~ '^[0-9]{10}$'),
  rol text not null default 'tutor' check (rol in ('tutor', 'autoridad')),
  acepto_privacidad_en timestamptz,
  version_aviso text,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------
-- Mascotas
-- ---------------------------------------------------------------------------------------
create table public.mascotas (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.perfiles (id) on delete cascade,
  especie text not null default 'perro' check (especie in ('perro', 'gato')),
  nombre text not null check (char_length(nombre) between 1 and 60),
  raza text not null default '' check (char_length(raza) <= 80),
  -- "AAAA" (edad aproximada) o "AAAA-MM-DD"
  nacimiento text not null check (nacimiento ~ '^[0-9]{4}(-[0-9]{2}-[0-9]{2})?$'),
  senas text not null default '' check (char_length(senas) <= 500),
  nota text not null default '' check (char_length(nota) <= 500),
  foto_path text check (char_length(foto_path) <= 200),
  folio text not null unique,
  token text not null unique,
  creada_en timestamptz not null default now()
);
create index mascotas_tutor_idx on public.mascotas (tutor_id);

-- ---------------------------------------------------------------------------------------
-- Cartilla: una fila por mascota (se crea sola) y una fila por vacuna aplicada.
-- Solo lo aplicado y la próxima pendiente; sin esquema calculado hasta que lo valide un vet.
-- ---------------------------------------------------------------------------------------
create table public.cartillas (
  mascota_id uuid primary key references public.mascotas (id) on delete cascade,
  proxima_nombre text check (char_length(proxima_nombre) <= 80),
  proxima_fecha date,
  foto_path text check (char_length(foto_path) <= 200),
  recordatorio boolean not null default true,
  check ((proxima_nombre is null) = (proxima_fecha is null))
);

create table public.vacunas (
  id uuid primary key default gen_random_uuid(),
  mascota_id uuid not null references public.mascotas (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  fecha date not null,
  veterinaria text check (char_length(veterinaria) <= 120),
  creada_en timestamptz not null default now()
);
create index vacunas_mascota_idx on public.vacunas (mascota_id, fecha desc);

-- ---------------------------------------------------------------------------------------
-- Reportes ciudadanos. Se insertan solo desde la función de Edge (clave de servicio).
-- ---------------------------------------------------------------------------------------
create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  tipo text not null check (tipo in ('maltrato', 'abandono', 'herido', 'suelto', 'venta', 'otro')),
  colonia text not null default '' check (char_length(colonia) <= 120),
  calle text not null default '' check (char_length(calle) <= 160),
  referencias text not null default '' check (char_length(referencias) <= 300),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  descripcion text not null check (char_length(descripcion) between 1 and 2000),
  fecha_hechos date not null,
  fotos_paths text[] not null default '{}' check (cardinality(fotos_paths) <= 3),
  telefono text check (telefono ~ '^[0-9]{10}$'),
  estado text not null default 'recibido' check (estado in ('recibido', 'canalizado')),
  creado_en timestamptz not null default now()
);
create index reportes_creado_idx on public.reportes (creado_en desc);

-- Registro de intentos para los límites del lado del servidor (guarda un hash, no la IP).
create table public.intentos (
  id bigint generated always as identity primary key,
  accion text not null,
  ip_hash text not null,
  creado_en timestamptz not null default now()
);
create index intentos_busqueda_idx on public.intentos (accion, ip_hash, creado_en desc);
