export default function TerminosPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 0 80px' }}>

      <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        Legal
      </p>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
        Términos y Condiciones
      </h1>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '48px' }}>
        Última actualización: abril de 2026
      </p>

      <Section title="1. Aceptación de los Términos">
        <p>
          Al registrarse o utilizar Rey del Prode, el usuario acepta quedar vinculado por estos Términos y Condiciones.
        </p>
      </Section>

      <Section title="2. Descripción del Servicio">
        <p>Rey del Prode es una aplicación web orientada a la Copa del Mundo 2026 que permite a los usuarios:</p>
        <ul>
          <li>Registrar pronósticos personales para cada partido del torneo.</li>
          <li>Crear y participar en prodes privados junto a amigos, familiares o compañeros de trabajo.</li>
          <li>Visualizar rankings, leaderboards y estadísticas generadas a partir de los pronósticos cargados.</li>
        </ul>
        <p>Rey del Prode es una plataforma de entretenimiento. No involucra apuestas de dinero real.</p>
      </Section>

      <Section title="3. Registro y Cuenta de Usuario">
        <p>
          Para acceder a todas las funcionalidades, el usuario debe registrarse con una dirección de correo electrónico y contraseña.
          El usuario es responsable de mantener la confidencialidad de sus credenciales.
        </p>
      </Section>

      <Section title="4. Planes y Pagos">
        <p>Rey del Prode ofrece distintos planes para la creación de prodes privados:</p>
        <ul>
          <li><strong style={{ color: 'var(--text-primary)' }}>Free</strong>: hasta 25 jugadores, sin costo.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Pro</strong>: hasta 50 jugadores, pago único de $19.999 ARS.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Business</strong>: hasta 150 jugadores, pago único de $199.999 ARS.</li>
        </ul>
        <p>Los pagos se procesan a través de MercadoPago. Los pagos son únicos y no implican suscripción recurrente.</p>
      </Section>

      <Section title="5. Reglas del Prode">
        <p>El sistema de puntuación por partido es el siguiente:</p>
        <ul>
          <li><strong style={{ color: 'var(--text-primary)' }}>3 puntos</strong>: pronóstico exacto.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>2 puntos</strong>: ganador correcto y diferencia de goles correcta.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>1 punto</strong>: ganador o empate correcto.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>0 puntos</strong>: pronóstico incorrecto o sin pronóstico cargado.</li>
        </ul>
        <p>Además, cada usuario puede elegir el <strong style={{ color: 'var(--text-primary)' }}>Campeón del Mundial</strong>: <strong style={{ color: '#FFD700' }}>+10 puntos</strong> si acierta.</p>
        <p>Los pronósticos se bloquean automáticamente 15 minutos antes del inicio de cada partido.</p>
      </Section>

      <Section title="6. Conducta del Usuario">
        <p>El usuario se compromete a no crear cuentas múltiples para obtener ventaja, ni utilizar la aplicación con fines no autorizados.</p>
      </Section>

      <Section title="7. Prodes Privados">
        <p>
          El administrador de un prode privado puede invitar participantes, gestionar miembros y editar premios.
          Rey del Prode no interviene en disputas entre miembros ni en la entrega de premios.
        </p>
      </Section>

      <Section title="8. Propiedad Intelectual">
        <p>
          Todos los derechos sobre Rey del Prode son propiedad exclusiva de sus desarrolladores.
          El usuario recibe una licencia limitada y no exclusiva para usar la aplicación.
        </p>
      </Section>

      <Section title="9. Limitación de Responsabilidad">
        <p>
          Rey del Prode se provee &quot;tal cual está&quot;. No garantizamos disponibilidad ininterrumpida ni la exactitud de los puntajes.
        </p>
      </Section>

      <Section title="10. Modificaciones">
        <p>
          Nos reservamos el derecho de modificar estos Términos. Las modificaciones serán notificadas al usuario con al menos 15 días de anticipación.
        </p>
      </Section>

      <Section title="11. Ley Aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina.
        </p>
      </Section>

      <Section title="12. Contacto" last>
        <p>
          Para consultas sobre estos Términos y Condiciones: contacto@reydelprode.com
        </p>
      </Section>

    </div>
  )
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section style={{ marginBottom: last ? 0 : '40px' }}>
      <h2 style={{
        fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        marginBottom: '16px', paddingBottom: '8px',
        borderBottom: '1px solid rgba(116,172,223,0.12)',
      }}>
        {title}
      </h2>
      <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </section>
  )
}
