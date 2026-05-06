import type { Metadata, Viewport } from 'next'
import { Roboto, Barlow_Condensed } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-barlow',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: {
    default: 'Rey del Prode | Prode del Mundial 2026',
    template: '%s | Rey del Prode',
  },
  description: 'El mejor prode online para el Mundial 2026. Pronosticá los partidos de la Copa del Mundo, armá tu grupo con amigos, familia o tu empresa y competí en el ranking.',
  keywords: [
    'prode mundial 2026',
    'prode copa del mundo 2026',
    'prode online',
    'quinela mundial 2026',
    'polla mundial 2026',
    'pronósticos copa del mundo',
    'prode empresa',
    'prode trabajo',
    'fantasy mundial',
    'prode fútbol',
    'prode argentina',
    'copa del mundo 2026',
    'mundial 2026 grupos',
  ],
  authors: [{ name: 'Rey del Prode', url: 'https://www.reydelprode.com' }],
  creator: 'Rey del Prode',
  metadataBase: new URL('https://www.reydelprode.com'),
  alternates: {
    canonical: 'https://www.reydelprode.com',
  },
  icons: {
    icon: '/escudo.png',
    apple: '/escudo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'Rey del Prode — Prode del Mundial 2026',
    description: 'Pronosticá los partidos de la Copa del Mundo 2026, armá tu prode privado y competí con amigos, familia o tu empresa.',
    url: 'https://www.reydelprode.com',
    siteName: 'Rey del Prode',
    images: [{ url: 'https://www.reydelprode.com/escudo.png', width: 512, height: 512, alt: 'Rey del Prode — Prode del Mundial 2026' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rey del Prode — Prode del Mundial 2026',
    description: 'Pronosticá los partidos de la Copa del Mundo 2026 y competí con amigos, familia o tu empresa.',
    images: ['https://www.reydelprode.com/escudo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${roboto.variable} ${barlowCondensed.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'Roboto, Arial, sans-serif' }} suppressHydrationWarning>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18144603940"
          strategy="afterInteractive"
        />
        <Script id="google-ads-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18144603940');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}
