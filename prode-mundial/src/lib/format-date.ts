// No usamos toLocaleString porque Node y Chrome producen caracteres Unicode
// distintos para el separador de AM/PM en es-AR (U+202F vs U+00A0), lo que
// genera hydration mismatches. Argentina no tiene DST desde 2009, así que
// un offset fijo UTC-3 es correcto.

const AR_OFFSET_MS = -3 * 60 * 60 * 1000

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toAR(iso: string): Date {
  return new Date(new Date(iso).getTime() + AR_OFFSET_MS)
}

export function formatMatchDateTime(iso: string): string {
  const d = toAR(iso)
  const day   = pad(d.getUTCDate())
  const month = pad(d.getUTCMonth() + 1)
  const year  = String(d.getUTCFullYear()).slice(2)
  return `${day}/${month}/${year}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export function formatMatchDate(iso: string): string {
  const d = toAR(iso)
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${String(d.getUTCFullYear()).slice(2)}`
}

export function formatMatchTime(iso: string): string {
  const d = toAR(iso)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
