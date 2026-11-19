import { ChevronDown, CircleAlert, ExternalLink, Info } from 'lucide-react'
import type { ReactNode } from 'react'

// Estructura editorial vertical para los documentos de políticas: encabezado, índice de navegación
// (lateral y fijo en escritorio, plegable en móvil), secciones independientes con subtítulos,
// listas, bloques destacados y acordeones, fecha de actualización y fuentes. El contenido llega
// como datos: este componente no escribe ningún texto normativo.

export type Bloque =
  | { tipo: 'p'; texto: string }
  | { tipo: 'sub'; titulo: string }
  | { tipo: 'lista'; items: string[] }
  | { tipo: 'destacado'; titulo?: string; texto: string }

export type Seccion = {
  id: string
  titulo: string
  bloques: Bloque[]
  /** Si es true, la sección se muestra como acordeón (cerrado al inicio). */
  acordeon?: boolean
}

export type Fuente = { texto: string; url?: string }

function Bloques({ bloques }: { bloques: Bloque[] }) {
  return (
    <div className="flex flex-col gap-3">
      {bloques.map((b, i) => {
        if (b.tipo === 'p') return <p key={i} className="text-[15px] leading-relaxed text-cafe">{b.texto}</p>
        if (b.tipo === 'sub')
          return (
            <h3 key={i} className="mt-1 font-titulo text-base font-bold text-cafe">
              {b.titulo}
            </h3>
          )
        if (b.tipo === 'lista')
          return (
            <ul key={i} className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-cafe">
              {b.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )
        return (
          <aside key={i} className="flex gap-3 rounded-[18px] border border-borde-calido bg-amarillo-suave p-4">
            <Info aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-naranja-sombra" />
            <div className="text-[15px] leading-relaxed text-cafe">
              {b.titulo && <p className="font-semibold">{b.titulo}</p>}
              <p>{b.texto}</p>
            </div>
          </aside>
        )
      })}
    </div>
  )
}

export default function DocumentoEditorial({
  titulo,
  descripcion,
  actualizado,
  borrador,
  secciones,
  fuentes,
  pie,
}: {
  titulo: string
  descripcion: string
  /** Texto de la fecha, p. ej. "Noviembre de 2026". */
  actualizado: string
  /** Aviso de que el texto no es definitivo (aparece arriba, bien visible). */
  borrador?: string
  secciones: Seccion[]
  fuentes?: Fuente[]
  pie?: ReactNode
}) {
  const indice = (
    <ol className="m-0 flex list-none flex-col gap-0.5 p-0 text-sm">
      {secciones.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="flex min-h-11 items-start gap-2 rounded-xl px-2 py-2.5 text-cafe-suave hover:bg-amarillo-suave hover:text-cafe focus-visible:outline-2 focus-visible:outline-naranja-sombra"
          >
            <span aria-hidden="true" className="w-5 shrink-0 font-titulo text-[13px] font-bold text-naranja-sombra">
              {i + 1}
            </span>
            {s.titulo}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <article>
      <header className="border-b border-borde-calido pb-6">
        <h1 className="font-titulo text-[28px] font-bold leading-tight text-cafe md:text-4xl">{titulo}</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-cafe-suave md:text-base">{descripcion}</p>
        <p className="mt-3 inline-flex rounded-full border border-borde-calido bg-white px-3 py-1 text-[13px] font-semibold text-cafe-suave">
          Última actualización: {actualizado}
        </p>
        {borrador && (
          <p role="note" className="mt-4 flex items-start gap-3 rounded-[18px] bg-aviso-fondo p-4 text-sm text-cafe">
            <CircleAlert aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-naranja-sombra" />
            <span>
              <strong>Borrador pendiente de revisión.</strong> {borrador}
            </span>
          </p>
        )}
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <nav aria-label="Índice del documento" className="lg:order-first">
          {/* Móvil: plegable. Escritorio: fijo a un lado mientras se lee. */}
          <details className="rounded-[18px] border border-borde-calido bg-white p-1 lg:hidden">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-xl px-3 font-semibold text-cafe">
              En esta página
              <ChevronDown aria-hidden="true" size={18} />
            </summary>
            <div className="px-1 pb-2">{indice}</div>
          </details>
          <div className="sticky top-6 hidden lg:block">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-cafe-suave">En esta página</p>
            {indice}
          </div>
        </nav>

        <div className="mt-8 flex min-w-0 flex-col gap-9 lg:mt-0">
          {secciones.map((s, i) =>
            s.acordeon ? (
              <details key={s.id} id={s.id} className="group scroll-mt-6 rounded-[20px] border border-borde-calido bg-white">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-5 font-titulo text-lg font-bold text-cafe">
                  <span>
                    <span aria-hidden="true" className="mr-2 text-naranja-sombra">
                      {i + 1}.
                    </span>
                    {s.titulo}
                  </span>
                  <ChevronDown aria-hidden="true" size={20} className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-borde-calido px-5 pb-5 pt-4">
                  <Bloques bloques={s.bloques} />
                </div>
              </details>
            ) : (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titulo`} className="scroll-mt-6">
                <h2 id={`${s.id}-titulo`} className="mb-3 font-titulo text-xl font-bold text-cafe md:text-2xl">
                  <span aria-hidden="true" className="mr-2 text-naranja-sombra">
                    {i + 1}.
                  </span>
                  {s.titulo}
                </h2>
                <Bloques bloques={s.bloques} />
              </section>
            ),
          )}

          {fuentes && fuentes.length > 0 && (
            <section aria-labelledby="fuentes-titulo" className="border-t border-borde-calido pt-6">
              <h2 id="fuentes-titulo" className="mb-3 font-titulo text-lg font-bold text-cafe">
                Fuentes y referencias
              </h2>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-cafe-suave">
                {fuentes.map((f) => (
                  <li key={f.texto}>
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-naranja-sombra underline">
                        {f.texto}
                        <ExternalLink aria-hidden="true" size={14} />
                        <span className="sr-only"> (se abre en otra pestaña)</span>
                      </a>
                    ) : (
                      f.texto
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {pie}
        </div>
      </div>
    </article>
  )
}
