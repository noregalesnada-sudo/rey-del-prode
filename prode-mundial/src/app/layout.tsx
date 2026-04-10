import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'Rey del Prode',
  description: 'El mejor prode online para el Mundial 2026. Cargá tus pronósticos y competí con amigos, familia o compañeros de trabajo.',
  openGraph: {
    title: 'Rey del Prode — Prode del Mundial 2026',
    description: 'El mejor prode online para el Mundial 2026. Cargá tus pronósticos y competí con amigos, familia o compañeros de trabajo.',
    url: 'https://www.reydelprode.com',
    siteName: 'Rey del Prode',
    images: [{ url: 'https://www.reydelprode.com/escudo.png', width: 512, height: 512 }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rey del Prode — Prode del Mundial 2026',
    description: 'El mejor prode online para el Mundial 2026.',
    images: ['https://www.reydelprode.com/escudo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${roboto.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
