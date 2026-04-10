export default function PrivacidadPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 0 80px' }}>

      <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        Legal
      </p>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
        Política de Privacidad
      </h1>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '48px' }}>
        Última actualización: abril de 2026
      </p>

      <Section title="1. Información General">
        <p>
          En Rey del Prode nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política describe
          qué datos recopilamos, cómo los usamos y cómo los protegemos, en cumplimiento con la Ley N° 25.326
          de Protección de los Datos Personales de la República Argentina.
        </p>
      </Section>

      <Section title="2. Datos que Recopilamos">
        <SubTitle>2.1 Datos que el usuario nos provee</SubTitle>
        <ul>
          <li>Dirección de correo electrónico (utilizada exclusivamente para autenticación y notificaciones del servicio).</li>
          <li>Nombre de usuario o apodo (visible para otros miembros de los prodes en los que participás).</li>
          <li>Contraseña (almacenada de forma cifrada — nunca en texto plano).</li>
          <li>Foto de perfil (opcional), cargada voluntariamente y visible en el leaderboard de tus prodes.</li>
          <li>Pronósticos de partidos que ingresás voluntariamente.</li>
          <li>En caso de contratar un plan pago (Pro o Business): el pago es procesado íntegramente por MercadoPago. Rey del Prode únicamente recibe confirmación del estado del pago y el plan contratado, sin acceso a datos de tarjeta ni información bancaria.</li>
        </ul>

        <SubTitle>2.2 Datos que NO recopilamos</SubTitle>
        <p>Rey del Prode ha sido diseñado con el principio de mínima recopilación de datos. No solicitamos ni almacenamos:</p>
        <ul>
          <li>Nombre ni apellido real.</li>
          <li>Número de documento de identidad.</li>
          <li>Fecha de nacimiento ni edad.</li>
          <li>Domicilio ni datos de geolocalización.</li>
          <li>Número de teléfono.</li>
          <li>Datos de tarjeta de crédito ni información bancaria (gestionados exclusivamente por MercadoPago).</li>
        </ul>

        <SubTitle>2.3 Datos técnicos</SubTitle>
        <p>
          De manera automática podemos recopilar información técnica básica como tipo de dispositivo, sistema
          operativo y datos de uso anónimos con el fin de mejorar el rendimiento de la aplicación. Estos datos
          no permiten identificar al usuario.
        </p>
      </Section>

      <Section title="3. Uso de los Datos">
        <p>Utilizamos los datos recopilados exclusivamente para:</p>
        <ul>
          <li>Permitir el acceso y funcionamiento de la cuenta del usuario.</li>
          <li>Mostrar pronósticos, puntos y posiciones en el leaderboard de cada prode.</li>
          <li>Mostrar la foto de perfil y el nombre de usuario en los rankings grupales.</li>
          <li>Enviar notificaciones relacionadas con el uso del servicio (confirmaciones de registro, cambios en los términos).</li>
          <li>Mejorar la experiencia de uso mediante análisis de comportamiento anónimo y agregado.</li>
        </ul>
        <p>No vendemos, cedemos ni compartimos los datos personales de los usuarios con terceros con fines comerciales.</p>
      </Section>

      <Section title="4. Visibilidad dentro de la Aplicación">
        <p>
          Los pronósticos de cada partido son visibles para todos los miembros del prode una vez iniciado ese partido.
          Antes del pitido inicial, los picks son privados y solo accesibles por su autor.
        </p>
        <p>
          El nombre de usuario y la foto de perfil (si la cargaste) son visibles para los demás miembros de
          los prodes en los que participás.
        </p>
        <p>
          Los pronósticos por defecto (fuera de un prode privado) son completamente privados y no son accesibles
          por otros usuarios ni administradores de prodes.
        </p>
      </Section>

      <Section title="5. Almacenamiento y Seguridad">
        <p>
          Los datos son almacenados en servidores seguros provistos por Supabase, con cifrado en tránsito
          (HTTPS/TLS) y en reposo. Implementamos medidas técnicas y organizativas razonables para proteger la
          información contra acceso no autorizado, alteración o pérdida.
        </p>
        <p>
          Las fotos de perfil se almacenan en un bucket de almacenamiento seguro con acceso controlado.
        </p>
      </Section>

      <Section title="6. Retención de Datos">
        <p>
          Los datos del usuario se conservan mientras la cuenta esté activa. El usuario puede solicitar la
          eliminación de su cuenta y todos sus datos asociados en cualquier momento enviando un correo a la
          dirección de contacto indicada al final de este documento. La eliminación se procesará dentro de
          los 30 días hábiles de la solicitud.
        </p>
      </Section>

      <Section title="7. Derechos del Usuario">
        <p>De acuerdo con la Ley N° 25.326, el usuario tiene derecho a:</p>
        <ul>
          <li>Acceder a sus datos personales almacenados.</li>
          <li>Rectificar datos inexactos o incompletos.</li>
          <li>Solicitar la supresión de sus datos (derecho al olvido).</li>
          <li>Oponerse al tratamiento de sus datos en casos justificados.</li>
        </ul>
        <p>Para ejercer cualquiera de estos derechos, podés contactarnos en: agencia@posicionarte.online</p>
      </Section>

      <Section title="8. Cookies y Tecnologías Similares">
        <p>
          La aplicación utiliza cookies o tecnologías similares exclusivamente para mantener la sesión del
          usuario activa. No utilizamos cookies con fines publicitarios ni de seguimiento de terceros.
        </p>
      </Section>

      <Section title="9. Menores de Edad">
        <p>
          Rey del Prode no está dirigida a menores de 13 años. Si tomamos conocimiento de que hemos
          recopilado datos de un menor sin consentimiento parental, procederemos a eliminar dicha información
          de inmediato.
        </p>
      </Section>

      <Section title="10. Cambios en esta Política">
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos por correo
          electrónico o mediante un aviso en la aplicación ante cambios significativos. La fecha de la última
          actualización siempre estará indicada al inicio de este documento.
        </p>
      </Section>

      <Section title="11. Contacto" last>
        <p>
          Para cualquier consulta o ejercicio de derechos relacionados con esta Política de Privacidad,
          podés contactarnos en: agencia@posicionarte.online
        </p>
        <p style={{ marginTop: '16px' }}>
          Autoridad de aplicación: Agencia de Acceso a la Información Pública (AAIP) —{' '}
          <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            www.argentina.gob.ar/aaip
          </a>
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

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
      {children}
    </p>
  )
}
