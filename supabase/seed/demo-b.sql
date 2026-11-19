-- Manchitas · datos de demostración (bloque B): promociones, reseñas y colectas de Manchitas Solidario.
-- Se ejecuta a continuación de demo.sql (lo concatena demo.mjs). Reproducible: ids fijos y
-- `on conflict`; refresca las fechas relativas en cada ejecución. Todo es ficticio (es_demo = true).
-- Las aportaciones confirmadas de aquí son DE DEMOSTRACIÓN: no hubo ningún pago real.

-- ---------------------------------------------------------------------------------------
-- Promociones (10)
-- ---------------------------------------------------------------------------------------
insert into public.promociones
  (id, establecimiento_id, titulo, descripcion, beneficio, condiciones, vigente_desde, vigente_hasta, es_demo) values
  ('de000007-0000-4000-8000-000000000001', 'de000002-0000-4000-8000-000000000001', 'Consulta de urgencias', 'Atención de urgencias para perros y gatos, todos los días.', '10 % en consulta de urgencias', 'Presenta tu folio Manchitas. Promoción de demostración.', current_date - 3, current_date + 60, true),
  ('de000007-0000-4000-8000-000000000002', 'de000002-0000-4000-8000-000000000002', 'Consulta general', 'Revisión completa y plan de vacunas para tu mascota.', '20 % en consulta general', 'Con cita previa. Promoción de demostración.', current_date - 5, current_date + 55, true),
  ('de000007-0000-4000-8000-000000000003', 'de000002-0000-4000-8000-000000000003', 'Ultrasonido', 'Diagnóstico por imagen con explicación de resultados.', '15 % en ultrasonido', 'Presenta tu folio Manchitas. Promoción de demostración.', current_date - 10, current_date + 90, true),
  ('de000007-0000-4000-8000-000000000004', 'de000002-0000-4000-8000-000000000004', 'Paquete de esterilización', 'Cirugía con indicaciones de cuidados posteriores.', 'Precio especial en jornada', 'Cupo limitado y con cita. Promoción de demostración.', current_date - 2, current_date + 40, true),
  ('de000007-0000-4000-8000-000000000005', 'de000002-0000-4000-8000-000000000005', 'Vacuna antirrábica en jornada', 'Vacunación en los días de jornada comunitaria.', 'Costo reducido en jornadas', 'Solo en fechas de campaña. Promoción de demostración.', current_date, current_date + 30, true),
  ('de000007-0000-4000-8000-000000000006', 'de000002-0000-4000-8000-000000000006', 'Vacunación de refuerzo', 'Mantén al día la cartilla de tu perro o gato.', '15 % en vacunas', 'Presenta tu folio Manchitas. Promoción de demostración.', current_date - 1, current_date + 30, true),
  ('de000007-0000-4000-8000-000000000007', 'de000002-0000-4000-8000-000000000007', 'Tu primer baño', 'Baño y cepillado con productos hipoalergénicos.', '10 % en tu primer baño', 'Una vez por mascota. Promoción de demostración.', current_date - 7, current_date + 45, true),
  ('de000007-0000-4000-8000-000000000008', 'de000002-0000-4000-8000-000000000008', 'Alimento seco', 'Alimento para perros y gatos de varias marcas.', '5 % en alimento seco', 'En bultos de 4 kg o más. Promoción de demostración.', current_date - 4, current_date + 50, true),
  ('de000007-0000-4000-8000-000000000009', 'de000002-0000-4000-8000-000000000010', 'Farmacia veterinaria', 'Medicamentos con receta de tu veterinario.', '10 % en medicamentos con receta', 'Presenta la receta. Promoción de demostración.', current_date - 6, current_date + 35, true),
  ('de000007-0000-4000-8000-000000000010', 'de000002-0000-4000-8000-000000000002', 'Desparasitación', 'Desparasitación interna y externa.', '2 por 1 en desparasitación', 'Para dos mascotas del mismo hogar. Promoción de demostración.', current_date - 1, current_date + 20, true)
