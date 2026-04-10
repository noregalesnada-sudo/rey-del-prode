import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function WelcomePage() {
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
      q: '¿Qué es Rey del Prode?',
      a: 'Es una app para pronosticar los resultados de la Copa del Mundo 2026. Podés jugar solo siguiendo tus picks globales, o competir contra amigos, familia o compañeros de trabajo en un prode privado.',
    },
    {
      q: '¿Es gratis?',
      a: 'Jugar con amigos es 100% gratis. Podés crear un prode privado con hasta 25 jugadores sin pagar nada, sin suscripciones y sin límite de tiempo. Para grupos más grandes existen los planes Pro (hasta 50 jugadores) y Business (hasta 300 jugadores), con pago único por todo el Mundial.',
    },
    {
      q: '¿Cómo se calculan los puntos?',
      a: '3 puntos si acertás el resultado exacto (ej. pusiste 2-1 y salió 2-1). 2 puntos si acertás el ganador y la diferencia de goles (pusiste 3-1 y salió 2-0: ganó el mismo equipo por 2). 1 punto si solo acertás el ganador o el empate. 0 puntos si te equivocás.',
    },
    {
      q: '¿Hasta cuándo puedo ingresar mis pronósticos?',
      a: 'Podés cargar o modificar tus picks hasta 15 minutos antes del inicio de cada partido. Una vez cerrado ese plazo, el pick queda bloqueado.',
    },
    {
      q: '¿Qué pasa si no cargo un pronóstico para un partido?',
      a: 'Si no ingresás pick para un partido, ese encuentro vale 0 puntos automáticamente.',
    },
    {
      q: '¿Qué es un prode privado?',
      a: 'Es un grupo cerrado donde competís solo con las personas que invitás. Cada prode tiene su propio leaderboard, podio y sección de premios personalizable por el admin. El plan Free soporta hasta 25 jugadores, suficiente para jugar con amigos o en la oficina.',
    },
    {
      q: '¿Puedo participar en varios prodes?',
      a: 'Sí, podés unirte a tantos prodes privados como quieras usando el código o link de invitación de cada uno.',
    },
    {
      q: '¿El admin de un prode puede ver mis picks?',
      a: 'Los picks de cada partido son visibles para todos los miembros del prode una vez que ese partido comenzó. Antes del inicio, solo vos podés ver tus propios picks.',
    },
  ]

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative',
        minHeight: 'calc(100vh - 44px - 82px)',
        display: 'flex',
        alignItems: 'flex-start',
        padding: '36px 0',
      }}>
        <div style={{ flex: '1 1 320px', maxWidth: '520px', position: 'relative', zIndex: 1 }}>
          {username && (
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Bienvenido, {username}
            </p>
          )}

          <h1 style={{ fontWeight: 900, fontSize: '42px', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>REY</span>
            {' '}
            <span style={{ color: 'var(--text-primary)' }}>
              D<span style={{ color: '#FFD700' }}>E</span>L
            </span>
            {' '}
            <span style={{ color: 'var(--accent)' }}>PRODE</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '28px' }}>
            Copa del Mundo 2026
          </p>

          <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '440px' }}>
            Demostrá que sos el verdadero Rey del Prode. Cargá tus pronósticos, armá tu grupo con amigos o compañeros de trabajo, y seguí cada partido de la Copa del Mundo.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/mis-pronos" style={{
              background: 'var(--accent)', color: '#fff', fontWeight: 900,
              fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px',
              padding: '12px 24px', borderRadius: '6px', textDecoration: 'none',
              display: 'inline-block',
            }}>
              Mis Pronósticos
            </Link>
            <Link href="/crear-prode" style={{
              background: 'transparent', color: 'var(--accent)', fontWeight: 700,
              fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px',
              padding: '12px 24px', borderRadius: '6px', textDecoration: 'none',
              border: '2px solid var(--accent)', display: 'inline-block',
            }}>
              Crear Prode
            </Link>
          </div>

          <div style={{ marginTop: '48px', display: 'flex', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>48</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Equipos</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>104</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partidos</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFD700' }}>2026</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Edición</div>
            </div>
          </div>
        </div>

        <img
          src="/copa.png"
          alt="Copa del Mundo FIFA"
          className="welcome-trophy"
          style={{
            position: 'absolute',
            right: '-5%',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '90%',
            minHeight: '420px',
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
      <section style={{ padding: '48px 0 64px' }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          FAQ
        </p>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '40px' }}>
          Preguntas Frecuentes
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {faqs.map((item, i) => (
            <div key={i} style={{
              borderBottom: '1px solid rgba(116,172,223,0.1)',
              padding: '20px 0',
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
        </div>
      </footer>

    </div>
  )
}
