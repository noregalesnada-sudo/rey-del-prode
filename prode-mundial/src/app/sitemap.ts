import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.reydelprode.com'
  const now = new Date()

  return [
    { url: base,                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/precios`,             lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/fase/groups`,         lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/fase/r32`,            lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/fase/r16`,            lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/fase/qf`,             lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/fase/sf`,             lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/fase/final`,          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/contacto`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/terminos`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/privacidad`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
