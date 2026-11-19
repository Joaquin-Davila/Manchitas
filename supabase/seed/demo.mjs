// Manchitas · aplica los datos de demostración al proyecto vinculado de Supabase.
//
//   node supabase/seed/demo.mjs              → solo muestra qué haría (no escribe nada)
//   node supabase/seed/demo.mjs --aplicar    → escribe en el proyecto REMOTO (pide confirmación a quien lo corre)
//
// Es seguro repetirlo: usa ids fijos y `on conflict`, y refresca las fechas relativas. También sirve
// para RESTABLECER la cuenta demo (vuelve a fijar su contraseña a la de .env).
//
// Lee de .env (fuera de git): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_DEMO_EMAIL y
// VITE_DEMO_PASSWORD. No necesita la clave service_role: el SQL lo ejecuta el CLI vinculado (con la
// sesión de quien lo corre) y las fotos las sube la propia cuenta demo con su contraseña.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = join(aqui, '..', '..')
const aplicar = process.argv.includes('--aplicar')

function leerEnv() {
  const ruta = join(raiz, '.env')
  if (!existsSync(ruta)) throw new Error('Falta .env (copia .env.example y llénalo).')
  const env = {}
  for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    if (!linea.includes('=') || linea.trimStart().startsWith('#')) continue
    const i = linea.indexOf('=')
    env[linea.slice(0, i).trim()] = linea.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
  return env
}

const env = leerEnv()
for (const k of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_DEMO_EMAIL', 'VITE_DEMO_PASSWORD']) {
  if (!env[k]) throw new Error(`Falta ${k} en .env.`)
}
if (env.VITE_DEMO_PASSWORD.length < 8) throw new Error('VITE_DEMO_PASSWORD debe tener al menos 8 caracteres.')
if (env.VITE_DEMO_EMAIL !== 'demo@manchitas.mx')
  throw new Error('El seed crea la cuenta demo@manchitas.mx; cambia el SQL si quieres otro correo.')

// Las fotos van en supabase/seed/fotos/<archivo> (JPEG, máx. 2 MB). Si falta un archivo, esa mascota
// se queda sin foto (la interfaz muestra un ícono) y el seed sigue.
const MASCOTAS = [
  { id: 'de000001-0000-4000-8000-000000000011', archivo: 'coco.jpg' },
  { id: 'de000001-0000-4000-8000-000000000012', archivo: 'pony.jpg' },
  { id: 'de000001-0000-4000-8000-000000000013', archivo: 'cenizas.jpg' },
  { id: 'de000001-0000-4000-8000-000000000014', archivo: 'felix.jpg' },
  { id: 'de000001-0000-4000-8000-000000000015', archivo: 'oreo.jpg' },
  { id: 'de000001-0000-4000-8000-000000000016', archivo: 'luna.jpg' },
  { id: 'de000001-0000-4000-8000-000000000017', archivo: 'chapito.jpg' },
  { id: 'de000001-0000-4000-8000-000000000018', archivo: 'lupe.jpg' },
  { id: 'de000001-0000-4000-8000-000000000019', archivo: 'emo.jpg' },
]
// Fotos de la primera versión de la demo (Mochi, Duque y Manchas): se borran de Storage.
const FOTOS_VIEJAS = ['demo-mochi.jpg', 'demo-duque.jpg', 'demo-manchas.jpg']
const ID_DEMO = 'de000000-0000-4000-8000-000000000001'

console.log('Proyecto:', new URL(env.VITE_SUPABASE_URL).host)
console.log('Cuenta demo:', env.VITE_DEMO_EMAIL)
console.log('Pasos: 1) SQL de datos (CLI, remoto)  2) fotos de las 9 mascotas (como la cuenta demo)')
if (!aplicar) {
  console.log('\nSimulacro: no se escribió nada. Agrega --aplicar para ejecutar.')
  process.exit(0)
}

// 1) SQL con la contraseña sustituida, en un archivo temporal que se borra al terminar.
const sql = readFileSync(join(aqui, 'demo.sql'), 'utf8').replaceAll('__DEMO_PASSWORD__', env.VITE_DEMO_PASSWORD.replaceAll("'", "''"))
const temporal = join(tmpdir(), `manchitas-demo-${process.pid}.sql`)
writeFileSync(temporal, sql)
try {
  const r = spawnSync('npx', ['supabase', 'db', 'query', '--remote', '--yes', '--file', temporal], {
    cwd: raiz,
    stdio: 'inherit',
    shell: true,
  })
  if (r.status !== 0) throw new Error('El SQL de demostración falló (ver arriba).')
} finally {
  rmSync(temporal, { force: true })
}

// 2) Fotos: las sube la cuenta demo a su propia carpeta de mascotas-fotos y fija foto_path.
const cliente = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
const { error: errSesion } = await cliente.auth.signInWithPassword({
  email: env.VITE_DEMO_EMAIL,
  password: env.VITE_DEMO_PASSWORD,
})
if (errSesion) throw new Error(`No pude iniciar sesión con la cuenta demo: ${errSesion.message}`)
await cliente.storage.from('mascotas-fotos').remove(FOTOS_VIEJAS.map((f) => `${ID_DEMO}/${f}`))
for (const { id, archivo } of MASCOTAS) {
  const origen = join(aqui, 'fotos', archivo)
  if (!existsSync(origen)) {
    console.log('Sin foto (falta el archivo):', archivo)
    continue
  }
  const ruta = `${ID_DEMO}/demo-${archivo}`
  const bytes = readFileSync(origen)
  const { error: errSubida } = await cliente.storage.from('mascotas-fotos').upload(ruta, bytes, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (errSubida) throw new Error(`Foto ${archivo}: ${errSubida.message}`)
  const { error: errFoto } = await cliente.from('mascotas').update({ foto_path: ruta }).eq('id', id)
  if (errFoto) throw new Error(`foto_path de ${archivo}: ${errFoto.message}`)
  console.log('Foto lista:', archivo)
}
await cliente.auth.signOut()
console.log('\nListo: datos de demostración aplicados.')
