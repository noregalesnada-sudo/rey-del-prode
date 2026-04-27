'use client'

import { useParams } from 'next/navigation'
import es from '@/dictionaries/es.json'
import en from '@/dictionaries/en.json'

const dicts = { es, en } as const
type Locale = keyof typeof dicts

export function useDictionary() {
  const params = useParams() as { lang?: string }
  const lang = (params.lang ?? 'es') as Locale
  return dicts[lang] ?? dicts.es
}

export function useLang(): string {
  const params = useParams() as { lang?: string }
  return params.lang ?? 'es'
}