on conflict (id) do update set vigente_desde = excluded.vigente_desde, vigente_hasta = excluded.vigente_hasta,
  titulo = excluded.titulo, descripcion = excluded.descripcion, beneficio = excluded.beneficio, activa = true, es_demo = true;

-- ---------------------------------------------------------------------------------------
-- Reseñas (20): puntuaciones distintas, algunas verificadas y otras no, y respuestas del
-- establecimiento. Autores ficticios. Se insertan sin sesión, así que el trigger respeta los valores.
-- ---------------------------------------------------------------------------------------
insert into public.resenas
  (id, establecimiento_id, autor_nombre, puntuacion, comentario, verificada, respuesta, respuesta_en, es_demo, creado_en) values
  ('de000008-0000-4000-8000-000000000001', 'de000002-0000-4000-8000-000000000001', 'Paola R.', 5, 'Llegué de madrugada con mi perro intoxicado y lo atendieron de inmediato. Muy profesionales.', true, 'Gracias, Paola. Nos alegra que tu perro esté bien.', now() - interval '12 days', true, now() - interval '14 days'),
  ('de000008-0000-4000-8000-000000000002', 'de000002-0000-4000-8000-000000000001', 'Iván T.', 4, 'Buena atención, aunque la espera fue de casi una hora.', false, null, null, true, now() - interval '30 days'),
  ('de000008-0000-4000-8000-000000000003', 'de000002-0000-4000-8000-000000000002', 'Lucía M.', 5, 'Siempre me explican con calma las vacunas y los cuidados. Muy cálidos con mi perro nervioso.', true, 'Gracias por tu confianza, Lucía. Aquí te esperamos.', now() - interval '5 days', true, now() - interval '6 days'),
  ('de000008-0000-4000-8000-000000000004', 'de000002-0000-4000-8000-000000000002', 'Marcos D.', 4, 'Buenos precios y atención puntual con cita.', true, null, null, true, now() - interval '20 days'),
  ('de000008-0000-4000-8000-000000000005', 'de000002-0000-4000-8000-000000000002', 'Rosa E.', 3, 'El servicio es bueno, pero cuesta encontrar estacionamiento.', false, null, null, true, now() - interval '40 days'),
  ('de000008-0000-4000-8000-000000000006', 'de000002-0000-4000-8000-000000000003', 'Daniela S.', 5, 'Le hicieron un ultrasonido a mi gata y me explicaron cada resultado con paciencia.', true, null, null, true, now() - interval '9 days'),
  ('de000008-0000-4000-8000-000000000007', 'de000002-0000-4000-8000-000000000003', 'Héctor G.', 2, 'Me cobraron más de lo que me dijeron por teléfono. Pedí que aclararan el desglose.', false, 'Lamentamos la confusión, Héctor. Escríbenos con tu folio para revisar el cobro.', now() - interval '16 days', true, now() - interval '18 days'),
  ('de000008-0000-4000-8000-000000000008', 'de000002-0000-4000-8000-000000000004', 'Sofía V.', 5, 'La esterilización de mi perra salió muy bien y la recuperación fue sencilla.', true, null, null, true, now() - interval '8 days'),
  ('de000008-0000-4000-8000-000000000009', 'de000002-0000-4000-8000-000000000004', 'Andrés P.', 4, 'Trato muy amable con los cachorros.', false, null, null, true, now() - interval '25 days'),
  ('de000008-0000-4000-8000-000000000010', 'de000002-0000-4000-8000-000000000004', 'Mariana L.', 5, 'Nos dieron indicaciones claras para el posoperatorio.', true, null, null, true, now() - interval '33 days'),
  ('de000008-0000-4000-8000-000000000011', 'de000002-0000-4000-8000-000000000005', 'Jorge C.', 4, 'La jornada de vacunación estuvo bien organizada, aunque llegamos tarde y había fila.', false, null, null, true, now() - interval '11 days'),
  ('de000008-0000-4000-8000-000000000012', 'de000002-0000-4000-8000-000000000005', 'Elena B.', 5, 'Pude vacunar a mis dos gatos en una sola mañana.', true, null, null, true, now() - interval '22 days'),
  ('de000008-0000-4000-8000-000000000013', 'de000002-0000-4000-8000-000000000006', 'Carlos P.', 5, 'Atendieron a mi gata con mucha paciencia.', true, 'Gracias, Carlos. Saludos a tu gata.', now() - interval '3 days', true, now() - interval '4 days'),
  ('de000008-0000-4000-8000-000000000014', 'de000002-0000-4000-8000-000000000006', 'Valeria N.', 3, 'Buen trato, pero el horario de la tarde es corto.', false, null, null, true, now() - interval '28 days'),
  ('de000008-0000-4000-8000-000000000015', 'de000002-0000-4000-8000-000000000007', 'Fernanda L.', 5, 'Dejaron a mi perro hermoso y tranquilo. Lo bañaron sin estresarlo.', true, null, null, true, now() - interval '7 days'),
  ('de000008-0000-4000-8000-000000000016', 'de000002-0000-4000-8000-000000000007', 'Raúl A.', 4, 'Buen corte; recomiendo apartar con anticipación.', false, null, null, true, now() - interval '35 days'),
  ('de000008-0000-4000-8000-000000000017', 'de000002-0000-4000-8000-000000000008', 'Diego A.', 4, 'Buen surtido de alimento y precios razonables.', false, null, null, true, now() - interval '13 days'),
  ('de000008-0000-4000-8000-000000000018', 'de000002-0000-4000-8000-000000000009', 'Patricia O.', 5, 'Adopté ahí a mi gato; el proceso fue serio y cuidadoso.', true, 'Gracias por darle un hogar, Patricia.', now() - interval '19 days', true, now() - interval '21 days'),
  ('de000008-0000-4000-8000-000000000019', 'de000002-0000-4000-8000-000000000009', 'Luis M.', 4, 'Muy comprometidos con los animales. Conviene hacer cita para visitar.', false, null, null, true, now() - interval '45 days'),
  ('de000008-0000-4000-8000-000000000020', 'de000002-0000-4000-8000-000000000010', 'Camila R.', 3, 'La atención es buena, pero a veces tardan en contestar mensajes.', false, null, null, true, now() - interval '17 days')
