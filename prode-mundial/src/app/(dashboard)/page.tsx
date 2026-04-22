// v2026.04.15
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import Link from 'next/link'
import WorldCupCountdown from '@/components/home/WorldCupCountdown'
export const metadata: Metadata = {
  title: 'Rey del Prode | Prode del Mundial 2026 — Pronósticos Copa del Mundo',
  description: 'El mejor prode online para el Mundial 2026. Pronosticá los partidos de la Copa del Mundo, armá tu prode privado con amigos, familia o tu empresa y competí en el ranking. Gratis.',
  alternates: { canonical: 'https://www.reydelprode.com' },
}

export default async function WelcomePage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    username = profile?.username ?? null
  }

  const steps = [
    {
      num: '01',
      title: 'Registrate',
      desc: 'Creá tu cuenta con email y contraseña. En menos de un minuto ya estás adentro.',
    },
    {
      num: '02',
      title: 'Cargá tus picks',
      desc: 'Pronosticá el resultado de cada partido antes de que empiece. Podés editarlos hasta 15 minutos antes del pitido inicial.',
    },
    {
      num: '03',
      title: 'Armá tu grupo',
      desc: 'Creá un prode privado e invitá amigos, familia o compañeros de trabajo con un código o link único.',
    },
    {
      num: '04',
      title: 'Seguí el torneo',
      desc: 'Mirá el leaderboard actualizado con el podio de tu grupo y competí por el título de Rey del Prode.',
    },
  ]

  const faqs = [
    {
      q: '¿Qué es Rey del Prode y cómo funciona?',
      a: 'Rey del Prode es la plataforma online para hacer el prode del Mundial 2026. Pronosticás el resultado de cada partido de la Copa del Mundo, acumulás puntos según tus aciertos y competís en tiempo real contra tu grupo. Podés jugar solo o armar un prode privado con amigos, familia o compañeros de trabajo.',
    },
    {
      q: '¿Puedo hacer el prode del Mundial 2026 gratis?',
      a: 'Sí, el plan Free es 100% gratis para siempre. Permite hasta 25 jugadores por prode, sin suscripción ni tarjeta de crédito. Para grupos más grandes existe el plan Pro (hasta 50 jugadores, pago único de $19.999) y el plan Business (hasta 150 jugadores, ideal para empresas y eventos corporativos, pago único de $199.999).',
    },
    {
      q: '¿Cómo organizo un prode para mi empresa o lugar de trabajo?',
      a: 'Con el plan Business podés crear un prode del Mundial para hasta 150 participantes. Subís tu logo y personalizás el banner con la identidad de tu empresa. Es la solución ideal para prodes corporativos o eventos de empresa durante la Copa del Mundo 2026.',
    },
    {
      q: '¿Cómo se calculan los puntos en el prode?',
      a: '3 puntos si acertás el resultado exacto (ej. pronosticaste 2-1 y salió 2-1). 2 puntos si acertás el ganador y la diferencia de goles (pronosticaste 3-1 y salió 2-0: mismo equipo ganador, misma diferencia). 1 punto si solo acertás el ganador o el empate. 0 puntos si el pronóstico fue incorrecto. Además, podés elegir el Campeón del Mundial antes del inicio del torneo: si acertás, sumás 10 puntos extra en cada prode donde hayas hecho esa elección.',
    },
    {
      q: '¿Hasta cuándo puedo cargar mis pronósticos del Mundial?',
      a: 'Podés ingresar o modificar tus pronósticos hasta 15 minutos antes del inicio de cada partido. Pasado ese tiempo, el pick queda bloqueado y ya no se puede editar. Si no cargás un pronóstico para un partido, ese encuentro vale 0 puntos.',
    },
    {
      q: '¿Qué es un prode privado y cómo invito a mis amigos?',
      a: 'Un prode privado es un grupo cerrado donde competís solo con las personas que vos invitás. Al crear el prode recibís un código único de 6 caracteres y un link de invitación para compartir. Cada prode tiene su propio leaderboard, podio y sección de premios que el admin puede personalizar.',
    },
    {
      q: '¿Puedo participar en varios prodes del Mundial al mismo tiempo?',
      a: 'Sí. Con una sola cuenta podés unirte a tantos prodes privados como quieras: el de la oficina, el de amigos, el familiar. Tus pronósticos se aplican a todos de forma automática.',
    },
    {
      q: '¿Rey del Prode es solo para Argentina?',
      a: 'La plataforma está en español y el sistema de pagos opera en pesos argentinos (ARS). Cualquier persona de habla hispana puede registrarse y jugar gratuitamente; los planes de pago actualmente están disponibles para Argentina.',
    },
    {
      q: '¿Mis pronósticos son visibles para los demás jugadores?',
      a: 'No hasta que el partido empieza. Mientras el partido no comenzó, solo vos podés ver tus picks. Una vez iniciado el encuentro, los pronósticos de todos los miembros del prode quedan visibles para generar debate y seguimiento en tiempo real.',
    },
  ]

  const jsonLdApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Rey del Prode',
    url: 'https://www.reydelprode.com',
    description: 'El mejor prode online para el Mundial 2026. Pronosticá los partidos de la Copa del Mundo, armá tu grupo privado con amigos, familia o tu empresa y competí en el ranking.',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    inLanguage: 'es-AR',
    offers: [
      { '@type': 'Offer', name: 'Plan Free',     price: '0',      priceCurrency: 'ARS', description: 'Hasta 25 jugadores' },
      { '@type': 'Offer', name: 'Plan Pro',      price: '19999',  priceCurrency: 'ARS', description: 'Hasta 50 jugadores' },
      { '@type': 'Offer', name: 'Plan Business', price: '199999', priceCurrency: 'ARS', description: 'Hasta 150 jugadores' },
    ],
  }

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  const jsonLdHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo hacer el prode del Mundial 2026',
    description: 'Pasos para crear tu cuenta, cargar pronósticos y competir en el prode del Mundial 2026.',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }} />

      {/* ── HERO ── breakout: escapa el padding del main */}
      <div style={{
        position: 'relative',
        minHeight: 'calc(100vh - 44px)',
        display: 'flex',
        alignItems: 'center',
        padding: '36px 24px',
        overflow: 'hidden',
        margin: '-24px -24px 0 -24px',
      }}>
        <div style={{ flex: '1 1 320px', maxWidth: '560px', position: 'relative', zIndex: 1, paddingLeft: '4%' }}>
          {username && (
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Bienvenido, {username}
            </p>
          )}

          <h1 style={{ fontFamily: 'var(--font-barlow), "Barlow Condensed", Arial, sans-serif', fontWeight: 900, fontSize: '72px', lineHeight: 1.0, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--accent)' }}>REY</span>
            {' '}
            <span style={{ color: 'var(--text-primary)' }}>
              D<span style={{ color: '#FFD700' }}>E</span>L
            </span>
            {' '}
            <span style={{ color: 'var(--accent)' }}>PRODE</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px' }}>
            Prode para la Copa del Mundo 2026
          </p>

          <p style={{ color: 'var(--text-primary)', fontSize: '17px', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
            El mejor prode online para el Mundial 2026. Cargá tus pronósticos, armá tu grupo con amigos o compañeros de trabajo, y seguí cada partido de la Copa del Mundo.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/mis-pronos" style={{
              background: 'var(--accent)', color: '#fff', fontWeight: 900,
              fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px',
              padding: '14px 28px', borderRadius: '6px', textDecoration: 'none',
              display: 'inline-block',
            }}>
              Mis Pronósticos
            </Link>
            <Link href="/crear-prode" style={{
              background: 'transparent', color: 'var(--accent)', fontWeight: 700,
              fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px',
              padding: '14px 28px', borderRadius: '6px', textDecoration: 'none',
              border: '2px solid var(--accent)', display: 'inline-block',
            }}>
              Crear Prode
            </Link>
          </div>

          <div style={{ marginTop: '52px', display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--accent)' }}>48</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Equipos</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#FFD700' }}>104</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partidos</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--accent)' }}>2026</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Edición</div>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="countdown-wrapper" style={{
          flex: '1 1 300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <WorldCupCountdown />
        </div>

        {/* Estadio de fondo */}
        <img
          src="/estadio.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            opacity: 0.09,
            filter: 'blur(3px) saturate(0.6)',
            zIndex: 0,
            transform: 'scale(1.003)',
          }}
        />

        <img
          src="/copa.png"
          alt="Copa del Mundo FIFA"
          className="welcome-trophy"
          style={{
            position: 'absolute',
            right: '-5%',
            bottom: '-4%',
            height: '115%',
            width: 'auto',
            opacity: 0.28,
            zIndex: 0,
          }}
        />
      </div>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ padding: '64px 0 48px' }}>
        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          Guía rápida
        </p>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '40px' }}>
          ¿Cómo funciona?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {steps.map((step) => (
            <div key={step.num} style={{
              background: 'var(--card-bg, #0d2545)',
              border: '1px solid rgba(116,172,223,0.12)',
              borderRadius: '8px',
              padding: '24px',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(116,172,223,0.18)', lineHeight: 1, marginBottom: '16px' }}>
                {step.num}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '48px 0 64px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            FAQ
          </p>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '28px' }}>
            Preguntas Frecuentes
          </h2>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '8px 32px',
          }}>
            {faqs.map((item, i) => (
              <div key={i} style={{
                borderBottom: i < faqs.length - 1 ? '1px solid rgba(116,172,223,0.1)' : 'none',
                padding: '22px 0',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {item.q}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(116,172,223,0.12)',
        padding: '24px 0 8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 Rey del Prode — Copa del Mundo
        </span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacidad" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Política de Privacidad
          </Link>
          <Link href="/terminos" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Términos y Condiciones
          </Link>
          <Link href="/contacto" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Contacto
          </Link>
        </div>
      </footer>

    </div>
  )
}
