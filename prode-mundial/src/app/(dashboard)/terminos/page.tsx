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
          Al registrarse o utilizar Rey del Prode, el usuario acepta quedar vinculado por estos Términos y
          Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
        </p>
      </Section>

      <Section title="2. Descripción del Servicio">
        <p>Rey del Prode es una aplicación web orientada a la Copa del Mundo 2026 que permite a los usuarios:</p>
        <ul>
          <li>Registrar pronósticos personales para cada partido del torneo.</li>
          <li>Crear y participar en prodes privados junto a amigos, familiares o compañeros de trabajo.</li>
          <li>Visualizar rankings, leaderboards y estadísticas generadas a partir de los pronósticos cargados.</li>
        </ul>
        <p>
          Rey del Prode es una plataforma de entretenimiento. No involucra apuestas de dinero real.
          La creación de prodes privados puede estar sujeta a un pago único según el plan elegido (ver sección 4).
        </p>
      </Section>

      <Section title="3. Registro y Cuenta de Usuario">
        <p>
          Para acceder a todas las funcionalidades de la aplicación, el usuario debe registrarse con una
          dirección de correo electrónico y contraseña. El usuario es responsable de mantener la
          confidencialidad de sus credenciales y de todas las actividades realizadas bajo su cuenta.
        </p>
        <p>
          Rey del Prode no solicita ni almacena datos personales adicionales al correo electrónico. El nombre
          de usuario (apodo) y la foto de perfil son opcionales y elegidos libremente por el usuario.
        </p>
      </Section>

      <Section title="4. Planes y Pagos">
        <p>
          Rey del Prode ofrece distintos planes para la creación de prodes privados:
        </p>
        <ul>
          <li><strong style={{ color: 'var(--text-primary)' }}>Free</strong>: hasta 25 jugadores, sin costo.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Pro</strong>: hasta 50 jugadores, pago único de $19.999 ARS.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Business</strong>: hasta 150 jugadores, pago único de $199.999 ARS.</li>
        </ul>
        <p>
          Los pagos se procesan a través de MercadoPago. El plan se activa únicamente una vez confirmado el pago
          por parte del procesador. Rey del Prode no almacena datos de tarjetas ni información bancaria del usuario.
        </p>
        <p>
          Los pagos son únicos y no implican suscripción recurrente. No se realizan reembolsos salvo en casos
          de falla técnica imputable a la plataforma.
        </p>
        <p>
          El registro de pronósticos y la participación como jugador en prodes existentes son siempre gratuitos
          para todos los usuarios registrados.
        </p>
      </Section>

      <Section title="5. Reglas del Prode">
        <p>El sistema de puntuación por partido es el siguiente:</p>
        <ul>
          <li><strong style={{ color: 'var(--text-primary)' }}>3 puntos</strong>: pronóstico exacto (marcador correcto).</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>2 puntos</strong>: ganador correcto y diferencia de goles correcta, pero marcador incorrecto (ej: pronosticaste 3-1 y salió 2-0).</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>1 punto</strong>: ganador o empate correcto, pero diferencia de goles incorrecta.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>0 puntos</strong>: pronóstico incorrecto o sin pronóstico cargado.</li>
        </ul>
        <p>Adicionalmente, cada usuario puede elegir el <strong style={{ color: 'var(--text-primary)' }}>Campeón del Mundial</strong>:</p>
        <ul>
          <li><strong style={{ color: '#FFD700' }}>+10 puntos</strong>: si el seleccionado elegido como campeón resulta ganador del torneo.</li>
        </ul>
        <p>
          La elección del campeón se bloquea automáticamente 15 minutos antes del inicio del primer partido del torneo y no puede modificarse una vez cerrado el plazo.
          Esta elección se aplica de forma independiente en Mis Pronósticos (pronóstico por defecto) y en cada prode privado donde el usuario participe.
        </p>
        <p>
          Los pronósticos de partidos se bloquean automáticamente 15 minutos antes del inicio de cada partido. Una vez
          bloqueados, no pueden modificarse.
        </p>
        <p>
          Los resultados oficiales utilizados para calcular los puntos provienen de la API de football-data.org.
          Rey del Prode no es responsable por demoras o errores en la actualización de resultados.
        </p>
      </Section>

      <Section title="6. Conducta del Usuario">
        <p>El usuario se compromete a utilizar la aplicación de manera responsable y a no:</p>
        <ul>
          <li>Crear cuentas múltiples para obtener ventaja en un prode.</li>
          <li>Intentar acceder a datos de otros usuarios sin autorización.</li>
          <li>Utilizar la aplicación con fines comerciales no autorizados.</li>
          <li>Realizar ingeniería inversa o intentar extraer el código fuente de la aplicación.</li>
          <li>Cargar contenido ofensivo como nombre de usuario o foto de perfil.</li>
        </ul>
        <p>
          El incumplimiento de estas normas puede resultar en la suspensión o eliminación de la cuenta sin previo aviso.
        </p>
      </Section>

      <Section title="7. Prodes Privados">
        <p>
          El administrador de un prode privado puede invitar participantes mediante un código o link único,
          aprobar o rechazar solicitudes de ingreso, editar los premios del grupo y gestionar los miembros.
        </p>
        <p>
          Los miembros del prode aceptan que sus pronósticos (una vez iniciado el partido) y su posición
          en el leaderboard sean visibles para todos los participantes del mismo grupo.
        </p>
        <p>
          Rey del Prode no interviene en disputas entre miembros de un prode privado ni en la entrega de
          premios acordados entre particulares.
        </p>
      </Section>

      <Section title="8. Propiedad Intelectual">
        <p>
          Todos los derechos de propiedad intelectual sobre Rey del Prode, incluyendo su diseño, código,
          nombre y logotipo, son propiedad exclusiva de sus desarrolladores. El usuario recibe una licencia
          limitada, no exclusiva e intransferible para usar la aplicación de conformidad con estos términos.
        </p>
        <p>
          Los pronósticos ingresados por el usuario son de su propiedad. Al cargarlos, el usuario otorga a
          la aplicación una licencia para procesarlos, calcular puntos y mostrarlos dentro de los prodes
          correspondientes.
        </p>
      </Section>

      <Section title="9. Limitación de Responsabilidad">
        <p>
          Rey del Prode se provee "tal cual está". No garantizamos disponibilidad ininterrumpida del servicio
          ni la exactitud de los puntajes frente a errores en los datos de resultados provistos por terceros.
        </p>
        <p>
          En ningún caso seremos responsables por daños indirectos, incidentales o consecuentes derivados
          del uso o la imposibilidad de uso de la aplicación.
        </p>
      </Section>

      <Section title="10. Modificaciones">
        <p>
          Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las
          modificaciones serán notificadas al usuario mediante la aplicación o por correo electrónico con al
          menos 15 días de anticipación. El uso continuado de Rey del Prode tras la notificación implica la
          aceptación de los nuevos términos.
        </p>
      </Section>

      <Section title="11. Ley Aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será sometida
          a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
        </p>
      </Section>

      <Section title="12. Contacto" last>
        <p>
          Para consultas sobre estos Términos y Condiciones, podés contactarnos en: agencia@posicionarte.online
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