on conflict (id) do update set creado_en = excluded.creado_en, comentario = excluded.comentario, es_demo = true;

-- ---------------------------------------------------------------------------------------
-- Colectas de Manchitas Solidario: 3 publicadas (con avance distinto) y 1 en revisión de la cuenta demo.
-- Las fotos son de banco (no son los animales reales).
-- ---------------------------------------------------------------------------------------
insert into public.colectas
  (id, organizador_id, organizador_nombre, titulo, resumen, historia, beneficiario_tipo, beneficiario_nombre, meta_mxn,
   foto_principal, fotos, estado, fecha_fin, es_demo, creado_en, publicada_en) values
  ('de00000a-0000-4000-8000-000000000001', null, 'Refugio Huellas del Desierto',
   'Cirugía para Tobi, atropellado en la carretera',
   'Tobi necesita una cirugía de cadera para volver a caminar.',
   E'Tobi llegó al refugio con la cadera lastimada después de ser atropellado. Es un perro joven, cariñoso y muy valiente.\n\nEl veterinario recomienda una cirugía ortopédica y unas semanas de recuperación. Con tu ayuda cubriremos la operación, la hospitalización y los medicamentos. Cuando esté recuperado, buscaremos una familia para él.\n\nEsta es una campaña de demostración: no se recibe dinero real.',
   'mascota', 'Tobi', 15000, '/img/adopcion-canela.webp', '{}', 'publicada', current_date + 20, true, now() - interval '25 days', now() - interval '24 days'),
  ('de00000a-0000-4000-8000-000000000002', null, 'Albergue Segunda Oportunidad',
   'Alimento para los animales del albergue',
   'Alimento y arena para perros y gatos durante dos meses.',
   E'En el albergue cuidamos a decenas de perros y gatos que esperan un hogar. El alimento es lo que más rápido se acaba.\n\nCon esta campaña compraremos croquetas para perros adultos y para gatos, y arena sanitaria para dos meses.\n\nEsta es una campaña de demostración: no se recibe dinero real.',
   'albergue', 'Albergue Segunda Oportunidad', 8000, '/img/adopcion-toto.webp', '{}', 'publicada', current_date + 35, true, now() - interval '10 days', now() - interval '9 days'),
  ('de00000a-0000-4000-8000-000000000003', null, 'Patitas Rescatistas Hermosillo',
   'Esterilizaciones para la colonia',
   'Esterilizar a 40 perros y gatos de la colonia para evitar camadas en la calle.',
   E'Cada camada que nace en la calle es una vida difícil. La esterilización es la forma más efectiva de evitarlo.\n\nJuntamos fondos para esterilizar a 40 perros y gatos de la colonia, con material de curación y traslado de los animales a la jornada.\n\nEsta es una campaña de demostración: no se recibe dinero real.',
   'campana', 'Jornada de esterilización en la colonia', 20000, '/images/aliados/jornadas-sonora-pet.webp', '{}', 'publicada', current_date + 9, true, now() - interval '40 days', now() - interval '39 days'),
  ('de00000a-0000-4000-8000-000000000004', 'de000000-0000-4000-8000-000000000001', 'Adriana D.',
   'Un hogar temporal para gatitos rescatados',
   'Vacunas y alimento para una camada de gatitos mientras encuentran familia.',
   E'Rescatamos una camada de gatitos de la calle y necesitan vacunas, alimento especial y su futura esterilización mientras encuentran un hogar definitivo.\n\nEsta campaña está en revisión: aún no es pública. Es de demostración.',
   'rescatista', 'Camada de gatitos rescatados', 6000, '/img/adopcion-misho.webp', '{}', 'en_revision', current_date + 45, true, now() - interval '1 day', null)
