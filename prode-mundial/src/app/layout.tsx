import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'Prode Mundial 2026',
  description: 'El prode del Mundial de Fútbol 2026',
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
