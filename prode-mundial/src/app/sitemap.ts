import { MetadataRoute } from 'next'

const LOCALES = ['es', 'en'] as const
const BASE = 'https://www.reydelprode.com'

function entries(path: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number): MetadataRoute.Sitemap {
  const now = new Date()
  return LOCALES.map((lang) => ({
    url: `${BASE}/${lang}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...entries('',              'weekly',  1.0),
    ...entries('/precios',      'monthly', 0.9),
    ...entries('/fase/groups',  'daily',   0.8),
    ...entries('/fase/r32',     'daily',   0.8),
    ...entries('/fase/r16',     'daily',   0.8),
    ...entries('/fase/qf',      'daily',   0.8),
    ...entries('/fase/sf',      'daily',   0.8),
    ...entries('/fase/final',   'daily',   0.8),
    ...entries('/contacto',     'monthly', 0.6),
    ...entries('/terminos',     'yearly',  0.3),
    ...entries('/privacidad',   'yearly',  0.3),
  ]
}
