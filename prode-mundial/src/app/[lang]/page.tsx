import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import LandingTicker from '@/components/landing/LandingTicker'
import LandingNav from '@/components/landing/LandingNav'
import LandingHero from '@/components/landing/LandingHero'
import LandingCountriesMarquee from '@/components/landing/LandingCountriesMarquee'
import LandingStats from '@/components/landing/LandingStats'
import LandingFeatures from '@/components/landing/LandingFeatures'
import LandingHowItWorks from '@/components/landing/LandingHowItWorks'
import LandingUseCases from '@/components/landing/LandingUseCases'
import LandingEmpresas from '@/components/landing/LandingEmpresas'
import LandingPricing from '@/components/landing/LandingPricing'
import LandingFAQ from '@/components/landing/LandingFAQ'
import LandingCtaFinal from '@/components/landing/LandingCtaFinal'
import LandingFooter from '@/components/landing/LandingFooter'

const META = {
  es: {
    title: 'Rey del Prode — Prode del Mundial 2026',
    description: 'Creá el prode del Mundial 2026 con amigos, familia o tu empresa. Pronósticos en tiempo real, ranking automático y prodes privados. Gratis para empezar.',
    keywords: [
      'prode mundial 2026', 'prode copa del mundo 2026', 'prode online gratis',
      'prode empresa mundial', 'quinela mundial 2026', 'polla mundial 2026',
      'pronósticos copa del mundo', 'prode privado', 'fantasy mundial 2026',
    ],
    ogTitle: 'Rey del Prode — Prode del Mundial 2026',
    ogDesc: 'Pronosticá los 104 partidos del Mundial 2026. Gratis para empezar.',
    jsonDesc: 'Plataforma de prode para el Mundial 2026. Creá grupos privados, cargá pronósticos y seguí el ranking en tiempo real.',
    jsonOfferDesc: 'Plan Free gratuito disponible',
  },
  en: {
    title: 'Rey del Prode — World Cup 2026 Pool',
    description: 'Create your World Cup 2026 pool with friends, family or your company. Real-time predictions, automatic ranking and private pools. Free to start.',
    keywords: [
      'world cup 2026 pool', 'world cup 2026 prediction game', 'free prediction pool 2026',
      'office world cup pool', 'world cup fantasy 2026', 'private prediction pool',
      'world cup picks 2026', 'FIFA world cup pool', 'soccer prediction game 2026',
    ],
    ogTitle: 'Rey del Prode — World Cup 2026 Pool',
    ogDesc: 'Predict all 104 World Cup 2026 matches. Free to start.',
    jsonDesc: 'World Cup 2026 prediction pool platform. Create private groups, submit predictions and follow the real-time ranking.',
    jsonOfferDesc: 'Free plan available',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const m = lang === 'en' ? META.en : META.es
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    openGraph: {
      title: m.ogTitle,
      description: m.ogDesc,
      images: [{ url: 'https://www.reydelprode.com/escudo.png', width: 512, height: 512 }],
    },
  }
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const m = lang === 'en' ? META.en : META.es

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let navUser: { email?: string; username?: string } | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    navUser = { email: user.email, username: profile?.username ?? undefined }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Rey del Prode',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Web',
            description: m.jsonDesc,
            url: 'https://www.reydelprode.com',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS', description: m.jsonOfferDesc },
          }),
        }}
      />
      <div className="landing-page" style={{ fontFamily: 'var(--font-roboto, Roboto, sans-serif)' }}>
        <LandingTicker lang={lang} />
        <LandingNav lang={lang} user={navUser} />

        <main>
          <LandingHero lang={lang} loggedIn={!!navUser} />
          <LandingCountriesMarquee />
          <LandingStats lang={lang} />
          <LandingFeatures lang={lang} />
          <LandingHowItWorks lang={lang} />
          <LandingUseCases lang={lang} />
          <LandingEmpresas lang={lang} />
          <LandingPricing lang={lang} />
          <LandingFAQ lang={lang} />
          <LandingCtaFinal lang={lang} />
        </main>

        <LandingFooter lang={lang} />
      </div>
    </>
  )
}
