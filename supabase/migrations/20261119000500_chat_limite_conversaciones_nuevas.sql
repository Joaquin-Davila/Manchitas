-- Manchitas · ajuste del bloque D: el límite de 10 conversaciones al día solo cuenta las NUEVAS.
-- Antes también se gastaba al abrir una conversación que ya existía (p. ej. al tocar "Escribir" otra vez
-- desde la ficha), y eso bloqueaba a personas legítimas.

create or replace function public.iniciar_conversacion(p_tipo text, p_contexto uuid, p_con uuid default null) returns uuid
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
    -- Solo crear una conversación nueva gasta del límite diario.
    perform public.limitar('iniciar_chat', 10, interval '1 day', yo::text);
    insert into public.chat_conversaciones (tipo, contexto_id, contexto_titulo, contexto_foto, clave, creado_por)
    values (p_tipo, p_contexto, left(coalesce(v_titulo, ''), 120), v_foto, v_clave, yo) returning chat_conversaciones.id into v_id;
    insert into public.chat_participantes (conversacion_id, usuario_id, nombre)
    values (v_id, yo, public.nombre_visible(yo)), (v_id, dest, public.nombre_visible(dest));
  else
    update public.chat_participantes set archivada = false where conversacion_id = v_id and usuario_id = yo;
  end if;
  return v_id;
end $$;
