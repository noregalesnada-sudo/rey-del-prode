export default function GuiaContent({ companyName }: { companyName: string }) {
  const s: React.CSSProperties = {
    background: '#0d2547',
    border: '1px solid rgba(116,172,223,0.18)',
    borderRadius: '10px',
    padding: '22px 26px',
    marginBottom: '14px',
  }
  const h3: React.CSSProperties = {
    fontSize: '13px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.5px', color: 'var(--accent)', marginBottom: '10px',
  }
  const p: React.CSSProperties = { fontSize: '14px', color: '#b8cfe8', lineHeight: 1.7 }
  const li: React.CSSProperties = { fontSize: '14px', color: '#b8cfe8', lineHeight: 1.7, marginBottom: '8px' }
  const highlight: React.CSSProperties = {
    background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)',
    borderRadius: '8px', padding: '14px 18px', margin: '14px 0',
    fontSize: '13px', color: '#FFD700', display: 'flex', gap: '10px',
  }
  const sectionHeader = (n: string, title: string, sub: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(116,172,223,0.15)' }}>
      <div style={{ width: '36px', height: '36px', background: 'var(--accent)', color: '#0a1f3d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', flexShrink: 0 }}>{n}</div>
      <div>
        <div style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fff' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '1px' }}>{sub}</div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Intro */}
      <div style={{ background: 'rgba(116,172,223,0.06)', border: '1px solid rgba(116,172,223,0.2)', borderLeft: '4px solid var(--accent)', borderRadius: '0 8px 8px 0', padding: '18px 22px', marginBottom: '48px', fontSize: '14px', color: '#b8cfe8', lineHeight: 1.7 }}>
        Esta guía está pensada para los <strong style={{ color: '#fff' }}>administradores</strong> del Panel de Rey del Prode de <strong style={{ color: '#fff' }}>{companyName}</strong>. Desde aquí podés gestionar jugadores, controlar accesos y personalizar la experiencia del torneo.
      </div>

      {/* 0. Acceso */}
      <div style={{ marginBottom: '48px' }}>
        {sectionHeader('0', 'Cómo acceder al panel', 'Ingresar por primera vez')}
        <div style={s}>
          <h3 style={h3}>URL del panel</h3>
          <p style={p}>El panel está disponible en:</p>
          <div style={{ background: '#061628', border: '1px solid rgba(116,172,223,0.25)', borderRadius: '6px', padding: '10px 16px', fontFamily: 'monospace', fontSize: '14px', color: 'var(--accent)', margin: '10px 0' }}>
            https://reydelprode.com/empresa-admin/<strong>{'{nombre-empresa}'}</strong>
          </div>
        </div>
        <div style={s}>
          <h3 style={h3}>Requisitos de acceso</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={li}>Necesitás tener cuenta registrada con el mail que tu proveedor habilitó como administrador.</li>
            <li style={li}>Si aún no tenés cuenta, registrate desde <strong>reydelprode.com/{'{tu-empresa}'}</strong> usando tu mail corporativo.</li>
            <li style={li}>Una vez logueado, ingresá a la URL del panel.</li>
          </ol>
        </div>
        <div style={highlight}><span>★</span><span>Si al ingresar sos redirigido al inicio, tu mail no tiene permisos de admin. Contactá a tu proveedor.</span></div>
      </div>

      {/* 1. Jugadores */}
      <div style={{ marginBottom: '48px' }}>
        {sectionHeader('1', 'Tab: Jugadores', 'Ver y gestionar participantes')}
        <div style={s}>
          <h3 style={h3}>Qué muestra la tabla</h3>
          <p style={p}>Lista de todos los jugadores activos ordenados por puntos. Columnas: <strong style={{ color: '#fff' }}>#, Jugador, Email, Gerencia, Pronósticos, Puntos</strong>.</p>
        </div>
        <div style={s}>
          <h3 style={h3}>Filtros disponibles</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={li}><strong style={{ color: '#fff' }}>Buscar jugador:</strong> filtra por nombre, apellido o usuario.</li>
            <li style={li}><strong style={{ color: '#fff' }}>Buscar email:</strong> filtra por dirección de correo.</li>
            <li style={li}><strong style={{ color: '#fff' }}>Gerencia:</strong> dropdown con todas las áreas cargadas.</li>
          </ul>
        </div>
        <div style={s}>
          <h3 style={h3}>Editar gerencia de un jugador</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={li}>Click sobre el nombre del área (o el guión si no tiene).</li>
            <li style={li}>Escribí el nombre de la gerencia.</li>
            <li style={li}>Presioná <strong style={{ color: '#fff' }}>OK</strong> o <strong style={{ color: '#fff' }}>Enter</strong> para guardar. <strong style={{ color: '#fff' }}>Escape</strong> para cancelar.</li>
          </ol>
        </div>
        <div style={s}>
          <h3 style={h3}>Seleccionar y copiar mails</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={li}>Usá los checkboxes a la izquierda para seleccionar jugadores. El checkbox del encabezado selecciona todos los filtrados.</li>
            <li style={li}>Aparece una barra con el botón <strong style={{ color: '#fff' }}>Copiar mails</strong>. Al presionarlo se copian los mails separados por coma.</li>
            <li style={li}>Pegalo en el campo <strong style={{ color: '#fff' }}>Para:</strong> de tu cliente de correo para enviar recordatorios masivos.</li>
          </ol>
        </div>
        <div style={s}>
          <h3 style={h3}>Eliminar un jugador del prode</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={li}>Click en los tres puntos <strong style={{ color: '#fff' }}>···</strong> al final de la fila.</li>
            <li style={li}>Seleccioná <strong style={{ color: '#fff' }}>Eliminar del prode</strong>.</li>
            <li style={li}>Confirmá la acción. El jugador pierde acceso al prode pero su cuenta no se elimina.</li>
          </ol>
        </div>
        <div style={highlight}><span>★</span><span>Los jugadores con <strong>0/104</strong> en pronósticos todavía no cargaron ninguno. Podés copiar sus mails para mandarles un recordatorio.</span></div>
      </div>

      {/* 2. Whitelist */}
      <div style={{ marginBottom: '48px' }}>
        {sectionHeader('2', 'Tab: Whitelist', 'Gestionar mails habilitados para registrarse')}
        <div style={s}>
          <h3 style={h3}>Qué es la whitelist</h3>
          <p style={p}>Lista de mails corporativos autorizados para registrarse. Solo quienes figuren aquí pueden crear cuenta. Los demás reciben un error al intentar registrarse.</p>
        </div>
        <div style={s}>
          <h3 style={h3}>Estados</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={li}><strong style={{ color: '#4ade80' }}>Registrado:</strong> el jugador ya creó su cuenta.</li>
            <li style={li}><strong style={{ color: 'var(--accent)' }}>Pendiente:</strong> aún no se registró.</li>
          </ul>
        </div>
        <div style={s}>
          <h3 style={h3}>Importar mails desde CSV</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={li}>Preparar un archivo <code style={{ background: '#061628', padding: '1px 5px', borderRadius: '3px' }}>.csv</code> con columnas <code style={{ background: '#061628', padding: '1px 5px', borderRadius: '3px' }}>email</code> y opcionalmente <code style={{ background: '#061628', padding: '1px 5px', borderRadius: '3px' }}>area</code>.</li>
            <li style={li}>Click en <strong style={{ color: '#fff' }}>Subir CSV</strong>.</li>
            <li style={li}>El sistema agrega los nuevos y actualiza los existentes.</li>
          </ol>
          <div style={{ background: '#061628', borderRadius: '6px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#4ade80', marginTop: '12px', lineHeight: 1.8 }}>
            email,area<br/>
            juan.perez@empresa.com,Operaciones<br/>
            maria.gomez@empresa.com,RRHH
          </div>
        </div>
        <div style={s}>
          <h3 style={h3}>Filtros y copiar mails</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={li}>Filtrá por <strong style={{ color: '#fff' }}>Estado</strong> (Todos / Pendientes / Registrados) y por <strong style={{ color: '#fff' }}>Gerencia</strong>.</li>
            <li style={li}>El botón <strong style={{ color: '#fff' }}>Copiar mails</strong> copia todos los mails filtrados separados por coma.</li>
          </ul>
        </div>
        <div style={highlight}><span>★</span><span>Combiná los filtros: Gerencia = Operaciones + Estado = Pendientes → copiás solo los de esa área que no se registraron aún.</span></div>
      </div>

      {/* 3. Configuración */}
      <div style={{ marginBottom: '48px' }}>
        {sectionHeader('3', 'Tab: Configuración', 'Personalizar la experiencia visual')}
        <div style={s}>
          <h3 style={h3}>Nombre del torneo</h3>
          <p style={p}>Definí un nombre personalizado visible para todos los jugadores. Ej: "Prode {companyName} — Mundial 2026". Si lo dejás vacío, se usa el nombre por defecto.</p>
        </div>
        <div style={s}>
          <h3 style={h3}>Colores de marca</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={li}><strong style={{ color: '#fff' }}>Color primario:</strong> botones, acentos y elementos destacados.</li>
            <li style={li}><strong style={{ color: '#fff' }}>Color secundario:</strong> líder del ranking y énfasis especiales.</li>
          </ul>
          <p style={{ ...p, marginTop: '8px' }}>Usá el selector de color o escribí el código hexadecimal (#RRGGBB). El Preview muestra cómo quedan antes de guardar.</p>
        </div>
        <div style={s}>
          <h3 style={h3}>Logo y Banner</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={li}><strong style={{ color: '#fff' }}>Logo:</strong> PNG con fondo transparente. Proporción 1:1 o 2:1. Recomendado 300×300px.</li>
            <li style={li}><strong style={{ color: '#fff' }}>Banner:</strong> JPG o PNG. Proporción 3:1. Recomendado 1200×400px. Evitá texto en los bordes.</li>
          </ul>
        </div>
        <div style={highlight}><span>★</span><span>Al guardar, los cambios se aplican para todos los jugadores de inmediato.</span></div>
      </div>

      {/* 4. FAQ */}
      <div style={{ marginBottom: '48px' }}>
        {sectionHeader('4', 'Preguntas frecuentes', 'Situaciones comunes y soluciones')}
        {[
          { q: 'Un jugador no puede registrarse', a: 'Verificá que su mail esté en la Whitelist como Pendiente. Si no está, importá un CSV con su mail.' },
          { q: 'Un jugador está en la gerencia equivocada', a: 'En la tab Jugadores, hacé click sobre su gerencia y editala. El cambio se refleja en el ranking por gerencia inmediatamente.' },
          { q: 'Un jugador no cargó ningún pronóstico', a: 'En la columna Pronósticos vas a ver 0/104 en rojo. Podés seleccionarlo y copiar su mail para avisarle. Los pronósticos se pueden cargar hasta el minuto previo a cada partido.' },
          { q: 'No veo el panel al ingresar a la URL', a: 'Asegurate de estar logueado con el mail que tiene permisos de admin. Si el problema persiste, contactá a tu proveedor.' },
        ].map((faq) => (
          <div key={faq.q} style={s}>
            <h3 style={h3}>{faq.q}</h3>
            <p style={p}>{faq.a}</p>
          </div>
        ))}
      </div>

      {/* Contacto */}
      <div style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid rgba(116,172,223,0.15)', color: 'rgba(116,172,223,0.5)', fontSize: '13px' }}>
        ¿Necesitás ayuda adicional? Contactá a tu proveedor: <strong style={{ color: 'rgba(116,172,223,0.8)' }}>contacto@reydelprode.com</strong>
      </div>
    </div>
  )
}
