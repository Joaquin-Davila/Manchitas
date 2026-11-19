-- Manchitas · registro de gatos.
-- Hasta ahora el trigger fijaba especie = 'perro' y el cliente no podía escribir esa columna.
-- La columna ya acepta solo 'perro' o 'gato' (check del esquema): ahora el tutor la elige al
-- registrar o editar. Dueño, folio y token siguen fijándolos el servidor.

create or replace function public.preparar_mascota() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  new.tutor_id := auth.uid();
  -- La especie la elige el tutor; si no la manda, 'perro' (valor por defecto de la columna).
  new.especie := coalesce(new.especie, 'perro');
  loop
    new.folio := 'MCH-' || public.codigo_aleatorio();
    exit when not exists (select 1 from public.mascotas where folio = new.folio);
  end loop;
  -- 256 bits en base64url
  new.token := translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');
  return new;
end $$;

grant insert (especie) on public.mascotas to authenticated;
grant update (especie) on public.mascotas to authenticated;
