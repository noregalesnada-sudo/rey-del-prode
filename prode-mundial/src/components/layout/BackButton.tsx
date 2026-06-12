'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

/**
 * Botón "Volver" que vive debajo del header, arriba a la izquierda de cada vista.
 * No aparece en el Inicio (la base desde donde arrancás a navegar).
 */
export default function BackButton({ lang }: { lang: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const root = `/${lang}`

  if (pathname === `${root}/inicio` || pathname === root || pathname === `${root}/`) return null

  const label = lang === 'en' ? 'Back' : 'Volver'

  return (
    <button
      onClick={() => router.back()}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(116,172,223,0.10)', border: '1px solid var(--border-light)',
        color: 'var(--accent-light)', borderRadius: 10, padding: '7px 12px 7px 9px',
        fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 14,
      }}
    >
      <ChevronLeft size={18} /> {label}
    </button>
  )
}
