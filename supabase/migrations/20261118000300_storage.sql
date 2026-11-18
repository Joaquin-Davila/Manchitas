-- Manchitas · paso 10 · buckets y políticas de Storage.
-- Ruta de archivos: <id del usuario>/<nombre aleatorio>.jpg. La carpeta decide quién es el dueño.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  -- Lectura pública con nombres no adivinables: la ficha del QR debe mostrar la foto sin sesión.
  ('mascotas-fotos', 'mascotas-fotos', true, 2097152, array['image/jpeg']),
  ('cartillas-fotos', 'cartillas-fotos', false, 2097152, array['image/jpeg']),
  -- Evidencia de reportes: la sube la función de Edge y solo la lee la autoridad.
  ('reportes-evidencia', 'reportes-evidencia', false, 2097152, array['image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy mascotas_fotos_propias on storage.objects for all to authenticated
  using (bucket_id = 'mascotas-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'mascotas-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy cartillas_fotos_propias on storage.objects for all to authenticated
  using (bucket_id = 'cartillas-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'cartillas-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy reportes_evidencia_autoridad on storage.objects for select to authenticated
  using (bucket_id = 'reportes-evidencia' and public.es_autoridad());
