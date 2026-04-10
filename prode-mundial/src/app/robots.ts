import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/mis-pronos', '/perfil', '/crear-prode'] },
    sitemap: 'https://www.reydelprode.com/sitemap.xml',
  }
}
