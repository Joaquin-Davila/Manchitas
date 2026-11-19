import type { Animal } from './adopcionEjemplo'
import { animales as ejemplo } from './adopcionEjemplo'
import { clienteRemoto, haySupabase } from './supabase'

/**
 * Animales en adopción. Con Supabase salen de la tabla `adopciones` (solo los disponibles); sin
 * Supabase, o si falla la lectura, se usan los de ejemplo para que la pantalla no quede vacía.
 */
export async function listarAdopciones(): Promise<Animal[]> {
  if (!haySupabase) return ejemplo
  const { data, error } = await clienteRemoto()
    .from('adopciones')
    .select('id, nombre, especie, sexo, edad_meses, tamano, descripcion, publicado_por, foto, verificado, publicador_id')
    .eq('estado', 'disponible')
    .order('creado_en', { ascending: false })
  if (error || !data || data.length === 0) return ejemplo
  return data.map((a) => ({
    id: a.id,
    nombre: a.nombre,
    especie: a.especie as Animal['especie'],
    edadMeses: a.edad_meses,
    tamano: a.tamano as Animal['tamano'],
    sexo: a.sexo as Animal['sexo'],
    descripcion: a.descripcion,
    publicadoPor: a.publicado_por,
    verificado: a.verificado,
    foto: a.foto ?? '',
    fotoAlt: `Foto de ejemplo de ${a.nombre}`,
    publicadorId: a.publicador_id ?? undefined,
  }))
}