on conflict (id) do update set fecha_fin = excluded.fecha_fin, estado = excluded.estado, titulo = excluded.titulo,
  historia = excluded.historia, foto_principal = excluded.foto_principal, es_demo = true;

insert into public.colecta_gastos (id, colecta_id, concepto, monto_mxn) values
  ('de00000b-0000-4000-8000-000000000001', 'de00000a-0000-4000-8000-000000000001', 'Cirugía ortopédica de cadera', 9000),
  ('de00000b-0000-4000-8000-000000000002', 'de00000a-0000-4000-8000-000000000001', 'Hospitalización', 3500),
  ('de00000b-0000-4000-8000-000000000003', 'de00000a-0000-4000-8000-000000000001', 'Medicamentos y curaciones', 1800),
  ('de00000b-0000-4000-8000-000000000004', 'de00000a-0000-4000-8000-000000000001', 'Estudios de imagen', 700),
  ('de00000b-0000-4000-8000-000000000005', 'de00000a-0000-4000-8000-000000000002', 'Alimento para perros adultos', 4800),
  ('de00000b-0000-4000-8000-000000000006', 'de00000a-0000-4000-8000-000000000002', 'Alimento para gatos', 2200),
  ('de00000b-0000-4000-8000-000000000007', 'de00000a-0000-4000-8000-000000000002', 'Arena sanitaria', 1000),
  ('de00000b-0000-4000-8000-000000000008', 'de00000a-0000-4000-8000-000000000003', 'Cirugías de esterilización (40)', 16000),
  ('de00000b-0000-4000-8000-000000000009', 'de00000a-0000-4000-8000-000000000003', 'Material de curación', 2500),
  ('de00000b-0000-4000-8000-000000000010', 'de00000a-0000-4000-8000-000000000003', 'Traslado y logística', 1500),
  ('de00000b-0000-4000-8000-000000000011', 'de00000a-0000-4000-8000-000000000004', 'Vacunas', 2400),
  ('de00000b-0000-4000-8000-000000000012', 'de00000a-0000-4000-8000-000000000004', 'Alimento especial', 1800),
  ('de00000b-0000-4000-8000-000000000013', 'de00000a-0000-4000-8000-000000000004', 'Esterilización futura', 1800)
