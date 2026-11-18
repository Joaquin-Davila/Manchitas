-- Manchitas · paso 10 · permisos del rol de servicio.
-- service_role se salta RLS, pero igual necesita permisos de tabla: en proyectos nuevos Supabase ya
-- no los concede solos a las tablas creadas por migraciones. Solo lo que la función de Edge
-- `enviar-reporte` necesita: guardar reportes y devolver su folio.
grant select, insert on public.reportes to service_role;
