import { Clock, ShieldCheck, Stethoscope, Syringe } from 'lucide-react'
import type { TipoAliado, TipoCampana } from '../../lib/campanasEjemplo'

/** Color e ícono por tipo de campaña o de lugar. */
export const VISUAL: Record<TipoCampana | TipoAliado, { fondo: string; texto: string; icono: typeof Syringe }> = {
  Vacunación: { fondo: 'bg-menta-suave', texto: 'text-salud-trazo', icono: Syringe },
  Esterilización: { fondo: 'bg-coral-suave', texto: 'text-naranja-sombra', icono: ShieldCheck },
  Veterinaria: { fondo: 'bg-celeste', texto: 'text-naranja-sombra', icono: Stethoscope },
  'Clínica 24 h': { fondo: 'bg-menta-suave', texto: 'text-salud-trazo', icono: Clock },
  'Punto de campañas': { fondo: 'bg-coral-suave', texto: 'text-naranja-sombra', icono: Syringe },
}

export function visualDe(tipo: TipoCampana | TipoAliado) {
  return VISUAL[tipo]
}

