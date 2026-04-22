import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }]
}

const SUPPORTED_LOCALES = ['es', 'en']

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!SUPPORTED_LOCALES.includes(lang)) notFound()
  return <>{children}</>
}
