import { redirect, notFound } from 'next/navigation'
import { hasLocale } from '@/app/[lang]/dictionaries'

// Las rutas /fase/[phase] quedaron unificadas en /fixture (con filtro de fase).
// Se conservan como alias para no romper links/marcadores: redirigen al fixture.
export default async function FasePage({ params }: { params: Promise<{ phase: string; lang: string }> }) {
  const { phase, lang } = await params
  if (!hasLocale(lang)) notFound()
  redirect(`/${lang}/fixture?phase=${phase}`)
}