on conflict (id) do nothing;

insert into public.colecta_actualizaciones (id, colecta_id, titulo, texto, creado_en) values
  ('de00000c-0000-4000-8000-000000000001', 'de00000a-0000-4000-8000-000000000001', 'Tobi ya está estable', 'El veterinario confirmó que Tobi está estable y programó la cirugía. Gracias por compartir su historia.', now() - interval '3 days'),
  ('de00000c-0000-4000-8000-000000000002', 'de00000a-0000-4000-8000-000000000001', 'Ya cubrimos los estudios', 'Con las primeras aportaciones pagamos los estudios de imagen. Seguimos con la cirugía.', now() - interval '10 days'),
  ('de00000c-0000-4000-8000-000000000003', 'de00000a-0000-4000-8000-000000000003', 'Quedan pocos lugares', 'Ya tenemos 32 de los 40 lugares para la jornada. Falta poco para completarla.', now() - interval '2 days')
on conflict (id) do update set creado_en = excluded.creado_en;

-- Aportaciones confirmadas DE DEMOSTRACIÓN (sin pago real). Los montos suman: colecta 1 = $9,300
-- (14 aportaciones), colecta 2 = $1,450 (6) y colecta 3 = $18,200 (22). Además, estados que no
-- cuentan como recaudado: una pendiente, una fallida y una reembolsada.
create or replace function pg_temp.sembrar_aportaciones(p_colecta uuid, p_montos int[], p_base int) returns void
language plpgsql as $f$
declare
  nombres text[] := array['Lucía M.', 'Marco R.', 'Fernanda L.', 'Diego A.', 'Sofía V.', 'Carlos P.', 'Paola R.', 'Iván T.', 'Rosa E.', 'Héctor G.', 'Daniela S.', 'Andrés P.'];
  i int;
begin
  for i in 1 .. array_length(p_montos, 1) loop
    insert into public.aportaciones (id, colecta_id, donante_nombre, anonima, monto_mxn, mensaje, estado, simulada, es_demo, creado_en)
    values (
      ('de00000d-0000-4000-8000-' || lpad((p_base + i)::text, 12, '0'))::uuid, p_colecta,
      case when i % 5 = 0 then 'Anónimo' else nombres[1 + (i + p_base) % array_length(nombres, 1)] end,
      i % 5 = 0, p_montos[i],
      case when i % 3 = 0 then 'Mucho ánimo.' when i % 4 = 0 then 'Con cariño desde Hermosillo.' else '' end,
      'confirmada', true, true,
      now() - make_interval(days => (i * 7) % 18, hours => (i * 5) % 23)
    ) on conflict (id) do nothing;
  end loop;
end $f$;

select pg_temp.sembrar_aportaciones('de00000a-0000-4000-8000-000000000001', array[2000,1000,800,800,700,600,600,500,500,500,400,400,300,200], 100);
select pg_temp.sembrar_aportaciones('de00000a-0000-4000-8000-000000000002', array[500,300,250,200,100,100], 200);
select pg_temp.sembrar_aportaciones('de00000a-0000-4000-8000-000000000003', array[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,500,500,500,500,500,500,500,500,1500,1000,700], 300);

insert into public.aportaciones (id, colecta_id, donante_nombre, anonima, monto_mxn, mensaje, estado, simulada, es_demo, creado_en) values
  ('de00000d-0000-4000-8000-000000000901', 'de00000a-0000-4000-8000-000000000001', 'Marco R.', false, 500, '', 'pendiente', true, true, now() - interval '2 hours'),
  ('de00000d-0000-4000-8000-000000000902', 'de00000a-0000-4000-8000-000000000001', 'Rosa E.', false, 300, '', 'fallida', true, true, now() - interval '1 day'),
  ('de00000d-0000-4000-8000-000000000903', 'de00000a-0000-4000-8000-000000000001', 'Iván T.', false, 200, 'Solicité el reembolso por error de monto.', 'reembolsada', true, true, now() - interval '4 days')
on conflict (id) do nothing;
